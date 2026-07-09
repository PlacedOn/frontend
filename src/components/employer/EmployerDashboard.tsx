"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, MapPin, X, Check, FileText, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import {
  getEmployerData,
  type EmployerData,
  type EmployerJob,
  type FeedCandidate,
} from "@/lib/mock/employer";

const EASE = [0.16, 1, 0.3, 1] as const;

function strengthTone(s: string): { bg: string; fg: string } {
  if (/strong/i.test(s)) return { bg: "rgba(16,185,129,0.12)", fg: "#047857" };
  if (/emerging/i.test(s)) return { bg: "rgba(245,134,11,0.12)", fg: "#B45309" };
  return { bg: "var(--iris-ghost)", fg: "var(--iris-ink)" };
}

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Busy = { id: string; kind: "save" | "pass" | "intro" } | null;

export function EmployerDashboard() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<EmployerData | null>(null);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [candidates, setCandidates] = useState<FeedCandidate[]>([]);
  const [busy, setBusy] = useState<Busy>(null);
  const [undo, setUndo] = useState<{ cand: FeedCandidate; index: number } | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [introId, setIntroId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    getEmployerData().then((d) => {
      if (active) {
        setData(d);
        setJobs(d.jobs);
        setCandidates(d.candidates);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setStatus = (id: string, status: FeedCandidate["status"]) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  const handleSave = async (id: string) => {
    setBusy({ id, kind: "save" });
    setStatus(id, "saved");
    setBusy(null);
  };

  const handlePass = async (id: string) => {
    const index = candidates.findIndex((c) => c.id === id);
    if (index < 0) return;
    const removed = candidates[index]!;
    setBusy({ id, kind: "pass" });
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setDrawerId((d) => (d === id ? null : d));
    setUndo({ cand: removed, index });
    setBusy(null);
  };

  const handleUndo = useCallback(() => {
    if (!undo) return;
    setCandidates((prev) => {
      const next = [...prev];
      next.splice(undo.index, 0, undo.cand);
      return next;
    });
    setUndo(null);
  }, [undo]);

  const confirmIntro = (id: string) => {
    setStatus(id, "intro");
    setIntroId(null);
  };

  const addRole = (job: EmployerJob) => {
    setJobs((prev) => [job, ...prev]);
    setShowCreate(false);
  };

  if (data === null) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-24 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        <div className="glass h-40 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
      </div>
    );
  }

  const drawerCandidate = candidates.find((c) => c.id === drawerId) ?? null;
  const introCandidate = candidates.find((c) => c.id === introId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      {data.live && (
        <div className="flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      )}

      {/* Roles */}
      <section>
        <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="eyebrow">Your roles</p>
            <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">{data.company}&rsquo;s open roles</h2>
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
          {jobs.map((j) => (
            <div key={j.id} className="glass flex flex-col rounded-[var(--r-card)] p-5">
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                  style={j.status === "Active" ? { background: "rgba(16,185,129,0.12)", color: "#047857" } : { background: "var(--mist)", color: "var(--ink-3)" }}
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
          ))}
        </div>
      </section>

      {/* Candidate feed */}
      <section id="feed">
        <p className="eyebrow">Evidence, not résumés</p>
        <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">Candidates for this role</h2>
        {candidates.length === 0 ? (
          <div className="glass mt-4 rounded-[var(--r-card)] p-10 text-center">
            <p className="text-[14.5px] text-[var(--ink-2)]">You&rsquo;ve reviewed everyone for now. New evidence-backed candidates appear here as they interview.</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {candidates.map((c, i) => {
                const tone = strengthTone(c.evidenceStrength);
                return (
                  <motion.li
                    key={c.id}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05, ease: EASE }}
                    className="glass rounded-[var(--r-card)] p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-[17px] font-bold text-[var(--ink)]">{c.name}</h3>
                          <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: tone.bg, color: tone.fg }}>
                            {c.evidenceStrength}
                          </span>
                          {c.status === "saved" && (
                            <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>Saved</span>
                          )}
                          {c.status === "intro" && (
                            <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>Intro requested</span>
                          )}
                        </div>
                        <p className="mt-1 text-[13.5px] font-semibold text-[var(--ink-3)]">
                          {c.roleFit} · {c.location} · {c.availableFrom}
                        </p>
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {c.keySignals.map((s) => (
                            <span key={s} className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{s}</span>
                          ))}
                          <span className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: "rgba(245,134,11,0.12)", color: "#B45309" }}>
                            Needs: {c.missingSignal}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <p className="text-[28px] font-extrabold leading-none" style={{ color: "var(--iris-ink)" }}>{c.matchScore}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">fit</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
                      <button type="button" onClick={() => setDrawerId(c.id)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]" style={{ boxShadow: "var(--shadow-sm)" }}>
                        <FileText size={14} /> Open evidence
                      </button>
                      {c.status !== "intro" && (
                        <button type="button" disabled={busy?.id === c.id} onClick={() => setIntroId(c.id)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-70" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
                          Request intro
                        </button>
                      )}
                      {c.status !== "saved" && c.status !== "intro" && (
                        <button type="button" disabled={busy?.id === c.id} onClick={() => handleSave(c.id)} className="cursor-pointer rounded-[var(--r-btn)] border px-4 py-2.5 text-[13px] font-bold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] disabled:opacity-70" style={{ borderColor: "var(--glass-line-hi)" }}>
                          Save
                        </button>
                      )}
                      <button type="button" disabled={busy?.id === c.id} onClick={() => handlePass(c.id)} className="cursor-pointer rounded-[var(--r-btn)] border px-4 py-2.5 text-[13px] font-medium text-[var(--ink-3)] transition-colors hover:text-[var(--ink-2)] disabled:opacity-70" style={{ borderColor: "var(--glass-line-hi)" }}>
                        Pass
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* Evidence drawer */}
      <EvidenceDrawer candidate={drawerCandidate} onClose={() => setDrawerId(null)} onRequestIntro={(id) => { setDrawerId(null); setIntroId(id); }} reduce={!!reduce} />

      {/* Request intro dialog */}
      <RequestIntroDialog candidate={introCandidate} onClose={() => setIntroId(null)} onConfirm={confirmIntro} reduce={!!reduce} />

      {/* Create role dialog */}
      {showCreate && <CreateRoleDialog onClose={() => setShowCreate(false)} onSave={addRole} reduce={!!reduce} />}

      {/* Undo toast */}
      <Portal>
        <AnimatePresence>
          {undo && (
            <motion.div className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: EASE }}>
              <div className="glass flex items-center gap-4 rounded-full py-2.5 pl-5 pr-2.5 text-[13.5px]" style={{ boxShadow: "var(--shadow-md)" }}>
                <span className="text-[var(--ink-2)]">Passed on <span className="font-semibold text-[var(--ink)]">{undo.cand.name}</span></span>
                <button type="button" onClick={handleUndo} className="cursor-pointer rounded-full px-3.5 py-1.5 font-semibold text-white" style={{ background: "var(--iris)" }}>Undo</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

function EvidenceDrawer({ candidate, onClose, onRequestIntro, reduce }: { candidate: FeedCandidate | null; onClose: () => void; onRequestIntro: (id: string) => void; reduce: boolean }) {
  useEffect(() => {
    if (!candidate) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [candidate, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {candidate && (
          <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(14,16,32,0.42)", backdropFilter: "blur(6px)" }} tabIndex={-1} />
            <motion.aside role="dialog" aria-modal="true" aria-label={`Evidence for ${candidate.name}`} className="glass absolute bottom-0 right-0 top-0 flex w-full max-w-[440px] flex-col overflow-y-auto p-7" initial={reduce ? { opacity: 0 } : { x: "100%" }} animate={reduce ? { opacity: 1 } : { x: 0 }} exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ duration: 0.34, ease: EASE }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Evidence review</p>
                  <h2 className="mt-1.5 text-[1.35rem]">{candidate.name}</h2>
                  <p className="text-[14px] text-[var(--ink-2)]">{candidate.roleFit} · {candidate.matchScore} fit</p>
                </div>
                <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-white/70 hover:text-[var(--ink)]"><X size={17} /></button>
              </div>

              <h3 className="mt-7 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Evidence-backed signals</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {candidate.keySignals.map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-[var(--r-card)] p-3 text-[13.5px] font-semibold text-[var(--ink)]" style={{ background: "var(--mist)" }}>
                    <Check size={14} className="text-[var(--iris-ink)]" /> {s}
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Missing signal</h3>
              <p className="mt-2 rounded-[var(--r-card)] p-3 text-[13.5px]" style={{ background: "rgba(245,134,11,0.10)", color: "#B45309" }}>
                {candidate.missingSignal} — worth exploring in the intro, not a reason to reject.
              </p>

              <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" /> You never see the raw transcript — only the evidence this candidate approved for employers.
              </p>

              <button type="button" onClick={() => onRequestIntro(candidate.id)} className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                Request intro
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

function RequestIntroDialog({ candidate, onClose, onConfirm, reduce }: { candidate: FeedCandidate | null; onClose: () => void; onConfirm: (id: string) => void; reduce: boolean }) {
  return (
    <Portal>
      <AnimatePresence>
        {candidate && (
          <motion.div className="fixed inset-0 z-[75] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(14,16,32,0.42)", backdropFilter: "blur(6px)" }} tabIndex={-1} />
            <motion.div role="dialog" aria-modal="true" className="glass relative w-full max-w-[420px] rounded-[var(--r-card)] p-7" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.26, ease: EASE }}>
              <p className="eyebrow">Request intro</p>
              <h2 className="mt-2 text-[1.35rem]">Ask {candidate.name} for an intro?</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
                The candidate must accept before any contact details are shared. They see the role and your note, and can decline — you&rsquo;ll be notified either way.
              </p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => onConfirm(candidate.id)} className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                  Send request
                </button>
                <button type="button" onClick={onClose} className="cursor-pointer rounded-[var(--r-btn)] border px-5 py-3 text-[14px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
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
        <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(14,16,32,0.42)", backdropFilter: "blur(6px)" }} tabIndex={-1} />
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
