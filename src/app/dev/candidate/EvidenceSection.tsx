"use client";

/**
 * The candidate's own view of their evidence.
 *
 * ══ THE SAME PRINCIPLE AS THE DIRECTORY FILTER, FROM THE OTHER SIDE ══
 * The directory keeps candidates with no reading on a filtered trait IN the
 * results, because a missing reading is a hole in our interview coverage rather
 * than a low figure. This screen is where the person that rule protects finds
 * out the hole exists. So the plan is rendered whole — reached topics and
 * unreached ones in PLAN ORDER, interleaved, the same size, the same grid.
 *
 * Sorting the gaps to the bottom was the obvious layout and is the wrong one: it
 * turns them into a remedial appendix, when the honest reading is that they are
 * equal members of a plan we did not finish. The `CoverageStrip` above runs in
 * the same order, so segment N is card N.
 *
 * ══ NO COMPOSITE, ANYWHERE ON THIS SCREEN ══
 * No overall figure, no percentile, no letter grade, no rank against other
 * candidates, no "readiness". The only quantity shown is how many topics the
 * interview reached, which is a property of the interview. Trait figures appear
 * one at a time inside `ScoreCard`, which refuses by construction to accept more
 * than one trait.
 *
 * ══ THE EMPTY-STATE PREVIEW ══
 * Measured 2026-08-01: `interview_sessions = 0`. The true state of every real
 * account is the empty one, and the fixture below is the only reason this page
 * has anything on it. The toggle exists so a reviewer can see the state an
 * actual candidate would land on without having to imagine it — and so that
 * state is exercised by anyone who opens this page rather than rotting unseen.
 */

import { useState } from "react";
import { ScoreCard } from "@/components/scoring/ScoreCard";
import { TrustBadge } from "@/components/scoring/TrustBadge";
import { EmptyState } from "@/components/directory/EmptyState";
import { CoverageStrip } from "@/components/candidate/evidence/CoverageStrip";
import { UncoveredTopicCard } from "@/components/candidate/evidence/UncoveredTopicCard";
import { buildCoverage, summariseCoverage } from "@/lib/candidate/coverage";
import { DUR_MS } from "@/lib/motion";
import {
  FIXTURE_CANDIDATE_READINGS,
  FIXTURE_INTERVIEW_PLAN,
} from "@/mocks/candidateInterview";

const COVERAGE = buildCoverage(FIXTURE_INTERVIEW_PLAN, FIXTURE_CANDIDATE_READINGS);
const SUMMARY = summariseCoverage(COVERAGE);

export function EvidenceSection() {
  const [previewEmpty, setPreviewEmpty] = useState(false);

  return (
    <section aria-labelledby="evidence-heading" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow">Your evidence</p>
          <h2
            id="evidence-heading"
            className="mt-2.5 max-w-[22ch] text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            What the interview actually covered
          </h2>
        </div>

        {!previewEmpty && (
          <div className="flex flex-wrap items-center gap-1.5">
            <TrustBadge signal="interview_complete" size="sm" />
            <TrustBadge signal="verified" size="sm" />
          </div>
        )}
      </div>

      <p
        className="mt-4 max-w-[70ch] text-[14.5px] leading-relaxed"
        style={{ color: "var(--ink-2)" }}
      >
        Every figure below describes one topic and points at the moments it came from. There is no
        overall score here, no percentile, and no ranking against anyone else &mdash; a single number
        summarising a person is the thing this product exists to not produce. What you can see is how
        much of the interview plan we got through.
      </p>

      {/* The preview toggle is a real control, not a dev flag hidden behind a
          query param: the state it reveals is the state every real account is
          in, and it should cost one click to check. */}
      <button
        type="button"
        onClick={() => setPreviewEmpty((v) => !v)}
        aria-pressed={previewEmpty}
        className="mt-5 cursor-pointer rounded-[var(--r-chip)] px-3.5 py-2 text-[12.5px] font-semibold"
        style={{
          background: previewEmpty ? "var(--iris-ghost)" : "var(--white)",
          color: previewEmpty ? "var(--iris-ink)" : "var(--ink-2)",
          border: `1px solid ${previewEmpty ? "var(--iris-line)" : "var(--glass-line)"}`,
          transitionProperty: "background-color, color, border-color",
          transitionDuration: `${DUR_MS.micro}ms`,
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {previewEmpty
          ? "Showing the real state — switch back to the fixture"
          : "Show the state before a first interview"}
      </button>

      {previewEmpty ? (
        <div className="mt-6">
          {/* No filters exist on this surface, so the removal callbacks are
              unreachable — `EmptyState` only invokes them from chips, and there
              are none. They are required props because the directory needs
              them, not because this branch can fire them. */}
          <EmptyState
            filters={[]}
            onRemove={() => {}}
            onClearAll={() => {}}
            totalCount={0}
            emptyTitle="You have not been interviewed yet, so there is nothing here."
            emptyBody={
              <>
                <p>
                  This is not an empty dashboard waiting to fill in with activity. Until an
                  interview runs, there is no evidence about you in this system and nothing for an
                  employer to read &mdash; which is also what an employer sees.
                </p>
                <p className="mt-3">
                  Measured 2026-08-01 against the production database:{" "}
                  <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>0</span>{" "}
                  interview sessions and{" "}
                  <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>0</span>{" "}
                  report card items exist. Every account is in this state right now.
                </p>
              </>
            }
          />
        </div>
      ) : (
        <>
          <div
            className="mt-7 rounded-[var(--r-card)] p-5 sm:p-6"
            style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}
          >
            <h3 className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
              Interview coverage
            </h3>
            <p
              className="mt-1.5 max-w-[72ch] text-[12.5px] leading-relaxed"
              style={{ color: "var(--ink-2)" }}
            >
              {`The plan had ${SUMMARY.planned} topics and the session reached ${
                SUMMARY.planned - SUMMARY.notReached
              }. This measures the interview, not you: the ${SUMMARY.notReached} it never got to are our gaps, and they count against nothing.`}
            </p>

            <div className="mt-4">
              <CoverageStrip coverage={COVERAGE} summary={SUMMARY} />
            </div>
          </div>

          {/* Plan order, gaps interleaved. `items-start` so a short gap card
              does not stretch to match a tall ScoreCard beside it. */}
          <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {COVERAGE.map((entry, i) =>
              entry.reading ? (
                <ScoreCard key={entry.topic.traitKey} trait={entry.reading} stagger={i} />
              ) : (
                <UncoveredTopicCard key={entry.topic.traitKey} topic={entry.topic} stagger={i} />
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}
