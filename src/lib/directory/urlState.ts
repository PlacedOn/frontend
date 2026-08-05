/**
 * Directory filter state ⇄ query string. Pure functions, no React, no `window`.
 *
 * ══ WHY THE URL OWNS THIS NOW ══
 * Phase 2 kept the filters in local React state and said so out loud: `/dev` is
 * an internal fixture surface, and a copy-pasteable link to a fabricated query
 * is not a thing worth making easy. That reasoning was sound about /dev and
 * wrong about the codebase. Filters, and eventually sort and pagination, are
 * shareable state — "here are the six people who clear this bar, look at FX-06"
 * is the single most common thing a recruiter wants to send a hiring manager,
 * and a screenshot is what they send instead when the URL does not carry it.
 * Building it here means the real `/hr` surface inherits the behaviour rather
 * than inheriting the debt.
 *
 * ══ WHY THIS FILE IS PURE ══
 * Serialisation is where URL state rots: a param renamed in the writer and not
 * the reader produces a link that silently drops a constraint, which on this
 * product means a recruiter believing they filtered when they did not. Keeping
 * both directions in one file, with no React and no browser API, makes the pair
 * readable in one screen and testable without a DOM.
 *
 * ══ THE PARAM CONTRACT ══
 *   role      single    role family
 *   skill     repeated  one param per skill, AND semantics (see filter.ts)
 *   trait     single    the named trait the minimum figure applies to
 *   min       single    the floor, only meaningful with `trait`
 *   uncovered single    `hide` — the explicit opt-in to drop no-reading records
 *   loc       repeated  one param per work location
 *   avail     single    availability
 *   expmin    single    years floor
 *   expmax    single    years ceiling
 *
 * Repeated params rather than a comma-joined list, because the values are free
 * text from the data — "Hybrid — Pune", "Remote (IST)" — and a separator that
 * can appear inside a value is a parser bug waiting for the first location with
 * a comma in it.
 *
 * ══ NO `sort` AND NO `page` KEY ══
 * Not an omission. There is no sort control on this surface and there is not
 * going to be one: the only key anyone would sort a grid of people on is the
 * composite this product refuses to compute (see FilterRail's header comment).
 * Pagination has no key because it has no control yet — nine fixture records
 * fit on one screen. A `page` param that nothing reads would be a promise the
 * UI does not keep. Both get keys on the day they get controls.
 */

import {
  EMPTY_FILTERS,
  EXPERIENCE_BOUNDS,
  type Availability,
  type DirectoryFilters,
} from "@/types/directory";

const AVAILABILITY_VALUES: readonly Availability[] = [
  "immediately",
  "within_30_days",
  "within_90_days",
  "not_looking",
];

/**
 * Parse a numeric param, or `null` if there is nothing usable to parse.
 *
 * ══ WHY THIS EXISTS INSTEAD OF A BARE `Number()` ══
 * `Number(null)` is `0` and `Number("")` is `0` — NOT `NaN`. So the obvious
 * `const n = Number(raw); if (!Number.isFinite(n)) return fallback;` never
 * reaches its fallback for an ABSENT param: it quietly returns 0 instead.
 *
 * That is not a rounding detail, it is a total-failure bug. A bare
 * `/dev/directory` has no `expmax`, so the ceiling came back 0, the experience
 * window collapsed to 0–20 → 0–0, and every candidate was filtered out. The
 * grid rendered "0 of 9 records" on the default URL with no filter chips to
 * explain it — an empty directory that looks like a broken page or, worse, like
 * nobody qualified. Measured before the fix; caught only by rendering the page.
 *
 * Guarding on the STRING before coercing is the fix: absence and emptiness are
 * decided in string space, where they are distinguishable, and only genuine
 * numeric text is handed to `Number()`.
 */
function readNumber(raw: string | null): number | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** Clamp to 0–100 in steps of 5 — the range control's own vocabulary. */
function readMinFigure(raw: string | null): number {
  const n = readNumber(raw);
  if (n === null) return EMPTY_FILTERS.minFigure.min;
  return Math.min(100, Math.max(0, Math.round(n / 5) * 5));
}

function readYears(raw: string | null, fallback: number): number {
  const n = readNumber(raw);
  if (n === null) return fallback;
  return Math.min(EXPERIENCE_BOUNDS.max, Math.max(EXPERIENCE_BOUNDS.min, Math.round(n)));
}

/**
 * Query string → filters. Total: any URL produces a usable filter object.
 *
 * Hand-edited and truncated URLs are the normal case for something meant to be
 * pasted into Slack, so every value is validated against its own vocabulary and
 * anything unrecognised falls back to the neutral default. A junk `avail=xyz`
 * has to mean "no availability constraint" rather than "match nothing", because
 * an empty grid with no visible cause is indistinguishable from a broken page.
 */
export function filtersFromSearchParams(
  params: URLSearchParams | ReadonlyURLSearchParamsLike,
): DirectoryFilters {
  const get = (key: string) => params.get(key);
  const getAll = (key: string) => params.getAll(key).filter((v) => v.length > 0);

  const availabilityRaw = get("avail");
  const availability = AVAILABILITY_VALUES.find((a) => a === availabilityRaw) ?? null;

  const traitKey = get("trait") || null;

  // The floor is read even when it equals the default, so that a link carrying
  // `trait=…` without `min=` still lands on the same figure the writer saw.
  const min = readMinFigure(get("min"));

  const expMin = readYears(get("expmin"), EXPERIENCE_BOUNDS.min);
  const expMax = readYears(get("expmax"), EXPERIENCE_BOUNDS.max);

  return {
    role: get("role") || null,
    skills: getAll("skill"),
    minFigure: {
      traitKey,
      min,
      // Only honoured alongside a named trait. `uncovered=hide` with no trait
      // is not a state the UI can produce, and treating it as armed would leave
      // an exclusion running with nothing to attribute it to.
      excludeNoReading: traitKey !== null && get("uncovered") === "hide",
    },
    locations: getAll("loc"),
    availability,
    // A reversed window in the URL is repaired rather than rejected: it is what
    // a hand-edited link produces, and the honest reading of `8..3` is `3..8`.
    experience: { min: Math.min(expMin, expMax), max: Math.max(expMin, expMax) },
  };
}

/**
 * Filters → query string. Writes ONLY what differs from the zero state.
 *
 * This is what keeps a bare `/dev/directory` at a bare `/dev/directory` instead
 * of `?role=&skill=&trait=&min=50&expmin=0&expmax=20`, which is the default
 * output of every naive implementation and reads to a recipient like a URL that
 * has already been filtered. Clean-when-empty is the whole reason `EMPTY_FILTERS`
 * is a single exported constant rather than six scattered literals.
 */
export function filtersToSearchParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.role) params.set("role", filters.role);
  for (const skill of filters.skills) params.append("skill", skill);

  if (filters.minFigure.traitKey) {
    params.set("trait", filters.minFigure.traitKey);
    params.set("min", String(filters.minFigure.min));
    if (filters.minFigure.excludeNoReading) params.set("uncovered", "hide");
  }

  for (const location of filters.locations) params.append("loc", location);
  if (filters.availability) params.set("avail", filters.availability);

  if (filters.experience.min !== EXPERIENCE_BOUNDS.min) {
    params.set("expmin", String(filters.experience.min));
  }
  if (filters.experience.max !== EXPERIENCE_BOUNDS.max) {
    params.set("expmax", String(filters.experience.max));
  }

  return params;
}

/**
 * The path to write to history. `?` is omitted entirely when there is nothing
 * to say — `/dev/directory?` is a different string from `/dev/directory` and
 * looks, to anyone reading it, like something went wrong.
 */
export function filtersToHref(pathname: string, filters: DirectoryFilters): string {
  const query = filtersToSearchParams(filters).toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * The read-only shape `useSearchParams()` hands back. Declared structurally so
 * this module never imports from `next/navigation` — that import would make it
 * client-only and untestable in a plain Node context.
 */
export interface ReadonlyURLSearchParamsLike {
  get(key: string): string | null;
  getAll(key: string): string[];
  toString(): string;
}
