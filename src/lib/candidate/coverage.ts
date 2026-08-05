/**
 * Interview coverage — pure functions, no React.
 *
 * ══ WHAT COVERAGE IS, AND WHAT IT IS NOT ══
 * Coverage is a property of the INTERVIEW: how much of the plan the session
 * actually reached, and how much of what it reached is backed by cited evidence.
 * It is legitimate to show a candidate, and it is legitimate to show as a
 * proportion, because the thing being measured is our work.
 *
 * It is NOT a score. Nothing in this module blends trait figures, and nothing
 * here returns a number that could be read as "how good this person is". The
 * distinction survives only if the arithmetic never crosses over, so the rule is
 * literal: this module may count TOPICS, and may never touch `point`.
 *
 * ══ WHY THREE STATES AND NOT TWO ══
 * "Covered / not covered" hides the case that matters most. A topic the
 * interview REACHED but produced no citable moment for is not the same as a
 * topic it never got to — the first is a reading we do not trust, the second is
 * a question we never asked. Collapsing them would let an unsupported figure sit
 * in the "covered" pile looking finished. Both are our gaps; they are different
 * gaps, and the candidate can act on them differently.
 */

import type { TraitScore } from "@/types/scoring";

/** One topic the interview plan intended to reach. */
export interface InterviewTopic {
  /** Stable machine key. Matches `TraitScore.traitKey`. */
  traitKey: string;
  traitLabel: string;
  /** Which HCV block it belongs to. */
  blockId: number;
  /** Why this topic is in the plan at all, in the candidate's language. */
  why: string;
}

/**
 * Where a planned topic stands.
 *
 * `not_reached` deliberately has NO figure attached anywhere downstream — the
 * whole point is that there is nothing to show, and rendering a 0, a dash on a
 * 0–100 track, or a greyed-out number would all read as a low result.
 */
export type CoverageStatus = "has_evidence" | "asked_no_evidence" | "not_reached";

export interface TopicCoverage {
  topic: InterviewTopic;
  status: CoverageStatus;
  /** The reading, when one exists. `null` for `not_reached`. */
  reading: TraitScore | null;
}

/**
 * Line the plan up against what the interview actually produced.
 *
 * Driven by the PLAN, not by the readings: a reading with no matching planned
 * topic would silently disappear here, which is correct — the denominator is
 * what we said we would ask, and a topic nobody planned cannot be a gap in the
 * plan. (It would be a bug upstream, and one worth seeing as a missing card
 * rather than as a phantom row.)
 */
export function buildCoverage(
  plan: readonly InterviewTopic[],
  readings: readonly TraitScore[],
): readonly TopicCoverage[] {
  return plan.map((topic) => {
    const reading = readings.find((r) => r.traitKey === topic.traitKey) ?? null;

    if (!reading) return { topic, status: "not_reached", reading: null };

    return {
      topic,
      // Evidence is the gate, exactly as at the scoring boundary — a reading
      // with nothing cited under it has not been established, whatever figure
      // it carries.
      status: reading.evidence.length > 0 ? "has_evidence" : "asked_no_evidence",
      reading,
    };
  });
}

/** Counts only. No percentage, no average, and nothing derived from `point`. */
export interface CoverageSummary {
  planned: number;
  withEvidence: number;
  askedWithoutEvidence: number;
  notReached: number;
}

export function summariseCoverage(coverage: readonly TopicCoverage[]): CoverageSummary {
  const count = (status: CoverageStatus) => coverage.filter((c) => c.status === status).length;

  return {
    planned: coverage.length,
    withEvidence: count("has_evidence"),
    askedWithoutEvidence: count("asked_no_evidence"),
    notReached: count("not_reached"),
  };
}

/** Has the interview produced anything at all yet? Drives the empty state. */
export function hasAnyReading(coverage: readonly TopicCoverage[]): boolean {
  return coverage.some((c) => c.reading !== null);
}

/**
 * What a given role's interview would ask about, marked with where the
 * candidate already stands.
 *
 * Returned as a LIST, never a ratio. "You cover 3 of 5 for this role" is a
 * number about a person dressed as a number about a job, and the first thing
 * anyone would do with it is sort by it.
 */
export interface TopicStanding {
  traitKey: string;
  /** Falls back to the key when a role names a topic outside the plan. */
  traitLabel: string;
  status: CoverageStatus;
}

export function standingForTopics(
  traitKeys: readonly string[],
  coverage: readonly TopicCoverage[],
): readonly TopicStanding[] {
  return traitKeys.map((traitKey) => {
    const entry = coverage.find((c) => c.topic.traitKey === traitKey);
    return {
      traitKey,
      traitLabel: entry?.topic.traitLabel ?? traitKey,
      // A topic this role asks about that is not even in our plan is, from the
      // candidate's side, indistinguishable from one we planned and never
      // reached: either way there is no evidence and the interview is where it
      // gets fixed.
      status: entry?.status ?? "not_reached",
    };
  });
}
