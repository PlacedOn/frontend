"use client";

/**
 * EvidenceQuote — a verbatim transcript moment with a clickable timestamp.
 *
 * This is the component that makes the product falsifiable. Every trait reading
 * has to point at something a human actually said, at a timestamp anyone can
 * jump to and check. A claim without one of these attached is an opinion the
 * system is not entitled to hold.
 *
 * The quote is rendered verbatim and is never paraphrased, summarised, or
 * LLM-rewritten on the way to the screen — a "cleaned up" quote is no longer
 * evidence, and a candidate contesting a reading has to be able to recognise
 * their own words.
 */

import { DUR_MS } from "@/lib/motion";

export interface EvidenceQuoteProps {
  /** Verbatim transcript text. */
  quote: string;
  /** Offset into the recording, in milliseconds. */
  startMs: number;
  /** Jump the player to this moment. Omit to render the chip as static text. */
  onSeek?: (startMs: number) => void;
}

/** ms → m:ss. Tabular figures keep a list of chips from shifting width. */
function formatTimestamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function EvidenceQuote({ quote, startMs, onSeek }: EvidenceQuoteProps) {
  const stamp = formatTimestamp(startMs);

  return (
    <figure className="m-0">
      <blockquote
        className="m-0 border-l-2 pl-3.5 text-[13.5px] leading-relaxed"
        style={{ borderColor: "var(--iris-line)", color: "var(--ink-2)" }}
      >
        {/* Typographic quotes around verbatim text, so it is unambiguous where
            the candidate's words start and stop. */}
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="mt-1.5 pl-3.5">
        {onSeek ? (
          <button
            type="button"
            onClick={() => onSeek(startMs)}
            className="cursor-pointer rounded-[var(--r-chip)] px-2.5 py-1 text-[11.5px] font-semibold transition-colors"
            style={{
              background: "var(--iris-ghost)",
              color: "var(--iris-ink)",
              fontVariantNumeric: "tabular-nums",
              transitionDuration: `${DUR_MS.micro}ms`,
            }}
            aria-label={`Play the interview from ${stamp}`}
          >
            {stamp} in the interview
          </button>
        ) : (
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}
          >
            {stamp} in the interview
          </span>
        )}
      </figcaption>
    </figure>
  );
}
