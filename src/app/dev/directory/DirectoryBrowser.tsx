"use client";

/**
 * The interactive half of the talent directory.
 *
 * ══ WHY THERE IS NO SPINNER ══
 * Filtering happens against an in-memory fixture array, so there is nothing to
 * wait for — but the interaction is built the way it will have to work against
 * `GET /api/candidates` too: the previous result set STAYS ON SCREEN and the
 * new one replaces it in place. Cards that no longer match fade out; cards that
 * survive slide to their new grid cell with a transform. Nothing is ever
 * replaced by a loading rectangle, because a full-page spinner throws away the
 * one thing the recruiter was looking at and forces them to re-orient after
 * every keystroke.
 *
 * ══ WHY THE GRID NEVER JUMPS ══
 * Two things do the work. `minmax(0, 1fr)` on the grid track stops a long
 * headline from forcing the column wider than its share (the classic CSS-grid
 * blowout that produces horizontal scroll at 320px). And `layout="position"` on
 * each card turns a reflow into a FLIP transform, so a card that moves from
 * column 3 to column 1 travels there instead of teleporting.
 *
 * ══ THE URL IS THE FILTER STATE ══
 * Phase 2 kept filters in `useState` and argued that /dev fixtures have no
 * shareable meaning. True about /dev, wrong about the codebase: the real /hr
 * directory has to put filters in the query string, and building that later
 * means building it on top of every component that assumed a setter. So there
 * is no `useState` for filters here. `useSearchParams()` is read, filters are
 * derived from it, and every change writes back — one direction, one source.
 *
 * ══ WHY `window.history.replaceState` AND NOT `router.replace` ══
 * Next 16 patches `pushState`/`replaceState` into its own router, so a native
 * call updates `useSearchParams()` and re-renders without a server round-trip
 * (see next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md,
 * "Native History API"). `router.replace()` would take an RSC round-trip per
 * keystroke on the minimum-figure slider. `replace` and not `push` because a
 * recruiter who dragged a slider from 50 to 75 wants Back to leave the
 * directory, not to walk them through five intermediate figures.
 *
 * ══ WHAT IS DELIBERATELY NOT IN THE URL ══
 * The shortlist. Filters describe the job and are meant to be pasted to a
 * colleague; the shortlist is a record of one recruiter's commitments, and a
 * link that silently forwards "these are the ones I like" is a different act
 * from sharing a search. It lives in `ShortlistProvider`.
 */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { CandidateCard } from "@/components/directory/CandidateCard";
import { FilterRail } from "@/components/directory/FilterRail";
import { EmptyState } from "@/components/directory/EmptyState";
import { ActiveFilterChips } from "@/components/directory/ActiveFilterChips";
import {
  activeFilters,
  buildVocabulary,
  countWithoutReading,
  filterCandidates,
  hasReadingOn,
  locationFacetCounts,
  skillFacetCounts,
  type ActiveFilter,
} from "@/lib/directory/filter";
import { filtersFromSearchParams, filtersToHref } from "@/lib/directory/urlState";
import { useShortlist } from "@/lib/shortlist/ShortlistProvider";
import { EMPTY_FILTERS, type DirectoryFilters } from "@/types/directory";
import { FIXTURE_DIRECTORY_CANDIDATES } from "@/mocks/directoryCandidates";

export function DirectoryBrowser() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const shortlist = useShortlist();
  const [railOpen, setRailOpen] = useState(false);

  const candidates = FIXTURE_DIRECTORY_CANDIDATES;

  // The URL is the state. `searchParams.toString()` is the dependency rather
  // than the object, because Next hands back a new instance on every render and
  // memoising on the instance would recompute filters every time.
  const paramString = searchParams.toString();
  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(paramString)),
    [paramString],
  );

  const setFilters = useCallback(
    (next: DirectoryFilters) => {
      // Shallow: no RSC round-trip, no history entry. The address bar still
      // ends up holding a link that reproduces exactly this grid.
      window.history.replaceState(null, "", filtersToHref(pathname, next));
    },
    [pathname],
  );

  // The vocabulary is derived from the data, never hand-listed — a facet that
  // offers a skill nobody has is a dead end the user has to discover by hand.
  const vocabulary = useMemo(() => buildVocabulary(candidates), [candidates]);
  const results = useMemo(() => filterCandidates(candidates, filters), [candidates, filters]);
  const skillCounts = useMemo(
    () => skillFacetCounts(candidates, filters, vocabulary.skills),
    [candidates, filters, vocabulary.skills],
  );
  const locationCounts = useMemo(
    () => locationFacetCounts(candidates, filters),
    [candidates, filters],
  );
  const chips = useMemo(() => activeFilters(filters, vocabulary), [filters, vocabulary]);

  const traitKey = filters.minFigure.traitKey;
  const traitLabel = traitKey
    ? (vocabulary.traits.find((t) => t.key === traitKey)?.label ?? traitKey)
    : null;

  /** Records in the CURRENT results that have no reading on the filtered trait. */
  const uncoveredInResults = useMemo(
    () => countWithoutReading(results, traitKey),
    [results, traitKey],
  );

  /**
   * Records the explicit exclusion is currently removing. Computed against the
   * query WITHOUT the exclusion, because a number computed against the
   * post-exclusion set would always be zero — the thing being counted is
   * exactly what is missing.
   */
  const hiddenByExclusion = useMemo(() => {
    if (!traitKey || !filters.minFigure.excludeNoReading) return 0;
    const withThemIn: DirectoryFilters = {
      ...filters,
      minFigure: { ...filters.minFigure, excludeNoReading: false },
    };
    return countWithoutReading(filterCandidates(candidates, withThemIn), traitKey);
  }, [candidates, filters, traitKey]);

  const removeFilter = (filter: ActiveFilter) => setFilters(filter.remove(filters));
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const showNoReading = () =>
    setFilters({ ...filters, minFigure: { ...filters.minFigure, excludeNoReading: false } });

  return (
    <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-[248px_minmax(0,1fr)] md:gap-8">
      <FilterRail
        filters={filters}
        vocabulary={vocabulary}
        skillCounts={skillCounts}
        locationCounts={locationCounts}
        activeCount={chips.length}
        onChange={setFilters}
        onClearAll={clearAll}
        open={railOpen}
        onToggleOpen={() => setRailOpen((v) => !v)}
      />

      {/* `min-w-0` is what actually prevents horizontal overflow: without it a
          grid item's min-content width wins and the whole page scrolls. */}
      <section aria-label="Candidate records" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {/* aria-live so the count is announced after a filter change — the
              visual cross-fade is invisible to a screen reader. */}
          <p aria-live="polite" className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              {results.length} of {candidates.length}
            </strong>{" "}
            {candidates.length === 1 ? "record" : "records"}
          </p>

          {/* The pipeline is reachable from here whether or not anything is on
              it. A link that appears only once you have shortlisted somebody
              hides where the identity release happens from exactly the person
              who should know before they press the button. */}
          <Link
            href="/dev/pipeline"
            className="inline-flex items-center gap-2 rounded-[var(--r-chip)] px-3.5 py-1.5 text-[12.5px] font-semibold"
            style={{
              background: shortlist.ids.length > 0 ? "var(--iris-ghost)" : "var(--white)",
              border: `1px solid ${shortlist.ids.length > 0 ? "var(--iris-line)" : "var(--glass-line)"}`,
              color: shortlist.ids.length > 0 ? "var(--iris-ink)" : "var(--ink-2)",
              textDecoration: "none",
            }}
          >
            Pipeline
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
              {shortlist.ids.length}
            </span>
          </Link>
        </div>

        {chips.length > 0 && (
          <div className="mt-3.5">
            <ActiveFilterChips filters={chips} onRemove={removeFilter} onClearAll={clearAll} />
          </div>
        )}

        {/* ── the coverage note ──
            Stated once above the grid rather than only per-card, because the
            per-card notice answers "why is this person here" and this answers
            "what am I actually looking at". Neutral register: it reports a
            property of our interview coverage, not a verdict on anybody. */}
        {traitLabel && (uncoveredInResults > 0 || hiddenByExclusion > 0) && (
          <p
            className="mt-3.5 max-w-[80ch] rounded-[var(--r-btn)] px-3.5 py-2.5 text-[12px] leading-relaxed"
            style={{
              background: "var(--band-needs-fill)",
              border: "1px solid var(--glass-line)",
              color: "var(--ink-2)",
            }}
          >
            {filters.minFigure.excludeNoReading
              ? `${hiddenByExclusion} ${hiddenByExclusion === 1 ? "record is" : "records are"} hidden because you asked to drop anyone with no reading on ${traitLabel}. They were not scored low — the interview never asked.`
              : `${uncoveredInResults} of these ${uncoveredInResults === 1 ? "records has" : "records have"} no reading on ${traitLabel} and ${uncoveredInResults === 1 ? "is" : "are"} kept anyway, marked on the card. A minimum figure filters people who have a reading; it does not turn a gap in our interview into a low score.`}
          </p>
        )}

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState
              filters={chips}
              onRemove={removeFilter}
              onClearAll={clearAll}
              minFigureActive={traitKey !== null}
              excludeNoReadingActive={filters.minFigure.excludeNoReading}
              hiddenNoReadingCount={hiddenByExclusion}
              onShowNoReading={showNoReading}
              totalCount={candidates.length}
            />
          ) : (
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {/* Keys are candidate ids, so a card that survives a filter change
                  is never remounted — its confidence bands do not re-animate and
                  its shortlist state is not lost. */}
              <AnimatePresence>
                {results.map((candidate, i) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    stagger={i}
                    selectedSkills={filters.skills}
                    uncoveredTraitLabel={
                      traitLabel && !hasReadingOn(candidate, traitKey) ? traitLabel : null
                    }
                    shortlisted={shortlist.isShortlisted(candidate.id)}
                    onShortlist={shortlist.toggle}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
