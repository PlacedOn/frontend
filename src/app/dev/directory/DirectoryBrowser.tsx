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
 * ══ FILTER STATE IS LOCAL, NOT URL, IN PHASE 2 ══
 * Shareable filters belong in the query string — that is the house rule and it
 * is right. It is not done here because this is `/dev`, an internal component
 * surface with no shareable meaning, and putting fixture filters into a
 * copy-pasteable URL is the wrong thing to make easy. The real `/hr` directory
 * must read and write search params.
 */

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CandidateCard } from "@/components/directory/CandidateCard";
import { FilterRail } from "@/components/directory/FilterRail";
import { EmptyState } from "@/components/directory/EmptyState";
import { ActiveFilterChips } from "@/components/directory/ActiveFilterChips";
import {
  activeFilters,
  buildVocabulary,
  filterCandidates,
  locationFacetCounts,
  skillFacetCounts,
  type ActiveFilter,
} from "@/lib/directory/filter";
import { EMPTY_FILTERS, type DirectoryFilters } from "@/types/directory";
import { FIXTURE_DIRECTORY_CANDIDATES } from "@/mocks/directoryCandidates";

export function DirectoryBrowser() {
  const [filters, setFilters] = useState<DirectoryFilters>(EMPTY_FILTERS);
  const [shortlisted, setShortlisted] = useState<readonly string[]>([]);
  const [railOpen, setRailOpen] = useState(false);

  const candidates = FIXTURE_DIRECTORY_CANDIDATES;

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

  const removeFilter = (filter: ActiveFilter) => setFilters((current) => filter.remove(current));
  const clearAll = () => setFilters(EMPTY_FILTERS);

  const toggleShortlist = (id: string) =>
    setShortlisted((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

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
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          {/* aria-live so the count is announced after a filter change — the
              visual cross-fade is invisible to a screen reader. */}
          <p aria-live="polite" className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              {results.length} of {candidates.length}
            </strong>{" "}
            {candidates.length === 1 ? "record" : "records"}
            {shortlisted.length > 0 && (
              <span style={{ color: "var(--ink-3)" }}> · {shortlisted.length} shortlisted</span>
            )}
          </p>
        </div>

        {chips.length > 0 && (
          <div className="mt-3.5">
            <ActiveFilterChips filters={chips} onRemove={removeFilter} onClearAll={clearAll} />
          </div>
        )}

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState
              filters={chips}
              onRemove={removeFilter}
              onClearAll={clearAll}
              minFigureActive={filters.minFigure.traitKey !== null}
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
                    shortlisted={shortlisted.includes(candidate.id)}
                    onShortlist={toggleShortlist}
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
