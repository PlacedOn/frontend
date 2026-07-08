/**
 * Data adapter for candidate matches. Prefers the real backend
 * (GET /demo/matches) when configured, else falls back to rich mock data.
 * The UI imports only these functions, so wiring the backend changes
 * nothing in the components.
 */

import type { Confidence, RoleMatch } from "@/lib/types";
import { isLiveBackend, getDemoMatches, type DemoMatch } from "@/lib/api";

const MATCHES: RoleMatch[] = [
  {
    job_id: "job_meridian_fe",
    title: "Senior Frontend Engineer",
    company: "Meridian",
    location: "Remote · EU",
    match_summary:
      "Strong fit for structured debugging and building under ambiguity — the two signals this team screens hardest for.",
    evidence: [
      {
        trait: "Structured debugging",
        quote: "I reproduced the failure in isolation before touching the API layer, so I could prove the fix.",
        confidence: "high",
      },
      {
        trait: "Ambiguity tolerance",
        quote: "The spec was half-written, so I shipped a thin slice and let the edge cases teach me the rest.",
        confidence: "high",
      },
    ],
    missing_signals: ["Stakeholder communication"],
    status: "new",
  },
  {
    job_id: "job_cortex_product",
    title: "Product Engineer",
    company: "Cortex",
    location: "Hybrid · Berlin",
    match_summary:
      "Decision velocity and user empathy came through clearly — Cortex weights both above raw output.",
    evidence: [
      {
        trait: "Decision velocity",
        quote: "I picked the boring option that unblocked three people the same day, then revisited it later.",
        confidence: "high",
      },
      {
        trait: "User empathy",
        quote: "I watched two support calls before writing a line — the real bug was the empty state, not the form.",
        confidence: "medium",
      },
    ],
    missing_signals: ["Systems design at scale"],
    status: "new",
  },
  {
    job_id: "job_lumen_fe",
    title: "Frontend Engineer",
    company: "Lumen",
    location: "Onsite · Amsterdam",
    match_summary:
      "Your rigor and clear communication cleared this role's bar; one collaboration signal is still light.",
    evidence: [
      {
        trait: "Engineering rigor",
        quote: "I wrote the failing test first because I wanted the bug to prove it was gone.",
        confidence: "high",
      },
    ],
    missing_signals: ["Cross-team collaboration", "Mentoring"],
    status: "new",
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Map the backend's flatter match shape into the UI's richer RoleMatch.
 *  The backend gives one summary (evidence_reason) rather than per-trait
 *  quotes, so we present it as a single evidence item + degrade the drawer
 *  gracefully. */
function mapDemoMatch(m: DemoMatch): RoleMatch {
  const confidence: Confidence = m.match_score >= 85 ? "high" : m.match_score >= 70 ? "medium" : "low";
  const isStretch = /stretch|possible/i.test(m.match_label);
  return {
    job_id: m.id,
    title: m.role,
    company: m.company,
    location: m.location,
    match_summary: m.evidence_reason,
    evidence: [{ trait: "Role fit", quote: m.evidence_reason, confidence }],
    missing_signals: isStretch ? ["Larger-scale ownership"] : [],
    status: "new",
  };
}

/** Returns the candidate's current role matches (live backend or mock). */
export async function getCandidateMatches(): Promise<RoleMatch[]> {
  if (isLiveBackend()) {
    try {
      const resp = await getDemoMatches();
      if (resp.matches?.length) return resp.matches.map(mapDemoMatch);
    } catch {
      // fall through to mock
    }
  }
  await delay(500);
  return MATCHES.map((m) => ({ ...m }));
}

/** Records candidate interest in a role. Resolves on success, throws on failure. */
export async function submitInterest(_jobId: string): Promise<void> {
  await delay(450);
}

/** Dismisses a role from the candidate's matches. */
export async function dismissMatch(_jobId: string): Promise<void> {
  await delay(450);
}
