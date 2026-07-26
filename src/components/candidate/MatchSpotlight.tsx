"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import type { RoleMatch } from "@/lib/types";
import { getCandidateMatches } from "@/lib/mock/matches";
import { MatchVisual } from "./MatchVisual";

const CONF_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

/**
 * Opens the matches page with the candidate's strongest match, shown as the 3D
 * fit visualization beside the evidence and the gaps that would lift it further.
 * Illustrative sample data (the live surface renders its own recommendations).
 */
export function MatchSpotlight() {
  const [match, setMatch] = useState<RoleMatch | null>(null);

  useEffect(() => {
    let active = true;
    getCandidateMatches().then((m) => active && setMatch(m[0] ?? null));
    return () => {
      active = false;
    };
  }, []);

  if (!match) {
    return <div className="glass mb-8 h-64 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} aria-busy="true" />;
  }

  const strongest = [...match.evidence].sort(
    (a, b) => (CONF_RANK[b.confidence] ?? 0) - (CONF_RANK[a.confidence] ?? 0),
  )[0];

  return (
    <section aria-labelledby="spotlight-heading" className="glass mb-8 rounded-[var(--r-card)] p-6 sm:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        {/* evidence side */}
        <div>
          <p className="eyebrow">Your strongest match</p>
          <h2 id="spotlight-heading" className="mt-2 text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold tracking-[-0.02em] text-[var(--ink)]">
            {match.title}
          </h2>
          <p className="mt-1 text-[13.5px] font-semibold text-[var(--ink-3)]">
            {match.company} · {match.location}
          </p>

          <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{match.match_summary}</p>

          {strongest && (
            <figure className="mt-4 border-l-2 pl-3.5" style={{ borderColor: "var(--iris-line)" }}>
              <blockquote className="text-[13.5px] italic leading-relaxed text-[var(--ink-2)]">
                <Quote size={13} className="mr-1 inline -translate-y-0.5 text-[var(--ink-3)]" aria-hidden />
                {strongest.quote}
              </blockquote>
              <figcaption className="mt-1.5 text-[12px] font-semibold text-[var(--ink)]">
                — evidence of {strongest.trait}
              </figcaption>
            </figure>
          )}

          {match.missing_signals.length > 0 && (
            <div className="mt-5">
              <p className="text-[12px] font-semibold text-[var(--ink-3)]">Close these to lift your fit</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.missing_signals.map((s) => (
                  <span key={s} className="rounded-full px-2.5 py-1 text-[11.5px] font-medium text-[var(--ink-2)]" style={{ background: "var(--mist)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* the 3D fit visualization */}
        <div className="lg:pl-2">
          <MatchVisual match={match} />
        </div>
      </div>
    </section>
  );
}
