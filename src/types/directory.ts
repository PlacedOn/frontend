/**
 * The talent-directory contract — the browsable HR grid.
 *
 * Mirrors the `CandidateCard[]` payload in placedon-v2-plan
 * docs/02_SYSTEM_ARCHITECTURE.md §4.2, minus every field that would put a
 * demographic proxy in front of a human doing triage.
 *
 * ══ WHAT IS DELIBERATELY ABSENT ══
 * There is no `name`, `photoUrl`, `avatarUrl`, `initials`, `school`,
 * `college`, `employer`, `age`, `gender`, `dateOfBirth`, or `nationality`
 * field on this type, and none may be added. The reasoning is written out in
 * full at the top of `src/components/directory/CandidateCard.tsx` — read it
 * before proposing one. The short version: on a BROWSE surface the human is
 * the ranker, so anything displayed is a ranking input, and the fairness
 * firewall (`app/fairness/firewall.py`) exists precisely to keep these
 * attributes out of ranking inputs.
 *
 * ══ WHAT IS ALSO ABSENT ══
 * Any composite. There is no `score`, `rating`, `matchPercent`, `rank`, or
 * `overall` here. `traits` is a LIST of per-trait figures; a caller that
 * averages them to render one number has broken the same invariant
 * `src/types/scoring.ts` opens with.
 */

import type { EvidenceBand, TrustSignal } from "./scoring";

/**
 * One trait figure as it appears ON a card — the reading and its interval,
 * with a count of what stands behind it, but not the quotes themselves.
 *
 * The quotes live one level deeper (the candidate detail surface). A browse
 * card that inlined three verbatim quotes would be unreadable at a glance and
 * would tempt the reader to judge the quote rather than open the evidence.
 * The count is the honest summary: "four cited moments" is checkable, and the
 * only way to check it is to go and look.
 */
export interface DirectoryTraitFigure {
  /** Stable machine key, e.g. `handles_ambiguity`. */
  traitKey: string;
  /** Human-readable trait name. */
  traitLabel: string;
  /** Point estimate, 0–100. A per-trait figure. NOT a person score. */
  point: number;
  bandLow: number;
  bandHigh: number;
  /** Qualitative band. Never a numeric model confidence. */
  confidence: EvidenceBand;
  /** How many transcript moments are cited under this reading. */
  evidenceCount: number;
}

/**
 * When someone can start. An operational constraint, not a judgement.
 * `not_looking` exists so the directory can be honest that a profile is in the
 * system but the person is not available, rather than silently hiding them.
 */
export type Availability = "immediately" | "within_30_days" | "within_90_days" | "not_looking";

export const AVAILABILITY_COPY: Record<Availability, string> = {
  immediately: "Available now",
  within_30_days: "Within 30 days",
  within_90_days: "Within 90 days",
  not_looking: "Not looking",
};

/**
 * One row of the browse grid.
 *
 * `ref` is the candidate's handle on this surface. It is a stable, opaque
 * reference — deliberately not a name, not initials, and not derived from one.
 * (Initials are not neutral: in the Indian hiring market a surname initial
 * carries caste, region and religion information, so "S. R." is a proxy
 * wearing a disguise.)
 */
export interface DirectoryCandidate {
  id: string;
  /** Opaque handle shown on the card in place of a name. */
  ref: string;
  /** What they do, in their own framing. The card's headline. */
  headline: string;
  /** Role family, used by the `role` facet. */
  role: string;
  /** Skill tags. Feeds SkillPill on the card and in the filter rail. */
  skills: readonly string[];
  /**
   * Where the WORK happens — "Remote (IST)", "Bengaluru", "Hybrid — Pune".
   * A working arrangement, not a home address and not a region of origin. It
   * is a hard constraint (a role that needs desk presence in Pune genuinely
   * needs it), never an input to any reading.
   */
  location: string;
  availability: Availability;
  /** Years of relevant experience. A range facet, never a quality signal. */
  yearsExperience: number;
  /**
   * The trait figures shown on the card. Three, by convention — enough to be a
   * reading, few enough that no one mistakes the card for a full assessment.
   */
  traits: readonly DirectoryTraitFigure[];
  /** Status of the record. See `TrustBadge`. */
  trust: readonly TrustSignal[];
  /** ISO timestamp of the assessment behind these figures. */
  assessedAt: string;
}

/**
 * The filter state. Mirrors the query string in §4.2
 * (`?role=&skills[]=&min_score=&location=&available=&page=`) with one
 * deliberate divergence, documented on `minFigure` below.
 */
export interface DirectoryFilters {
  /** Single-select role family. `null` = any. */
  role: string | null;
  /** Multi-select skills. Empty = any. A candidate must carry ALL selected. */
  skills: readonly string[];
  /**
   * ══ THE DIVERGENCE FROM THE PLAN ══
   * The plan's endpoint takes `min_score` — a floor on a single blended number.
   * That number does not exist and is not going to, so this facet takes a floor
   * on a NAMED trait instead. The recruiter has to say *which* trait they are
   * filtering on, which is the whole difference: "handles ambiguity, at least
   * 60" is a job requirement, "score at least 60" is a ranking of humans.
   *
   * `traitKey: null` means the facet is inactive. There is no default trait,
   * because a default would quietly become the composite by the back door.
   *
   * ══ `excludeNoReading` — OFF BY DEFAULT, AND THAT IS THE POINT ══
   * A candidate the interview never asked about this trait has NO reading on
   * it. That is an absence of evidence, not a low figure, and the two must not
   * be collapsed — the distinction is this product's core claim. So the floor
   * applies only to candidates who HAVE a reading; the rest stay in the results
   * and are marked as uncovered on the card.
   *
   * HR can still choose to drop them, because "only show me people I can
   * actually evaluate on this axis" is a legitimate thing to want. But it has to
   * be *chosen*, with a labelled control and a visible chip, so the exclusion is
   * attributable to the recruiter rather than silently performed by us.
   */
  minFigure: { traitKey: string | null; min: number; excludeNoReading: boolean };
  /** Multi-select work locations. Empty = any. */
  locations: readonly string[];
  /** Single-select availability. `null` = any. */
  availability: Availability | null;
  /** Inclusive years-of-experience window. */
  experience: { min: number; max: number };
}

/** The widest experience window — the "no constraint" value. */
export const EXPERIENCE_BOUNDS = { min: 0, max: 20 } as const;

/** The zero state. Anything equal to this renders no filter chips. */
export const EMPTY_FILTERS: DirectoryFilters = {
  role: null,
  skills: [],
  minFigure: { traitKey: null, min: 50, excludeNoReading: false },
  locations: [],
  availability: null,
  experience: { min: EXPERIENCE_BOUNDS.min, max: EXPERIENCE_BOUNDS.max },
};
