"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  MessageCircleQuestion,
  FileCheck2,
  SlidersHorizontal,
  UserCheck,
  Clock3,
  CheckCircle2,
  GitCompareArrows,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import {
  MOCK_TEAM_OPERATE,
  ALIGNMENT_MIN_PAIRS,
  type ActionItem,
  type ActionKind,
  type RoleState,
} from "@/lib/mock/teamOperate";
import { wilson, fmtRate, fmtInterval } from "@/lib/stats";

const EASE = [0.16, 1, 0.3, 1] as const;

const KIND_ICON: Record<ActionKind, LucideIcon> = {
  question: MessageCircleQuestion,
  evidence: FileCheck2,
  calibration: SlidersHorizontal,
  intro: UserCheck,
  sla: Clock3,
};

const ROLE_STATE: Record<RoleState, { label: string; fg: string; bg: string }> = {
  search_ready: { label: "Search-ready", fg: "var(--ok)", bg: "rgba(16,185,129,0.12)" },
  needs_calibration: { label: "Needs calibration", fg: "var(--warn)", bg: "rgba(245,134,11,0.12)" },
  active: { label: "Active", fg: "var(--ink-2)", bg: "var(--mist)" },
};

/**
 * The team dashboard "Operate" view (statistical plan §3.2 / §7.1). Its whole job:
 * surface the next respectful, evidence-aware *human action* — framed per person,
 * never a candidate ranking or score. The process-quality strip measures the
 * *process*, and every rate is honest: it carries its counts + a Wilson interval,
 * and a too-small sample says "not enough data" instead of a confident number.
 */
export function TeamOperate() {
  const reduce = useReducedMotion();
  const d = MOCK_TEAM_OPERATE;
  const m = d.metrics;

  const sla = wilson(m.slaMet, m.slaDue);
  const closure = wilson(m.closed, m.decided);
  const alignOk = m.alignmentPairs >= ALIGNMENT_MIN_PAIRS;
  const burden = m.activeCandidates > 0 ? m.supplementalRounds / m.activeCandidates : 0;

  const reveal = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.05 * i, ease: EASE } };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Operate · today</p>
        <h2 className="mt-1 text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] font-extrabold tracking-tight text-[var(--ink)]">
          {d.firstName}, {d.promisesDue} candidate {d.promisesDue === 1 ? "promise needs" : "promises need"} an owner today.
        </h2>
        <p className="mt-1 text-[14px] text-[var(--ink-2)]">
          The next respectful action, by person — not a ranking, not a score.
        </p>
      </div>

      {/* Action queue — per person, human actions only */}
      <motion.ul {...reveal(0)} className="glass flex flex-col divide-y rounded-[var(--r-card)] p-2" style={{ borderColor: "var(--glass-line)" }}>
        {d.actions.map((a) => (
          <ActionRow key={a.id} a={a} />
        ))}
      </motion.ul>

      {/* Role health strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        {d.roles.map((r, i) => {
          const s = ROLE_STATE[r.state];
          return (
            <motion.div {...reveal(i + 1)} key={r.id} className="glass rounded-[var(--r-card)] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14.5px] font-bold text-[var(--ink)]">{r.role}</span>
                <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-[var(--ink-3)]">{r.note}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Process-quality strip — measures the process, never the candidate */}
      <div>
        <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Process quality · not candidate quality
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            {...reveal(2)}
            icon={Clock3}
            label="Response SLA"
            value={fmtRate(sla)}
            sub={fmtInterval(sla)}
            tone={sla.sufficient && (sla.point ?? 0) >= 0.9 ? "good" : "neutral"}
          />
          <StatCard
            {...reveal(3)}
            icon={CheckCircle2}
            label="Candidate closure"
            value={fmtRate(closure)}
            sub={fmtInterval(closure)}
            tone={closure.sufficient && (closure.point ?? 0) >= 0.8 ? "good" : "neutral"}
          />
          <StatCard
            {...reveal(4)}
            icon={GitCompareArrows}
            label="Decisions ↔ evidence"
            value={alignOk ? `${m.alignmentPct}%` : "Not enough data yet"}
            sub={alignOk ? "decisions track the evidence" : `${m.alignmentPairs} of ${ALIGNMENT_MIN_PAIRS} decided pairs`}
            tone={alignOk ? "good" : "gated"}
          />
          <StatCard
            {...reveal(5)}
            icon={RotateCcw}
            label="Re-interview burden"
            value={`${m.supplementalRounds} / ${m.activeCandidates}`}
            sub={burden <= 0.2 ? "low — not over-extractive" : "watch: may be over-extractive"}
            tone={burden <= 0.2 ? "good" : "warn"}
          />
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-3)]">
          Sample — illustrative. Every rate shows its counts and a 95% interval; a sample too small to trust says so
          rather than guessing. No candidate is ranked or scored here.
        </p>
      </div>
    </section>
  );
}

function ActionRow({ a }: { a: ActionItem }) {
  const Icon = KIND_ICON[a.kind];
  const overdue = a.due === "overdue";
  return (
    <li className="flex items-center gap-3 p-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-[11px]"
        style={{ background: overdue ? "rgba(245,134,11,0.14)" : "var(--iris-ghost)", color: overdue ? "var(--warn)" : "var(--iris-ink)" }}
      >
        <Icon size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] text-[var(--ink-2)]">
          <span className="font-bold text-[var(--ink)]">{a.ref}</span> {a.text}
        </p>
        <p className="text-[11.5px] text-[var(--ink-3)]">{a.owner}</p>
      </div>
      <span
        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={overdue ? { background: "rgba(245,134,11,0.14)", color: "var(--warn)" } : { background: "var(--mist)", color: "var(--ink-3)" }}
      >
        {a.due}
      </span>
    </li>
  );
}

type Tone = "good" | "neutral" | "warn" | "gated";
const TONE_FG: Record<Tone, string> = {
  good: "var(--ok)",
  neutral: "var(--iris-ink)",
  warn: "var(--warn)",
  gated: "var(--ink-3)",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  ...motionProps
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  tone: Tone;
} & Record<string, unknown>) {
  return (
    <motion.div {...motionProps} className="glass rounded-[var(--r-card)] p-4">
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: TONE_FG[tone] }} aria-hidden />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">{label}</span>
      </div>
      <p className="mt-2 text-[18px] font-extrabold tracking-tight text-[var(--ink)] tabular-nums">{value}</p>
      <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{sub}</p>
    </motion.div>
  );
}
