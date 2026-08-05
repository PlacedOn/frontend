"use client";

/**
 * ConfidenceBand — the signature component.
 *
 * A 0–100 track carrying one trait reading: a shaded interval (bandLow →
 * bandHigh) with a solid marker at the point estimate.
 *
 * ══ WHY THE INTERVAL IS THE POINT ══
 * A bare number implies a precision the evidence does not have. Showing the
 * range makes the uncertainty impossible to ignore, which is the honest
 * position and also the legally defensible one. A recruiter who sees 61 sorts
 * by it; a recruiter who sees "somewhere between 48 and 74, and we're not
 * confident" asks a follow-up question instead.
 *
 * ══ GREYSCALE-FIRST ENCODING ══
 * Confidence is encoded THREE times over: interval width, fill opacity, and
 * (last) hue. Print the page, view it at 8% zoom, or hand it to someone with
 * deuteranopia — a wide faint band still reads as less certain than a narrow
 * solid one. Hue is the redundant cue, never the carrier.
 *
 * ══ WHY scaleX AND NOT width ══
 * `width` is layout-bound: animating it forces layout on every frame for the
 * band and every sibling. `transform: scaleX()` runs on the compositor. The
 * band's width is set ONCE as a static layout value and never animates; only
 * the transform does. `transform-origin: left` makes it grow from bandLow.
 */

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_SPRING, EASE_OUT, revealTransition } from "@/lib/motion";
import { BAND_COPY, BAND_GEOMETRY, type EvidenceBand } from "@/types/scoring";

export interface ConfidenceBandProps {
  /** Point estimate, 0–100. A per-trait figure — never an overall person score. */
  point: number;
  /** Lower bound of the plausible interval, 0–100. */
  bandLow: number;
  /** Upper bound of the plausible interval, 0–100. */
  bandHigh: number;
  /** Qualitative band. Never a numeric model confidence. */
  confidence: EvidenceBand;
  /** Trait name, used to build the screen-reader label. */
  label: string;
  /** Index in a list — staggers the reveal. */
  stagger?: number;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function ConfidenceBand({
  point,
  bandLow,
  bandHigh,
  confidence,
  label,
  stagger = 0,
}: ConfidenceBandProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  const copy = BAND_COPY[confidence];
  const geometry = BAND_GEOMETRY[confidence];

  // Clamp and order defensively — a backend that emits bandHigh < bandLow
  // should render something sane, not a negative-width box.
  const lo = clamp(Math.min(bandLow, bandHigh));
  const hi = clamp(Math.max(bandLow, bandHigh));
  const pt = clamp(point);

  // Width and opacity BOTH carry confidence. `minWidthPct` guarantees the
  // geometry differentiates even when the model returns a suspiciously tight
  // interval for a low-confidence reading — the visual must not claim more
  // precision than the band label does.
  const rawWidth = hi - lo;
  const width = Math.max(rawWidth, geometry.minWidthPct);
  // Re-centre on the original midpoint if minWidth widened the band, then push
  // it back inside the track if that overflowed an edge.
  const mid = (lo + hi) / 2;
  const left = Math.min(100 - width, Math.max(0, mid - width / 2));

  const srLabel =
    `${label}: ${pt} out of 100. ` +
    `Plausible range ${lo} to ${hi}. ` +
    `Confidence: ${copy.label.toLowerCase()}. ${copy.plain}`;

  return (
    <div className="relative">
      {/* Popover. Spans the full track width so it can never overflow the
          viewport at any breakpoint — at 320px it is exactly as wide as the
          track it describes. aria-hidden because the focusable track below
          already carries all of this text in its label; announcing it twice is
          noise. */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 4 }}
        transition={revealTransition(
          reduce,
          ["y"],
          { duration: DUR.micro, ease: EASE_OUT as unknown as [number, number, number, number] },
          "micro",
        )}
        style={{ pointerEvents: "none" }}
        className="absolute bottom-full left-0 right-0 z-10 mb-2"
      >
        <div
          className="rounded-[var(--radius-md)] px-3 py-2.5"
          style={{
            background: "var(--glass-hi)",
            border: "1px solid var(--glass-line-hi)",
            backdropFilter: "blur(12px)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <p
            className="text-[12.5px] font-semibold"
            style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}
          >
            {lo}–{hi} of 100
            <span className="ml-1.5 font-medium" style={{ color: copy.ink }}>
              · {copy.label}
            </span>
          </p>
          <p className="mt-1 text-[12px] leading-snug" style={{ color: "var(--ink-2)" }}>
            {copy.plain}
          </p>
        </div>
      </motion.div>

      {/* The track. role="img" + a complete label is the most reliable way to
          expose a range to a screen reader — a progressbar/meter role would
          force a single value and lose the interval, which is the one thing
          this component exists to communicate. */}
      <div
        role="img"
        aria-label={srLabel}
        aria-describedby={popoverId}
        tabIndex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        // Focus ring comes from the global `[tabindex]:focus-visible` rule in
        // globals.css — 2px solid var(--iris), 3px offset.
        className="relative h-2.5 w-full cursor-default rounded-[var(--r-chip)]"
        style={{ background: "var(--mist)" }}
      >
        {/* Shaded interval. `width` and `left` are STATIC layout values set
            once; only `scaleX` animates. */}
        <motion.span
          aria-hidden
          className="absolute inset-y-0 rounded-[var(--r-chip)]"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: copy.ink,
            transformOrigin: "left center",
          }}
          // `initial` and `animate` carry the SAME KEYS in both motion modes.
          // Only the transition branches. An earlier version dropped the scaleX
          // key under reduce, and because the SERVER renders with reduce=false
          // it had already written `transform: scaleX(0)` into the HTML — which
          // the client then never overwrote. The band was invisible for every
          // reduced-motion user. See the note on `reveal()` in src/lib/motion.ts.
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: geometry.fillOpacity }}
          transition={revealTransition(
            reduce,
            ["scaleX"],
            {
              duration: DUR.sig,
              delay: stagger * 0.06,
              ease: EASE_SPRING as unknown as [number, number, number, number],
            },
            "std",
          )}
        />

        {/* Point marker. A solid bar, not a dot — it reads as a reading on a
            scale rather than a target that was hit. */}
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: `${pt}%`,
            top: -3,
            bottom: -3,
            width: 3,
            marginLeft: -1.5,
            background: "var(--ink)",
            boxShadow: "0 0 0 2px var(--porcelain-2)",
          }}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={revealTransition(
            reduce,
            ["scaleY"],
            {
              duration: DUR.std,
              delay: stagger * 0.06 + DUR.sig * 0.5,
              ease: EASE_OUT as unknown as [number, number, number, number],
            },
            "micro",
          )}
        />
      </div>

      {/* Always in the DOM for aria-describedby; visually hidden. Gives the
          plain-language line to assistive tech without depending on hover. */}
      <span id={popoverId} className="sr-only">
        {copy.plain}
      </span>
    </div>
  );
}
