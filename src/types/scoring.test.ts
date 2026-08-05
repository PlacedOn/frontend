/**
 * Tests for the trait-scoring boundary mappers and the invariants they assert.
 *
 * The invariants at the top of `scoring.ts` are product constraints, and two of
 * them are enforceable at runtime rather than only by review:
 *
 *   - "confidence is qualitative" — `bandFromConfidence` is the only place the
 *     wire enum `high|medium|low` may die, and nothing numeric may escape.
 *   - "every figure traces to evidence" — a reading with no cited moments is a
 *     guess, whatever the model said about itself.
 *
 * The third — "no overall person score" — is asserted here as a shape check on
 * the mapper's output, so adding an `overall` field to `TraitScore` turns a
 * review argument into a red test.
 */

import { describe, expect, test } from "vitest";
import {
  BAND_COPY,
  BAND_GEOMETRY,
  bandFromConfidence,
  toTraitScore,
  type EvidenceBand,
  type EvidenceSpan,
  type TraitScoreRow,
  type WireConfidence,
} from "./scoring";

const row: TraitScoreRow = {
  id: "row-1",
  block_id: 3,
  trait_key: "handles_ambiguity",
  trait_label: "Handles ambiguity",
  point: 74,
  band_low: 69,
  band_high: 79,
  confidence: "high",
  interview_id: "interview-1",
  created_at: "2026-08-01T09:12:00.000Z",
};

const span = (id: string): EvidenceSpan => ({
  id,
  transcriptId: "transcript-1",
  quote: "I wrote down the three readings I could defend and picked the one that failed safe.",
  startMs: 412_000,
  endMs: 431_000,
});

describe("bandFromConfidence", () => {
  test("maps the stored enum onto the vocabulary the UI is allowed to speak", () => {
    expect(bandFromConfidence("high")).toBe("supported");
    expect(bandFromConfidence("medium")).toBe("emerging");
    expect(bandFromConfidence("low")).toBe("needs_more_evidence");
  });

  test("never lets a wire value through as its own label", () => {
    // A candidate who reads "confidence: high" will treat it as a grade, and a
    // recruiter will sort by it. The wire vocabulary must not reach a screen.
    const wire: readonly WireConfidence[] = ["high", "medium", "low"];
    const bands: readonly EvidenceBand[] = ["supported", "emerging", "needs_more_evidence"];

    for (const value of wire) {
      expect(bands).toContain(bandFromConfidence(value));
      expect(bandFromConfidence(value)).not.toBe(value as string);
    }
  });

  test("maps each wire value to a distinct band", () => {
    const mapped = new Set((["high", "medium", "low"] as const).map(bandFromConfidence));
    expect(mapped.size).toBe(3);
  });
});

describe("toTraitScore — evidence is the gate, not the model's self-report", () => {
  test("downgrades a high-confidence row with no cited evidence to needs_more_evidence", () => {
    // This is the load-bearing one. The row claims `high`; nothing is cited; the
    // reading is a guess and has to render as one.
    expect(toTraitScore(row, []).confidence).toBe("needs_more_evidence");
  });

  test("downgrades when the evidence argument is omitted entirely", () => {
    expect(toTraitScore(row).confidence).toBe("needs_more_evidence");
  });

  test("honours the row's confidence once at least one moment is cited", () => {
    expect(toTraitScore(row, [span("s1")]).confidence).toBe("supported");
    expect(toTraitScore({ ...row, confidence: "medium" }, [span("s1")]).confidence).toBe(
      "emerging",
    );
  });

  test("keeps a low-confidence row at needs_more_evidence even when cited", () => {
    expect(toTraitScore({ ...row, confidence: "low" }, [span("s1")]).confidence).toBe(
      "needs_more_evidence",
    );
  });

  test("carries the cited spans through untouched", () => {
    const evidence = [span("s1"), span("s2")];
    const mapped = toTraitScore(row, evidence);

    expect(mapped.evidence).toHaveLength(2);
    expect(mapped.evidence[0].quote).toBe(evidence[0].quote);
  });
});

describe("toTraitScore — the row → model mapping", () => {
  test("renames every snake_case column onto its camelCase field", () => {
    const mapped = toTraitScore(row, [span("s1")]);

    expect(mapped).toMatchObject({
      id: "row-1",
      blockId: 3,
      traitKey: "handles_ambiguity",
      traitLabel: "Handles ambiguity",
      point: 74,
      bandLow: 69,
      bandHigh: 79,
      interviewId: "interview-1",
      createdAt: "2026-08-01T09:12:00.000Z",
    });
  });

  test("preserves a null interview id rather than coercing it", () => {
    expect(toTraitScore({ ...row, interview_id: null }, [span("s1")]).interviewId).toBeNull();
  });

  test("emits no field beyond the trait contract — no composite, no person score", () => {
    // Invariant 1, made executable. A blended `overall`/`rank`/`matchPercent`
    // added to the mapper fails here rather than in code review, and adding a
    // legitimate field is a deliberate edit to this list.
    expect(Object.keys(toTraitScore(row, [span("s1")])).sort()).toEqual([
      "bandHigh",
      "bandLow",
      "blockId",
      "confidence",
      "createdAt",
      "evidence",
      "id",
      "interviewId",
      "point",
      "traitKey",
      "traitLabel",
    ]);
  });

  test("returns a fresh object and never mutates the row it was handed", () => {
    const source: TraitScoreRow = { ...row };
    toTraitScore(source, []);
    expect(source).toEqual(row);
  });
});

describe("BAND_COPY", () => {
  test("gives every band a label and a plain-language explanation", () => {
    const bands: readonly EvidenceBand[] = ["supported", "emerging", "needs_more_evidence"];

    for (const band of bands) {
      expect(BAND_COPY[band].label.length).toBeGreaterThan(0);
      expect(BAND_COPY[band].plain.length).toBeGreaterThan(0);
    }
  });

  test("names the missing-evidence band as our gap, not a finding about the person", () => {
    expect(BAND_COPY.needs_more_evidence.plain).toContain("gap in our evidence");
    expect(BAND_COPY.needs_more_evidence.plain).toContain("not a finding about the person");
  });

  test("carries no numeric certainty in any band's copy", () => {
    // "Confidence 0.62" on a screen becomes a grade. Nothing here may be a
    // number, a percentage, or a letter.
    for (const copy of Object.values(BAND_COPY)) {
      expect(copy.label).not.toMatch(/\d/);
      expect(copy.plain).not.toMatch(/\d+\s*%/);
    }
  });

  test("resolves its colours through design tokens rather than raw hex", () => {
    for (const copy of Object.values(BAND_COPY)) {
      expect(copy.ink.startsWith("var(--")).toBe(true);
      expect(copy.fill.startsWith("var(--")).toBe(true);
    }
  });
});

describe("BAND_GEOMETRY — confidence survives greyscale", () => {
  test("widens the interval as confidence drops", () => {
    // Width is one of the two non-hue channels carrying confidence. A reader
    // with deuteranopia, or a printed page, has only these two.
    expect(BAND_GEOMETRY.supported.minWidthPct).toBeLessThan(
      BAND_GEOMETRY.emerging.minWidthPct,
    );
    expect(BAND_GEOMETRY.emerging.minWidthPct).toBeLessThan(
      BAND_GEOMETRY.needs_more_evidence.minWidthPct,
    );
  });

  test("fades the fill as confidence drops", () => {
    expect(BAND_GEOMETRY.supported.fillOpacity).toBeGreaterThan(
      BAND_GEOMETRY.emerging.fillOpacity,
    );
    expect(BAND_GEOMETRY.emerging.fillOpacity).toBeGreaterThan(
      BAND_GEOMETRY.needs_more_evidence.fillOpacity,
    );
  });

  test("keeps every fill visible — the least certain band still renders", () => {
    for (const geometry of Object.values(BAND_GEOMETRY)) {
      expect(geometry.fillOpacity).toBeGreaterThan(0);
      expect(geometry.fillOpacity).toBeLessThanOrEqual(1);
      expect(geometry.minWidthPct).toBeGreaterThan(0);
      expect(geometry.minWidthPct).toBeLessThan(100);
    }
  });
});
