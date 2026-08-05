/**
 * The job-browse contract — what a CANDIDATE sees when they look for work.
 *
 * ══ WHY THIS TYPE IS ALLOWED TO CARRY THINGS `DirectoryCandidate` IS NOT ══
 * The directory type is stripped of identity because on a browse grid of people
 * the reader is the ranker, so every displayed field is a ranking input, and
 * ranking humans on those fields is the thing the fairness firewall exists to
 * stop. None of that transfers here. A company is not a protected class; a
 * candidate comparing employers on stage, pay and location is doing exactly what
 * they should be doing, and withholding it would be paternalism dressed as
 * fairness. The asymmetry is the point: constraints attach to the party being
 * judged, and on this surface that party is the employer.
 *
 * ══ WHAT IS STILL ABSENT, AND WHY ══
 * No `matchPercent`, `fitScore`, `readiness`, or `rank`. Those look like
 * properties of a job and are actually properties of the PERSON — "you are a
 * 74% match" is a composite about a human wearing a job's clothes, and it is the
 * exact number this product refuses to compute. What replaces it is
 * `assessesTraitKeys`: the topics this role's interview covers, which the UI
 * shows against the topics the candidate already has evidence on. That is
 * coverage — checkable, per-topic, and impossible to sort a person by.
 *
 * ══ AND NO REAL EMPLOYER NAMES ══
 * `companyArchetype` is a description, never an identity — "a Series-B payments
 * company", not a brand. Fixture jobs attributed to a real named employer would
 * be a fabricated job posting with that employer's name on it.
 */

/** Where the work happens. An operational fact about the role. */
export type WorkMode = "remote" | "hybrid" | "onsite";

export const WORK_MODE_COPY: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

/** How far along the company is. Affects risk and scope, not candidate quality. */
export type CompanyStage = "seed" | "series_a_b" | "growth" | "listed";

export const STAGE_COPY: Record<CompanyStage, string> = {
  seed: "Seed",
  series_a_b: "Series A–B",
  growth: "Growth",
  listed: "Listed",
};

/**
 * Advertised pay range, in Indian annual lakhs.
 *
 * Named `SalaryBand` because that is what everyone calls it, but it has nothing
 * to do with `EvidenceBand` in `scoring.ts` — one is a pay bracket on a job, the
 * other is how much evidence stands behind a trait reading. They must never be
 * rendered in the same visual grammar, or a reader will transfer meaning between
 * them.
 */
export type SalaryBand = "upto_12" | "12_20" | "20_35" | "35_plus";

export const SALARY_COPY: Record<SalaryBand, string> = {
  upto_12: "Up to ₹12L",
  "12_20": "₹12–20L",
  "20_35": "₹20–35L",
  "35_plus": "₹35L+",
};

/** Display order, low to high. Filter pills follow this, never alphabetical. */
export const SALARY_ORDER: readonly SalaryBand[] = ["upto_12", "12_20", "20_35", "35_plus"];
export const STAGE_ORDER: readonly CompanyStage[] = ["seed", "series_a_b", "growth", "listed"];
export const WORK_MODE_ORDER: readonly WorkMode[] = ["remote", "hybrid", "onsite"];

/** One row of the job grid. */
export interface Job {
  id: string;
  /** Fixture reference shown on the card. Not a real posting id. */
  ref: string;
  title: string;
  /** A DESCRIPTION of the employer, never an employer's name. */
  companyArchetype: string;
  role: string;
  stage: CompanyStage;
  workMode: WorkMode;
  /** Where the work happens — city, or the remote timezone. */
  location: string;
  salaryBand: SalaryBand;
  skills: readonly string[];
  /**
   * The trait keys this role's interview is set up to ask about.
   *
   * Rendered against the candidate's own coverage so they can see which topics
   * they already have evidence on and which this interview would newly reach.
   * Deliberately a LIST, never a count or a ratio: "3 of 5" invites a reader to
   * treat it as a fit score and sort by it, which is the composite this product
   * does not compute. Naming the topics keeps it a description of the interview.
   */
  assessesTraitKeys: readonly string[];
  postedAt: string;
}

/**
 * Job filter state.
 *
 * ══ WHY EVERY FACET IS OR-WITHIN AND AND-ACROSS ══
 * The opposite of the directory's skill rule, on purpose. Selecting `Python` and
 * `Postgres` on a candidate describes ONE person who has both, so those AND. But
 * a candidate selecting `Remote` and `Hybrid` is saying "either of these suits
 * me" — ANDing them would describe a job that is somehow both, and would return
 * nothing. Within a facet the selections are alternatives; across facets they
 * are all requirements.
 */
export interface JobFilters {
  roles: readonly string[];
  stages: readonly CompanyStage[];
  workModes: readonly WorkMode[];
  salaryBands: readonly SalaryBand[];
}

/** The zero state. Anything equal to this renders no filter chips. */
export const EMPTY_JOB_FILTERS: JobFilters = {
  roles: [],
  stages: [],
  workModes: [],
  salaryBands: [],
};
