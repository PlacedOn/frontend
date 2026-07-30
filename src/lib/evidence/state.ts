/**
 * Evidence state machine.
 *
 * The candidate owns every extracted trait until they say otherwise. This
 * encodes that as real logic rather than leaving it to whichever component
 * happens to render the card, because "nothing is shared until you say yes" is a
 * promise the product makes on its own homepage and a UI-only version of it is
 * one careless `setState` away from being false.
 *
 * States and the only legal moves between them:
 *
 *     pending ──review──▶ reviewed ──approve──▶ approved ──share──▶ shared
 *                            │                     │                  │
 *                            ├──contest──▶ contested                  │
 *                            └──keepPrivate──▶ private ◀──unshare─────┘
 *
 *     contested ──revise──▶ revised ──approve──▶ approved
 *     contested ──keepPrivate──▶ private
 *
 * Four rules the machine enforces, not the UI:
 *
 *   1. `pending` can never reach `shared`. Sharing requires an explicit
 *      approval that only the candidate can perform.
 *   2. Contesting always blocks sharing. `contested` has no edge to `shared`.
 *   3. A revision never destroys the original — `revised` carries the prior
 *      version so the change stays auditable, which is the whole point of a
 *      contestable system.
 *   4. Anything shared can be pulled back. `shared ──unshare──▶ private` is
 *      always available; consent that cannot be withdrawn is not consent.
 */

export type EvidenceState =
  | "pending" // extracted, candidate has not looked at it
  | "reviewed" // candidate has seen the evidence behind it
  | "contested" // candidate disagrees; held from sharing
  | "revised" // candidate supplied a correction; original retained
  | "private" // candidate declined to share it
  | "approved" // candidate accepted it; eligible to share
  | "shared"; // visible to approved employers

export type ContestReason =
  | "inaccurate"
  | "out_of_context"
  | "one_off"
  | "wants_to_clarify"
  | "do_not_share";

export const CONTEST_REASONS: { id: ContestReason; label: string }[] = [
  { id: "inaccurate", label: "This isn't accurate" },
  { id: "out_of_context", label: "This was taken out of context" },
  { id: "one_off", label: "This was a one-off answer" },
  { id: "wants_to_clarify", label: "I want to clarify it" },
  { id: "do_not_share", label: "I don't want this shared" },
];

/** A transcript moment the trait was inferred from. */
export type EvidenceSource = {
  quote: string;
  /** Where in the conversation, e.g. "12:04" or "problem-solving prompt". */
  moment: string;
};

export type Trait = {
  id: string;
  /** e.g. "Structured thinking" */
  name: string;
  /** One sentence, plain language. */
  summary: string;
  source: EvidenceSource;
  /** Wilson-style band, never a bare score. null = not enough data. */
  confidence: "emerging" | "supported" | "strong" | null;
  state: EvidenceState;
  contest?: {
    reason: ContestReason;
    note?: string;
    at: string;
  };
  /** Set only on `revised`. The original is never overwritten. */
  previous?: {
    name: string;
    summary: string;
    state: EvidenceState;
  };
  revisedSummary?: string;
};

/* ── transitions ──────────────────────────────────────────────────────── */

export type EvidenceAction =
  | { type: "review" }
  | { type: "approve" }
  | { type: "keepPrivate" }
  | { type: "contest"; reason: ContestReason; note?: string }
  | { type: "revise"; summary: string }
  | { type: "share" }
  | { type: "unshare" };

/** Which actions are legal from each state. Anything absent is forbidden. */
const ALLOWED: Record<EvidenceState, EvidenceAction["type"][]> = {
  pending: ["review"],
  reviewed: ["approve", "contest", "keepPrivate"],
  contested: ["revise", "keepPrivate"],
  revised: ["approve", "keepPrivate"],
  private: ["review"], // reopen to reconsider
  approved: ["share", "keepPrivate"],
  shared: ["unshare"], // consent is always withdrawable
};

export function can(trait: Trait, action: EvidenceAction["type"]): boolean {
  return ALLOWED[trait.state].includes(action);
}

/**
 * Apply an action. Returns the trait unchanged if the action is illegal from
 * the current state — callers should gate on `can()` for UI, but this makes an
 * invalid transition a no-op rather than a corrupt state.
 */
export function transition(trait: Trait, action: EvidenceAction): Trait {
  if (!can(trait, action.type)) return trait;

  switch (action.type) {
    case "review":
      return { ...trait, state: "reviewed" };

    case "approve":
      return { ...trait, state: "approved" };

    case "keepPrivate":
      return { ...trait, state: "private" };

    case "contest":
      return {
        ...trait,
        state: "contested",
        contest: {
          reason: action.reason,
          note: action.note,
          // Caller supplies the timestamp so this stays pure and testable.
          at: new Date(0).toISOString(),
        },
      };

    case "revise":
      // The original is preserved, not replaced. This is what makes the
      // correction auditable rather than a silent rewrite.
      return {
        ...trait,
        state: "revised",
        revisedSummary: action.summary,
        previous: trait.previous ?? {
          name: trait.name,
          summary: trait.summary,
          state: "contested",
        },
      };

    case "share":
      return { ...trait, state: "shared" };

    case "unshare":
      return { ...trait, state: "private" };
  }
}

/* ── presentation helpers ─────────────────────────────────────────────── */

export type StateMeta = {
  label: string;
  /** Candidate-facing explanation of what this state means for sharing. */
  meaning: string;
  tone: "neutral" | "warn" | "info" | "good" | "live";
};

export const STATE_META: Record<EvidenceState, StateMeta> = {
  pending: { label: "Not reviewed", meaning: "You haven't looked at this yet.", tone: "neutral" },
  reviewed: { label: "Reviewed", meaning: "Seen, not shared.", tone: "neutral" },
  contested: { label: "Contested", meaning: "Held back while you sort this out.", tone: "warn" },
  revised: { label: "Revised by you", meaning: "Your wording, waiting on your approval.", tone: "info" },
  private: { label: "Private", meaning: "Only you can see this.", tone: "neutral" },
  approved: { label: "Approved", meaning: "Ready to share when you unlock matches.", tone: "good" },
  shared: { label: "Shared", meaning: "Visible to employers you approved.", tone: "live" },
};

/** The summary a candidate should see now — revision wins if present. */
export function displaySummary(trait: Trait): string {
  return trait.state === "revised" || trait.state === "approved"
    ? (trait.revisedSummary ?? trait.summary)
    : trait.summary;
}

/** Nothing is shared unless it is explicitly in the shared state. */
export function isVisibleToEmployers(trait: Trait): boolean {
  return trait.state === "shared";
}

/** What the candidate should be nudged to do next, or null if nothing. */
export function nextAction(traits: Trait[]): { label: string; count: number } | null {
  const pending = traits.filter((t) => t.state === "pending").length;
  if (pending) return { label: "Review new evidence", count: pending };
  const ready = traits.filter((t) => t.state === "approved").length;
  if (ready) return { label: "Unlock matches", count: ready };
  const open = traits.filter((t) => t.state === "contested").length;
  if (open) return { label: "Finish contesting", count: open };
  return null;
}
