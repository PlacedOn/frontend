"use client";

/**
 * UncoveredTopicCard — a planned topic the interview never reached.
 *
 * ══ WHY THIS IS NOT A ScoreCard WITH THE NUMBER REMOVED ══
 * Because it is not the same object. `ScoreCard` renders a reading and the
 * evidence under it; this renders the absence of one. If it were a ScoreCard
 * variant, every future change to the card — a figure, a track, a comparison —
 * would arrive here by default and have to be argued out again. A separate
 * component makes "there is nothing to show" a thing the code can state once.
 *
 * ══ WHAT IS DELIBERATELY ABSENT ══
 * No figure, no 0–100 track, no dash where a number would go, no empty
 * ConfidenceBand, no "0 of 100", no greyed-out numeral. Each of those reads as a
 * poor result rather than an absent one, and the difference between "we did not
 * ask" and "you did badly" is the single claim this product is making.
 *
 * ══ THE REGISTER ══
 * The neutral `--band-needs-*` tokens, which globals.css defines as deliberately
 * grey precisely because "we don't know yet" is an absence of evidence rather
 * than a failure. Amber would read as a warning and red as a verdict. The
 * sentence attributes the gap to us in the first person, because it is ours.
 *
 * No icon. A glyph in this slot would be doing tone rather than meaning, and the
 * tone it would do is "alert".
 */

import { motion, useReducedMotion } from "motion/react";
import { reveal } from "@/lib/motion";
import type { InterviewTopic } from "@/lib/candidate/coverage";

export interface UncoveredTopicCardProps {
  topic: InterviewTopic;
  /** Index in a stack — staggers the reveal. */
  stagger?: number;
}

export function UncoveredTopicCard({ topic, stagger = 0 }: UncoveredTopicCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      {...reveal(reduce, { y: 12 }, "std", { stagger })}
      className="flex flex-col rounded-[var(--r-card)] p-5 sm:p-6"
      style={{
        background: "var(--porcelain-2)",
        // Dashed, like the directory's empty state and the `contested` badge:
        // an unfinished edge for something that is genuinely unfinished.
        border: "1px dashed var(--glass-line-hi)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">Block {topic.blockId}</span>
        <span
          className="shrink-0 rounded-[var(--r-chip)] px-2.5 py-[3px] text-[11px] font-semibold"
          style={{
            color: "var(--band-needs-ink)",
            background: "var(--band-needs-fill)",
            border: "1px dashed color-mix(in srgb, var(--band-needs-ink) 38%, transparent)",
            whiteSpace: "nowrap",
          }}
        >
          Not reached
        </span>
      </div>

      {/* Explicit color: globals.css carries an UNLAYERED `h1-h4 { color: var(--ink) }`
          that beats every Tailwind text utility regardless of specificity. */}
      <h3
        className="mt-2.5 text-[16px] font-semibold"
        style={{ color: "var(--ink)", lineHeight: 1.25 }}
      >
        {topic.traitLabel}
      </h3>

      {/* Where the figure would be on a ScoreCard, there is a sentence. The
          slot is not left visually empty — an empty slot invites the reader to
          supply the missing number themselves. */}
      <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: "var(--ink)" }}>
        Your interview never got here, so there is no reading — not a low one, none at all.
      </p>

      <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        {topic.why}
      </p>

      <div
        className="mt-auto pt-5 text-[12px] leading-relaxed"
        style={{ color: "var(--ink-2)" }}
      >
        <div style={{ height: 1, background: "var(--glass-line)" }} />
        <p className="mt-3">
          <strong style={{ color: "var(--ink)", fontWeight: 600 }}>This is our gap.</strong> A
          session that reaches this topic is the only thing that closes it, and nothing you do
          elsewhere counts against it in the meantime.
        </p>
      </div>
    </motion.article>
  );
}
