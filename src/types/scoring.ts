/**
 * The trait-scoring contract.
 *
 * Mirrors `trait_scores` and `evidence_spans` from placedon-v2-plan
 * docs/02_SYSTEM_ARCHITECTURE.md §3, reconciled with the vocabulary this
 * codebase already ships (`Band` in src/lib/v1.ts).
 *
 * ══ THE INVARIANTS ══
 * These are product constraints, not style preferences. A component that
 * violates one must not ship.
 *
 * 1. NO OVERALL PERSON SCORE. There is no field here that blends traits into a
 *    single number ranking a human being, and none may be added. `point` is a
 *    per-trait figure. A caller that averages several `point` values to render
 *    "Candidate: 72" has broken the product's core promise.
 *
 * 2. CONFIDENCE IS QUALITATIVE. The UI surfaces `supported` / `emerging` /
 *    `needs_more_evidence` — never a numeric model confidence, never a
 *    percentage certainty. The database's `high|medium|low` enum is a WIRE
 *    value that gets mapped at the boundary by `bandFromConfidence()` and is
 *    never rendered.
 *
 * 3. NO DEMOGRAPHIC PROXIES. School, college, employer prestige, name, photo,
 *    age, gender, caste, region, marital status — none appear as fields here,
 *    and none may be added. Anything correlated with a protected attribute is
 *    excluded whether or not it is predictive; that it predicts is usually
 *    *because* it proxies.
 *
 * 4. EVERY FIGURE TRACES TO EVIDENCE. A trait with no `evidence` array is not
 *    a finding, it is a guess, and renders as `needs_more_evidence`.
 */

/**
 * The qualitative confidence vocabulary. This is what humans see.
 *
 * Deliberately not a number: a candidate reading "confidence 0.62" will treat
 * it as a grade, and a recruiter will sort by it. The band says how much
 * evidence stands behind a reading — not how good the person is.
 */
export type EvidenceBand = "supported" | "emerging" | "needs_more_evidence";

/**
 * The raw `confidence` enum on the `trait_scores` row. Wire format only —
 * map with `bandFromConfidence()` before this reaches a component.
 */
export type WireConfidence = "high" | "medium" | "low";

/** Map the stored enum to the vocabulary the UI is allowed to speak. */
export function bandFromConfidence(confidence: WireConfidence): EvidenceBand {
  switch (confidence) {
    case "high":
      return "supported";
    case "medium":
      return "emerging";
    case "low":
      return "needs_more_evidence";
  }
}

/** One cited moment from a transcript. The proof under a trait reading. */
export interface EvidenceSpan {
  id: string;
  /** FK → transcripts.id. Which transcript this quote lives in. */
  transcriptId: string;
  /** Verbatim. Never paraphrased, never LLM-rewritten. */
  quote: string;
  /** Offset into the recording, milliseconds. Drives the timestamp chip. */
  startMs: number;
  endMs: number;
}

/**
 * A single trait reading with its uncertainty interval.
 *
 * `point`, `bandLow` and `bandHigh` are all on the same 0–100 scale and
 * describe ONE trait — never a person. The interval is the honest part: a
 * point estimate alone implies a precision the evidence does not support.
 */
export interface TraitScore {
  id: string;
  /** Which HCV block this trait belongs to. */
  blockId: number;
  /** Stable machine key, e.g. `handles_ambiguity`. */
  traitKey: string;
  /** Human-readable trait name, e.g. "Handles ambiguity". */
  traitLabel: string;

  /** Point estimate, 0–100. A trait figure. NOT a person score. */
  point: number;
  /** Lower bound of the plausible interval, 0–100. */
  bandLow: number;
  /** Upper bound of the plausible interval, 0–100. */
  bandHigh: number;

  /** Qualitative confidence. See invariant 2. */
  confidence: EvidenceBand;

  /** Cited transcript moments. Empty means the reading is not yet supported. */
  evidence: EvidenceSpan[];

  /** FK → interviews.id, the session this reading came from. */
  interviewId: string | null;
  createdAt: string;
}

/** Trust signals attached to a candidate record. */
export type TrustSignal = "verified" | "interview_complete" | "contested";

/** Raw `trait_scores` row shape, before boundary mapping. */
export interface TraitScoreRow {
  id: string;
  block_id: number;
  trait_key: string;
  trait_label: string;
  point: number;
  band_low: number;
  band_high: number;
  confidence: WireConfidence;
  interview_id: string | null;
  created_at: string;
}

/** Boundary mapper: DB row → app model. The only place `WireConfidence` dies. */
export function toTraitScore(row: TraitScoreRow, evidence: EvidenceSpan[] = []): TraitScore {
  return {
    id: row.id,
    blockId: row.block_id,
    traitKey: row.trait_key,
    traitLabel: row.trait_label,
    point: row.point,
    bandLow: row.band_low,
    bandHigh: row.band_high,
    // A reading with no cited evidence cannot claim support, whatever the
    // model said. Evidence is the gate, not the model's self-report.
    confidence: evidence.length === 0 ? "needs_more_evidence" : bandFromConfidence(row.confidence),
    evidence,
    interviewId: row.interview_id,
    createdAt: row.created_at,
  };
}

/** Display copy for each band. Single source — components never inline these. */
export const BAND_COPY: Record<
  EvidenceBand,
  { label: string; ink: string; fill: string; plain: string }
> = {
  supported: {
    label: "Supported",
    ink: "var(--band-supported-ink)",
    fill: "var(--band-supported-fill)",
    plain: "Several independent moments in the interview point the same way.",
  },
  emerging: {
    label: "Emerging",
    ink: "var(--band-emerging-ink)",
    fill: "var(--band-emerging-fill)",
    plain: "There are signs of this, but fewer moments to draw on — treat the range as wide.",
  },
  needs_more_evidence: {
    label: "Needs more evidence",
    ink: "var(--band-needs-ink)",
    fill: "var(--band-needs-fill)",
    plain: "Not enough came up in this interview to say much. This is a gap in our evidence, not a finding about the person.",
  },
};

/**
 * How wide the shaded interval is allowed to read, as a share of the track.
 *
 * Width and fill opacity BOTH encode confidence, so the band survives
 * greyscale, colour-blindness, and a printed page. A wide faint band and a
 * narrow solid one are distinguishable without any hue at all.
 */
export const BAND_GEOMETRY: Record<EvidenceBand, { fillOpacity: number; minWidthPct: number }> = {
  supported: { fillOpacity: 0.9, minWidthPct: 4 },
  emerging: { fillOpacity: 0.55, minWidthPct: 10 },
  needs_more_evidence: { fillOpacity: 0.28, minWidthPct: 18 },
};
