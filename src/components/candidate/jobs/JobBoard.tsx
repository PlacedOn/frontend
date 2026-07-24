"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, MapPin, BriefcaseBusiness, ArrowRight, Wallet, Radar } from "lucide-react";
import { getJobListings, type JobListing } from "@/lib/mock/jobs";
import { WORK_FILTERS } from "@/lib/candidate/openRoles";
import { WORK_TYPE_LABEL } from "@/components/candidate/profile/kit";
import { IconTile } from "@/components/ui/IconTile";

const EASE = [0.16, 1, 0.3, 1] as const;

const WORK_MODE_LABEL: Record<JobListing["workMode"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

/**
 * Candidate-facing job board: browse open roles, then apply to one and take the
 * AI interview generated from that role's data. Mirrors the search + filter +
 * card grid the hub established, but each card opens the role's full page.
 */
export function JobBoard({ hasEvidence = false }: { hasEvidence?: boolean }) {
  const reduce = useReducedMotion();
  const [listings, setListings] = useState<JobListing[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof WORK_FILTERS)[number]["id"]>("all");

  useEffect(() => {
    let active = true;
    getJobListings().then((l) => active && setListings(l));
    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((r) => {
      if (filter !== "all" && r.workType !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [listings, query, filter]);

  return (
    <section aria-label="Open roles" className="space-y-5">
      {/* Heading lives in the page's PageHeading — this surface starts at search. */}
      {/* search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {roles.map((role, i) => (
            <RoleCard key={role.id} role={role} index={i} reduce={!!reduce} hasEvidence={hasEvidence} />
          ))}
        </AnimatePresence>
      </div>

      {listings.length > 0 && roles.length === 0 && (
        <p className="rounded-[var(--r-card)] border border-dashed px-4 py-6 text-center text-[14px] text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          No roles match that yet. Clear the search, or widen the filter.
        </p>
      )}
    </section>
  );
}

function RoleCard({ role, index, reduce, hasEvidence }: { role: JobListing; index: number; reduce: boolean; hasEvidence: boolean }) {
  const total = role.signals.length;
  const covered = Math.min(role.coveredSignals, total);
  const readiness = total > 0 ? Math.round((covered / total) * 100) : 0;

  return (
    <motion.article
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.34, delay: reduce ? 0 : Math.min(index * 0.04, 0.2), ease: EASE }}
      className="glass flex flex-col rounded-[20px] p-5"
    >
      <div className="flex items-center gap-3">
        <IconTile icon={BriefcaseBusiness} tone="iris" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-[var(--ink-3)]">{role.company}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--mist)", color: "var(--ink-2)" }}>
              {WORK_TYPE_LABEL[role.workType]}
            </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
              {WORK_MODE_LABEL[role.workMode]}
            </span>
          </div>
        </div>
        {role.fresh && (
          <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em]" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>
            New
          </span>
        )}
      </div>

      <h3 className="mt-3.5 text-[17px] font-bold leading-snug text-[var(--ink)]">{role.title}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--ink-3)]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={1.75} aria-hidden /> {role.location}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink-2)]">
          <Wallet size={13} strokeWidth={1.75} aria-hidden /> {role.compRange}
        </span>
      </div>

      {/* readiness from prior evidence (only meaningful once they've interviewed) */}
      {hasEvidence ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-semibold text-[var(--ink-2)]">Readiness from your evidence</span>
            <span className="text-[12.5px] font-bold text-[var(--iris-ink)]">{covered}/{total} signals</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <span className="block h-full rounded-full" style={{ width: `${readiness}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
          </div>
        </div>
      ) : (
        <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-3)]">
          <Radar size={13} strokeWidth={1.75} aria-hidden />
          {total} signals this interview explores
        </p>
      )}

      {/* skills */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {role.skills.map((s) => (
          <span key={s} className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link
          href={`/candidate/jobs/${role.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--r-btn)] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          View role <ArrowRight size={15} />
        </Link>
      </div>
    </motion.article>
  );
}
