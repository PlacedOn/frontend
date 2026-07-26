"use client";

/**
 * Employer command band — the at-a-glance header from GET /v1/employer/overview.
 * One dominant "pipeline" card carries the hero number, an honest active-roles
 * bar, and the single most useful next action; three lighter tiles sit beside it.
 * Paper system: flat cards, one restrained accent (the bar), no decorative icons.
 * Counts only, never a score.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { v1, isLiveBackend, type EmployerOverview } from "@/lib/v1";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

const SAMPLE: EmployerOverview = { active_roles: 3, total_roles: 5, candidates_in_pipeline: 12, intros_open: 2, hires: 1 };

export function EmployerStats() {
  const live = isLiveBackend();
  const [data, setData] = useState<EmployerOverview | null>(live ? null : SAMPLE);

  useEffect(() => {
    if (!live) return;
    let active = true;
    v1.employerOverview().then((d) => active && setData(d)).catch(() => active && setData(SAMPLE));
    return () => {
      active = false;
    };
  }, [live]);

  const rolePct = data && data.total_roles > 0 ? Math.round((data.active_roles / data.total_roles) * 100) : 0;

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Hero — the volume you're actually working */}
      <div className="glass flex flex-col rounded-[var(--r-card)] p-6 md:col-span-2 lg:col-span-3">
        <p className="eyebrow">Pipeline</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-[52px] font-bold leading-[0.9] tabular-nums text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)" }}>
            {data ? <AnimatedNumber value={data.candidates_in_pipeline} /> : "—"}
          </span>
          <span className="pb-1.5 text-[14px] font-semibold text-[var(--ink-2)]">candidates in play</span>
        </div>

        {/* honest active-roles bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--ink)]">{data ? data.active_roles : "—"}</span> of {data ? data.total_roles : "—"} roles active
            </span>
            <span className="font-semibold tabular-nums text-[var(--ink)]">
              {data ? <AnimatedNumber value={rolePct} /> : "—"}%
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${rolePct}%`, background: "var(--iris)" }} />
          </div>
        </div>

        {/* the single most useful next action */}
        <Link
          href="/intros"
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--iris-ink)]"
        >
          {data && data.intros_open > 0
            ? `${data.intros_open} intro${data.intros_open === 1 ? "" : "s"} awaiting your response`
            : "No intros awaiting you"}
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Secondary tiles — lighter weight, clear rhythm */}
      <SecondaryTile value={data ? data.active_roles : null} label="Active roles" sub={data ? `of ${data.total_roles} total` : ""} />
      <SecondaryTile value={data ? data.intros_open : null} label="Open intros" sub="awaiting a response" />
      <SecondaryTile value={data ? data.hires : null} label="Hires" sub="positive outcomes" />
    </div>
  );
}

function SecondaryTile({ value, label, sub }: { value: number | null; label: string; sub: string }) {
  return (
    <div className="glass flex flex-col justify-end rounded-[var(--r-card)] p-5 lg:col-span-1">
      <p className="text-[26px] font-bold leading-none tabular-nums text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)" }}>
        {value === null ? "—" : <AnimatedNumber value={value} />}
      </p>
      <p className="mt-2 text-[12.5px] font-semibold text-[var(--ink-2)]">{label}</p>
      {sub && <p className="text-[11.5px] text-[var(--ink-3)]">{sub}</p>}
    </div>
  );
}
