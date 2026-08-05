/**
 * Job filtering — pure functions, no React.
 *
 * Structurally the same idea as `lib/directory/filter.ts` (a predicate table, a
 * leave-one-out pass for facet counts, a flattener for removable chips) and
 * deliberately a separate module rather than a generalisation of it. The two
 * share no predicate: the directory's facets carry fairness reasoning that
 * exists nowhere here, and a shared abstraction would have to be parameterised
 * on exactly the parts that are load-bearing. Sharing the SHAPE without sharing
 * the CODE keeps each readable on its own.
 *
 * Within a facet the selections are alternatives (OR); across facets they are
 * all requirements (AND). See the note on `JobFilters` for why that inverts the
 * directory's skill rule.
 */

import {
  SALARY_COPY,
  SALARY_ORDER,
  STAGE_COPY,
  STAGE_ORDER,
  WORK_MODE_COPY,
  WORK_MODE_ORDER,
  type CompanyStage,
  type Job,
  type JobFilters,
  type SalaryBand,
  type WorkMode,
} from "@/types/jobs";
import type { ActiveFilter } from "@/lib/directory/filter";

/** Empty selection means "no constraint", never "match nothing". */
function anyOf<T>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

const PREDICATES = {
  roles: (j: Job, f: JobFilters) => anyOf(f.roles, j.role),
  stages: (j: Job, f: JobFilters) => anyOf(f.stages, j.stage),
  workModes: (j: Job, f: JobFilters) => anyOf(f.workModes, j.workMode),
  salaryBands: (j: Job, f: JobFilters) => anyOf(f.salaryBands, j.salaryBand),
} as const;

export type JobFacetKey = keyof typeof PREDICATES;

const ALL_FACETS = Object.keys(PREDICATES) as readonly JobFacetKey[];

/** Apply every facet. Order is stable — the caller's array order is preserved. */
export function filterJobs(jobs: readonly Job[], filters: JobFilters): readonly Job[] {
  return jobs.filter((j) => ALL_FACETS.every((key) => PREDICATES[key](j, filters)));
}

/**
 * Jobs matching every facet EXCEPT the named one — what a facet count has to be
 * computed against. Counting against the fully-filtered set would show `0` next
 * to every unselected option the moment one is picked, which tells the reader
 * nothing and looks broken.
 */
function matchingExcept(
  jobs: readonly Job[],
  filters: JobFilters,
  except: JobFacetKey,
): readonly Job[] {
  return jobs.filter((j) => ALL_FACETS.every((key) => key === except || PREDICATES[key](j, filters)));
}

/**
 * How many jobs each value of one facet would yield.
 *
 * Simpler than the directory's skill counts because these are OR-within-facet:
 * with `Remote` already selected, adding `Hybrid` widens the set, so each value
 * is counted independently against the pool that ignores this facet. No
 * "together with everything else I picked" adjustment is needed, because within
 * a facet nothing else was picked that constrains this one.
 */
export function jobFacetCounts<T extends string>(
  jobs: readonly Job[],
  filters: JobFilters,
  facet: JobFacetKey,
  valueOf: (job: Job) => T,
  vocabulary: readonly T[],
): ReadonlyMap<T, number> {
  const pool = matchingExcept(jobs, filters, facet);
  const counts = new Map<T, number>();
  for (const value of vocabulary) {
    counts.set(value, pool.filter((j) => valueOf(j) === value).length);
  }
  return counts;
}

/** The vocabulary the rail offers. Roles come from the data; the rest are enums. */
export interface JobVocabulary {
  roles: readonly string[];
  stages: readonly CompanyStage[];
  workModes: readonly WorkMode[];
  salaryBands: readonly SalaryBand[];
}

export function buildJobVocabulary(jobs: readonly Job[]): JobVocabulary {
  const roles = new Set<string>();
  for (const job of jobs) roles.add(job.role);

  return {
    roles: [...roles].sort((a, b) => a.localeCompare(b)),
    // Enum facets keep their MEANINGFUL order — seed→listed, low pay→high pay.
    // Sorting these alphabetically would put "Growth" before "Seed" and make the
    // rail read as a shuffled list rather than a scale.
    stages: STAGE_ORDER,
    workModes: WORK_MODE_ORDER,
    salaryBands: SALARY_ORDER,
  };
}

/** Toggle one value inside a multi-select facet, immutably. */
export function toggleJobFacetValue<K extends JobFacetKey>(
  filters: JobFilters,
  facet: K,
  value: JobFilters[K][number],
): JobFilters {
  const current = filters[facet] as readonly (typeof value)[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return { ...filters, [facet]: next };
}

/** Flatten the filter object into removable chips. Empty when nothing is set. */
export function activeJobFilters(filters: JobFilters): readonly ActiveFilter<JobFilters>[] {
  const chips: ActiveFilter<JobFilters>[] = [];

  const push = <K extends JobFacetKey>(
    facet: K,
    label: string,
    values: readonly string[],
    copy: (value: string) => string,
  ) => {
    for (const value of values) {
      chips.push({
        id: `${facet}:${value}`,
        facet: label,
        value: copy(value),
        remove: (f) => ({
          ...f,
          [facet]: (f[facet] as readonly string[]).filter((v) => v !== value),
        }),
      });
    }
  };

  push("roles", "Role", filters.roles, (v) => v);
  push("stages", "Stage", filters.stages, (v) => STAGE_COPY[v as CompanyStage]);
  push("workModes", "Works from", filters.workModes, (v) => WORK_MODE_COPY[v as WorkMode]);
  push("salaryBands", "Pay", filters.salaryBands, (v) => SALARY_COPY[v as SalaryBand]);

  return chips;
}
