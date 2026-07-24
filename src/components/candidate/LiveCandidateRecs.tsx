"use client";

/**
 * Live candidate → company recommendations from GET /v1/candidate/recommendations.
 * Mutual-fit tiers (readiness = coverage of the role's public must-haves, NOT
 * odds of selection) + honest Reality-Card/growth reasons + the gap to close.
 * The employer's identity is never shown here — only the role and a "Verified
 * company" flag; identity is revealed only through a consented intro.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { v1, V1Error, type CandidateOpeningRec, type MutualFitTier } from "@/lib/v1";
import { FitCheckCard } from "@/components/fit/FitCheckCard";

const TIER: Record<MutualFitTier, { label: string; bg: string; fg: string }> = {
  strong_fit: { label: "Strong fit", bg: "rgba(5,150,105,0.12)", fg: "#047857" },
  worth_a_look: { label: "Worth a look", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  stretch: { label: "Stretch", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
};

export function LiveCandidateRecs() {
  const [recs, setRecs] = useState<CandidateOpeningRec[] | null>(null);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);

  useEffect(() => {
    let active = true;
    v1.candidateRecommendations()
      .then((rows) => active && setRecs(rows))
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof V1Error) setError({ message: e.message, status: e.status });
        else setError({ message: "Could not load your recommendations.", status: 0 });
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">
          {error.status === 401 ? "Sign in to see your recommendations." : "Could not load your recommendations."}
        </p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">{error.message}</p>
      </div>
    );
  }

  if (recs === null) {
    return (
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="glass h-56 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        ))}
      </ul>
    );
  }

  if (recs.length === 0) {
    return (
      <div className="glass rounded-[var(--r-card)] p-10 text-center">
        <IconTile icon={Sparkles} tone="iris" size="lg" className="mx-auto mb-4" />
        <h2 className="text-[1.3rem]">No open roles to match yet.</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Finish your interview and approve your evidence — then live roles are ranked by how much of each one your evidence covers.
        </p>
        <Link href="/pre-interview" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
          Take your interview <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
        Ranked by how much of each role your evidence covers — readiness, not a chance of selection. You can see who&rsquo;s hiring;
        <em> your</em> identity stays private until you both consent to an intro.
      </p>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recs.map((rec) => {
          const t = TIER[rec.tier];
          return (
            <li key={rec.job_id} className="glass relative flex h-full flex-col overflow-hidden rounded-[var(--r-card)] p-5 transition-transform duration-[var(--d-std)] hover:-translate-y-1">
              {/* tier accent */}
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${t.fg}, transparent)` }} />

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold text-[var(--ink-2)]">
                      {rec.company_name ?? "Confidential company"}
                    </span>
                    {rec.company_verified && (
                      <ShieldCheck size={13} className="shrink-0 text-[var(--iris-ink)]" aria-label="Verified company" />
                    )}
                  </div>
                  <h3 className="mt-0.5 text-[16px] font-bold leading-tight text-[var(--ink)]">{rec.title}</h3>
                  {rec.level && <span className="mt-1 block text-[12.5px] text-[var(--ink-3)]">{rec.level}</span>}
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: t.bg, color: t.fg }}>
                  {t.label}
                </span>
              </div>

              {/* Fit Check — role-evidence coverage %, with the strict contract */}
              <div className="mt-4">
                <FitCheckCard fit={rec.fit} />
              </div>

              {rec.reasons.length > 0 && (
                <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                  {rec.reasons.slice(0, 3).map((reason, i) => (
                    <span key={i} className="rounded-full px-2.5 py-1 text-[12px] leading-snug text-[var(--ink-2)]" style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)" }}>
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
