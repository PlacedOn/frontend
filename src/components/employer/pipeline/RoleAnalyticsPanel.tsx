"use client";

/**
 * Role analytics — the hero metric is "are your decisions following the evidence?"
 * (evidence-alignment via rank-concordance), plus advancement-by-tier and funnel.
 * Fair by construction: it uses coverage tiers, never protected attributes. No
 * person-score.
 */

import { useEffect, useState } from "react";
import { Scale, TrendingUp } from "lucide-react";
import { v1, isLiveBackend, type RoleAnalytics } from "@/lib/v1";

const TIER_LABEL: Record<string, string> = { strong: "Strong", worth_a_look: "Worth a look", gaps: "Gaps" };

function alignColor(a: number): string {
  if (a >= 0.75) return "#047857";
  if (a >= 0.5) return "#B45309";
  return "#b91c1c";
}

const SAMPLE: RoleAnalytics = {
  total_candidates: 12,
  by_tier: [
    { tier: "strong", total: 4, advanced: 3, rate: 0.75 },
    { tier: "worth_a_look", total: 5, advanced: 2, rate: 0.4 },
    { tier: "gaps", total: 3, advanced: 0, rate: 0 },
  ],
  alignment: { alignment: 0.82, gamma: 0.64, concordant: 9, discordant: 2, decided: 8, monotonic: true, note: "Your advance/pass decisions track the evidence well." },
  funnel: { counts: { new: 3, reviewing: 4, intro: 4, hired: 1, passed: 0 }, reviewed_rate: 0.75, intro_rate: 0.42, hired_rate: 0.08 },
};

export function RoleAnalyticsPanel({ jobId }: { jobId: string }) {
  const live = isLiveBackend();
  const [data, setData] = useState<RoleAnalytics | null>(live ? null : SAMPLE);

  useEffect(() => {
    if (!live) return;
    let active = true;
    v1.jobAnalytics(jobId).then((d) => active && setData(d)).catch(() => active && setData(SAMPLE));
    return () => {
      active = false;
    };
  }, [live, jobId]);

  if (!data) return <div className="glass h-40 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />;

  const a = data.alignment;
  const pct = Math.round(a.alignment * 100);
  const color = alignColor(a.alignment);

  return (
    <div className="glass rounded-[var(--r-card)] p-6">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-[var(--iris-ink)]" />
        <h3 className="text-[15px] font-bold text-[var(--ink)]">Are your decisions following the evidence?</h3>
      </div>

      {/* hero: evidence alignment */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[12.5px] font-semibold text-[var(--ink-3)]">Decisions ↔ evidence alignment</span>
          <span className="text-[22px] font-extrabold" style={{ color, fontFamily: "var(--font-mono)" }}>{pct}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-2)]">{a.note}</p>
        <p className="mt-1 text-[11.5px] text-[var(--ink-3)]">
          Rank-concordance over {a.decided} decided candidate(s) · {a.concordant} concordant / {a.discordant} inverted · uses coverage tiers, never protected traits.
        </p>
      </div>

      {/* advancement by tier — should descend strong → gaps */}
      <div className="mt-6">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-3)]">Advancement rate by evidence tier</p>
        <div className="mt-2 flex flex-col gap-2">
          {data.by_tier.map((t) => (
            <div key={t.tier} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[12.5px] font-semibold text-[var(--ink-2)]">{TIER_LABEL[t.tier] ?? t.tier}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(t.rate * 100)}%`, background: "var(--iris)" }} />
              </div>
              <span className="w-24 shrink-0 text-right text-[11.5px] font-semibold text-[var(--ink-3)]">{t.advanced}/{t.total} advanced</span>
            </div>
          ))}
        </div>
        {!a.monotonic && a.decided > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#B45309" }}>
            <TrendingUp size={13} /> Advancement isn&rsquo;t tracking evidence tier — worth a review.
          </p>
        )}
      </div>

      {/* funnel */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Reviewed", v: data.funnel.reviewed_rate },
          { label: "Reached intro", v: data.funnel.intro_rate },
          { label: "Hired", v: data.funnel.hired_rate },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--r-btn)] p-3 text-center" style={{ background: "var(--porcelain-2)" }}>
            <p className="text-[20px] font-extrabold text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)" }}>{Math.round(s.v * 100)}%</p>
            <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">{s.label}</p>
          </div>
        ))}
      </div>

      {!live && <p className="mt-4 text-[12px] text-[var(--ink-3)]">Sample — connect the backend for your role&rsquo;s real analytics.</p>}
    </div>
  );
}
