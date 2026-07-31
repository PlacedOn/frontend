/**
 * Client for the evidence state endpoint.
 *
 * Mirrors `app/evidence_state.py` on the backend, and the direction of trust is
 * the point: this sends an ACTION, never a target state. The server re-runs the
 * guard table and decides where the trait lands. A client that could name its
 * own next state could put a trait into `shared` — visible to employers —
 * without the candidate ever approving it.
 *
 * The local `ALLOWED` copy below exists ONLY to grey out buttons. It is not a
 * security control and must never be treated as one. If it ever disagrees with
 * the server, the server is right and this is the bug.
 */

import { API_BASE_URL } from "@/lib/api";

export type EvidenceState =
  | "pending"
  | "reviewed"
  | "contested"
  | "revised"
  | "private"
  | "approved"
  | "shared";

export type EvidenceActionType =
  | "review"
  | "approve"
  | "keepPrivate"
  | "contest"
  | "revise"
  | "share"
  | "unshare";

export type ContestReason =
  | "inaccurate"
  | "out_of_context"
  | "one_off"
  | "wants_to_clarify"
  | "do_not_share";

/** UI affordance only. The server's copy is the authority. */
const ALLOWED: Record<EvidenceState, EvidenceActionType[]> = {
  pending: ["review"],
  reviewed: ["approve", "contest", "keepPrivate"],
  contested: ["revise", "keepPrivate"],
  revised: ["approve", "keepPrivate"],
  private: ["review"],
  approved: ["share", "keepPrivate"],
  shared: ["unshare"],
};

export function can(state: EvidenceState, action: EvidenceActionType): boolean {
  return ALLOWED[state].includes(action);
}

/** The one gate on evidence leaving the system. Derived, never stored. */
export function isVisibleToEmployers(state: EvidenceState): boolean {
  return state === "shared";
}

export type EvidenceItem = {
  id: string;
  claim: string;
  band: string | null;
  candidate_state: EvidenceState;
  candidate_context: string | null;
  previous_claim: string | null;
  contest_reason: ContestReason | null;
  visible_to_employers: boolean;
};

/**
 * Why the result is a discriminated union rather than a thrown error.
 *
 * These four outcomes need genuinely different UI, and collapsing them into
 * "it failed" produces the worst possible screen on the most consequential
 * page in the product:
 *
 *   ok          — apply the server's state
 *   illegal     — 409. The UI offered a button the machine forbids. That is OUR
 *                 bug; say so plainly rather than blaming the person.
 *   unavailable — 404/network. The endpoint is not deployed yet. The candidate
 *                 must be told their choice was NOT saved — silently keeping it
 *                 in local state would be a lie about consent, which is the one
 *                 thing this feature cannot do.
 *   error       — anything else.
 */
export type EvidenceResult =
  | { kind: "ok"; item: EvidenceItem }
  | { kind: "illegal"; message: string }
  | { kind: "unavailable" }
  | { kind: "error"; message: string };

export async function applyEvidenceAction(
  itemId: string,
  action: EvidenceActionType,
  opts: { token: string; reason?: ContestReason; summary?: string },
): Promise<EvidenceResult> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE_URL}/v1/candidate/evidence/${encodeURIComponent(itemId)}/state`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.token}`,
        },
        body: JSON.stringify({
          action,
          reason: opts.reason ?? null,
          summary: opts.summary ?? null,
        }),
      },
    );
  } catch {
    // DNS failure, offline, CORS. Indistinguishable from not-deployed here, and
    // the honest thing to tell the candidate is the same either way.
    return { kind: "unavailable" };
  }

  if (res.status === 404) return { kind: "unavailable" };
  if (res.status === 409) {
    return { kind: "illegal", message: await safeDetail(res, "That change isn't allowed from here.") };
  }
  if (!res.ok) {
    return { kind: "error", message: await safeDetail(res, `Request failed (${res.status}).`) };
  }

  try {
    return { kind: "ok", item: (await res.json()) as EvidenceItem };
  } catch {
    return { kind: "error", message: "The server replied with something unreadable." };
  }
}

async function safeDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}
