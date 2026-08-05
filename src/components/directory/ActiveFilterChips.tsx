"use client";

/**
 * ActiveFilterChips — every constraint currently applied, each removable.
 *
 * Shared by the results header and by `EmptyState`, because a recruiter who
 * just filtered themselves down to zero needs the SAME list in the SAME
 * grammar in front of them — not a different empty-screen dialect. Reading
 * "Skill: Kubernetes ×" in both places is what makes the fix obvious.
 *
 * Deliberately a different shape from `SkillPill`: these are not the taggable
 * vocabulary, they are a receipt of what you did. The facet name is printed
 * next to the value, which `SkillPill` never does.
 */

import { DUR_MS } from "@/lib/motion";
import type { ActiveFilter } from "@/lib/directory/filter";

/**
 * Generic over the filter state, so the job browser drives the same chips with
 * its own filter object. `F` is inferred from the array at every call site.
 */
export interface ActiveFilterChipsProps<F> {
  filters: readonly ActiveFilter<F>[];
  onRemove: (filter: ActiveFilter<F>) => void;
  onClearAll: () => void;
  /** Hide the "Clear all" control when the caller renders its own. */
  showClearAll?: boolean;
}

export function ActiveFilterChips<F>({
  filters,
  onRemove,
  onClearAll,
  showClearAll = true,
}: ActiveFilterChipsProps<F>) {
  if (filters.length === 0) return null;

  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
      {filters.map((filter) => (
        <li key={filter.id}>
          <button
            type="button"
            onClick={() => onRemove(filter)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-chip)] py-1.5 pl-3 pr-2.5 text-[12px]"
            style={{
              background: "var(--iris-ghost)",
              border: "1px solid var(--iris-line)",
              color: "var(--iris-ink)",
              transitionProperty: "background-color, border-color",
              transitionDuration: `${DUR_MS.micro}ms`,
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            <span>
              <span style={{ opacity: 0.72 }}>{filter.facet}:</span>{" "}
              <span style={{ fontWeight: 600 }}>{filter.value}</span>
            </span>
            {/* A functional control glyph, not decoration — it is the button's
                affordance. The accessible name below carries the real sentence,
                so nothing depends on the character being understood. */}
            <span aria-hidden style={{ fontSize: 14, lineHeight: 1, opacity: 0.7 }}>
              &times;
            </span>
            <span className="sr-only">
              Remove filter {filter.facet}: {filter.value}
            </span>
          </button>
        </li>
      ))}

      {showClearAll && (
        <li>
          <button
            type="button"
            onClick={onClearAll}
            className="cursor-pointer px-1 text-[12px] font-semibold"
            style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Clear all
          </button>
        </li>
      )}
    </ul>
  );
}
