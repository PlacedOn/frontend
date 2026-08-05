"use client";

/**
 * CoverageStrip — how much of the interview plan the session actually reached.
 *
 * ══ WHY THIS IS NOT A SCORE, AND HOW THE SHAPE ENFORCES IT ══
 * A progress ring or a filling gauge would be read as "how far along this person
 * is", and a single continuous fill invites exactly one question: what number is
 * that? So this is SEGMENTED — one segment per planned topic, each individually
 * labelled — and there is no continuous track and no percentage anywhere. You
 * can count the segments; you cannot read a figure off them. The quantity being
 * shown is a property of our interview, not of the person taking it.
 *
 * ══ THREE STATES, ENCODED AS TEXTURE FIRST ══
 * Solid / part-filled / hollow-and-dashed. The ramp survives greyscale, a
 * photocopy, and deuteranopia, because the difference was never only hue — the
 * same rule `ConfidenceBand` and `TrustBadge` follow. Hue is the redundant cue.
 *
 * ══ NO FIGURE ON AN UNREACHED TOPIC ══
 * A `not_reached` segment renders as an empty outline. Not a zero, not a grey
 * bar at some low width, not a dash on a 0–100 scale — all three of which read
 * as a poor result rather than as an absent one.
 */

import { motion, useReducedMotion } from "motion/react";
import { reveal } from "@/lib/motion";
import type { CoverageStatus, CoverageSummary, TopicCoverage } from "@/lib/candidate/coverage";

export interface CoverageStripProps {
  coverage: readonly TopicCoverage[];
  summary: CoverageSummary;
}

interface SegmentStyle {
  /** What the segment is filled with. */
  background: string;
  border: string;
  borderStyle: "solid" | "dashed";
  /** Plain language for the legend and the screen-reader sentence. */
  label: string;
}

const SEGMENT: Record<CoverageStatus, SegmentStyle> = {
  has_evidence: {
    background: "var(--iris)",
    border: "var(--iris)",
    borderStyle: "solid",
    label: "Reached, with cited moments",
  },
  asked_no_evidence: {
    background: "color-mix(in srgb, var(--iris) 22%, transparent)",
    border: "var(--iris-line)",
    borderStyle: "solid",
    label: "Reached, but nothing citable came out of it",
  },
  not_reached: {
    // A faint neutral FILL rather than nothing, plus a firmer dashed edge.
    // Measured at 1440 with `transparent` and a hairline border: the unreached
    // segments were barely findable against the porcelain panel, so the strip
    // read as three segments rather than six with three empty. An uncounted gap
    // is a hidden gap, which is the failure this whole component exists to
    // avoid. Grey and dashed keeps it unmistakably "no signal here" — it must
    // never read as partial credit.
    background: "var(--mist)",
    border: "color-mix(in srgb, var(--ink-3) 55%, transparent)",
    borderStyle: "dashed",
    label: "Never reached",
  },
};

const LEGEND_ORDER: readonly CoverageStatus[] = [
  "has_evidence",
  "asked_no_evidence",
  "not_reached",
];

export function CoverageStrip({ coverage, summary }: CoverageStripProps) {
  const reduce = useReducedMotion();

  // Assembled as one sentence rather than left to the segments, because a screen
  // reader walking eleven adjacent divs learns nothing. The individual segments
  // are `aria-hidden`; this carries all of it.
  const srLabel =
    `Interview coverage. ${summary.planned} topics were planned. ` +
    `${summary.withEvidence} produced cited evidence. ` +
    `${summary.askedWithoutEvidence} were reached but produced nothing citable. ` +
    `${summary.notReached} were never reached. ` +
    `The topics that were not reached are gaps in the interview, not findings about you.`;

  return (
    <div>
      <div role="img" aria-label={srLabel} className="flex w-full items-stretch gap-1.5">
        {coverage.map((entry, i) => {
          const style = SEGMENT[entry.status];
          return (
            <motion.span
              key={entry.topic.traitKey}
              aria-hidden
              // `reveal()` keeps the SAME KEYS in `initial` and `animate` in both
              // motion modes and branches only the transition — the rule that
              // exists because the server renders with reduce=false and would
              // otherwise serialise `scaleX(0)` into HTML that the client never
              // overwrites. Never branch the key set on `useReducedMotion()`.
              {...reveal(reduce, { scaleX: 0 }, "sig", { stagger: i })}
              className="h-2.5 flex-1 rounded-[var(--r-chip)]"
              style={{
                background: style.background,
                border: `1px ${style.borderStyle} ${style.border}`,
                transformOrigin: "left center",
                // Never below a visible width, however many topics a plan holds.
                minWidth: 10,
              }}
            />
          );
        })}
      </div>

      {/* The legend is visible text, not a tooltip. Three textures are only
          self-explanatory to whoever designed them. */}
      <ul className="mt-3 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
        {LEGEND_ORDER.map((status) => {
          const style = SEGMENT[status];
          const count =
            status === "has_evidence"
              ? summary.withEvidence
              : status === "asked_no_evidence"
                ? summary.askedWithoutEvidence
                : summary.notReached;

          return (
            <li key={status} className="flex items-center gap-2 text-[11.5px]">
              <span
                aria-hidden
                className="inline-block h-2.5 w-5 shrink-0 rounded-[var(--r-chip)]"
                style={{
                  background: style.background,
                  border: `1px ${style.borderStyle} ${style.border}`,
                }}
              />
              <span style={{ color: "var(--ink-2)" }}>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{count}</span>{" "}
                {style.label.toLowerCase()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
