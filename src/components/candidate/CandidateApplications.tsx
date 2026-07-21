"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { getApplicationsData, type Application, type AppStage, type AppStageId } from "@/lib/mock/applications";

const EASE = [0.16, 1, 0.3, 1] as const;

const STAGE_TONE: Record<AppStageId, { bg: string; fg: string }> = {
  saved: { bg: "var(--mist)", fg: "var(--ink-3)" },
  applied: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  interview: { bg: "rgba(16,185,129,0.12)", fg: "#047857" },
  offer: { bg: "rgba(245,134,11,0.12)", fg: "#B45309" },
};

export function CandidateApplications() {
  const reduce = useReducedMotion();
  const [stages, setStages] = useState<AppStage[] | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    getApplicationsData().then((d) => {
      if (active) {
        setStages(d.stages);
        setApplications(d.applications);
        setLive(d.live);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (stages === null) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-20 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass h-28 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="glass rounded-[var(--r-card)] p-10 text-center">
        <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <Sparkles size={19} />
        </span>
        <h2 className="text-[1.3rem]">No applications yet.</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Show interest in a matched role and it will appear here — you stay in control of every intro.
        </p>
        <Link href="/candidate/matches" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
          Browse matches <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {live && (
        <div className="flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      )}

      {/* Pipeline */}
      <div className="glass grid grid-cols-2 gap-3 rounded-[var(--r-card)] p-5 sm:grid-cols-4">
        {stages.map((s) => {
          const tone = STAGE_TONE[(s.id as AppStageId) in STAGE_TONE ? (s.id as AppStageId) : "applied"];
          return (
            <div key={s.id} className="rounded-[1rem] p-4" style={{ background: tone.bg }}>
              <p className="text-[26px] font-extrabold leading-none" style={{ color: tone.fg }}>{s.count}</p>
              <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--ink-2)]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Applications */}
      <ul className="flex flex-col gap-4">
        {applications.map((a, i) => {
          const tone = STAGE_TONE[a.stage];
          return (
            <motion.li
              key={a.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: reduce ? 0 : i * 0.05, ease: EASE }}
              className="glass rounded-[var(--r-card)] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[16.5px] font-bold text-[var(--ink)]">{a.role}</h3>
                    <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold capitalize" style={{ background: tone.bg, color: tone.fg }}>
                      {a.stage}
                    </span>
                  </div>
                  <p className="mt-1 text-[13.5px] font-semibold text-[var(--ink-3)]">{a.company}</p>
                </div>
                <span className="text-[13px] font-medium text-[var(--ink-2)]">{a.statusLabel}</span>
              </div>

              <p className="mt-4 rounded-[0.9rem] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--ink-2)]" style={{ background: "var(--mist)" }}>
                <span className="font-semibold text-[var(--ink)]">Next: </span>{a.nextStep}
              </p>

              {a.evidence.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {a.evidence.map((e) => (
                    <span key={e} className="rounded-full px-2.5 py-1 text-[11.5px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/candidate/matches" className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
          Find more roles <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/candidate" className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-white" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
