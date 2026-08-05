/**
 * /dev/directory — the Phase 2 HR talent directory.
 *
 * Lives under /dev for the same reason /dev/scoring does: it renders fabricated
 * assessments of fabricated people. `robots: noindex, nofollow` because a
 * search result reading "FX-06 · Debugs systematically 86" would be a
 * fabricated assessment with a URL and a snippet, and no amount of on-page
 * "sample data" copy travels with it into a search engine.
 *
 * This route is also not linked from any public navigation. It is reachable
 * only by typing it.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { DirectoryBrowser } from "./DirectoryBrowser";
import { DIRECTORY_FIXTURE_NOTICE } from "@/mocks/directoryCandidates";

export const metadata: Metadata = {
  title: "Talent directory — Placedon (internal)",
  robots: { index: false, follow: false },
};

export default function DirectoryDevPage() {
  return (
    <main
      // A wider container than the marketing `--max` (1180px). A browse grid
      // with a persistent rail needs the room: at 1180 the three-column layout
      // leaves ~285px per card, which is narrower than the cards can carry.
      className="mx-auto w-full max-w-[1440px] px-[clamp(20px,5vw,40px)] py-14 sm:py-20"
    >
      <p className="eyebrow">Internal · talent directory</p>

      {/* Explicit color: globals.css carries an UNLAYERED `h1-h4 { color: var(--ink) }`
          that outranks every Tailwind text utility regardless of specificity. */}
      <h1
        className="mt-3 max-w-[18ch] text-[clamp(2rem,1.2rem+3.4vw,3.25rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Talent directory
      </h1>

      <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        A browsable grid of assessed candidates with a persistent filter rail. Every card carries
        per-trait figures with their evidence bands and the trust status of the record. There is no
        overall candidate score anywhere on this page, and no sort control &mdash; filters describe a
        job, ranking describes a person. Filters live in the query string, so the address bar always
        holds a link that reproduces exactly what you are looking at.
      </p>

      {/* The identity policy is stated on the page, not only in code comments.
          A reviewer opening this surface should be able to see that the missing
          avatar is a decision rather than an unfinished feature. */}
      <div
        className="mt-6 max-w-[68ch] rounded-[var(--r-btn)] px-4 py-3.5"
        style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
      >
        <p className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
          No names and no photographs on this surface.
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          On a browse grid the human is the ranker, so anything on a card is a ranking input. Name,
          photo and initials are the exact channels the fairness firewall exists to close, and
          putting them back at the moment of first impression would defeat it with the front end.
          Identity is released when you shortlist &mdash; the point at which the decision has already
          been made on the evidence. The reasoning is written out in full at the top of{" "}
          {/* `overflowWrap: anywhere` is load-bearing, not tidiness: a file path
              is one unbreakable token, and at 320px an unbreakable token sets
              the min-content width of its container and pushes the whole
              document into horizontal scroll. Measured at 21px of overflow
              before this was added. */}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.95em",
              overflowWrap: "anywhere",
            }}
          >
            src/components/directory/CandidateCard.tsx
          </code>
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
        <p className="text-[13px] font-semibold">{DIRECTORY_FIXTURE_NOTICE}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Measured 2026-08-01: <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          interview sessions and <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          report card items exist. Every record below is invented, handled by a fixture reference
          (FX-01…FX-09), and describes no real person.
        </p>
      </div>

      {/* `DirectoryBrowser` reads `useSearchParams()`, which forces the client
          tree beneath it to be client-rendered. Without this boundary the
          production build fails outright ("Missing Suspense boundary with
          useSearchParams") — it is a build requirement, not a nicety.

          The fallback is a plain reserved block rather than a shimmer: the real
          content arrives on hydration, and an animated skeleton for something
          measured in milliseconds is decoration pretending to be feedback. It
          holds height so the page does not shift when the grid lands. */}
      <Suspense
        fallback={
          <div
            className="mt-10 rounded-[var(--r-card)]"
            style={{ minHeight: 420, border: "1px dashed var(--glass-line)" }}
          />
        }
      >
        <DirectoryBrowser />
      </Suspense>
    </main>
  );
}
