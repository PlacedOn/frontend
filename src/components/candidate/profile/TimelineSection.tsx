"use client";

import { Plus, Trash2, Briefcase, GraduationCap } from "lucide-react";
import type { CandidateProfile, WorkEntry, EducationEntry } from "@/lib/v1";
import { FieldLabel, INPUT_CLS, INPUT_STYLE, SectionCard } from "./kit";

type Props = {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
};

/**
 * Structured work + education timeline — the familiar Naukri/LinkedIn shape,
 * for context and as an interview seed. Never taken as proof: pedigree stays out
 * of scoring, and the interview is still where claims become evidence.
 */
export function TimelineSection({ profile, update }: Props) {
  const work = profile.work_history ?? [];
  const education = profile.education ?? [];

  const setWork = (i: number, patch: Partial<WorkEntry>) =>
    update({ work_history: work.map((w, idx) => (idx === i ? { ...w, ...patch } : w)) });
  const addWork = () =>
    update({ work_history: [...work, { id: `w-${Date.now()}`, role: "", company: "", start: "", end: "", summary: "" }] });
  const removeWork = (id: string) => update({ work_history: work.filter((w) => w.id !== id) });

  const setEdu = (i: number, patch: Partial<EducationEntry>) =>
    update({ education: education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });
  const addEdu = () => update({ education: [...education, { id: `e-${Date.now()}`, school: "", credential: "", year: "" }] });
  const removeEdu = (id: string) => update({ education: education.filter((e) => e.id !== id) });

  return (
    <SectionCard
      id="timeline"
      step={5}
      kicker="Experience & education · optional"
      title="Your background, in order"
      note="A familiar timeline for context — it seeds your interview and shows employers the shape of your path. It's never taken as proof; where you studied or worked stays out of scoring."
    >
      {/* ── Work history ── */}
      <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--ink)]">
        <Briefcase className="h-4 w-4 text-[var(--ink-3)]" aria-hidden /> Work history
      </div>
      <div className="mt-3 grid gap-4">
        {work.map((w, i) => {
          const current = w.end === null;
          return (
            <div key={w.id} className="rounded-[1.25rem] border p-5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                  Role {i + 1}
                </span>
                <button type="button" onClick={() => removeWork(w.id)} aria-label={`Remove role ${i + 1}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--danger)]">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <FieldLabel>Role / title</FieldLabel>
                  <input value={w.role} onChange={(e) => setWork(i, { role: e.target.value })} placeholder="Backend Engineer" className={INPUT_CLS} style={INPUT_STYLE} />
                </label>
                <label className="block">
                  <FieldLabel>Company</FieldLabel>
                  <input value={w.company} onChange={(e) => setWork(i, { company: e.target.value })} placeholder="Acme Fintech" className={INPUT_CLS} style={INPUT_STYLE} />
                </label>
                <label className="block">
                  <FieldLabel>Start</FieldLabel>
                  <input value={w.start} onChange={(e) => setWork(i, { start: e.target.value })} placeholder="2021" className={INPUT_CLS} style={INPUT_STYLE} />
                </label>
                <label className="block">
                  <FieldLabel>End</FieldLabel>
                  <input value={w.end ?? ""} onChange={(e) => setWork(i, { end: e.target.value })} disabled={current} placeholder="2024" className={`${INPUT_CLS} disabled:opacity-50`} style={INPUT_STYLE} />
                  <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[var(--ink-2)]">
                    <input type="checkbox" checked={current} onChange={(e) => setWork(i, { end: e.target.checked ? null : "" })} /> I work here now
                  </label>
                </label>
              </div>
              <label className="mt-4 block">
                <FieldLabel hint="one line — the interview digs into the rest">What you did there</FieldLabel>
                <textarea value={w.summary} onChange={(e) => setWork(i, { summary: e.target.value })} rows={2} placeholder="Owned the payments reliability work; cut incident rate by half." className={`${INPUT_CLS} resize-y leading-6`} style={INPUT_STYLE} />
              </label>
            </div>
          );
        })}
        <button type="button" onClick={addWork} className="group flex cursor-pointer items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-5 py-4 text-[14px] font-bold text-[var(--ink-2)] transition-colors hover:border-solid hover:bg-white hover:text-[var(--iris-ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden />
          {work.length === 0 ? "Add a role" : "Add another role"}
        </button>
      </div>

      {/* ── Education ── */}
      <div className="mt-7 flex items-center gap-2 text-[13px] font-bold text-[var(--ink)]">
        <GraduationCap className="h-4 w-4 text-[var(--ink-3)]" aria-hidden /> Education
      </div>
      <div className="mt-3 grid gap-4">
        {education.map((ed, i) => (
          <div key={ed.id} className="rounded-[1.25rem] border p-5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                School {i + 1}
              </span>
              <button type="button" onClick={() => removeEdu(ed.id)} aria-label={`Remove school ${i + 1}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--danger)]">
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
              <label className="block">
                <FieldLabel>School</FieldLabel>
                <input value={ed.school} onChange={(e) => setEdu(i, { school: e.target.value })} placeholder="State University" className={INPUT_CLS} style={INPUT_STYLE} />
              </label>
              <label className="block">
                <FieldLabel>Credential</FieldLabel>
                <input value={ed.credential} onChange={(e) => setEdu(i, { credential: e.target.value })} placeholder="B.Tech · Computer Science" className={INPUT_CLS} style={INPUT_STYLE} />
              </label>
              <label className="block">
                <FieldLabel>Year</FieldLabel>
                <input value={ed.year} onChange={(e) => setEdu(i, { year: e.target.value })} placeholder="2020" className={INPUT_CLS} style={INPUT_STYLE} />
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={addEdu} className="group flex cursor-pointer items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-5 py-4 text-[14px] font-bold text-[var(--ink-2)] transition-colors hover:border-solid hover:bg-white hover:text-[var(--iris-ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden />
          {education.length === 0 ? "Add education" : "Add another"}
        </button>
      </div>
    </SectionCard>
  );
}
