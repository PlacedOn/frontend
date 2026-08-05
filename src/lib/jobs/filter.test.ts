/**
 * Tests for job filtering.
 *
 * The rule that most needs guarding is the one that inverts the directory's:
 * within a facet the selections are ALTERNATIVES. Getting it backwards produces
 * an empty grid the moment someone ticks two pay bands, which reads as "there is
 * no work" rather than as a bug.
 */

import { describe, expect, test } from "vitest";
import {
  activeJobFilters,
  buildJobVocabulary,
  filterJobs,
  jobFacetCounts,
  toggleJobFacetValue,
} from "./filter";
import {
  EMPTY_JOB_FILTERS,
  SALARY_ORDER,
  STAGE_ORDER,
  WORK_MODE_ORDER,
  type Job,
  type JobFilters,
} from "@/types/jobs";

function job(overrides: Partial<Job> & { id: string }): Job {
  return {
    ref: overrides.id.toUpperCase(),
    title: "A role",
    companyArchetype: "A company of some description",
    role: "Backend engineer",
    stage: "seed",
    workMode: "remote",
    location: "Remote (IST)",
    salaryBand: "12_20",
    skills: [],
    assessesTraitKeys: [],
    postedAt: "2026-07-30T09:00:00.000Z",
    ...overrides,
  };
}

const ids = (rows: readonly Job[]) => rows.map((j) => j.id);

const POOL: readonly Job[] = [
  job({ id: "a", role: "Backend engineer", stage: "seed", workMode: "remote", salaryBand: "12_20" }),
  job({ id: "b", role: "Backend engineer", stage: "listed", workMode: "onsite", salaryBand: "35_plus" }),
  job({ id: "c", role: "Frontend engineer", stage: "growth", workMode: "hybrid", salaryBand: "20_35" }),
];

describe("filterJobs — alternatives within a facet, requirements across facets", () => {
  test("returns everything for the zero state", () => {
    expect(ids(filterJobs(POOL, EMPTY_JOB_FILTERS))).toEqual(["a", "b", "c"]);
  });

  test("widens the result set when a second value in the same facet is added", () => {
    // The inverse of the directory's skill rule. "Remote or on-site" is one
    // search; ANDing them would describe a job that is somehow both.
    const one: JobFilters = { ...EMPTY_JOB_FILTERS, workModes: ["remote"] };
    const two: JobFilters = { ...EMPTY_JOB_FILTERS, workModes: ["remote", "onsite"] };

    expect(ids(filterJobs(POOL, one))).toEqual(["a"]);
    expect(ids(filterJobs(POOL, two))).toEqual(["a", "b"]);
  });

  test("narrows the result set when a different facet is added", () => {
    const filters: JobFilters = {
      ...EMPTY_JOB_FILTERS,
      roles: ["Backend engineer"],
      workModes: ["onsite"],
    };
    expect(ids(filterJobs(POOL, filters))).toEqual(["b"]);
  });

  test("can return nothing when facets contradict each other", () => {
    const filters: JobFilters = {
      ...EMPTY_JOB_FILTERS,
      roles: ["Frontend engineer"],
      salaryBands: ["35_plus"],
    };
    expect(filterJobs(POOL, filters)).toHaveLength(0);
  });

  test("preserves the caller's array order", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, roles: ["Backend engineer"] };
    expect(ids(filterJobs(POOL, filters))).toEqual(["a", "b"]);
  });
});

describe("jobFacetCounts", () => {
  test("counts each value against the query with its own facet ignored", () => {
    // Otherwise picking Remote would show 0 next to every other work mode,
    // which tells the reader nothing and looks broken.
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, workModes: ["remote"] };
    const counts = jobFacetCounts(POOL, filters, "workModes", (j) => j.workMode, WORK_MODE_ORDER);

    expect(counts.get("remote")).toBe(1);
    expect(counts.get("onsite")).toBe(1);
    expect(counts.get("hybrid")).toBe(1);
  });

  test("keeps honouring the other facets", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, roles: ["Backend engineer"] };
    const counts = jobFacetCounts(POOL, filters, "workModes", (j) => j.workMode, WORK_MODE_ORDER);

    expect(counts.get("remote")).toBe(1);
    expect(counts.get("hybrid")).toBe(0);
  });

  test("returns an entry for every value in the vocabulary, including zeroes", () => {
    const counts = jobFacetCounts(POOL, EMPTY_JOB_FILTERS, "stages", (j) => j.stage, STAGE_ORDER);
    expect([...counts.keys()]).toEqual([...STAGE_ORDER]);
    expect(counts.get("series_a_b")).toBe(0);
  });
});

describe("buildJobVocabulary", () => {
  test("derives roles from the data, de-duplicated and sorted", () => {
    expect(buildJobVocabulary(POOL).roles).toEqual(["Backend engineer", "Frontend engineer"]);
  });

  test("keeps the enum facets in their meaningful order, not alphabetical", () => {
    // Seed→listed and low pay→high pay are scales. Sorting them alphabetically
    // would put "Growth" before "Seed" and make the rail read as a shuffle.
    const vocabulary = buildJobVocabulary(POOL);
    expect(vocabulary.stages).toEqual(STAGE_ORDER);
    expect(vocabulary.salaryBands).toEqual(SALARY_ORDER);
    expect(vocabulary.salaryBands).not.toEqual([...SALARY_ORDER].sort());
  });

  test("offers the full enum vocabulary even when the pool has no such job", () => {
    // A facet that appears and disappears as the data changes is worse than one
    // showing an honest zero.
    expect(buildJobVocabulary([]).stages).toEqual(STAGE_ORDER);
    expect(buildJobVocabulary([]).roles).toEqual([]);
  });
});

describe("toggleJobFacetValue", () => {
  test("adds an unselected value", () => {
    expect(toggleJobFacetValue(EMPTY_JOB_FILTERS, "stages", "seed").stages).toEqual(["seed"]);
  });

  test("removes an already-selected value", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, stages: ["seed", "listed"] };
    expect(toggleJobFacetValue(filters, "stages", "seed").stages).toEqual(["listed"]);
  });

  test("returns a new object and leaves the original untouched", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, stages: ["seed"] };
    const next = toggleJobFacetValue(filters, "stages", "listed");

    expect(next).not.toBe(filters);
    expect(filters.stages).toEqual(["seed"]);
    expect(next.stages).toEqual(["seed", "listed"]);
  });

  test("leaves the other facets alone", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, roles: ["Backend engineer"] };
    expect(toggleJobFacetValue(filters, "stages", "seed").roles).toEqual(["Backend engineer"]);
  });
});

describe("activeJobFilters", () => {
  test("produces no chips for the zero state", () => {
    expect(activeJobFilters(EMPTY_JOB_FILTERS)).toEqual([]);
  });

  test("produces one chip per selected value across every facet", () => {
    const filters: JobFilters = {
      roles: ["Backend engineer"],
      stages: ["seed", "listed"],
      workModes: ["remote"],
      salaryBands: ["35_plus"],
    };
    const chipIds = activeJobFilters(filters).map((c) => c.id);

    expect(chipIds).toHaveLength(5);
    expect(new Set(chipIds).size).toBe(5);
  });

  test("labels enum values in plain language rather than their wire keys", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, salaryBands: ["35_plus"] };
    const [chip] = activeJobFilters(filters);

    expect(chip.facet).toBe("Pay");
    expect(chip.value).toBe("₹35L+");
    expect(chip.value).not.toContain("_");
  });

  test("remove strips only its own value and never mutates", () => {
    const filters: JobFilters = { ...EMPTY_JOB_FILTERS, stages: ["seed", "listed"] };
    const chip = activeJobFilters(filters).find((c) => c.id === "stages:seed")!;
    const next = chip.remove(filters);

    expect(next).not.toBe(filters);
    expect(filters.stages).toEqual(["seed", "listed"]);
    expect(next.stages).toEqual(["listed"]);
  });

  test("removing every chip in turn arrives back at the zero state", () => {
    const filters: JobFilters = {
      roles: ["Backend engineer"],
      stages: ["seed"],
      workModes: ["remote"],
      salaryBands: ["12_20"],
    };
    const cleared = activeJobFilters(filters).reduce((acc, chip) => chip.remove(acc), filters);

    expect(cleared).toEqual(EMPTY_JOB_FILTERS);
  });
});
