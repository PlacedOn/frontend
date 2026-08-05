/**
 * Tests for the directory filter ⇄ query-string boundary.
 *
 * This module is where URL state rots, and the rot is silent: a param that
 * parses to the wrong value produces a grid that looks fine and shows the wrong
 * people. Every test here asserts an OBSERVABLE decision — what the filter
 * object ends up holding — rather than restating the implementation.
 */

import { describe, expect, test } from "vitest";
import {
  filtersFromSearchParams,
  filtersToHref,
  filtersToSearchParams,
} from "./urlState";
import { EMPTY_FILTERS, EXPERIENCE_BOUNDS, type DirectoryFilters } from "@/types/directory";

const parse = (query: string) => filtersFromSearchParams(new URLSearchParams(query));

describe("filtersFromSearchParams — the experience window", () => {
  /**
   * ══ THE REGRESSION TEST ══
   * Shipped 2026-08-05. `Number(null)` is `0` and `Number("")` is `0`, NOT
   * `NaN`, so the obvious `const n = Number(raw); if (!Number.isFinite(n))
   * return fallback;` never reached its fallback for an absent param — it
   * returned 0. The ceiling came back 0, the window collapsed from 0–20 to
   * 0–0, and every candidate was filtered out on the bare URL.
   *
   * The first assertion is the one that failed. The second states the
   * arithmetic fact the defect rested on, so anyone re-introducing the bare
   * `Number()` reads why it does not work before they write it.
   */
  test("returns the fallback ceiling when expmax is absent, not 0", () => {
    const filters = parse("");

    expect(filters.experience.max).toBe(EXPERIENCE_BOUNDS.max);
    expect(filters.experience.max).not.toBe(0);

    // The trap itself, stated as an executable fact.
    expect(Number(null)).toBe(0);
    expect(Number.isFinite(Number(null))).toBe(true);
  });

  test("a bare URL keeps every candidate in range rather than collapsing the window", () => {
    const { min, max } = parse("").experience;

    expect(min).toBe(EXPERIENCE_BOUNDS.min);
    expect(max).toBe(EXPERIENCE_BOUNDS.max);
    expect(max).toBeGreaterThan(min);
  });

  test("returns the fallback when the param is present but empty", () => {
    // `?expmin=&expmax=` is what a form serialiser emits for untouched fields.
    expect(parse("expmin=&expmax=").experience).toEqual({
      min: EXPERIENCE_BOUNDS.min,
      max: EXPERIENCE_BOUNDS.max,
    });
  });

  test("returns the fallback when the param is not a number", () => {
    expect(parse("expmin=three&expmax=lots").experience).toEqual({
      min: EXPERIENCE_BOUNDS.min,
      max: EXPERIENCE_BOUNDS.max,
    });
  });

  test("clamps years outside the bounds instead of rejecting the URL", () => {
    expect(parse("expmin=-40&expmax=999").experience).toEqual({
      min: EXPERIENCE_BOUNDS.min,
      max: EXPERIENCE_BOUNDS.max,
    });
  });

  test("rounds fractional years to whole ones", () => {
    expect(parse("expmin=2.7&expmax=9.2").experience).toEqual({ min: 3, max: 9 });
  });

  test("repairs a reversed window rather than producing an impossible one", () => {
    // What a hand-edited link produces. The honest reading of 8..3 is 3..8.
    expect(parse("expmin=8&expmax=3").experience).toEqual({ min: 3, max: 8 });
  });
});

describe("filtersFromSearchParams — the minimum figure", () => {
  test("falls back to the default floor when min is absent", () => {
    expect(parse("trait=handles_ambiguity").minFigure.min).toBe(EMPTY_FILTERS.minFigure.min);
  });

  test("falls back to the default floor when min is an empty string", () => {
    expect(parse("trait=handles_ambiguity&min=").minFigure.min).toBe(EMPTY_FILTERS.minFigure.min);
  });

  test("snaps the floor to the control's 5-point vocabulary", () => {
    expect(parse("trait=t&min=63").minFigure.min).toBe(65);
    expect(parse("trait=t&min=62").minFigure.min).toBe(60);
  });

  test("clamps the floor to 0–100", () => {
    expect(parse("trait=t&min=-30").minFigure.min).toBe(0);
    expect(parse("trait=t&min=400").minFigure.min).toBe(100);
  });

  test("leaves the facet inactive when no trait is named", () => {
    // There is deliberately no default trait — a default would quietly become
    // the composite this product refuses to compute.
    expect(parse("min=80").minFigure.traitKey).toBeNull();
  });

  test("arms the no-reading exclusion only alongside a named trait", () => {
    expect(parse("trait=handles_ambiguity&uncovered=hide").minFigure.excludeNoReading).toBe(true);
  });

  test("ignores uncovered=hide when there is no trait to attribute it to", () => {
    // Otherwise an exclusion would run with nothing on screen explaining it.
    expect(parse("uncovered=hide").minFigure.excludeNoReading).toBe(false);
  });

  test("ignores an uncovered value other than hide", () => {
    expect(parse("trait=t&uncovered=show").minFigure.excludeNoReading).toBe(false);
  });
});

describe("filtersFromSearchParams — vocabularies and repeated params", () => {
  test("collects one skill per repeated param", () => {
    expect(parse("skill=Python&skill=Redis").skills).toEqual(["Python", "Redis"]);
  });

  test("drops empty repeated values rather than filtering on an empty string", () => {
    expect(parse("skill=Python&skill=&loc=").skills).toEqual(["Python"]);
    expect(parse("skill=Python&skill=&loc=").locations).toEqual([]);
  });

  test("keeps a location containing a comma intact", () => {
    // The reason params repeat instead of being comma-joined: values are free
    // text from the data, and a separator that can occur inside a value is a
    // parser bug waiting for its first input.
    expect(parse(`loc=${encodeURIComponent("Hybrid — Pune, Maharashtra")}`).locations).toEqual([
      "Hybrid — Pune, Maharashtra",
    ]);
  });

  test("treats an unrecognised availability as no constraint, not as match-nothing", () => {
    // An empty grid with no visible cause is indistinguishable from a broken page.
    expect(parse("avail=xyz").availability).toBeNull();
  });

  test("accepts every availability in the vocabulary", () => {
    expect(parse("avail=immediately").availability).toBe("immediately");
    expect(parse("avail=not_looking").availability).toBe("not_looking");
  });

  test("treats an empty role as no role rather than a role named empty string", () => {
    expect(parse("role=").role).toBeNull();
  });
});

describe("filtersToSearchParams", () => {
  test("writes nothing at all for the zero state", () => {
    // This is what keeps a bare /dev/directory bare instead of shipping a URL
    // that reads to a recipient as though it has already been filtered.
    expect(filtersToSearchParams(EMPTY_FILTERS).toString()).toBe("");
  });

  test("omits the floor when no trait names it", () => {
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: null, min: 85, excludeNoReading: true },
    };

    const written = filtersToSearchParams(filters);
    expect(written.get("min")).toBeNull();
    expect(written.get("uncovered")).toBeNull();
  });

  test("omits an experience bound that is still at its default", () => {
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      experience: { min: 3, max: EXPERIENCE_BOUNDS.max },
    };

    const written = filtersToSearchParams(filters);
    expect(written.get("expmin")).toBe("3");
    expect(written.get("expmax")).toBeNull();
  });

  test("writes one param per skill", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Go", "Redis"] };
    expect(filtersToSearchParams(filters).getAll("skill")).toEqual(["Go", "Redis"]);
  });
});

describe("round trip", () => {
  test("a fully-populated query survives serialise → parse unchanged", () => {
    const filters: DirectoryFilters = {
      role: "Backend engineer",
      skills: ["Go", "PostgreSQL"],
      minFigure: { traitKey: "handles_ambiguity", min: 65, excludeNoReading: true },
      locations: ["Remote (IST)", "Hybrid — Pune"],
      availability: "within_30_days",
      experience: { min: 3, max: 12 },
    };

    expect(filtersFromSearchParams(filtersToSearchParams(filters))).toEqual(filters);
  });

  test("the zero state survives serialise → parse unchanged", () => {
    expect(filtersFromSearchParams(filtersToSearchParams(EMPTY_FILTERS))).toEqual(EMPTY_FILTERS);
  });
});

describe("filtersToHref", () => {
  test("omits the question mark entirely when there is nothing to say", () => {
    // `/dev/directory?` is a different string from `/dev/directory` and looks,
    // to anyone reading it, like something went wrong.
    expect(filtersToHref("/dev/directory", EMPTY_FILTERS)).toBe("/dev/directory");
  });

  test("appends the query when a filter is set", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, role: "QA engineer" };
    expect(filtersToHref("/dev/directory", filters)).toBe(
      "/dev/directory?role=QA+engineer",
    );
  });
});
