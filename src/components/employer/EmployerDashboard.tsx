"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, MapPin, X, ArrowRight, Sparkles } from "lucide-react";
import { getEmployerData, type EmployerJob } from "@/lib/mock/employer";
import { listCandidateReports, type CandidateReport } from "@/lib/mock/candidateReport";
import { isLiveBackend } from "@/lib/api";
import { CandidateSummaryCard } from "./CandidateSummaryCard";
import { LiveEmployerBoard } from "./LiveEmployerBoard";
import { TeamOperate } from "./TeamOperate";

const EASE = [0.16, 1, 0.3, 1] as const;

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Meta = { company: string; live: boolean } | null;

/**
 * Selector: with a real backend configured, the dashboard is the live RLS-scoped
 * roles board (GET /v1/employer/dashboard). Otherwise the labeled sample preview
 * renders — never fake data pretending to be live. Hooks stay unconditional
 * because each branch is its own component.
 */
export function EmployerDashboard() {
  if (isLiveBackend()) return <LiveEmployerBoard />;
  return <MockEmployerBoard />;
}

function MockEmployerBoard() {
  const reduce = useReducedMotion();
  const [meta, setMeta] = useState<Meta>(null);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [candidates, setCandidates] = useState<CandidateReport[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ cand: CandidateReport; index: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getEmployerData(), listCandidateReports()]).then(([d, reports]) => {
      if (!active) return;
      setMeta({ company: d.company, live: d.live });
      setJobs(d.jobs);
      setCandidates(reports);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = (id: string) => {
    setBusyId(id);
    setCandidates((prev) => prev?.map((c) => (c.id === id ? { ...c, status: "saved" } : c)) ?? prev);
    setBusyId(null);
  };

  const handlePass = (id: string) => {
    setCandidates((prev) => {
      if (!prev) return prev;
      const index = prev.findIndex((c) => c.id === id);
      if (index < 0) return prev;
      setUndo({ cand: prev[index]!, index });
      return prev.filter((c) => c.id !== id);
    });
  };

  const handleUndo = useCallback(() => {
    if (!undo) return;
    setCandidates((prev) => {
      const next = [...(prev ?? [])];
      next.splice(undo.index, 0, undo.cand);
      return next;
    });
    setUndo(null);
  }, [undo]);

  const addRole = (job: EmployerJob) => {
    setJobs((prev) => [job, ...prev]);
    setShowCreate(false);
  };

  if (candidates === null || meta === null) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-24 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="glass h-72 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
          <div className="glass h-72 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
          <div className="glass h-72 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <span className="livedot" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          {meta.live ? "Live · from backend" : "Sample pipeline · illustrative"}
        </span>
      </div>

      {/* Operate — what needs a human today, per person not per score */}
      <TeamOperate />

      {/* Roles */}
      <section>
        <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="eyebrow">Your roles</p>
            <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">{meta.company}&rsquo;s open roles</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            <Plus size={16} /> Add role
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((j) => {
            const accent = j.status === "Active" ? "var(--ok)" : "var(--ink-3)";
            return (
            <div key={j.id} className="glass relative flex flex-col overflow-hidden rounded-[var(--r-card)] p-5 transition-transform duration-[var(--d-std)] hover:-translate-y-1">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                  style={j.status === "Active" ? { background: "rgba(16,185,129,0.12)", color: "var(--ok)" } : { background: "var(--mist)", color: "var(--ink-3)" }}
                >
                  {j.status}
                </span>
                <span className="text-[13px] font-semibold text-[var(--iris-ink)]">{j.candidateCount} matches</span>
              </div>
              <h3 className="mt-3 text-[16px] font-bold text-[var(--ink)]">{j.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--ink-3)]">
                <MapPin size={13} /> {j.location}
              </p>
              <a
                href="#feed"
                className="mt-4 inline-flex w-fit cursor-pointer items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--iris-ink)" }}
              >
                Review candidates <ArrowRight size={14} />
              </a>
            </div>
            );
          })}
        </div>
      </section>

      {/* Candidate pipeline */}
      <section id="feed">
        <p className="eyebrow">Evidence, not resumes</p>
        <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">Ready-to-hire candidates</h2>
        <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
          Each has interviewed. Open a card for the full evidence-backed report — evidence bands, transcript moments, and a GitHub read.
        </p>
        {candidates.length === 0 ? (
          <div className="glass mt-4 rounded-[var(--r-card)] p-10 text-center">
            <p className="text-[14.5px] text-[var(--ink-2)]">You&rsquo;ve reviewed everyone for now. New evidence-backed candidates appear here as they interview.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {candidates.map((c, i) => (
                <motion.li
                  key={c.id}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05, ease: EASE }}
                >
                  <CandidateSummaryCard
                    c={c}
                    status={c.status}
                    busy={busyId === c.id}
                    onSave={() => handleSave(c.id)}
                    onPass={() => handlePass(c.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* Create role dialog */}
      {showCreate && <CreateRoleDialog onClose={() => setShowCreate(false)} onSave={addRole} reduce={!!reduce} />}

      {/* Undo toast */}
      <Portal>
        <AnimatePresence>
          {undo && (
            <motion.div className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: EASE }}>
              <div className="glass flex items-center gap-4 rounded-full py-2.5 pl-5 pr-2.5 text-[13.5px]" style={{ boxShadow: "var(--shadow-md)" }}>
                <span className="text-[var(--ink-2)]">Passed on <span className="font-semibold text-[var(--ink)]">{undo.cand.initials}</span></span>
                <button type="button" onClick={handleUndo} className="cursor-pointer rounded-full px-3.5 py-1.5 font-semibold text-white" style={{ background: "var(--iris)" }}>Undo</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

function CreateRoleDialog({ onClose, onSave, reduce }: { onClose: () => void; onSave: (job: EmployerJob) => void; reduce: boolean }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [signals, setSignals] = useState<string[]>([]);

  const generate = () => {
    const base = skills.split(",").map((s) => s.trim()).filter(Boolean);
    setSignals([...base, "Structured debugging", "Learning velocity"].slice(0, 6));
  };

  const save = () => {
    if (!title.trim()) return;
    onSave({
      id: `job-${Date.now()}`,
      title: title.trim(),
      location: location.trim() || "Remote",
      status: "Draft",
      candidateCount: 0,
    });
  };

  const inputClass = "rounded-xl border px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--iris)]";
  const inputStyle = { borderColor: "var(--glass-line-hi)", background: "rgba(255,255,255,.7)" } as const;

  return (
    <Portal>
      <div className="fixed inset-0 z-[75] grid place-items-center p-4">
        <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(14,16,32,0.42)", }} tabIndex={-1} />
        <motion.div role="dialog" aria-modal="true" className="glass relative w-full max-w-[460px] rounded-[var(--r-card)] p-7" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.26, ease: EASE }}>
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-white/70 hover:text-[var(--ink)]"><X size={17} /></button>
          <p className="eyebrow">New role</p>
          <h2 className="mt-2 text-[1.4rem]">Describe the role.</h2>
          <div className="mt-5 flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Role title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Engineer" className={inputClass} style={inputStyle} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Location</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru · Hybrid" className={inputClass} style={inputStyle} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Must-have skills (comma-separated)</span>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, API integration" className={inputClass} style={inputStyle} />
            </label>

            <button type="button" onClick={generate} className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
              <Sparkles size={14} /> Generate signals
            </button>
            {signals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {signals.map((s) => (
                  <span key={s} className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{s}</span>
                ))}
              </div>
            )}

            <button type="button" onClick={save} disabled={!title.trim()} className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[15px] font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
              Save role
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}
