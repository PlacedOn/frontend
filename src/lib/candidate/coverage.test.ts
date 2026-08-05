/**
 * Tests for interview coverage.
 *
 * The invariant worth guarding is negative: nothing in this module may produce a
 * number derived from a trait's `point`. Coverage counts TOPICS. The moment it
 * counts anything else it has become the composite the product refuses to
 * compute, and it would arrive looking like a legitimate progress indicator.
 */

import { describe, expect, test } from "vitest";
import {
  buildCoverage,
  hasAnyReading,
  standingForTopics,
  summariseCoverage,
  type InterviewTopic,
} from "./coverage";
import type { EvidenceSpan, TraitScore } from "@/types/scoring";

const topic = (traitKey: string): InterviewTopic => ({
  traitKey,
  traitLabel: `Label for ${traitKey}`,
  blockId: 3,
  why: "Why this topic is in the plan.",
});

const span: EvidenceSpan = {
  id: "span-1",
  transcriptId: "transcript-1",
  quote: "A verbatim moment.",
  startMs: 1000,
  endMs: 2000,
};

const reading = (traitKey: string, evidence: EvidenceSpan[]): TraitScore => ({
  id: `reading-${traitKey}`,
  blockId: 3,
  traitKey,
  traitLabel: `Label for ${traitKey}`,
  point: 74,
  bandLow: 69,
  bandHigh: 79,
  confidence: evidence.length > 0 ? "supported" : "needs_more_evidence",
  evidence,
  interviewId: null,
  createdAt: "2026-08-01T09:12:00.000Z",
});

const PLAN = [topic("a"), topic("b"), topic("c")];

describe("buildCoverage", () => {
  test("marks a topic with cited evidence as having evidence", () => {
    const [entry] = buildCoverage([topic("a")], [reading("a", [span])]);
    expect(entry.status).toBe("has_evidence");
    expect(entry.reading).not.toBeNull();
  });

  test("distinguishes a topic that was reached but produced nothing citable", () => {
    // Not the same as never asking. The first is a reading we do not trust; the
    // second is a question we never put. Collapsing them would let an
    // unsupported figure sit in the covered pile looking finished.
    const [entry] = buildCoverage([topic("a")], [reading("a", [])]);
    expect(entry.status).toBe("asked_no_evidence");
    expect(entry.reading).not.toBeNull();
  });

  test("marks a planned topic with no reading as never reached, with no reading attached", () => {
    const [entry] = buildCoverage([topic("a")], []);
    expect(entry.status).toBe("not_reached");
    // Load-bearing: downstream cards render an absence, and they can only do
    // that if there is genuinely nothing here to render a figure from.
    expect(entry.reading).toBeNull();
  });

  test("follows plan order, not the order the readings arrived in", () => {
    const coverage = buildCoverage(PLAN, [reading("c", [span]), reading("a", [span])]);
    expect(coverage.map((c) => c.topic.traitKey)).toEqual(["a", "b", "c"]);
  });

  test("returns one entry per planned topic and never more", () => {
    // The denominator is what we said we would ask. A reading for an unplanned
    // topic cannot be a gap in the plan and must not inflate the count.
    const coverage = buildCoverage(PLAN, [reading("a", [span]), reading("z", [span])]);
    expect(coverage).toHaveLength(3);
    expect(coverage.map((c) => c.topic.traitKey)).not.toContain("z");
  });

  test("returns nothing for an empty plan", () => {
    expect(buildCoverage([], [reading("a", [span])])).toEqual([]);
  });
});

describe("summariseCoverage", () => {
  const coverage = buildCoverage(PLAN, [reading("a", [span]), reading("b", [])]);

  test("counts each status separately", () => {
    expect(summariseCoverage(coverage)).toEqual({
      planned: 3,
      withEvidence: 1,
      askedWithoutEvidence: 1,
      notReached: 1,
    });
  });

  test("accounts for every planned topic exactly once", () => {
    const s = summariseCoverage(coverage);
    expect(s.withEvidence + s.askedWithoutEvidence + s.notReached).toBe(s.planned);
  });

  test("emits only topic counts — no field derived from a trait figure", () => {
    // The invariant, made executable. A `score`, `percent`, `average`, or
    // `readiness` added to this summary fails here.
    expect(Object.keys(summariseCoverage(coverage)).sort()).toEqual([
      "askedWithoutEvidence",
      "notReached",
      "planned",
      "withEvidence",
    ]);
  });

  test("reports an all-zero summary for an empty plan rather than dividing by it", () => {
    expect(summariseCoverage([])).toEqual({
      planned: 0,
      withEvidence: 0,
      askedWithoutEvidence: 0,
      notReached: 0,
    });
  });
});

describe("hasAnyReading", () => {
  test("is false when the interview produced nothing", () => {
    expect(hasAnyReading(buildCoverage(PLAN, []))).toBe(false);
  });

  test("is true once any topic has a reading, even an uncited one", () => {
    expect(hasAnyReading(buildCoverage(PLAN, [reading("a", [])]))).toBe(true);
  });
});

describe("standingForTopics", () => {
  const coverage = buildCoverage(PLAN, [reading("a", [span]), reading("b", [])]);

  test("reports where the candidate stands on each topic a role asks about", () => {
    expect(standingForTopics(["a", "b", "c"], coverage).map((s) => s.status)).toEqual([
      "has_evidence",
      "asked_no_evidence",
      "not_reached",
    ]);
  });

  test("preserves the order the role listed its topics in", () => {
    expect(standingForTopics(["c", "a"], coverage).map((s) => s.traitKey)).toEqual(["c", "a"]);
  });

  test("treats a topic outside our plan as not reached rather than dropping it", () => {
    // From the candidate's side there is no evidence either way, and silently
    // omitting the row would hide something the role does assess.
    const [entry] = standingForTopics(["unplanned"], coverage);
    expect(entry.status).toBe("not_reached");
    expect(entry.traitLabel).toBe("unplanned");
  });

  test("returns a list, never a ratio", () => {
    // A "3 of 5" summary is a composite about a person wearing a job's clothes,
    // and the first thing anyone would do with one is sort by it.
    const standing = standingForTopics(["a", "b"], coverage);
    expect(Array.isArray(standing)).toBe(true);
    expect(Object.keys(standing[0]).sort()).toEqual(["status", "traitKey", "traitLabel"]);
  });
});
