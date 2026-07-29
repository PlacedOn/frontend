"use client";

/**
 * Candidate readiness ring — completeness of the candidate's OWN setup (build
 * profile → interview → approve evidence → mint passport), with the next action.
 * It's the completion widget (cf. the "Complete your profile 40%" pattern), NOT a
 * person-score. Drives the funnel: a complete profile produces good matches.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { v1, isLiveBackend, type ReadinessProfile } from "@/lib/v1";

const SAMPLE: ReadinessProfile = {
  pct: 45,
  complete: false,
  steps: [
    { key: "has_profile", label: "Build your profile", weight: 20, done: true, hint: "Role, skills, what you're looking for.", href: "/candidate/profile" },
    { key: "has_resume", label: "Attach your resume", weight: 10, done: false, hint: "We extract claims to verify — we never score it.", href: "/candidate/profile" },
    { key: "has_interview", label: "Take your interview", weight: 30, done: true, hint: "One calm, adaptive conversation.", href: "/pre-interview" },
    { key: "has_approved_evidence", label: "Approve your evidence", weight: 25, done: false, hint: "Review each trait in your own words.", href: "/candidate/profile#evidence" },
    { key: "has_passport", label: "Mint your passport", weight: 15, done: false, hint: "A portable, verifiable proof.", href: "/candidate/passport" },
  ],
  next_action: { key: "has_resume", label: "Attach your resume", weight: 10, done: false, hint: "We extract claims to verify — we never score it.", href: "/candidate/profile" },
};

function Ring({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--mist)" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="url(#rg)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset var(--d-narrate) var(--ease-out)" }}
      />
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--iris-soft)" />
          <stop offset="1" stopColor="var(--iris)" />
        </linearGradient>
      </defs>
      <text x="50" y="50" transform="rotate(90 50 50)" textAnchor="middle" dominantBaseline="central" className="fill-[var(--ink)] font-bold" style={{ fontSize: "22px" }}>
        {pct}%
      </text>
    </svg>
  );
}

export function CandidateReadiness() {
  const [data, setData] = useState<ReadinessProfile | null>(isLiveBackend() ? null : SAMPLE);

  useEffect(() => {
    if (!isLiveBackend()) return;
    let active = true;
    v1.candidateReadiness().then((r) => active && setData(r)).catch(() => active && setData(SAMPLE));
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return <div className="glass h-40 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />;
  }

  return (
    <div className="glass rounded-[var(--r-card)] p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <Ring pct={data.pct} />
          <div>
            <p className="eyebrow">Your readiness</p>
            <h3 className="mt-1 text-[18px] font-bold text-[var(--ink)]">
              {data.complete ? "You're all set." : "A few steps to go."}
            </h3>
            <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--ink-3)]">
              How complete your profile is — not a score of you. A complete profile gets you matched well.
            </p>
            {data.next_action && (
              <Link
                href={data.next_action.href}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
              >
                {data.next_action.label} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2 border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0" style={{ borderColor: "var(--glass-line)" }}>
          {data.steps.map((s) => (
            <li key={s.key} className="flex items-center gap-2.5">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                style={s.done ? { background: "#047857", color: "#fff" } : { border: "1.5px solid var(--glass-line-hi)", color: "transparent" }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span className={`text-[13.5px] ${s.done ? "text-[var(--ink-3)] line-through" : "font-semibold text-[var(--ink)]"}`}>{s.label}</span>
              <span className="ml-auto text-[11.5px] font-semibold text-[var(--ink-3)]">+{s.weight}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
