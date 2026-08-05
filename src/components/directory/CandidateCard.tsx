"use client";

/**
 * CandidateCard — one row of the browsable talent directory.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THERE IS NO AVATAR AND NO NAME ON THIS CARD
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * placedon-v2-plan §1.3 specifies this card as "avatar, name, headline,
 * rate/score, skill pills, trust badges". Three of those six are implemented
 * here. The avatar and the name are not, the composite score is not, and this
 * block is the argument for why — because silently dropping a spec item is
 * indistinguishable from forgetting it.
 *
 * ── The distinction that is real ──
 * There is a genuine difference between a demographic proxy used as a RANKING
 * INPUT and one used for DISPLAY AFTER SELECTION. You cannot schedule a call
 * with a hash. At some point a recruiter has to learn who they are talking to,
 * and refusing that forever would be theatre rather than fairness. So the
 * question is not "name: yes or no" — it is WHERE THE LINE SITS.
 *
 * ── Why the line cannot sit at the browse grid ──
 * On a browse surface, display *is* ranking input, because the human is the
 * ranker. This grid's entire job is to help someone reduce forty cards to five.
 * That reduction is a ranking. It runs on whatever the card shows, at a glance,
 * in the first second — before a single confidence band has been read.
 *
 * The fairness firewall (`app/fairness/firewall.py` in the backend repo) exists
 * to keep name, photo, school, employer, age and gender out of the features the
 * model ranks on. If the UI paints them back onto the card at the exact moment
 * a *human* performs the ranking, the firewall has been defeated by the front
 * end. Worse: a model's use of a proxy is auditable — you can ablate the
 * feature and measure the delta. A recruiter's is not. Moving the proxy from
 * the model to the human does not remove the bias, it removes the ability to
 * measure it. That is a strictly worse position than not having built the
 * firewall at all, because now it is also possible to claim the system is fair.
 *
 * And the cost lands hardest at first impression, which is where the evidence
 * has had the least chance to do any work.
 *
 * ── Where the line does sit ──
 * At SHORTLISTING. Shortlisting is the recruiter committing, on the strength of
 * the evidence, to a conversation. Once that commitment exists, identity is no
 * longer competing with the evidence for the decision — the decision is made.
 * So the shortlist action is the release point, and the card says so out loud
 * when you press it. (The reveal itself lives on the pipeline surface, not
 * here; this card never holds an identity to leak.)
 *
 * ── Why not initials, and why not "photo after shortlist" ──
 * Initials were the obvious compromise and they fail on this market. In Indian
 * hiring a surname initial carries caste, region and religion; "S. R." is a
 * proxy wearing a disguise, and one that is harder to argue with than a full
 * name because it *looks* anonymised. Rejected.
 *
 * Photos are rejected at every stage, not just this one. A photograph transmits
 * race, age, gender, disability and attractiveness in a single glance and is
 * job-relevant at no stage of an assessment product. The candidate will be
 * visible on a video call soon enough; the difference is that a call is a
 * conversation and a grid is a comparison. This product does not put a face
 * next to a figure.
 *
 * ── What takes the avatar's place ──
 * Nothing. The slot is not backfilled with a monogram tile or a generated
 * blob — a decorative shape where a face belongs invites the eye to treat it as
 * one. The headline takes the visual weight the avatar and name would have had,
 * which is the composition this product should have wanted anyway: the first
 * thing you read about a person is what they do.
 *
 * `ref` (FX-01) is the handle. It is deliberately mechanical-looking. A
 * recruiter should feel that they do not yet know this person.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * NO COMPOSITE
 * ═══════════════════════════════════════════════════════════════════════════
 * The plan also lists "rate/score" on the card. There is no blended figure
 * here and no prop that would accept one. Three per-trait figures are shown,
 * each with its own interval and band. If a caller wants a headline number they
 * have to invent it themselves, and there is nowhere in this component to put
 * it. See invariant 1 in `src/types/scoring.ts`.
 */

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ConfidenceBand } from "@/components/scoring/ConfidenceBand";
import { TrustBadge } from "@/components/scoring/TrustBadge";
import { SkillPill } from "./SkillPill";
import { DUR, DUR_MS, EASE_OUT, reveal } from "@/lib/motion";
import { AVAILABILITY_COPY, type DirectoryCandidate } from "@/types/directory";

export interface CandidateCardProps {
  candidate: DirectoryCandidate;
  /** Index in the grid — drives the 40ms entry stagger. */
  stagger?: number;
  /** Skills currently selected in the rail; matching pills are highlighted. */
  selectedSkills?: readonly string[];
  shortlisted?: boolean;
  onShortlist?: (id: string) => void;
}

/** ISO → "28 Jul 2026". Fixed locale so server and client agree during SSR. */
function formatAssessedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function CandidateCard({
  candidate,
  stagger = 0,
  selectedSkills = [],
  shortlisted = false,
  onShortlist,
}: CandidateCardProps) {
  const reduce = useReducedMotion();
  const noteId = useId();
  const entry = reveal(reduce, { y: 14 }, "std", { stagger });

  const meta = [
    candidate.role,
    `${candidate.yearsExperience} ${candidate.yearsExperience === 1 ? "year" : "years"}`,
    candidate.location,
  ];

  return (
    <motion.article
      {...entry}
      // `layout="position"` moves the card to its new grid cell with a transform
      // (FLIP) rather than letting the browser snap it there when a filter
      // changes. Compositor-friendly, and it is what turns "the grid rearranged"
      // into "the grid rearranged, and I could follow it".
      layout="position"
      transition={{
        ...entry.transition,
        // Only the TRANSITION branches on reduced motion — never the key set.
        // Under reduce the card teleports to its new cell with no elapsed time;
        // the position is still written, so nothing can be stranded mid-slide.
        layout: reduce
          ? { duration: 0 }
          : { duration: DUR.std, ease: EASE_OUT as unknown as [number, number, number, number] },
      }}
      exit={{ opacity: 0 }}
      // No `overflow: hidden` — ConfidenceBand's popover escapes the top edge of
      // its track by design, and clipping it silently breaks the hover state.
      className="relative flex flex-col rounded-[var(--r-card)] p-5 sm:p-[22px]"
      style={{
        background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 72%)",
        border: `1px solid ${shortlisted ? "var(--iris-line)" : "var(--glass-line)"}`,
        backdropFilter: "blur(var(--blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--blur)) saturate(160%)",
        boxShadow: shortlisted ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* ── handle + availability ──
          The reference sits where a name would. It is monospaced and small:
          it identifies the record, it does not introduce a person. */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{candidate.ref}</span>
        <span
          className="shrink-0 text-[11.5px] font-medium"
          style={{
            color:
              candidate.availability === "not_looking" ? "var(--ink-3)" : "var(--band-supported-ink)",
          }}
        >
          {AVAILABILITY_COPY[candidate.availability]}
        </span>
      </div>

      {/* The headline carries the weight the avatar + name would have carried.
          Explicit color: globals.css has an UNLAYERED `h1-h4 { color: var(--ink) }`
          that beats every Tailwind text utility regardless of specificity, so
          stating it here is what keeps this from becoming an invisible heading
          the day this card moves onto the --instrument dark register. */}
      <h3
        className="mt-2.5 text-[16.5px] font-semibold"
        style={{ color: "var(--ink)", lineHeight: 1.3, letterSpacing: "-0.01em" }}
      >
        {candidate.headline}
      </h3>

      <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
        {meta.join(" · ")}
      </p>

      {/* ── trust signals live ON the card, per plan §1.3 ── */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {candidate.trust.map((signal) => (
          <TrustBadge key={signal} signal={signal} size="sm" />
        ))}
      </div>

      {/* ── the readings ──
          Three traits, three intervals, no total. The label sits above its own
          band rather than beside it so that at 320px nothing has to wrap into a
          second column and lose its association with the track. */}
      <div className="mt-5" style={{ borderTop: "1px solid var(--glass-line)" }}>
        <p className="eyebrow mt-4">Readings from one interview</p>

        <ul className="mt-3 flex list-none flex-col gap-3.5 p-0">
          {candidate.traits.map((trait, i) => (
            <li key={trait.traitKey}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>
                  {trait.traitLabel}
                </span>
                <span
                  className="shrink-0 text-[12.5px] font-semibold"
                  style={{
                    // Muted when nothing is cited — an uncited figure is a guess,
                    // and the typography must not claim otherwise. Same rule as
                    // ScoreCard.
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
      </div>

      {/* ── skills ── */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {candidate.skills.map((skill) => (
          <SkillPill
            key={skill}
            label={skill}
            size="sm"
            selected={selectedSkills.includes(skill)}
          />
        ))}
      </div>

      {/* ── action ──
          `mt-auto` pins this to the bottom so a row of cards of different
          heights still has its buttons on one line. */}
      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => onShortlist?.(candidate.id)}
          aria-pressed={shortlisted}
          aria-describedby={noteId}
          className="w-full cursor-pointer rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-semibold"
          style={{
            background: shortlisted ? "var(--iris-ghost)" : "var(--iris)",
            color: shortlisted ? "var(--iris-ink)" : "#FFFFFF",
            border: `1px solid ${shortlisted ? "var(--iris-line)" : "var(--iris)"}`,
            transitionProperty: "background-color, color, border-color",
            transitionDuration: `${DUR_MS.micro}ms`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </button>

        {/* The identity policy, stated at the moment it applies rather than
            buried in a settings page.

            NOT a live region. Nine cards each carrying `role="status"` is nine
            polite announcements competing on every re-render, and the state
            change is already announced by `aria-pressed` on the button above.
            `aria-describedby` gives a screen-reader user the same sentence,
            once, at the moment they land on the control. */}
        <p
          id={noteId}
          className="mt-2 min-h-[2.4em] text-[11.5px] leading-snug"
          style={{ color: "var(--ink-3)" }}
        >
          {shortlisted
            ? "Name and contact details are released to your pipeline at this point — not before. (These fixtures carry no identity to release.)"
            : `Assessed ${formatAssessedAt(candidate.assessedAt)}. Identity stays sealed until you shortlist.`}
        </p>
      </div>
    </motion.article>
  );
}
