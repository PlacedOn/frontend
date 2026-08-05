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
 * the generic copy cannot: a candidate with no reading on that trait was
 * excluded, and that is an absence of evidence, not a low figure. A recruiter
 * who does not know that will read the empty grid as "nobody here is good
 * enough", which is a conclusion the data does not support.
 */

import { ActiveFilterChips } from "./ActiveFilterChips";
import type { ActiveFilter } from "@/lib/directory/filter";

export interface EmptyStateProps {
  filters: readonly ActiveFilter[];
  onRemove: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  /** True when the min-figure facet is part of the query. Adds the caveat. */
  minFigureActive: boolean;
  /** How many records exist in total, before any filter. */
  totalCount: number;
}

export function EmptyState({
  filters,
  onRemove,
  onClearAll,
  minFigureActive,
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
            <p
              className="mt-5 max-w-[62ch] rounded-[var(--r-btn)] px-4 py-3 text-[12.5px] leading-relaxed"
              style={{
                background: "var(--band-needs-fill)",
                color: "var(--ink-2)",
                border: "1px solid var(--glass-line)",
              }}
            >
              A minimum-figure filter also excludes anyone with{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>no reading</strong>
              {" on that trait. Those people were not scored low — the interview never got to it. " +
                "Clearing this filter is the only way to see them."}
            </p>
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
