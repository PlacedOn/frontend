/**
 * Directory filtering — pure functions, no React.
 *
 * Kept out of the components so the matching rules can be read, argued with,
 * and eventually swapped for the real `GET /api/candidates` call without
 * touching a single line of markup. The client-side implementation here is a
 * stand-in for the server query in placedon-v2-plan §4.2; the SHAPE is the
 * contract, the implementation is scaffolding.
 */

import {
  EXPERIENCE_BOUNDS,
  type DirectoryCandidate,
  type DirectoryFilters,
} from "@/types/directory";

/** Does this candidate carry every selected skill? */
function matchesSkills(candidate: DirectoryCandidate, skills: readonly string[]): boolean {
  // AND, not OR. A recruiter selecting "Python" and "Postgres" is describing
  // one person who has both, not two piles of people. OR would silently
  // widen the result set every time they added a requirement, which is the
  // opposite of what the interaction implies.
  return skills.every((skill) => candidate.skills.includes(skill));
}

/**
 * Is there a reading on this trait at all? Exported because the CARD has to
 * mark the uncovered case, and it must ask the same question the filter asks.
 * Two implementations of "has a reading" would drift, and the drift would show
 * up as a candidate the filter kept but the card did not explain.
 */
export function hasReadingOn(candidate: DirectoryCandidate, traitKey: string | null): boolean {
  if (!traitKey) return true;
  return candidate.traits.some((t) => t.traitKey === traitKey);
}

/** How many of these records carry no reading on the named trait. */
export function countWithoutReading(
  candidates: readonly DirectoryCandidate[],
  traitKey: string | null,
): number {
  if (!traitKey) return 0;
  return candidates.filter((c) => !hasReadingOn(c, traitKey)).length;
}

/**
 * Does this candidate clear the floor on the NAMED trait?
 *
 * ══ CANDIDATES WITH NO READING STAY IN ══
 * This used to exclude them, and that was wrong. A candidate the interview
 * never asked about a trait is not scoring low on it — there is no score. The
 * filter was quietly converting "we haven't asked yet" into "they failed", and
 * the person who has never seen this screen was the one paying for it.
 *
 * The earlier argument for dropping them was that a recruiter cannot evaluate
 * someone on an axis with no data, so they would be rejected a screen later
 * anyway. That argument is doing something dishonest: it assumes the outcome
 * and then hides the reason. If the recruiter is going to decide the gap
 * disqualifies, they should decide it in front of the record, seeing that the
 * gap is OURS. A missing reading is a hole in our interview coverage, and the
 * cost of that hole should be visible to the party who can fix it.
 *
 * So: the floor applies to candidates who HAVE a reading. Candidates with no
 * reading pass, and the card marks them as uncovered on that trait.
 *
 * `excludeNoReading` lets HR opt out of that, because "only show me people I
 * can actually compare on this axis" is a real need and pretending otherwise
 * just makes them do it by hand. It defaults to false, it has its own labelled
 * control, and it produces its own removable chip — an exclusion that a human
 * chose and can see is a different object from one we performed for them.
 */
function matchesMinFigure(
  candidate: DirectoryCandidate,
  minFigure: DirectoryFilters["minFigure"],
): boolean {
  if (!minFigure.traitKey) return true;
  const trait = candidate.traits.find((t) => t.traitKey === minFigure.traitKey);
  if (!trait) return !minFigure.excludeNoReading;
  return trait.point >= minFigure.min;
}

/** Every predicate except one, so facet counts can be computed per-facet. */
const PREDICATES = {
  role: (c: DirectoryCandidate, f: DirectoryFilters) => !f.role || c.role === f.role,
  skills: (c: DirectoryCandidate, f: DirectoryFilters) => matchesSkills(c, f.skills),
  minFigure: (c: DirectoryCandidate, f: DirectoryFilters) => matchesMinFigure(c, f.minFigure),
  locations: (c: DirectoryCandidate, f: DirectoryFilters) =>
    f.locations.length === 0 || f.locations.includes(c.location),
  availability: (c: DirectoryCandidate, f: DirectoryFilters) =>
    !f.availability || c.availability === f.availability,
  experience: (c: DirectoryCandidate, f: DirectoryFilters) =>
    c.yearsExperience >= f.experience.min && c.yearsExperience <= f.experience.max,
} as const;

export type FacetKey = keyof typeof PREDICATES;

const ALL_FACETS = Object.keys(PREDICATES) as readonly FacetKey[];

/** Apply every facet. Order is stable — the caller's array order is preserved. */
export function filterCandidates(
  candidates: readonly DirectoryCandidate[],
  filters: DirectoryFilters,
): readonly DirectoryCandidate[] {
  return candidates.filter((c) => ALL_FACETS.every((key) => PREDICATES[key](c, filters)));
}

/**
 * Candidates matching every facet EXCEPT the named one.
 *
 * This is what facet counts have to be computed against. Counting against the
 * fully-filtered set would show `0` next to every unselected skill the moment
 * one skill is picked, which tells the recruiter nothing and looks broken.
 */
function matchingExcept(
  candidates: readonly DirectoryCandidate[],
  filters: DirectoryFilters,
  except: FacetKey,
): readonly DirectoryCandidate[] {
  return candidates.filter((c) =>
    ALL_FACETS.every((key) => key === except || PREDICATES[key](c, filters)),
  );
}

/**
 * For each skill: how many candidates you get if that skill is the selection,
 * with every OTHER selected skill still applied.
 *
 * The naive version — count every skill across the non-skill-filtered pool —
 * is wrong under AND semantics and actively misleading. With `Python` and
 * `Figma` both selected and zero results, it would still print "Figma 2",
 * because two candidates do have Figma. What the recruiter needs to know is
 * "Figma **together with everything else I picked** gives 0", and this
 * computes that: the pool holds all non-skill facets plus every selected skill
 * except the one being counted, and the count is how many of those also carry
 * it. An unselected pill therefore reads "add me and you get N", and a
 * selected pill reads "I am currently contributing N".
 */
export function skillFacetCounts(
  candidates: readonly DirectoryCandidate[],
  filters: DirectoryFilters,
  vocabulary: readonly string[],
): ReadonlyMap<string, number> {
  const base = matchingExcept(candidates, filters, "skills");
  const counts = new Map<string, number>();

  for (const skill of vocabulary) {
    const others = filters.skills.filter((s) => s !== skill);
    counts.set(
      skill,
      base.filter((c) => c.skills.includes(skill) && others.every((s) => c.skills.includes(s)))
        .length,
    );
  }
  return counts;
}

/** Same, for the single-select location facet. */
export function locationFacetCounts(
  candidates: readonly DirectoryCandidate[],
  filters: DirectoryFilters,
): ReadonlyMap<string, number> {
  const pool = matchingExcept(candidates, filters, "locations");
  const counts = new Map<string, number>();
  for (const candidate of pool) {
    counts.set(candidate.location, (counts.get(candidate.location) ?? 0) + 1);
  }
  return counts;
}

/** The sorted, de-duplicated vocabulary the rail offers for each facet. */
export interface DirectoryVocabulary {
  roles: readonly string[];
  skills: readonly string[];
  locations: readonly string[];
  traits: readonly { key: string; label: string }[];
}

export function buildVocabulary(candidates: readonly DirectoryCandidate[]): DirectoryVocabulary {
  const roles = new Set<string>();
  const skills = new Set<string>();
  const locations = new Set<string>();
  const traits = new Map<string, string>();

  for (const candidate of candidates) {
    roles.add(candidate.role);
    locations.add(candidate.location);
    candidate.skills.forEach((s) => skills.add(s));
    candidate.traits.forEach((t) => traits.set(t.traitKey, t.traitLabel));
  }

  const alpha = (a: string, b: string) => a.localeCompare(b);

  return {
    roles: [...roles].sort(alpha),
    skills: [...skills].sort(alpha),
    locations: [...locations].sort(alpha),
    traits: [...traits.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => alpha(a.label, b.label)),
  };
}

/**
 * One active filter, flattened for display and one-click removal.
 * `remove` returns the next filter state — it never mutates. (See the
 * immutability rule; every setter in this module returns a fresh object.)
 *
 * Generic over the filter state so `ActiveFilterChips` and `EmptyState` can be
 * driven by the job browser's filters too. It defaults to `DirectoryFilters`,
 * so every existing call site reads exactly as it did before.
 */
export interface ActiveFilter<F = DirectoryFilters> {
  /** Stable key for React and for tests. */
  id: string;
  /** Facet name as the user would say it. */
  facet: string;
  /** The selected value, in plain language. */
  value: string;
  /** Filters with just this one cleared. */
  remove: (current: F) => F;
}

/** Flatten the filter object into removable chips. Empty when nothing is set. */
export function activeFilters(
  filters: DirectoryFilters,
  vocabulary: DirectoryVocabulary,
): readonly ActiveFilter[] {
  const chips: ActiveFilter[] = [];

  if (filters.role) {
    chips.push({
      id: `role:${filters.role}`,
      facet: "Role",
      value: filters.role,
      remove: (f) => ({ ...f, role: null }),
    });
  }

  for (const skill of filters.skills) {
    chips.push({
      id: `skill:${skill}`,
      facet: "Skill",
      value: skill,
      remove: (f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }),
    });
  }

  if (filters.minFigure.traitKey) {
    const label =
      vocabulary.traits.find((t) => t.key === filters.minFigure.traitKey)?.label ??
      filters.minFigure.traitKey;
    chips.push({
      id: "minFigure",
      facet: "Minimum figure",
      value: `${label} — ${filters.minFigure.min} or above`,
      // Clearing the trait clears the exclusion with it. The exclusion is
      // meaningless without a named trait, and leaving it armed would ambush the
      // next recruiter who picks one.
      remove: (f) => ({
        ...f,
        minFigure: { ...f.minFigure, traitKey: null, excludeNoReading: false },
      }),
    });

    // Its own chip, not a footnote on the one above. An exclusion that removes
    // people from the result set has to be as visible — and as removable — as
    // any other constraint, or it is back to being invisible policy.
    if (filters.minFigure.excludeNoReading) {
      chips.push({
        id: "minFigure:excludeNoReading",
        facet: "Also hiding",
        value: `anyone with no reading on ${label}`,
        remove: (f) => ({ ...f, minFigure: { ...f.minFigure, excludeNoReading: false } }),
      });
    }
  }

  for (const location of filters.locations) {
    chips.push({
      id: `location:${location}`,
      facet: "Works from",
      value: location,
      remove: (f) => ({ ...f, locations: f.locations.filter((l) => l !== location) }),
    });
  }

  if (filters.availability) {
    chips.push({
      id: "availability",
      facet: "Availability",
      value: filters.availability.replace(/_/g, " "),
      remove: (f) => ({ ...f, availability: null }),
    });
  }

  const { min, max } = filters.experience;
  if (min !== EXPERIENCE_BOUNDS.min || max !== EXPERIENCE_BOUNDS.max) {
    chips.push({
      id: "experience",
      facet: "Experience",
      value:
        max >= EXPERIENCE_BOUNDS.max ? `${min}+ years` : `${min}–${max} years`,
      remove: (f) => ({ ...f, experience: { ...EXPERIENCE_BOUNDS } }),
    });
  }

  return chips;
}
