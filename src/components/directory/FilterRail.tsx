"use client";

/**
 * FilterRail — the persistent filter rail SHELL, and the `Facet` primitive.
 *
 * ══ WHY THIS IS A SHELL AND NOT A DIRECTORY COMPONENT ══
 * It used to be both: the aside, the mobile disclosure, the panel chrome AND
 * the six candidate-specific facets, in one file. Phase 4 needed a rail on the
 * candidate's job browser, and the two honest options were to clone this file
 * or to split it. Cloning would have produced a second rail that drifts — one
 * of them gets the accessibility fix, the other does not, and nobody finds out
 * until a screen reader user does.
 *
 * So the shell — which is where all the fiddly behaviour lives — is shared, and
 * the facets are `children`. The directory's own facets moved to
 * `DirectoryFacets.tsx` unchanged; the job browser passes its own set. Neither
 * surface has a rail of its own.
 *
 * ══ WHY IT IS ALWAYS VISIBLE ON DESKTOP AND COLLAPSIBLE ON MOBILE ══
 * The rail is not a modal. Someone narrowing a list needs to see what they have
 * already narrowed while they narrow further; a filter sheet that covers the
 * results forces them to hold the state in their head and commit blind. Below
 * `md` there is no room for both, so the rail collapses behind a disclosure —
 * but the ACTIVE FILTER COUNT stays on the trigger, so the state is never
 * invisible even when the controls are.
 *
 * ══ WHY THE OPEN/CLOSED STATE IS CSS, NOT JS-CONDITIONAL RENDERING ══
 * The panel is always in the DOM; `md:block` shows it on desktop regardless of
 * the React state. That means the server renders the same tree the client
 * hydrates, there is no viewport measurement, no `useEffect` flash, and the
 * desktop rail cannot be hidden by a stale piece of mobile state.
 *
 * ══ NO SORT CONTROL, ON EITHER SURFACE ══
 * Deliberate, and for different reasons that land in the same place. On the
 * directory, a "sort by" dropdown over a grid of people needs a key, and the
 * only key anyone would want is the composite this product refuses to compute.
 * On the job browser there is no such objection in principle — but a candidate
 * ranking jobs by salary is a ranking we would be performing on their behalf
 * from one field, and the `note` slot is where each surface says which applies.
 */

import { useId, type ReactNode } from "react";
import { DUR_MS } from "@/lib/motion";

export interface FilterRailProps {
  /** Heading inside the panel. */
  title: string;
  /** Accessible name for the landmark. */
  label?: string;
  /** Number of chips the active-filter bar is showing. Drives the trigger. */
  activeCount: number;
  onClearAll: () => void;
  /** Mobile disclosure state. Owned by the page so the trigger can live elsewhere. */
  open: boolean;
  onToggleOpen: () => void;
  /** The facet controls. See `DirectoryFacets` / `JobFacets`. */
  children: ReactNode;
  /** The closing note under the facets — what this rail does and does not do. */
  note: ReactNode;
}

/**
 * One labelled group of controls. `role="group"` ties the heading to the set.
 * Exported because both facet sets are built from it — a second implementation
 * of "a labelled facet" is exactly the drift this file exists to prevent.
 */
export function Facet({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className="pt-5" style={{ borderTop: "1px solid var(--glass-line)" }}>
      {/* Explicit color — globals.css carries an unlayered `h1-h4 { color: var(--ink) }`
          that outranks Tailwind text utilities regardless of specificity. */}
      <h3 id={headingId} className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      {hint && (
        <p className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--ink-3)" }}>
          {hint}
        </p>
      )}
      <div role="group" aria-labelledby={headingId} className="mt-2.5">
        {children}
      </div>
    </section>
  );
}

/** Shared style for the native selects inside a facet. */
export const facetSelectStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--glass-line)",
  color: "var(--ink-2)",
  borderRadius: "var(--r-btn)",
  padding: "8px 10px",
  fontSize: 12.5,
  width: "100%",
  // Native controls inherit the body font only if asked.
  fontFamily: "var(--font-body)",
};

export function FilterRail({
  title,
  label = "Filters",
  activeCount,
  onClearAll,
  open,
  onToggleOpen,
  children,
  note,
}: FilterRailProps) {
  const panelId = useId();

  return (
    <aside
      aria-label={label}
      className="md:sticky md:top-6 md:self-start"
      // The rail can outgrow a short viewport once the vocabulary is real, so it
      // scrolls inside itself rather than detaching from `top-6`.
      style={{ maxHeight: "calc(100dvh - 3rem)" }}
    >
      {/* ── mobile disclosure trigger ── */}
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls={panelId}
        className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-[var(--r-btn)] px-4 py-3 text-[13px] font-semibold md:hidden"
        style={{
          background: "var(--white)",
          border: "1px solid var(--glass-line)",
          color: "var(--ink)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span>
          {label}
          {activeCount > 0 && (
            <span
              className="ml-2 rounded-[var(--r-chip)] px-2 py-[2px] text-[11px]"
              style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
            >
              {activeCount} active
            </span>
          )}
        </span>
        <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{open ? "Hide" : "Show"}</span>
      </button>

      {/* Always in the DOM. `md:block` wins over `hidden`, so desktop is never
          at the mercy of the mobile disclosure state. */}
      <div
        id={panelId}
        className={`${open ? "block" : "hidden"} rounded-[var(--r-card)] p-5 md:block md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto`}
        style={{
          background: "var(--porcelain-2)",
          border: "1px solid var(--glass-line)",
        }}
      >
        <div className="flex items-baseline justify-between gap-3 pb-5">
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
            {title}
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="cursor-pointer text-[12px] font-semibold"
              style={{
                color: "var(--iris-ink)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {children}

        <p
          className="mt-5 text-[11.5px] leading-snug"
          style={{
            color: "var(--ink-3)",
            borderTop: "1px solid var(--glass-line)",
            paddingTop: 14,
            transitionDuration: `${DUR_MS.micro}ms`,
          }}
        >
          {note}
        </p>
      </div>
    </aside>
  );
}
