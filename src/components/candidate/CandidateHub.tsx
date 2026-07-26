"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Search, MapPin, BriefcaseBusiness, Sparkles, ArrowRight, Mic, CheckCircle2,
  Eye, Lock, Target, Handshake,
} from "lucide-react";
import { getCandidateSnapshot, loadCandidateDashboard, type CandidateDashboardMode } from "@/lib/mock/candidate";
import { OPEN_ROLES, WORK_FILTERS, type OpenRole } from "@/lib/candidate/openRoles";
import { WORK_TYPE_LABEL } from "@/components/candidate/profile/kit";
import { ConnectedGreeting } from "@/components/candidate/ConnectedGreeting";
import { IconTile } from "@/components/ui/IconTile";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Candidate home, redeveloped as a job-board hub: find a role → take the AI
 * interview built from that role's data → get matched. The warm status greeting
 * stays on top; the board is the centre of gravity. Icons use the new keyline
 * IconTile treatment (pilot for the app-wide refresh).
 */
export function CandidateHub({ mode }: { mode: CandidateDashboardMode }) {
  const [snapshot, setSnapshot] = useState(() => getCandidateSnapshot(mode));
  useEffect(() => {
    let active = true;
    loadCandidateDashboard(mode).then((r) => active && setSnapshot(r.snapshot));
    return () => {
      active = false;
    };
  }, [mode]);

  return (
    <div className="space-y-9">
      <ConnectedGreeting snapshot={snapshot} />
      <JobBoard interviewDone={snapshot.interview.status === "complete"} />
      <EvidenceStrip
        interviewDone={snapshot.interview.status === "complete"}
        matchCount={snapshot.matches.length}
        visible={snapshot.profile.employerVisible}
      />
    </div>
  );
}

function JobBoard({ interviewDone }: { interviewDone: boolean }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof WORK_FILTERS)[number]["id"]>("all");

  const roles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPEN_ROLES.filter((r) => {
      if (filter !== "all" && r.workType !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  return (
    <section aria-labelledby="board-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your matches</p>
          <h2 id="board-heading" className="mt-1.5 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-extrabold tracking-tight text-[var(--ink)]">
            {interviewDone ? "Roles matched to your evidence." : "Roles you'll match."}
          </h2>
        </div>
        <p className="max-w-xs text-[13px] text-[var(--ink-3)]">One honest interview — your evidence is matched to every open role. No re-interviewing.</p>
      </div>

      {/* One-interview lead — the whole hub hinges on this single conversation */}
      {!interviewDone && (
        <div className="glass mt-5 flex flex-col items-start gap-4 rounded-[20px] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IconTile icon={Mic} tone="iris" size="lg" />
            <div>
              <p className="text-[15px] font-bold text-[var(--ink)]">Take your one honest interview</p>
              <p className="text-[13px] text-[var(--ink-2)]">One conversation unlocks every role below that your evidence matches.</p>
            </div>
          </div>
          <Link href="/pre-interview" className="inline-flex shrink-0 items-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[14px] font-bold text-white transition-transform active:scale-[0.98]" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            Begin interview <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* search + filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--r-btn)] border bg-[var(--glass)] px-3 py-2.5 transition-colors focus-within:border-[var(--iris)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Search size={17} className="text-[var(--ink-3)]" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, skills or company type…"
            aria-label="Search roles"
            className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-[var(--ink-3)]"
          />
        </div>
        <div className="flex gap-1.5">
          {WORK_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className="rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                style={active
                  ? { borderColor: "var(--iris)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }
                  : { borderColor: "var(--glass-line-hi)", color: "var(--ink-2)", background: "var(--glass)" }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* role grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {roles.map((role, i) => (
            <RoleCard key={role.id} role={role} index={i} reduce={!!reduce} interviewDone={interviewDone} />
          ))}
        </AnimatePresence>
      </div>

      {roles.length === 0 && (
        <p className="mt-6 rounded-[var(--r-card)] border border-dashed px-4 py-6 text-center text-[14px] text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          No roles match that yet. Clear the search, or widen the filter.
        </p>
      )}
    </section>
  );
}

function RoleCard({ role, index, reduce, interviewDone }: { role: OpenRole; index: number; reduce: boolean; interviewDone: boolean }) {
  return (
    <motion.article
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.34, delay: reduce ? 0 : Math.min(index * 0.04, 0.2), ease: EASE }}
      className="glass flex flex-col rounded-[20px] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <IconTile icon={BriefcaseBusiness} tone="iris" size="md" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[13px] font-semibold text-[var(--ink-3)]">{role.company}</p>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--mist)", color: "var(--ink-2)" }}>
                {WORK_TYPE_LABEL[role.workType]}
              </span>
            </div>
          </div>
        </div>
        {role.fresh && (
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em]" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>
            New
          </span>
        )}
      </div>

      <h3 className="mt-3.5 text-[17px] font-bold leading-snug text-[var(--ink)]">{role.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[var(--ink-3)]">
        <MapPin size={13} strokeWidth={1.75} aria-hidden /> {role.location}
      </p>

      {/* readiness */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-[var(--ink-2)]">Your readiness</span>
          <span className="text-[12.5px] font-bold text-[var(--iris-ink)]">{role.readiness}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <span className="block h-full rounded-full" style={{ width: `${role.readiness}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
        </div>
      </div>

      {/* skills */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {role.skills.map((s) => (
          <span key={s} className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            {s}
          </span>
        ))}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--ink-3)]">
        <Target size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
        Close first: <span className="font-semibold text-[var(--ink-2)]">{role.topGap}</span>
      </p>

      <div className="mt-4 flex items-center gap-2 pt-1">
        {interviewDone ? (
          <>
            <Link
              href="/candidate/matches"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--r-btn)] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
            >
              <Handshake size={15} strokeWidth={2} /> Express interest
            </Link>
            <Link
              href="/candidate/matches"
              className="inline-flex items-center gap-1 rounded-[var(--r-btn)] border px-3 py-2.5 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
              style={{ borderColor: "var(--glass-line-hi)" }}
              aria-label={`Why you fit ${role.title}`}
            >
              Why <ArrowRight size={14} />
            </Link>
          </>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--r-btn)] border px-4 py-2.5 text-[12.5px] font-semibold text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            <Lock size={13} /> Matches once you interview
          </span>
        )}
      </div>
    </motion.article>
  );
}

function EvidenceStrip({ interviewDone, matchCount, visible }: { interviewDone: boolean; matchCount: number; visible: boolean }) {
  const items = [
    {
      href: "/pre-interview",
      icon: interviewDone ? CheckCircle2 : Mic,
      tone: (interviewDone ? "green" : "amber") as "green" | "amber",
      label: "Your interview",
      value: interviewDone ? "Complete" : "Waiting for you",
    },
    {
      href: "/candidate/matches",
      icon: BriefcaseBusiness,
      tone: "iris" as const,
      label: "Roles you fit",
      value: matchCount > 0 ? `${matchCount} matched` : "Interview to unlock",
    },
    {
      href: "/candidate/preferences",
      icon: visible ? Eye : Lock,
      tone: (visible ? "green" : "ink") as "green" | "ink",
      label: "Visibility",
      value: visible ? "On — employers can find you" : "Private — you choose",
    },
  ];
  return (
    <section aria-label="Your evidence" className="grid gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          className="glass flex items-center gap-3 rounded-[16px] p-4 transition-transform hover:-translate-y-0.5"
        >
          <IconTile icon={it.icon} tone={it.tone} size="md" />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[var(--ink-3)]">{it.label}</p>
            <p className="truncate text-[13.5px] font-bold text-[var(--ink)]">{it.value}</p>
          </div>
          <ArrowRight size={15} className="ml-auto text-[var(--ink-3)]" aria-hidden />
        </Link>
      ))}
    </section>
  );
}
