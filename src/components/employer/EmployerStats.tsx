"use client";

/**
 * Employer command band — the at-a-glance header from GET /v1/employer/overview.
 *
 * One card, not four. The three secondary tiles that used to sit beside this
 * repeated their own neighbour verbatim: the pipeline card already states
 * "3 of 5 roles active" and "2 intros awaiting your response", so an
 * "Active roles 3 / of 5 total" tile and an "Open intros 2 / awaiting a
 * response" tile added surface area and zero information. The third tile was a
 * lone hires count with no baseline, which is now a quiet footnote here.
 *
 * Counts only, never a score. Live on the team dashboard; labeled sample on mocks.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheckBig, ArrowRight } from "lucide-react";
import { v1, isLiveBackend, type EmployerOverview } from "@/lib/v1";

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
    <div className="mb-8">
      {/* Hero — the volume you're actually working */}
      <div
        className="relative flex max-w-xl flex-col overflow-hidden rounded-[var(--r-card)] p-6"
        style={{
          background: "linear-gradient(135deg, rgba(139,84,255,0.10), rgba(105,34,245,0.04))",
          border: "1px solid var(--iris-line)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,84,255,0.20), transparent 68%)", filter: "blur(8px)" }}
        />
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
          Pipeline
        </p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-[52px] font-extrabold leading-[0.9] text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
            {data ? data.candidates_in_pipeline : "—"}
          </span>
          <span className="pb-1.5 text-[14px] font-semibold text-[var(--ink-2)]">candidates in play</span>
        </div>

        {/* honest active-roles bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-[var(--ink-2)]">
              <span className="font-bold text-[var(--ink)]">{data ? data.active_roles : "—"}</span> of {data ? data.total_roles : "—"} roles active
            </span>
            <span className="font-semibold text-[var(--iris-ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>{rolePct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${rolePct}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
          </div>
        </div>

        {/* the single most useful next action */}
        <Link
          href="/intros"
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-[13.5px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--iris-ink)" }}
        >
          {data && data.intros_open > 0
            ? `${data.intros_open} intro${data.intros_open === 1 ? "" : "s"} awaiting your response`
            : "No intros awaiting you"}
          <ArrowRight size={14} />
        </Link>

        {data && data.hires > 0 && (
          <p className="mt-3 text-[12.5px] text-[var(--ink-3)]">
            <CircleCheckBig size={12} className="mr-1 inline align-[-1px]" aria-hidden />
            {data.hires} hire{data.hires === 1 ? "" : "s"} so far
          </p>
        )}
      </div>
    </div>
  );
}
