"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, MapPin, ArrowRight, Lock } from "lucide-react";
import { getCandidateSnapshot, loadCandidateDashboard, type CandidateDashboardMode } from "@/lib/mock/candidate";
import { OPEN_ROLES, WORK_FILTERS, type OpenRole } from "@/lib/candidate/openRoles";
import { WORK_TYPE_LABEL } from "@/components/candidate/profile/kit";
import { ConnectedGreeting } from "@/components/candidate/ConnectedGreeting";

const EASE = [0.16, 1, 0.3, 1] as const;

// Shared action styles — matches the Button primitive (solid ink / hairline).
const SOLID =
  "inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] font-semibold text-[var(--white)] bg-[var(--ink)] transition-colors hover:bg-[color-mix(in_oklab,var(--ink),#000_14%)]";
const HAIRLINE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] font-semibold text-[var(--ink)] bg-[var(--white)] border border-[var(--glass-line)] transition-colors hover:bg-[var(--mist)]";

/**
 * Candidate home — a job-board hub: find a role → take one AI interview built
 * from that role → get matched. Paper system: typographic, flat surfaces, one
 * restrained accent (the readiness bar), no decorative icons.
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
    <div className="space-y-10">
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
          <h2 id="board-heading" className="mt-2 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-bold tracking-[-0.02em] text-[var(--ink)]">
            {interviewDone ? "Roles matched to your evidence." : "Roles you'll match."}
          </h2>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-[var(--ink-3)]">
          One honest interview — your evidence is matched to every open role. No re-interviewing.
        </p>
      </div>

      {/* One-interview lead — the whole hub hinges on this single conversation */}
      {!interviewDone && (
        <div className="mt-6 flex flex-col items-start gap-4 rounded-[var(--r-card)] border border-[var(--ink)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15.5px] font-semibold text-[var(--ink)]">Take your one honest interview</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
              One conversation unlocks every role below that your evidence matches.
            </p>
          </div>
          <Link href="/pre-interview" className={`${SOLID} shrink-0 px-5 py-3 text-[14px]`}>
            Begin interview <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* search + filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--r-btn)] border bg-[var(--white)] px-3 py-2.5 transition-colors focus-within:border-[var(--ink)]" style={{ borderColor: "var(--glass-line)" }}>
          <Search size={16} className="text-[var(--ink-3)]" aria-hidden />
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
                  ? { borderColor: "var(--ink)", background: "var(--ink)", color: "var(--white)" }
                  : { borderColor: "var(--glass-line)", color: "var(--ink-2)", background: "var(--white)" }}
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, delay: reduce ? 0 : Math.min(index * 0.04, 0.2), ease: EASE }}
      className="glass flex flex-col rounded-[var(--r-card)] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <p className="truncate text-[13px] font-semibold text-[var(--ink-3)]">{role.company}</p>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line)" }}>
            {WORK_TYPE_LABEL[role.workType]}
          </span>
        </div>
        {role.fresh && (
          <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]">New</span>
        )}
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)]">{role.title}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-[var(--ink-3)]">
        <MapPin size={13} strokeWidth={1.75} aria-hidden /> {role.location}
      </p>

      {/* readiness — the one accent on this surface */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-[var(--ink-2)]">Your readiness</span>
          <span className="text-[12.5px] font-semibold tabular-nums text-[var(--ink)]">{role.readiness}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <span className="block h-full rounded-full" style={{ width: `${role.readiness}%`, background: "var(--iris)" }} />
        </div>
      </div>

      {/* skills — neutral, not decorative colour */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {role.skills.map((s) => (
          <span key={s} className="rounded-full px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--ink-2)]" style={{ background: "var(--mist)" }}>
            {s}
          </span>
        ))}
      </div>

      <p className="mt-3.5 text-[12px] leading-relaxed text-[var(--ink-3)]">
        Close first: <span className="font-semibold text-[var(--ink-2)]">{role.topGap}</span>
      </p>

      <div className="mt-4 flex items-center gap-2 pt-1">
        {interviewDone ? (
          <>
            <Link href="/candidate/matches" className={`${SOLID} flex-1 px-4 py-2.5 text-[13.5px]`}>
              Express interest
            </Link>
            <Link
              href="/candidate/matches"
              className={`${HAIRLINE} px-3 py-2.5 text-[13px]`}
              aria-label={`Why you fit ${role.title}`}
            >
              Why <ArrowRight size={14} />
            </Link>
          </>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--r-btn)] border px-4 py-2.5 text-[12.5px] font-semibold text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line)", background: "var(--white)" }}>
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
      label: "Your interview",
      value: interviewDone ? "Complete" : "Waiting for you",
    },
    {
      href: "/candidate/matches",
      label: "Roles you fit",
      value: matchCount > 0 ? `${matchCount} matched` : "Interview to unlock",
    },
    {
      href: "/candidate/preferences",
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
          className="glass flex items-center gap-3 rounded-[var(--r-card)] p-4 transition-colors hover:bg-[var(--mist)]"
        >
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[var(--ink-3)]">{it.label}</p>
            <p className="truncate text-[13.5px] font-semibold text-[var(--ink)]">{it.value}</p>
          </div>
          <ArrowRight size={15} className="ml-auto text-[var(--ink-3)]" aria-hidden />
        </Link>
      ))}
    </section>
  );
}
