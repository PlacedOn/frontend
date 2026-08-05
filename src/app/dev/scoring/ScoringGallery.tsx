"use client";

/**
 * The interactive half of the scoring gallery. Client-side only because the
 * timestamp chips need a handler to prove they are chips and not decoration.
 *
 * The seek handler does NOT pretend to seek. There is no recording behind these
 * fixtures, so clicking a chip states plainly what it would have done. A demo
 * that mimes a working player teaches the reviewer the wrong thing about how
 * finished this is.
 */

import { useState } from "react";
import { ScoreCard } from "@/components/scoring/ScoreCard";
import { TrustBadge } from "@/components/scoring/TrustBadge";
import { EvidenceQuote } from "@/components/scoring/EvidenceQuote";
import { ConfidenceBand } from "@/components/scoring/ConfidenceBand";
import { FIXTURE_TRAIT_SCORES } from "@/mocks/traitScores";
import type { TrustSignal } from "@/types/scoring";

const SIGNALS: readonly TrustSignal[] = ["verified", "interview_complete", "contested"];

function formatStamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function ScoringGallery() {
  const [seekNote, setSeekNote] = useState<string | null>(null);

  const handleSeek = (startMs: number) =>
    setSeekNote(
      `Would jump the player to ${formatStamp(startMs)}. These fixtures have no recording behind them.`,
    );

  return (
    <>
      {/* ── ScoreCard, all three confidence states ── */}
      <section className="mt-12" aria-labelledby="cards-heading">
        <h2
          id="cards-heading"
          className="text-[20px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          ScoreCard
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          One card per trait. There is no card that combines them, and no figure anywhere on this
          page that ranks a person. Expand any card to reach the quotes underneath it.
        </p>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FIXTURE_TRAIT_SCORES.map((trait, i) => (
            <ScoreCard key={trait.id} trait={trait} stagger={i} onSeek={handleSeek} />
          ))}
        </div>

        {/* aria-live so a keyboard user hears the result of pressing a chip. */}
        <p
          aria-live="polite"
          className="mt-4 min-h-[1.25rem] text-[12.5px]"
          style={{ color: "var(--ink-3)" }}
        >
          {seekNote}
        </p>
      </section>

      {/* ── ConfidenceBand in isolation ── */}
      <section className="mt-16" aria-labelledby="bands-heading">
        <h2
          id="bands-heading"
          className="text-[20px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          ConfidenceBand
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Interval width and fill opacity both encode confidence, so the three read apart in
          greyscale. Hover or tab onto a track for the exact range. Print this page to check.
        </p>

        <div
          className="mt-6 flex flex-col gap-9 rounded-[var(--r-card)] p-5 sm:p-7"
          style={{
            background: "var(--porcelain-2)",
            border: "1px solid var(--glass-line)",
          }}
        >
          {FIXTURE_TRAIT_SCORES.map((trait, i) => (
            <div key={trait.id}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
                  {trait.traitLabel}
                </span>
                <span
                  className="text-[12px]"
                  style={{ color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}
                >
                  {trait.point}
                </span>
              </div>
              <ConfidenceBand
                point={trait.point}
                bandLow={trait.bandLow}
                bandHigh={trait.bandHigh}
                confidence={trait.confidence}
                label={trait.traitLabel}
                stagger={i}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── TrustBadge ── */}
      <section className="mt-16" aria-labelledby="badges-heading">
        <h2
          id="badges-heading"
          className="text-[20px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          TrustBadge
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Status of the record, not a verdict on a person. Each variant carries its own border
          treatment — solid, solid hairline, dashed — so hue is never the only difference. Hover
          for the plain-language meaning.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {SIGNALS.map((signal) => (
            <TrustBadge key={signal} signal={signal} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {SIGNALS.map((signal) => (
            <TrustBadge key={signal} signal={signal} size="sm" />
          ))}
        </div>
      </section>

      {/* ── EvidenceQuote ── */}
      <section className="mt-16 mb-24" aria-labelledby="quote-heading">
        <h2
          id="quote-heading"
          className="text-[20px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          EvidenceQuote
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Verbatim, never paraphrased. The chip is a real control when a recording exists and plain
          text when it does not — shown both ways below.
        </p>

        <div
          className="mt-6 grid grid-cols-1 gap-7 rounded-[var(--r-card)] p-5 sm:p-7 md:grid-cols-2"
          style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}
        >
          <div>
            <p className="eyebrow mb-3">Seekable</p>
            <EvidenceQuote
              quote={FIXTURE_TRAIT_SCORES[0].evidence[0].quote}
              startMs={FIXTURE_TRAIT_SCORES[0].evidence[0].startMs}
              onSeek={handleSeek}
            />
          </div>
          <div>
            <p className="eyebrow mb-3">No recording available</p>
            <EvidenceQuote
              quote={FIXTURE_TRAIT_SCORES[1].evidence[0].quote}
              startMs={FIXTURE_TRAIT_SCORES[1].evidence[0].startMs}
            />
          </div>
        </div>
      </section>
    </>
  );
}
