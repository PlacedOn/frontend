"use client";

/**
 * ScoreCard — one trait, its interval, and the evidence underneath it.
 *
 * ══ WHAT THIS COMPONENT REFUSES TO DO ══
 * It renders ONE trait. It has no prop that accepts a list of traits and no
 * prop that accepts a blended figure, because the moment a component can render
 * "Candidate: 72" someone will render it. A page that wants five traits renders
 * five of these; the arithmetic that would collapse them never exists.
 *
 * ══ THE FIGURE IS SUBORDINATE TO THE EVIDENCE ══
 * Type scale does the arguing. The number is large, but "of 100 · on this
 * trait" sits against it at a quarter the size, and the count of cited moments
 * sits directly below the band. A reader's eye lands on the figure, then
 * immediately on what it rests on. When nothing is cited, the figure is muted
 * to tertiary ink and a caveat replaces the confident reading — an uncited
 * number is a guess, and the card says so rather than letting the typography
 * imply otherwise.
 *
 * ══ EXPANSION WITHOUT LAYOUT ANIMATION ══
 * The evidence list mounts and unmounts. Its container height snaps; only
 * opacity and a small translate animate. Animating `height` (or a grid
 * `1fr`/`0fr` trick) is layout-bound and forbidden here — it would force layout
 * on every frame for this card and every sibling card in the stack.
 */

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DUR, EASE_OUT, reveal, revealTransition } from "@/lib/motion";
import { BAND_COPY, type TraitScore } from "@/types/scoring";
import { ConfidenceBand } from "./ConfidenceBand";
import { EvidenceQuote } from "./EvidenceQuote";

export interface ScoreCardProps {
  /** Exactly one trait reading. Never a person, never an aggregate. */
  trait: TraitScore;
  /** Index in a stack — staggers the reveal and the band growth. */
  stagger?: number;
  /** Jump a player to a cited moment. Omit and timestamps render as text. */
  onSeek?: (startMs: number) => void;
  /** Start with the evidence list open. */
  defaultExpanded?: boolean;
}

export function ScoreCard({ trait, stagger = 0, onSeek, defaultExpanded = false }: ScoreCardProps) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const listId = useId();

  const copy = BAND_COPY[trait.confidence];
  const count = trait.evidence.length;
  const cited = count > 0;

  const disclosure = cited
    ? expanded
      ? `Hide the ${count === 1 ? "moment" : `${count} moments`}`
      : `Show the ${count === 1 ? "moment" : `${count} moments`} behind this`
    : "Why there is nothing to show";

  return (
    <motion.article
      {...reveal(reduce, { y: 12 }, "std", { stagger })}
      // No `overflow: hidden` — the band's popover escapes the top edge of this
      // card by design, and clipping it would silently break the hover state.
      className="relative flex flex-col rounded-[var(--r-card)] p-5 sm:p-6"
      style={{
        background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 72%)",
        border: "1px solid var(--glass-line)",
        backdropFilter: "blur(var(--blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--blur)) saturate(160%)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* ── header: provenance left, qualitative band right ── */}
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">Block {trait.blockId}</span>
        <span
          className="shrink-0 rounded-[var(--r-chip)] px-2.5 py-[3px] text-[11px] font-semibold"
          style={{
            color: copy.ink,
            background: copy.fill,
            border: `1px solid color-mix(in srgb, ${copy.ink} 30%, transparent)`,
            whiteSpace: "nowrap",
          }}
        >
          {copy.label}
        </span>
      </div>

      {/* Explicit color: globals.css sets an UNLAYERED `h1-h4 { color: var(--ink) }`
          that beats any Tailwind text utility. On this porcelain card --ink is
          correct anyway, but stating it here means moving this card onto the
          --instrument dark register is a one-line change rather than an
          invisible-heading bug. */}
      <h3
        className="mt-2.5 text-[16px] font-semibold"
        style={{ color: "var(--ink)", lineHeight: 1.25 }}
      >
        {trait.traitLabel}
      </h3>

      {/* ── the figure ── */}
      <div className="mt-4 flex items-end gap-2.5">
        <span
          className="text-[40px] font-semibold leading-none"
          style={{
            // Muted when nothing is cited. The typography must not claim a
            // confidence the evidence does not support.
            color: cited ? "var(--ink)" : "var(--ink-3)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.03em",
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {trait.point}
        </span>
        <span className="pb-1 text-[11.5px] leading-tight" style={{ color: "var(--ink-3)" }}>
          of 100
          <br />
          on this trait
        </span>
        <span
          className="ml-auto pb-1 text-[11.5px] font-medium"
          style={{ color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}
        >
          range {trait.bandLow}&ndash;{trait.bandHigh}
        </span>
      </div>

      <div className="mt-3.5">
        <ConfidenceBand
          point={trait.point}
          bandLow={trait.bandLow}
          bandHigh={trait.bandHigh}
          confidence={trait.confidence}
          label={trait.traitLabel}
          stagger={stagger}
        />
      </div>

      <p className="mt-3 text-[12.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
        {cited
          ? `Based on ${count} cited ${count === 1 ? "moment" : "moments"} from the interview.`
          : "No moments cited yet, so this figure is not a finding — treat the range, not the number."}
      </p>

      {/* ── disclosure ── */}
      <div className="mt-auto pt-4">
        <div style={{ height: 1, background: "var(--glass-line)" }} />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="mt-3 cursor-pointer rounded-[var(--r-chip)] px-3 py-1.5 text-[12px] font-semibold transition-colors"
          style={{
            background: expanded ? "var(--iris-ghost)" : "transparent",
            color: "var(--iris-ink)",
            border: "1px solid var(--iris-line)",
            transitionDuration: "var(--d-micro)",
          }}
        >
          {disclosure}
        </button>
      </div>

      <div id={listId}>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              // Same key set in every motion mode; only the transition branches.
              // Under reduce the `y` snaps to 0 with zero elapsed time and the
              // opacity alone travels — no movement, and no transform can be
              // left unwritten. See src/lib/motion.ts → `revealTransition`.
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={revealTransition(
                reduce,
                ["y"],
                {
                  duration: DUR.std,
                  ease: EASE_OUT as unknown as [number, number, number, number],
                },
                "micro",
              )}
              className="mt-4 flex flex-col gap-4"
            >
              {cited ? (
                trait.evidence.map((span) => (
                  <EvidenceQuote
                    key={span.id}
                    quote={span.quote}
                    startMs={span.startMs}
                    onSeek={onSeek}
                  />
                ))
              ) : (
                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {copy.plain}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
