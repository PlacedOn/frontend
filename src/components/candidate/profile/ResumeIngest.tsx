"use client";

/*
 * "Start from your resume" — turns a resume into Card A claims to VERIFY, and
 * makes the pedigree/PII redaction the hero moment. The resume is never believed
 * or scored: extracted skills become claims flagged for the interview, and the
 * server strips college/name/age/address before anything surfaces. The UI shows
 * only the `redacted` list (what was removed) — never the removed fields.
 */

import { useState, useRef, type ChangeEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, FileText, Sparkles, Check, Loader2, Upload } from "lucide-react";
import {
  isLiveBackend,
  v1,
  V1Error,
  type CandidateProfile,
  type ClaimedSkill,
  type ResumeParseResult,
} from "@/lib/v1";
import { MOCK_RESUME_PARSE } from "@/lib/mock/resumeParse";
import { SectionCard, INPUT_CLS, INPUT_STYLE } from "./kit";

const TEXT_FILE = /\.(txt|md|markdown|text)$/i;

export function ResumeIngest({
  profile,
  update,
}: {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
}) {
  const reduce = useReducedMotion();
  const live = isLiveBackend();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeParseResult | null>(null);
  const [added, setAdded] = useState(0);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!TEXT_FILE.test(file.name)) {
      setError("For PDF or Word files, paste the text below — we don't upload your file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
    setError(null);
  };

  // Merge extracted claims/highlights into the builder, de-duped by label/title.
  const apply = (r: ResumeParseResult) => {
    const haveSkill = new Set(profile.claimed_skills.map((s) => s.label.toLowerCase()));
    const newSkills: ClaimedSkill[] = r.claimed_skills
      .filter((c) => !haveSkill.has(c.label.toLowerCase()))
      .map((c) => ({ skill_id: c.skill_id, label: c.label, self_rating: c.self_rating, wants_to_verify: true }));
    const haveHi = new Set(profile.highlights.map((h) => h.title.toLowerCase()));
    const newHi = r.highlights.filter((h) => !haveHi.has(h.title.toLowerCase()));
    update({
      claimed_skills: [...profile.claimed_skills, ...newSkills],
      highlights: [...profile.highlights, ...newHi],
    });
    setAdded(newSkills.length + newHi.length);
  };

  const parse = async () => {
    if (!text.trim() || parsing) return;
    setParsing(true);
    setError(null);
    try {
      const r = live
        ? await v1.parseResume({ text: text.trim(), filename: null })
        : await new Promise<ResumeParseResult>((res) => setTimeout(() => res(MOCK_RESUME_PARSE), 650));
      setResult(r);
      apply(r);
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Couldn't read that resume. Try pasting the text again.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <SectionCard
      id="resume"
      step={0}
      kicker="Start from your resume · optional"
      title="Turn your resume into claims to verify"
      note="We read it for what you've done, then throw away everything that could bias an evaluator. Nothing here is taken as proof — your interview is where claims become evidence."
    >
      {!result ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste your resume text here…"
            className={`${INPUT_CLS} resize-y leading-6`}
            style={INPUT_STYLE}
          />
          <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.text" onChange={onFile} className="hidden" />
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={parse}
              disabled={!text.trim() || parsing}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
            >
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {parsing ? "Reading…" : "Turn my resume into claims"}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-4 py-2.5 text-[13.5px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-white"
              style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
            >
              <Upload className="h-4 w-4" /> Upload .txt
            </button>
          </div>
          {error && <p className="mt-3 text-[13px] font-semibold text-[var(--warn)]">{error}</p>}
        </>
      ) : (
        <div className="flex flex-col gap-5">
          {/* The redaction reveal — the promise being kept */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[1.5rem] p-6"
            style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: "var(--iris)", opacity: 0.1, filter: "blur(60px)" }} />
            <div className="relative flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: "var(--iris)", boxShadow: "var(--shadow-iris)" }}>
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[18px] font-bold tracking-tight text-[var(--ink)]">
                  We removed these so they can&rsquo;t be used to judge you
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {result.redacted.map((r) => (
                    <li
                      key={r}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)]"
                      style={{ borderColor: "var(--iris-line)" }}
                    >
                      <span className="text-[var(--iris)]">✕</span> {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-3.5 text-[13.5px] leading-6 text-[var(--ink-2)]">{result.note}</p>
              </div>
            </div>
          </motion.div>

          {/* What we kept — claims to verify */}
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--ok)]">
              <Check className="h-4 w-4" /> Added {added} {added === 1 ? "item" : "items"} to your profile as claims to verify
            </p>
            <ul className="flex flex-col gap-2">
              {result.claimed_skills.map((c) => (
                <li key={c.label} className="rounded-[1rem] border p-3.5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14.5px] font-bold text-[var(--ink)]">{c.label}</span>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                      you said
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-5 text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                    from your resume: {c.source_line}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3.5 flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
              <FileText className="h-4 w-4 text-[var(--ink-3)]" />
              Review and edit them below — the interview is where each one becomes <em className="not-italic font-semibold text-[var(--ink)]">shown</em>.
            </p>
            <button
              type="button"
              onClick={() => { setResult(null); setText(""); setAdded(0); }}
              className="mt-4 cursor-pointer text-[13px] font-semibold text-[var(--iris-ink)] underline underline-offset-2 hover:text-[var(--iris)]"
            >
              Paste another resume
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
