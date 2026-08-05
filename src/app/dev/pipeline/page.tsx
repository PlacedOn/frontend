/**
 * /dev/pipeline — the far side of the identity boundary.
 *
 * `robots: noindex, nofollow` for the same reason /dev/directory carries it,
 * only more so: this page renders NAMES beside trait figures. A search result
 * reading "Fixture Candidate Six · Debugs systematically 86" would be a
 * fabricated assessment of a named individual with a URL and a snippet, and no
 * amount of on-page "sample data" copy travels with it into an index.
 *
 * Not linked from any public navigation. Reachable from /dev/directory and by
 * typing it.
 */

import type { Metadata } from "next";
import { PipelineBoard } from "./PipelineBoard";
import { PIPELINE_FIXTURE_NOTICE } from "@/mocks/pipelineIdentities";

export const metadata: Metadata = {
  title: "Pipeline — Placedon (internal)",
  robots: { index: false, follow: false },
};

export default function PipelineDevPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-[clamp(20px,5vw,40px)] py-14 sm:py-20">
      <p className="eyebrow">Internal · pipeline</p>

      {/* Explicit color: globals.css carries an UNLAYERED `h1-h4 { color: var(--ink) }`
          that outranks every Tailwind text utility regardless of specificity. */}
      <h1
        className="mt-3 max-w-[18ch] text-[clamp(2rem,1.2rem+3.4vw,3.25rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Your pipeline
      </h1>

      <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        The records you shortlisted, with the names and contact details the directory withheld.
        Still no overall score, still no ranking, and still no photograph &mdash; committing to a
        conversation releases a way to reach someone, not a file on them.
      </p>

      {/* The boundary, stated on the surface that implements it. A reviewer
          landing here should be able to see that the name appearing now, and
          only now, is a decision with a reason rather than an inconsistency. */}
      <div
        className="mt-6 max-w-[68ch] rounded-[var(--r-btn)] px-4 py-3.5"
        style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
      >
        <p className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
          Identity is released here, and only here.
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          On the browse grid the human is the ranker, so anything on a card is a ranking input &mdash;
          which is why name and initials are withheld there. Shortlisting is the recruiter committing
          on the evidence, and after that commitment identity is no longer competing with the
          evidence for the decision. Photographs are refused at every stage including this one: a
          name is what you need to hold a conversation, and a face is job-relevant at no point. The
          release is enforced in code by{" "}
          {/* `overflowWrap: anywhere` is load-bearing: an unbroken identifier
              sets the min-content width of its container and pushes the whole
              document into horizontal scroll at 320px. */}
          <code
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.95em", overflowWrap: "anywhere" }}
          >
            releaseIdentity(id, shortlistedIds)
          </code>
          , which returns nothing for a candidate who is not on your list.
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
        <p className="text-[13px] font-semibold">{PIPELINE_FIXTURE_NOTICE}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Measured 2026-08-01: <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          interview sessions and <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          report card items exist. The names below are literally &ldquo;Fixture Candidate
          One&rdquo;&hellip;&ldquo;Nine&rdquo; and the addresses use the reserved{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.95em" }}>.invalid</code>{" "}
          domain, which can never resolve. Nobody here is a person. The shortlist lives in this
          browser tab only &mdash; there is no backend to store it in.
        </p>
      </div>

      <PipelineBoard />
    </main>
  );
}
