"use client";

/**
 * SkillPill — the one visual grammar for "a taggable thing".
 *
 * Per placedon-v2-plan §1.3 this component is reused everywhere a skill, tool,
 * or tag appears: the filter rail, the candidate card, a job description, a
 * profile. That reuse is the point. When the same token means the same thing in
 * the filter and on the card, a recruiter learns the vocabulary once and can
 * then read a card by scanning for the pills they just selected.
 *
 * Two modes, one component:
 *   - `onToggle` present  → an interactive filter control (`aria-pressed`)
 *   - `onToggle` absent   → a static label on a card
 *
 * A toggle is a BUTTON with `aria-pressed`, not a checkbox. The distinction
 * matters to a screen reader: a checkbox announces "checked / not checked",
 * which implies a form the user will later submit. These take effect
 * immediately, and `aria-pressed` announces "pressed", which is what actually
 * happens.
 *
 * No icons. A checkmark inside a selected pill would say nothing that the fill,
 * the border weight and the `aria-pressed` state do not already say.
 */

import { DUR_MS } from "@/lib/motion";

export interface SkillPillProps {
  label: string;
  /**
   * Facet count. Shown only in filter mode — a count on a card would be
   * meaningless ("React 4"?). `0` renders the pill as unavailable rather than
   * hiding it, so the vocabulary stays stable while the recruiter narrows.
   */
  count?: number;
  selected?: boolean;
  /** Provide to make the pill an interactive filter control. */
  onToggle?: () => void;
  /** `sm` for dense card footers, `md` for the filter rail. */
  size?: "sm" | "md";
}

export function SkillPill({ label, count, selected = false, onToggle, size = "md" }: SkillPillProps) {
  const compact = size === "sm";
  // A zero-count facet is still shown, but cannot be selected into a guaranteed
  // empty result. It stays visible so the recruiter can see the axis exists.
  const unavailable = onToggle !== undefined && count === 0 && !selected;

  const base = compact
    ? "inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-2.5 py-[3px] text-[11.5px]"
    : "inline-flex items-center gap-1.5 rounded-[var(--r-chip)] px-3 py-1.5 text-[12.5px]";

  const style: React.CSSProperties = {
    // Selected inverts to the brand ground: it is the strongest available
    // signal and it is spent on the one thing the recruiter changed. Unselected
    // pills stay on the porcelain register so a rail of forty of them does not
    // read as forty buttons demanding attention.
    background: selected ? "var(--iris)" : "var(--white)",
    color: selected ? "#FFFFFF" : unavailable ? "var(--ink-3)" : "var(--ink-2)",
    border: `1px solid ${selected ? "var(--iris)" : "var(--glass-line)"}`,
    fontWeight: selected ? 600 : 500,
    letterSpacing: "0.005em",
    whiteSpace: "nowrap",
    opacity: unavailable ? 0.55 : 1,
    boxShadow: selected ? "var(--shadow-sm)" : "none",
    transitionProperty: "background-color, border-color, color, box-shadow, opacity",
    transitionDuration: `${DUR_MS.micro}ms`,
    transitionTimingFunction: "var(--ease-out)",
  };

  if (!onToggle) {
    return (
      <span className={base} style={style}>
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      // 44px is the touch-target floor; the pill's own box is ~30px tall, so
      // the padding does the rest rather than inflating the visual chip.
      className={`${base} cursor-pointer min-h-[32px] hover:border-[var(--iris-line)]`}
      style={style}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            color: selected ? "rgba(255,255,255,0.78)" : "var(--ink-3)",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
          }}
        >
          {count}
        </span>
      )}
      {unavailable && <span className="sr-only">. No matches with the current filters.</span>}
    </button>
  );
}
