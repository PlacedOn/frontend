"use client";

/**
 * EmptyState — zero results, and the exact reason why.
 *
 * ══ WHY IT LISTS THE FILTERS RATHER THAN APOLOGISING ══
 * "No candidates found" is a dead end. The user did not do anything wrong; they
 * built a query that happens to be empty, and the only useful thing a screen
 * can do is show them the query and let them take a piece off it. So the
 * filters are repeated here, in the same removable grammar as the header bar,
 * with a single control that drops all of them.
 *
 * ══ THE MINIMUM-FIGURE CAVEAT ══
 * When the empty result involves the minimum-figure facet, this says something
 * the generic copy cannot, and WHAT it says changed when the filter changed.
 *
 * The facet no longer drops candidates with no reading on the named trait —
 * they stay in the results, marked. So the default caveat is no longer "people
 * were silently excluded"; it is "everyone with a reading here came in under
 * your floor, and that is a real reading of real evidence".
 *
 * But if the recruiter has ALSO ticked the explicit exclusion, the old warning
 * becomes true again — and now it is attributable, so this names it and offers
 * the specific undo rather than only "clear all filters". A recruiter who does
 * not know an exclusion is running will read the empty grid as "nobody here is
 * good enough", which is a conclusion the data does not support.
 */

import { ActiveFilterChips } from "./ActiveFilterChips";
import type { ActiveFilter } from "@/lib/directory/filter";

export interface EmptyStateProps {
  filters: readonly ActiveFilter[];
  onRemove: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  /** True when the min-figure facet is part of the query. Adds the caveat. */
  minFigureActive: boolean;
  /** True when the recruiter opted into hiding no-reading records. */
  excludeNoReadingActive?: boolean;
  /** How many records the exclusion is currently removing. */
  hiddenNoReadingCount?: number;
  /** Undo just the exclusion, leaving the rest of the query intact. */
  onShowNoReading?: () => void;
  /** How many records exist in total, before any filter. */
  totalCount: number;
}

export function EmptyState({
  filters,
  onRemove,
  onClearAll,
  minFigureActive,
  excludeNoReadingActive = false,
  hiddenNoReadingCount = 0,
  onShowNoReading,
  totalCount,
}: EmptyStateProps) {
  const hasFilters = filters.length > 0;

  return (
    <div
      role="status"
      className="rounded-[var(--r-card)] p-7 sm:p-10"
      style={{
        background: "var(--porcelain-2)",
        border: "1px dashed var(--glass-line-hi)",
      }}
    >
      <p className="eyebrow">No matches</p>

      {/* Explicit color: the unlayered `h1-h4 { color: var(--ink) }` in
          globals.css beats any Tailwind text utility. */}
      <h2
        className="mt-2.5 max-w-[28ch] text-[clamp(1.25rem,1rem+1vw,1.6rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        {hasFilters
          ? "Nothing in the directory clears every one of these at once."
          : "The directory is empty."}
      </h2>

      {hasFilters ? (
        <>
          <p
            className="mt-3 max-w-[58ch] text-[13.5px] leading-relaxed"
            style={{ color: "var(--ink-2)" }}
          >
            {/* One expression, not interpolated fragments. JSX collapses the
                whitespace between an expression container and the text that
                follows it on the same source line, which silently produced
                "9 recordsexist" — a single template literal cannot drift. */}
            {`${totalCount} ${totalCount === 1 ? "record" : "records"} exist. ` +
              `Take one constraint off and the list comes back — start with whichever of these matters least.`}
          </p>

          <div className="mt-5">
            <ActiveFilterChips
              filters={filters}
              onRemove={onRemove}
              onClearAll={onClearAll}
              showClearAll={false}
            />
          </div>

          {minFigureActive && (
            <div
              className="mt-5 max-w-[62ch] rounded-[var(--r-btn)] px-4 py-3.5"
              style={{
                background: "var(--band-needs-fill)",
                color: "var(--ink-2)",
                border: "1px solid var(--glass-line)",
              }}
            >
              {excludeNoReadingActive ? (
                <>
                  <p className="text-[12.5px] leading-relaxed">
                    You also ticked{" "}
                    <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                      hide anyone with no reading
                    </strong>{" "}
                    {`on that trait. ${
                      hiddenNoReadingCount > 0
                        ? `That is removing ${hiddenNoReadingCount} ${
                            hiddenNoReadingCount === 1 ? "record" : "records"
                          } right now. Those people`
                        : "Anyone it removes"
                    } were not scored low — the interview never asked. That is a gap in our coverage.`}
                  </p>
                  {onShowNoReading && (
                    <button
                      type="button"
                      onClick={onShowNoReading}
                      className="mt-3 cursor-pointer rounded-[var(--r-btn)] px-3.5 py-2 text-[12.5px] font-semibold"
                      style={{
                        background: "var(--white)",
                        color: "var(--iris-ink)",
                        border: "1px solid var(--iris-line)",
                      }}
                    >
                      Show them again
                    </button>
                  )}
                </>
              ) : (
                <p className="text-[12.5px] leading-relaxed">
                  {"The minimum-figure filter applies only to candidates who HAVE a reading on that " +
                    "trait. Anyone the interview never asked is still included and marked on their " +
                    "card — so an empty grid here means everyone with a reading came in under your " +
                    "floor, not that people were hidden."}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClearAll}
            className="mt-6 cursor-pointer rounded-[var(--r-btn)] px-5 py-2.5 text-[13px] font-semibold"
            style={{
              background: "var(--iris)",
              color: "#FFFFFF",
              border: "1px solid var(--iris)",
            }}
          >
            Clear all filters
          </button>
        </>
      ) : (
        <p
          className="mt-3 max-w-[58ch] text-[13.5px] leading-relaxed"
          style={{ color: "var(--ink-2)" }}
        >
          No candidate records have been assessed yet. When the interview pipeline produces its
          first completed session, it will appear here.
        </p>
      )}
    </div>
  );
}
