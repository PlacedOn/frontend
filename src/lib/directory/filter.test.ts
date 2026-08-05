/**
 * Tests for the directory matching rules.
 *
 * The rules encoded here are product decisions, not implementation details —
 * particularly the no-reading retention rule, which is the difference between
 * "we haven't asked yet" and "they failed". A test that only checked the count
 * would let that rule be inverted without noticing, so the tests below assert
 * WHICH records survive, by id.
 *
 * Fixtures are built locally rather than imported from `src/mocks`. The mock
 * rows exist to make a surface look real and will churn; these want a stable,
 * minimal shape where every field is load-bearing for the assertion.
 */

import { describe, expect, test } from "vitest";
import {
  activeFilters,
  buildVocabulary,
  countWithoutReading,
  filterCandidates,
  hasReadingOn,
  locationFacetCounts,
  skillFacetCounts,
} from "./filter";
import {
  EMPTY_FILTERS,
  EXPERIENCE_BOUNDS,
  type DirectoryCandidate,
  type DirectoryFilters,
  type DirectoryTraitFigure,
} from "@/types/directory";

function figure(traitKey: string, point: number): DirectoryTraitFigure {
  return {
    traitKey,
    traitLabel: traitKey === "ambiguity" ? "Handles ambiguity" : "Debugs systematically",
    point,
    bandLow: point - 8,
    bandHigh: point + 8,
    confidence: "supported",
    evidenceCount: 3,
  };
}

function candidate(overrides: Partial<DirectoryCandidate> & { id: string }): DirectoryCandidate {
  return {
    ref: overrides.id.toUpperCase(),
    headline: "A description of work",
    role: "Backend engineer",
    skills: [],
    location: "Remote (IST)",
    availability: "immediately",
    yearsExperience: 5,
    traits: [],
    trust: ["interview_complete"],
    assessedAt: "2026-07-28T09:12:00.000Z",
    ...overrides,
  };
}

const ids = (rows: readonly DirectoryCandidate[]) => rows.map((c) => c.id);

describe("filterCandidates — AND semantics across facets", () => {
  const pool: readonly DirectoryCandidate[] = [
    candidate({ id: "a", role: "Backend engineer", skills: ["Go"], location: "Bengaluru" }),
    candidate({ id: "b", role: "Backend engineer", skills: ["Python"], location: "Bengaluru" }),
    candidate({ id: "c", role: "Frontend engineer", skills: ["Go"], location: "Bengaluru" }),
  ];

  test("narrows rather than widens as facets are added", () => {
    const roleOnly: DirectoryFilters = { ...EMPTY_FILTERS, role: "Backend engineer" };
    const roleAndSkill: DirectoryFilters = { ...roleOnly, skills: ["Go"] };

    expect(ids(filterCandidates(pool, roleOnly))).toEqual(["a", "b"]);
    expect(ids(filterCandidates(pool, roleAndSkill))).toEqual(["a"]);
  });

  test("preserves the caller's array order", () => {
    expect(ids(filterCandidates(pool, EMPTY_FILTERS))).toEqual(["a", "b", "c"]);
  });

  test("returns everything for the zero state", () => {
    expect(filterCandidates(pool, EMPTY_FILTERS)).toHaveLength(pool.length);
  });
});

describe("filterCandidates — skills are AND, never OR", () => {
  const pool: readonly DirectoryCandidate[] = [
    candidate({ id: "both", skills: ["Python", "PostgreSQL", "Redis"] }),
    candidate({ id: "python-only", skills: ["Python"] }),
    candidate({ id: "postgres-only", skills: ["PostgreSQL"] }),
  ];

  test("requires every selected skill on the same candidate", () => {
    // OR would silently widen the result set every time a requirement is added,
    // which is the opposite of what the interaction implies.
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Python", "PostgreSQL"] };
    expect(ids(filterCandidates(pool, filters))).toEqual(["both"]);
  });

  test("can produce an empty result from a combination nobody carries", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Python", "Elixir"] };
    expect(filterCandidates(pool, filters)).toHaveLength(0);
  });
});

describe("filterCandidates — the no-reading retention rule", () => {
  const withHighReading = candidate({ id: "high", traits: [figure("ambiguity", 80)] });
  const withLowReading = candidate({ id: "low", traits: [figure("ambiguity", 40)] });
  const neverAsked = candidate({ id: "uncovered", traits: [figure("debugging", 90)] });
  const pool = [withHighReading, withLowReading, neverAsked] as const;

  const floor = (excludeNoReading: boolean): DirectoryFilters => ({
    ...EMPTY_FILTERS,
    minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading },
  });

  test("keeps a candidate the interview never asked about the named trait", () => {
    // A missing reading is a hole in OUR interview coverage, not a low figure.
    // Dropping them would convert "we haven't asked" into "they failed".
    expect(ids(filterCandidates(pool, floor(false)))).toContain("uncovered");
  });

  test("still applies the floor to candidates who do have a reading", () => {
    const survivors = ids(filterCandidates(pool, floor(false)));
    expect(survivors).toContain("high");
    expect(survivors).not.toContain("low");
  });

  test("drops the no-reading candidate only when excludeNoReading is opted into", () => {
    expect(ids(filterCandidates(pool, floor(true)))).toEqual(["high"]);
  });

  test("defaults the exclusion to off", () => {
    expect(EMPTY_FILTERS.minFigure.excludeNoReading).toBe(false);
  });

  test("ignores the floor entirely when no trait is named", () => {
    const noTrait: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: null, min: 95, excludeNoReading: true },
    };
    expect(filterCandidates(pool, noTrait)).toHaveLength(3);
  });

  test("treats a reading exactly on the floor as clearing it", () => {
    const exactly = candidate({ id: "exact", traits: [figure("ambiguity", 60)] });
    expect(ids(filterCandidates([exactly], floor(false)))).toEqual(["exact"]);
  });
});

describe("hasReadingOn / countWithoutReading", () => {
  const pool = [
    candidate({ id: "has", traits: [figure("ambiguity", 70)] }),
    candidate({ id: "lacks", traits: [] }),
  ] as const;

  test("reports a candidate with no figure on the named trait as uncovered", () => {
    expect(hasReadingOn(pool[0], "ambiguity")).toBe(true);
    expect(hasReadingOn(pool[1], "ambiguity")).toBe(false);
  });

  test("treats every candidate as covered when no trait is named", () => {
    // The card and the filter must ask the identical question; a null trait
    // means the facet is off, not that everyone is uncovered.
    expect(hasReadingOn(pool[1], null)).toBe(true);
    expect(countWithoutReading(pool, null)).toBe(0);
  });

  test("counts how many records carry no reading on the named trait", () => {
    expect(countWithoutReading(pool, "ambiguity")).toBe(1);
  });
});

describe("skillFacetCounts", () => {
  const pool: readonly DirectoryCandidate[] = [
    candidate({ id: "a", skills: ["Python", "Figma"] }),
    candidate({ id: "b", skills: ["Python"] }),
    candidate({ id: "c", skills: ["Figma"] }),
  ];
  const vocabulary = ["Python", "Figma"];

  test("counts an unselected skill as what you would get by adding it", () => {
    // With Python selected, Figma must read 1 — the one candidate who has BOTH.
    // The naive count over the whole pool would say 2 and be actively
    // misleading under AND semantics.
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Python"] };
    expect(skillFacetCounts(pool, filters, vocabulary).get("Figma")).toBe(1);
  });

  test("counts a selected skill as what it is currently contributing", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Python"] };
    expect(skillFacetCounts(pool, filters, vocabulary).get("Python")).toBe(2);
  });

  test("can report zero for a combination that yields nothing", () => {
    const orphan = candidate({ id: "d", skills: ["Rust"] });
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Python"] };
    const counts = skillFacetCounts([...pool, orphan], filters, [...vocabulary, "Rust"]);
    expect(counts.get("Rust")).toBe(0);
  });

  test("still applies the non-skill facets to the counting pool", () => {
    const remote = candidate({ id: "e", skills: ["Python", "Figma"], location: "Remote (IST)" });
    const bengaluru = candidate({ id: "f", skills: ["Python", "Figma"], location: "Bengaluru" });
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, locations: ["Bengaluru"] };

    expect(skillFacetCounts([remote, bengaluru], filters, ["Figma"]).get("Figma")).toBe(1);
  });

  test("returns an entry for every word in the vocabulary, selected or not", () => {
    const counts = skillFacetCounts(pool, EMPTY_FILTERS, vocabulary);
    expect([...counts.keys()].sort()).toEqual(["Figma", "Python"]);
  });
});

describe("locationFacetCounts", () => {
  test("counts each location against the query with the location facet removed", () => {
    // Otherwise picking Bengaluru would show 0 next to every other city, which
    // tells the recruiter nothing and reads as broken.
    const pool: readonly DirectoryCandidate[] = [
      candidate({ id: "a", location: "Bengaluru" }),
      candidate({ id: "b", location: "Bengaluru" }),
      candidate({ id: "c", location: "Hyderabad" }),
    ];
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, locations: ["Bengaluru"] };

    const counts = locationFacetCounts(pool, filters);
    expect(counts.get("Bengaluru")).toBe(2);
    expect(counts.get("Hyderabad")).toBe(1);
  });

  test("keeps honouring the other facets", () => {
    const pool: readonly DirectoryCandidate[] = [
      candidate({ id: "a", location: "Bengaluru", role: "Backend engineer" }),
      candidate({ id: "b", location: "Bengaluru", role: "Product designer" }),
    ];
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, role: "Backend engineer" };

    expect(locationFacetCounts(pool, filters).get("Bengaluru")).toBe(1);
  });
});

describe("buildVocabulary", () => {
  const pool: readonly DirectoryCandidate[] = [
    candidate({
      id: "a",
      role: "QA engineer",
      skills: ["Python", "Go"],
      location: "Hyderabad",
      traits: [figure("ambiguity", 70)],
    }),
    candidate({
      id: "b",
      role: "Backend engineer",
      skills: ["Go"],
      location: "Hyderabad",
      traits: [figure("debugging", 60), figure("ambiguity", 50)],
    }),
  ];

  test("de-duplicates and sorts each facet alphabetically", () => {
    const vocabulary = buildVocabulary(pool);
    expect(vocabulary.roles).toEqual(["Backend engineer", "QA engineer"]);
    expect(vocabulary.skills).toEqual(["Go", "Python"]);
    expect(vocabulary.locations).toEqual(["Hyderabad"]);
  });

  test("derives traits from the data with their display labels, sorted by label", () => {
    // Hand-listing the vocabulary produces facets nobody can satisfy — a dead
    // end the user only discovers by clicking it.
    expect(buildVocabulary(pool).traits).toEqual([
      { key: "debugging", label: "Debugs systematically" },
      { key: "ambiguity", label: "Handles ambiguity" },
    ]);
  });

  test("returns empty vocabularies for an empty pool", () => {
    expect(buildVocabulary([])).toEqual({ roles: [], skills: [], locations: [], traits: [] });
  });
});

describe("activeFilters — flattening for removable chips", () => {
  const vocabulary = buildVocabulary([
    candidate({ id: "a", traits: [figure("ambiguity", 70)] }),
  ]);

  test("produces no chips for the zero state", () => {
    expect(activeFilters(EMPTY_FILTERS, vocabulary)).toEqual([]);
  });

  test("produces one chip per selected skill", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Go", "Redis"] };
    expect(activeFilters(filters, vocabulary).map((c) => c.id)).toEqual([
      "skill:Go",
      "skill:Redis",
    ]);
  });

  test("labels the minimum-figure chip with the trait's human name", () => {
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading: false },
    };
    const chip = activeFilters(filters, vocabulary).find((c) => c.id === "minFigure");
    expect(chip?.value).toBe("Handles ambiguity — 60 or above");
  });

  test("gives the no-reading exclusion its own chip, not a footnote", () => {
    // An exclusion that removes people has to be as visible, and as removable,
    // as any other constraint — otherwise it is invisible policy again.
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading: true },
    };
    expect(activeFilters(filters, vocabulary).map((c) => c.id)).toContain(
      "minFigure:excludeNoReading",
    );
  });

  test("clearing the trait clears the exclusion with it", () => {
    // Leaving it armed would ambush the next recruiter who picks a trait.
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading: true },
    };
    const chip = activeFilters(filters, vocabulary).find((c) => c.id === "minFigure")!;
    const next = chip.remove(filters);

    expect(next.minFigure.traitKey).toBeNull();
    expect(next.minFigure.excludeNoReading).toBe(false);
  });

  test("removing the exclusion chip leaves the floor running", () => {
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading: true },
    };
    const chip = activeFilters(filters, vocabulary).find(
      (c) => c.id === "minFigure:excludeNoReading",
    )!;
    const next = chip.remove(filters);

    expect(next.minFigure.traitKey).toBe("ambiguity");
    expect(next.minFigure.excludeNoReading).toBe(false);
  });

  test("remove returns a new object and never mutates the one it was given", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, skills: ["Go", "Redis"] };
    const chip = activeFilters(filters, vocabulary)[0];
    const next = chip.remove(filters);

    expect(next).not.toBe(filters);
    expect(filters.skills).toEqual(["Go", "Redis"]);
    expect(next.skills).toEqual(["Redis"]);
  });

  test("renders an open-ended experience window as N+ years", () => {
    const filters: DirectoryFilters = {
      ...EMPTY_FILTERS,
      experience: { min: 3, max: EXPERIENCE_BOUNDS.max },
    };
    expect(activeFilters(filters, vocabulary).find((c) => c.id === "experience")?.value).toBe(
      "3+ years",
    );
  });

  test("renders a bounded experience window as a range", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, experience: { min: 3, max: 8 } };
    expect(activeFilters(filters, vocabulary).find((c) => c.id === "experience")?.value).toBe(
      "3–8 years",
    );
  });

  test("produces no experience chip while the window is at its default", () => {
    expect(activeFilters(EMPTY_FILTERS, vocabulary).find((c) => c.id === "experience")).toBe(
      undefined,
    );
  });

  test("removing the experience chip restores the full window", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, experience: { min: 3, max: 8 } };
    const chip = activeFilters(filters, vocabulary).find((c) => c.id === "experience")!;
    expect(chip.remove(filters).experience).toEqual({ ...EXPERIENCE_BOUNDS });
  });

  test("reads availability back in plain language", () => {
    const filters: DirectoryFilters = { ...EMPTY_FILTERS, availability: "within_30_days" };
    expect(activeFilters(filters, vocabulary).find((c) => c.id === "availability")?.value).toBe(
      "within 30 days",
    );
  });

  test("gives every chip a stable id unique within the set", () => {
    const filters: DirectoryFilters = {
      role: "Backend engineer",
      skills: ["Go", "Redis"],
      minFigure: { traitKey: "ambiguity", min: 60, excludeNoReading: true },
      locations: ["Bengaluru", "Hyderabad"],
      availability: "immediately",
      experience: { min: 3, max: 8 },
    };
    const chipIds = activeFilters(filters, vocabulary).map((c) => c.id);

    expect(chipIds).toHaveLength(9);
    expect(new Set(chipIds).size).toBe(9);
  });
});
