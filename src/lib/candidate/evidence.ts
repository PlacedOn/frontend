/**
 * The candidate's own verified evidence — the traits an interview surfaced, each
 * grounded in a transcript moment. Mirrors the public profile's trait shape so
 * the private (editable, visibility-controlled) and public (read-only) faces
 * render the same evidence. Local sample today; swaps to the live report + the
 * candidate's saved per-trait visibility when the backend is connected.
 */

export type Band = "high" | "emerging" | "needs_review";

export interface EvidenceTrait {
  id: string;
  label: string;
  band: Band;
  quote: string; // the candidate's own words the trait traces to
  at: string; // transcript timestamp
  visible: boolean; // candidate-controlled — what employers see
}

export const CANDIDATE_EVIDENCE: EvidenceTrait[] = [
  { id: "t1", label: "Systems thinking", band: "high", quote: "I'd cache the read path and measure before touching the write side — a rollback I can't reason about is worse than the bug.", at: "08:41", visible: true },
  { id: "t2", label: "Structured debugging", band: "high", quote: "I bisected by cost first, ruled out the cache path, and that pointed straight at the write lock.", at: "12:07", visible: true },
  { id: "t3", label: "Clear communication", band: "emerging", quote: "I wrote the postmortem so the next on-call could act without paging me — the failure mode, not just the fix.", at: "17:52", visible: true },
  { id: "t4", label: "Handles ambiguity", band: "needs_review", quote: "Honestly I hadn't owned the ambiguous-requirements part before — I'd want a week to sit with the domain first.", at: "21:10", visible: false },
];

export const BAND_META: Record<Band, { label: string; fg: string; bg: string }> = {
  high: { label: "Strong", fg: "var(--ok)", bg: "rgba(16,185,129,0.14)" },
  emerging: { label: "Emerging", fg: "var(--iris-ink)", bg: "var(--iris-ghost)" },
  needs_review: { label: "Needs more", fg: "var(--warn)", bg: "rgba(245,134,11,0.14)" },
};
