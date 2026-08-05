/**
 * TrustBadge — Verified / Interview complete / Contested.
 *
 * These are STATUS OF THE RECORD, never a judgement of the person. "Contested"
 * in particular must not read as a black mark: it means the candidate exercised
 * a right and a human is re-reading the evidence. That is the system working,
 * so it is rendered in the same amber register as `emerging` — an open
 * question — and never in the danger red used for failures.
 *
 * ══ GREYSCALE-FIRST, LIKE THE BAND ══
 * Each variant carries a distinct BORDER TREATMENT (solid / hairline / dashed)
 * on top of its fill and ink. Photocopy the page or hand it to someone with
 * deuteranopia and the three are still distinguishable, because the difference
 * was never only hue.
 *
 * No icons. A checkmark next to "Verified" says nothing the word does not, and
 * every icon added here is one more thing to mistranslate.
 */

import type { TrustSignal } from "@/types/scoring";

export interface TrustBadgeProps {
  signal: TrustSignal;
  /** `sm` for inside dense card headers, `md` for standalone use. */
  size?: "sm" | "md";
}

interface BadgeStyle {
  label: string;
  /** Plain-language expansion. Read by assistive tech; shown on hover. */
  meaning: string;
  ink: string;
  fill: string;
  border: string;
  borderStyle: "solid" | "dashed";
  weight: number;
}

const BADGES: Record<TrustSignal, BadgeStyle> = {
  verified: {
    label: "Verified",
    meaning: "Identity and interview session confirmed by Placedon.",
    ink: "var(--band-supported-ink)",
    fill: "var(--band-supported-fill)",
    border: "color-mix(in srgb, var(--band-supported-ink) 34%, transparent)",
    borderStyle: "solid",
    weight: 600,
  },
  interview_complete: {
    label: "Interview complete",
    meaning: "A full interview was finished. The readings here are drawn from it.",
    ink: "var(--iris-ink)",
    fill: "var(--iris-ghost)",
    border: "var(--iris-line)",
    borderStyle: "solid",
    weight: 500,
  },
  contested: {
    // Dashed, deliberately: an open question looks unfinished, which is exactly
    // what it is. It is not a warning and must never be styled as one.
    label: "Contested",
    meaning:
      "The candidate has challenged a reading here and it is being re-checked by a person.",
    ink: "var(--band-emerging-ink)",
    fill: "var(--band-emerging-fill)",
    border: "color-mix(in srgb, var(--band-emerging-ink) 42%, transparent)",
    borderStyle: "dashed",
    weight: 600,
  },
};

export function TrustBadge({ signal, size = "md" }: TrustBadgeProps) {
  const badge = BADGES[signal];
  const compact = size === "sm";

  return (
    <span
      className={
        compact
          ? "inline-flex items-center rounded-[var(--r-chip)] px-2.5 py-[3px] text-[11px]"
          : "inline-flex items-center rounded-[var(--r-chip)] px-3 py-1.5 text-[12.5px]"
      }
      style={{
        color: badge.ink,
        background: badge.fill,
        border: `1px ${badge.borderStyle} ${badge.border}`,
        fontWeight: badge.weight,
        letterSpacing: "0.005em",
        whiteSpace: "nowrap",
      }}
      title={badge.meaning}
    >
      {badge.label}
      {/* The label alone is jargon out of context. Assistive tech gets the
          sentence; sighted users get it on hover via `title`. */}
      <span className="sr-only">. {badge.meaning}</span>
    </span>
  );
}
