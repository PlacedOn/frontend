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
import { ShieldCheck, ArrowRight, Sparkles, CircleCheck, CircleDot, CircleDashed } from "lucide-react";
import { v1, V1Error, type CandidateOpeningRec, type MutualFitTier } from "@/lib/v1";

const TIER: Record<MutualFitTier, { label: string; bg: string; fg: string }> = {
  strong_fit: { label: "Strong fit", bg: "rgba(5,150,105,0.12)", fg: "#047857" },
  worth_a_look: { label: "Worth a look", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  stretch: { label: "Stretch", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
};

function mustHaveSummary(rec: CandidateOpeningRec) {
  const musts = rec.readiness.requirements.filter((r) => r.kind === "must_have");
  const supported = musts.filter((r) => r.status === "supported").length;
  const partial = musts.filter((r) => r.status === "partial").length;
  return { total: musts.length, supported, partial };
}

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
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <Sparkles size={20} />
        </span>
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
        Ranked by how much of each role your evidence covers — readiness, not a chance of selection. The company stays anonymous
        until you both consent to an intro.
      </p>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recs.map((rec) => {
          const t = TIER[rec.tier];
          const ms = mustHaveSummary(rec);
          return (
            <li key={rec.job_id} className="glass flex h-full flex-col rounded-[var(--r-card)] p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[16px] font-bold leading-tight text-[var(--ink)]">{rec.title}</h3>
                  {rec.level && <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">{rec.level}</p>}
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: t.bg, color: t.fg }}>
                  {t.label}
                </span>
              </div>

              {rec.company_verified && (
                <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}>
                  <ShieldCheck size={12} /> Verified company
                </span>
              )}

              {/* must-have coverage — bands, never a number */}
              <div className="mt-4 flex items-center gap-3 text-[12.5px] font-semibold">
                <span className="inline-flex items-center gap-1" style={{ color: "#047857" }}>
                  <CircleCheck size={13} /> {ms.supported} supported
                </span>
                <span className="inline-flex items-center gap-1" style={{ color: "var(--iris-ink)" }}>
                  <CircleDot size={13} /> {ms.partial} emerging
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--ink-3)]">
                  <CircleDashed size={13} /> of {ms.total} must-haves
                </span>
              </div>

              {rec.reasons.length > 0 && (
                <ul className="mt-3 flex flex-1 flex-col gap-1.5 text-[13px] leading-relaxed text-[var(--ink-2)]">
                  {rec.reasons.slice(0, 4).map((reason, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--iris)" }} />
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
