"use client";

/**
 * JobCard — one open role, as a candidate sees it.
 *
 * ══ WHY THIS IS A NEW COMPONENT AND NOT A CandidateCard VARIANT ══
 * Jobs are not people, and almost every rule that shapes `CandidateCard` is a
 * rule about judging a human. That card withholds identity because on a browse
 * grid the reader is the ranker; this card names the pay band, the stage and the
 * location precisely because the reader SHOULD be ranking — the party being
 * assessed here is the employer, and a candidate comparing employers on the
 * terms of the work is doing the thing this product is for. Sharing a component
 * between the two would mean one file whose every prop needs a note explaining
 * which of two opposite fairness regimes it is under.
 *
 * ══ WHAT REPLACES THE MATCH PERCENTAGE ══
 * Nothing on this card scores the candidate against the role. Instead the card
 * lists the topics this role's interview will ask about, each marked with where
 * the candidate currently stands — evidence on file, asked but nothing cited, or
 * never reached. It is per-topic and checkable, and there is deliberately no
 * "3 of 5" summary: a ratio is a composite about a person wearing a job's
 * clothes, and the first thing anyone does with one is sort by it.
 *
 * A topic with no evidence is framed as something this interview would COVER,
 * never as something the candidate lacks. Same rule as the directory card: a
 * missing reading is a gap in our interview.
 */

import { motion, useReducedMotion } from "motion/react";
import { DUR_MS, reveal } from "@/lib/motion";
import { SkillPill } from "@/components/directory/SkillPill";
import type { CoverageStatus, TopicStanding } from "@/lib/candidate/coverage";
import {
  SALARY_COPY,
  STAGE_COPY,
  WORK_MODE_COPY,
  type Job,
} from "@/types/jobs";

export interface JobCardProps {
  job: Job;
  /** Where the candidate stands on each topic this role assesses. */
  standing: readonly TopicStanding[];
  /** Index in a list — staggers the reveal. */
  stagger?: number;
  /** Skills the candidate currently has selected in the rail, for emphasis. */
  highlightSkills?: readonly string[];
}

/** How each standing reads on a JOB card — forward-looking, never a deficit. */
const STANDING_COPY: Record<CoverageStatus, { note: string; ink: string; marker: string }> = {
  has_evidence: {
    note: "you already have cited evidence here",
    ink: "var(--band-supported-ink)",
    marker: "solid",
  },
  asked_no_evidence: {
    note: "asked before, nothing citable yet",
    ink: "var(--band-emerging-ink)",
    marker: "hairline",
  },
  not_reached: {
    note: "this interview would be the first to cover it",
    ink: "var(--ink-3)",
    marker: "dashed",
  },
};

/** ISO → "30 Jul 2026". Fixed locale so server and client agree during SSR. */
function formatPostedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function JobCard({ job, standing, stagger = 0, highlightSkills = [] }: JobCardProps) {
  const reduce = useReducedMotion();
  const entry = reveal(reduce, { y: 14 }, "std", { stagger });

  const meta = [STAGE_COPY[job.stage], WORK_MODE_COPY[job.workMode], job.location];

  return (
    <motion.article
      {...entry}
      className="flex flex-col rounded-[var(--r-card)] p-5 sm:p-[22px]"
      style={{
        background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 72%)",
        border: "1px solid var(--glass-line)",
        backdropFilter: "blur(var(--blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--blur)) saturate(160%)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{job.ref}</span>
        {/* Pay sits in the header, where a candidate looks first, rather than
            buried under the description. Withholding it costs them and nobody
            else. */}
        <span
          className="shrink-0 rounded-[var(--r-chip)] px-2.5 py-[3px] text-[11.5px] font-semibold"
          style={{
            color: "var(--iris-ink)",
            background: "var(--iris-ghost)",
            border: "1px solid var(--iris-line)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {SALARY_COPY[job.salaryBand]}
        </span>
      </div>

      {/* Explicit color: globals.css carries an UNLAYERED `h1-h4 { color: var(--ink) }`
          that outranks every Tailwind text utility regardless of specificity. */}
      <h3
        className="mt-2.5 text-[16.5px] font-semibold"
        style={{ color: "var(--ink)", lineHeight: 1.3, letterSpacing: "-0.01em" }}
      >
        {job.title}
      </h3>

      {/* A description of the employer, never a name. Identity is released at a
          consented intro, the mirror of how the directory releases a candidate's
          identity at shortlist. */}
      <p className="mt-1.5 text-[13px]" style={{ color: "var(--ink-2)" }}>
        {job.companyArchetype}
      </p>

      <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
        {meta.join(" · ")}
      </p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {job.skills.map((skill) => (
          <SkillPill
            key={skill}
            label={skill}
            size="sm"
            selected={highlightSkills.includes(skill)}
          />
        ))}
      </div>

      {/* ── what the interview covers ── */}
      <div className="mt-5" style={{ borderTop: "1px solid var(--glass-line)" }}>
        <p className="eyebrow mt-4">This role&rsquo;s interview asks about</p>

        <ul className="mt-3 flex list-none flex-col gap-2.5 p-0">
          {standing.map((topic) => {
            const copy = STANDING_COPY[topic.status];
            return (
              <li key={topic.traitKey} className="flex items-start gap-2.5">
                {/* Texture, not hue, carries the state — solid / hairline /
                    dashed — so the three remain distinguishable in greyscale.
                    Not an icon: it is a state marker with no meaning of its own,
                    and the sentence beside it carries all of it. */}
                <span
                  aria-hidden
                  className="mt-[6px] h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: copy.marker === "solid" ? copy.ink : "transparent",
                    border: `1px ${copy.marker === "dashed" ? "dashed" : "solid"} ${copy.ink}`,
                  }}
                />
                <span className="text-[12.5px] leading-snug">
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>{topic.traitLabel}</span>
                  <span style={{ color: "var(--ink-2)" }}> &mdash; {copy.note}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── action ──
          `mt-auto` pins this to the bottom so a row of cards of different
          heights still has its buttons on one line. */}
      <div className="mt-auto pt-5">
        <button
          type="button"
          className="w-full cursor-pointer rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-semibold"
          style={{
            background: "var(--iris)",
            color: "#FFFFFF",
            border: "1px solid var(--iris)",
            transitionProperty: "background-color, color, border-color",
            transitionDuration: `${DUR_MS.micro}ms`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          Start this role&rsquo;s interview
        </button>

        <p className="mt-2 text-[11.5px] leading-snug" style={{ color: "var(--ink-3)" }}>
          {`Posted ${formatPostedAt(job.postedAt)}. Fixture posting — the button does nothing yet, and no employer has posted on Placedon.`}
        </p>
      </div>
    </motion.article>
  );
}
