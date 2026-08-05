/**
 * /dev/scoring — the Phase 1 scoring component gallery.
 *
 * Lives under /dev, not /demo. `/demo` is the public book-a-demo page; a route
 * that renders invented assessment data must never sit where a prospect can
 * mistake it for the product. It is also `noindex, nofollow` for the same
 * reason: a search result reading "Handles ambiguity 74" would be a fabricated
 * assessment with a URL.
 */

import type { Metadata } from "next";
import { ScoringGallery } from "./ScoringGallery";
import { FIXTURE_NOTICE } from "@/mocks/traitScores";

export const metadata: Metadata = {
  title: "Scoring components — Placedon (internal)",
  robots: { index: false, follow: false },
};

export default function ScoringDevPage() {
  return (
    <main className="shell py-20 sm:py-24">
      <p className="eyebrow">Internal · component gallery</p>

      {/* Explicit color. globals.css carries an unlayered `h1-h4 { color: var(--ink) }`
          that outranks every Tailwind text utility regardless of specificity —
          stating the colour here is the habit that stops this from becoming an
          invisible heading the day the surface goes dark. */}
      <h1
        className="mt-3 max-w-[16ch] text-[clamp(2rem,1.2rem+3.4vw,3.25rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Scoring components
      </h1>

      <p className="mt-5 max-w-[64ch] text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Every figure below describes one trait. There is no overall candidate score on this page,
        in these components, or in the type that feeds them &mdash; a single number ranking a
        person is the thing this product exists to not do.
      </p>

      {/* The fixture notice is a required, always-visible part of any surface
          rendering src/mocks. Placed above the components, not in a footnote. */}
      <div
        role="note"
        className="mt-7 rounded-[var(--r-btn)] px-4 py-3.5"
        style={{
          background: "var(--band-emerging-fill)",
          border: "1px dashed color-mix(in srgb, var(--band-emerging-ink) 42%, transparent)",
          color: "var(--band-emerging-ink)",
        }}
      >
        <p className="text-[13px] font-semibold">{FIXTURE_NOTICE}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Measured 2026-08-01: <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          interview sessions and <span style={{ fontVariantNumeric: "tabular-nums" }}>0</span>{" "}
          report card items exist. Nothing here came from a real interview or a real person, and no
          person is named.
        </p>
      </div>

      <ScoringGallery />
    </main>
  );
}
