"use client";

/**
 * Employer overview KPIs — the at-a-glance stat header (active roles, candidates
 * in pipeline, open intros, hires) from GET /v1/employer/overview. Counts only,
 * no score. Live on the team dashboard; sample on mocks.
 */

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Users, MessagesSquare, CircleCheckBig } from "lucide-react";
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

  const cards = [
    { icon: BriefcaseBusiness, label: "Active roles", value: data ? `${data.active_roles}` : "—", sub: data ? `of ${data.total_roles} total` : "" },
    { icon: Users, label: "Candidates", value: data ? `${data.candidates_in_pipeline}` : "—", sub: "in your pipeline" },
    { icon: MessagesSquare, label: "Open intros", value: data ? `${data.intros_open}` : "—", sub: "awaiting a response" },
    { icon: CircleCheckBig, label: "Hires", value: data ? `${data.hires}` : "—", sub: "positive outcomes" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="glass rounded-[var(--r-card)] p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-[var(--iris-ink)]" style={{ background: "var(--iris-ghost)" }}>
              <Icon size={18} />
            </span>
            <p className="mt-4 text-[28px] font-extrabold leading-none text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
              {c.value}
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-[var(--ink-2)]">{c.label}</p>
            {c.sub && <p className="text-[12px] text-[var(--ink-3)]">{c.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}
