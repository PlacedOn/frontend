"use client";

/**
 * Employer command band — the at-a-glance header from GET /v1/employer/overview.
 * Deliberately NOT four uniform boxes: one dominant "pipeline" card carries the
 * hero number + an honest active-roles bar + the single most useful next action
 * (open intros), with three lighter secondary tiles beside it. Counts only, never
 * a score. Live on the team dashboard; labeled sample on mocks.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, MessagesSquare, CircleCheckBig, ArrowRight } from "lucide-react";
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
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Hero — the volume you're actually working */}
      <div
        className="relative flex flex-col overflow-hidden rounded-[var(--r-card)] p-6 md:col-span-2 lg:col-span-3"
        style={{
          background: "linear-gradient(135deg, color-mix(in oklab, var(--iris-soft) 10%, transparent), color-mix(in oklab, var(--iris) 4%, transparent))",
          border: "1px solid var(--iris-line)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--iris-soft) 20%, transparent), transparent 68%)", filter: "blur(8px)" }}
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
      </div>

      {/* Secondary tiles — lighter weight, clear rhythm */}
      <SecondaryTile icon={BriefcaseBusiness} value={data ? `${data.active_roles}` : "—"} label="Active roles" sub={data ? `of ${data.total_roles} total` : ""} />
      <SecondaryTile icon={MessagesSquare} value={data ? `${data.intros_open}` : "—"} label="Open intros" sub="awaiting a response" />
      <SecondaryTile icon={CircleCheckBig} value={data ? `${data.hires}` : "—"} label="Hires" sub="positive outcomes" />
    </div>
  );
}

function SecondaryTile({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="glass flex flex-col rounded-[var(--r-card)] p-5 lg:col-span-1">
      <span className="grid h-9 w-9 place-items-center rounded-xl text-[var(--iris-ink)]" style={{ background: "var(--iris-ghost)" }}>
        <Icon size={17} />
      </span>
      <p className="mt-3 text-[26px] font-extrabold leading-none text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--ink-2)]">{label}</p>
      {sub && <p className="text-[11.5px] text-[var(--ink-3)]">{sub}</p>}
    </div>
  );
}
