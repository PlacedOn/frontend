"use client";

/**
 * PipelineRecord — one shortlisted candidate, WITH their identity.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THIS IS THE ONLY COMPONENT IN THE APP THAT RENDERS A CANDIDATE'S NAME
 * ═══════════════════════════════════════════════════════════════════════════
 * The argument for withholding it on the browse grid is written out in full at
 * the top of `src/components/directory/CandidateCard.tsx`. The short version:
 * on a browse surface the human is the ranker, so anything displayed is a
 * ranking input, and painting a name onto a card at the moment of first
 * impression defeats the fairness firewall with the front end.
 *
 * The line sits at SHORTLISTING, and this is the far side of it. Shortlisting
 * is the recruiter committing, on the evidence, to a conversation. Once that
 * commitment exists, identity is no longer competing with the evidence for the
 * decision, because the decision is made. You cannot schedule a call with a
 * hash, and refusing forever would be theatre rather than fairness.
 *
 * Two properties keep that boundary real rather than stated:
 *   1. The identity arrives via `releaseIdentity(id, shortlistedIds)`, which
 *      returns `null` for anyone not on the list. There is no exported map to
 *      import directly, so there is no shortcut around the check.
 *   2. `DirectoryCandidate` still has no name field. This component takes the
 *      identity as a SEPARATE prop, so nothing that renders a candidate object
 *      can print one by accident.
 *
 * ── Still no photograph. Not here either. ──
 * `PROTECTED_AND_PROXY` in `app/fairness/firewall.py` bans `photo` with no
 * post-shortlist exception, and this is exactly where someone would argue for
 * one ("we already know who they are"). A name is the minimum needed to hold a
 * conversation. A face transmits race, age, gender, disability and
 * attractiveness in one glance and is job-relevant at no stage. The candidate
 * will be visible on a video call soon enough — the difference is that a call
 * is a conversation and a list is a comparison. `ReleasedIdentity` has no image
 * field, so there is nothing to render even if someone wanted to.
 *
 * ── And still no composite ──
 * Same per-trait figures as the card, same intervals, same qualitative bands.
 * Committing to a conversation does not license a blended number; if anything
 * it makes one less necessary, since the next step is talking to the person.
 */

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ConfidenceBand } from "@/components/scoring/ConfidenceBand";
import { TrustBadge } from "@/components/scoring/TrustBadge";
import { SkillPill } from "@/components/directory/SkillPill";
import { DUR_MS, reveal } from "@/lib/motion";
import { AVAILABILITY_COPY, type DirectoryCandidate } from "@/types/directory";
import type { ReleasedIdentity } from "@/mocks/pipelineIdentities";

export interface PipelineRecordProps {
  candidate: DirectoryCandidate;
  /**
   * The released identity. `null` is a real, renderable state — a record whose
   * identity could not be resolved shows the reference alone rather than
   * disappearing, because a silently missing row is worse than a visibly
   * incomplete one.
   */
  identity: ReleasedIdentity | null;
  stagger?: number;
  onRemove: (id: string) => void;
}

function formatAssessedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function PipelineRecord({
  candidate,
  identity,
  stagger = 0,
  onRemove,
}: PipelineRecordProps) {
  const reduce = useReducedMotion();
  const headingId = useId();
  // `reveal()` branches only the TRANSITION on reduce, never the key set —
  // branching keys strands the SSR-serialised transform forever. See the
  // reasoning block in src/lib/motion.ts.
  const entry = reveal(reduce, { y: 12 }, "std", { stagger });

  return (
    <motion.article
      {...entry}
      layout="position"
      exit={{ opacity: 0 }}
      aria-labelledby={headingId}
      className="rounded-[var(--r-card)] p-5 sm:p-7"
      style={{
        background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 72%)",
        border: "1px solid var(--iris-line)",
        backdropFilter: "blur(var(--blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--blur)) saturate(160%)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Two columns on desktop: who they are, and what stands behind that.
          `minmax(0,…)` on both tracks so a long headline cannot blow the grid
          out and start the page scrolling sideways at 320px. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-9">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="eyebrow">{candidate.ref}</span>
            <span
              className="shrink-0 text-[11.5px] font-medium"
              style={{
                color:
                  candidate.availability === "not_looking"
                    ? "var(--ink-3)"
                    : "var(--band-supported-ink)",
              }}
            >
              {AVAILABILITY_COPY[candidate.availability]}
            </span>
          </div>

          {/* The name. Explicit color: globals.css carries an UNLAYERED
              `h1-h4 { color: var(--ink) }` that beats every Tailwind text
              utility regardless of specificity.

              No avatar, no monogram tile, no generated blob in the slot beside
              it. A decorative shape where a face belongs invites the eye to
              treat it as one. */}
          <h3
            id={headingId}
            className="mt-2 text-[19px] font-semibold"
            style={{ color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-0.015em" }}
          >
            {identity ? identity.name : candidate.ref}
          </h3>

          {identity ? (
            <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--ink-2)" }}>
              {/* Not a mailto link. `.invalid` addresses cannot resolve, and a
                  link that opens a mail client addressed to a fixture is a
                  small lie the surface does not need to tell. */}
              <span style={{ fontFamily: "var(--font-mono)", overflowWrap: "anywhere" }}>
                {identity.contactEmail}
              </span>
              {identity.pronouns && (
                <span style={{ color: "var(--ink-3)" }}> · {identity.pronouns}</span>
              )}
            </p>
          ) : (
            <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
              No identity on file for this reference.
            </p>
          )}

          <p
            className="mt-3.5 text-[13.5px] font-medium"
            style={{ color: "var(--ink)", lineHeight: 1.4 }}
          >
            {candidate.headline}
          </p>

          <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
            {[
              candidate.role,
              `${candidate.yearsExperience} ${candidate.yearsExperience === 1 ? "year" : "years"}`,
              candidate.location,
            ].join(" · ")}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {candidate.trust.map((signal) => (
              <TrustBadge key={signal} signal={signal} size="sm" />
            ))}
          </div>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <SkillPill key={skill} label={skill} size="sm" />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onRemove(candidate.id)}
            className="mt-5 w-full cursor-pointer rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-semibold sm:w-auto"
            style={{
              background: "var(--white)",
              color: "var(--ink-2)",
              border: "1px solid var(--glass-line-hi)",
              transitionProperty: "background-color, color, border-color",
              transitionDuration: `${DUR_MS.micro}ms`,
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            Remove from shortlist
          </button>

          {/* Stated where the consequence is, not in a settings page. */}
          <p className="mt-2 text-[11.5px] leading-snug" style={{ color: "var(--ink-3)" }}>
            Removing puts this record back behind its reference. The grid never showed a name.
          </p>
        </div>

        <div className="min-w-0">
          <p className="eyebrow">Readings from one interview</p>
          <ul className="mt-3 flex list-none flex-col gap-4 p-0">
            {candidate.traits.map((trait, i) => (
              <li key={trait.traitKey}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>
                    {trait.traitLabel}
                  </span>
                  <span
                    className="shrink-0 text-[12.5px] font-semibold"
                    style={{
                      // Muted when nothing is cited — an uncited figure is a
                      // guess and must not be typeset like a finding.
                      color: trait.evidenceCount > 0 ? "var(--ink)" : "var(--ink-3)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {trait.point}
                    <span className="ml-1 font-normal" style={{ color: "var(--ink-3)" }}>
                      /100
                    </span>
                  </span>
                </div>

                <ConfidenceBand
                  point={trait.point}
                  bandLow={trait.bandLow}
                  bandHigh={trait.bandHigh}
                  confidence={trait.confidence}
                  label={trait.traitLabel}
                  stagger={stagger + i}
                />

                <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                  {trait.evidenceCount > 0
                    ? `${trait.evidenceCount} cited ${trait.evidenceCount === 1 ? "moment" : "moments"}`
                    : "Nothing cited — this is a gap in our evidence"}
                </p>
              </li>
            ))}
          </ul>

          <p
            className="mt-4 pt-3.5 text-[11.5px]"
            style={{ color: "var(--ink-3)", borderTop: "1px solid var(--glass-line)" }}
          >
            Assessed {formatAssessedAt(candidate.assessedAt)}. Three readings from one interview are
            not a full assessment, and nothing here blends them into a single figure.
          </p>
        </div>
      </div>
    </motion.article>
  );
}
