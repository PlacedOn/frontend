/**
 * /dev/candidate — the Phase 4 candidate dashboard.
 *
 * Lives under /dev for the same reason /dev/scoring and /dev/directory do: it
 * renders fabricated assessment data. `robots: noindex, nofollow` because a
 * search result reading "Handles ambiguity 74 · your evidence" would be a
 * fabricated assessment with a URL and a snippet, and no amount of on-page
 * "sample data" copy travels with it into a search engine.
 *
 * Not linked from any navigation. Reachable only by typing it.
 *
 * ══ WHAT THIS SURFACE IS FOR ══
 * The directory and the pipeline are what an employer sees. This is the same
 * evidence from the side of the person it is about, and the two have to agree —
 * a candidate who reads their own record here and then hears something different
 * in a rejection has been told two stories by one system.
 *
 * The load-bearing symmetry is the uncovered trait. The directory KEEPS a
 * candidate with no reading on a filtered trait, and marks the gap as ours. This
 * page is where that same person finds out the gap exists, in the same words.
 */

import type { Metadata } from "next";
import { EvidenceSection } from "./EvidenceSection";
import { JobBrowser } from "./JobBrowser";
import { CANDIDATE_FIXTURE_NOTICE } from "@/mocks/candidateInterview";
import { JOBS_FIXTURE_NOTICE } from "@/mocks/candidateJobs";

export const metadata: Metadata = {
  title: "Candidate dashboard — Placedon (internal)",
  robots: { index: false, follow: false },
};

export default function CandidateDevPage() {
  return (
    <main
      // Wider than the marketing `--max` (1180px) for the same reason the
      // directory is: a browse grid beside a persistent rail needs the room.
      className="mx-auto w-full max-w-[1440px] px-[clamp(20px,5vw,40px)] py-14 sm:py-20"
    >
      <p className="eyebrow">Internal · candidate dashboard</p>

      {/* Explicit color: globals.css carries an UNLAYERED `h1-h4 { color: var(--ink) }`
          that outranks every Tailwind text utility regardless of specificity. */}
      <h1
        className="mt-3 max-w-[18ch] text-[clamp(2rem,1.2rem+3.4vw,3.25rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Your evidence, and what it opens
      </h1>

      <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        The same readings an employer sees, shown to the person they are about, plus the roles those
        readings are relevant to. Nothing on this page blends your traits into one figure, ranks you
        against another candidate, or tells you where you place in a distribution.
      </p>

      <div
        className="mt-6 max-w-[68ch] rounded-[var(--r-btn)] px-4 py-3.5"
        style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
      >
        <p className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
          No overall score, and no readiness percentage.
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          A composite would be the one number you would check, an employer would sort by, and
          neither of you could trace to anything. What is measured instead is COVERAGE &mdash; how
          much of the interview plan has evidence behind it. That is a fact about our interview and
          it is legitimate to show; a summary of you is not, and there is no field for one anywhere
          in the types this page reads from.
        </p>
      </div>

      {/* Required, always-visible marker for any surface rendering src/mocks. */}
      <div
        role="note"
        className="mt-4 max-w-[68ch] rounded-[var(--r-btn)] px-4 py-3.5"
        style={{
          background: "var(--band-emerging-fill)",
          border: "1px dashed color-mix(in srgb, var(--band-emerging-ink) 42%, transparent)",
          color: "var(--band-emerging-ink)",
        }}
      >
        <p className="text-[13px] font-semibold">{CANDIDATE_FIXTURE_NOTICE}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {JOBS_FIXTURE_NOTICE}
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Measured 2026-08-01 against the production database:{" "}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span> interview sessions and{" "}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span> report card items exist. No
          real person has been assessed, and nobody is named here. The evidence section has a
          control that shows the state a real account is actually in.
        </p>
      </div>

      <EvidenceSection />
      <JobBrowser />
    </main>
  );
}
