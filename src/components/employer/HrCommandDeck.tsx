"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Sparkles, Send, ShieldCheck, ShieldAlert, Quote, ArrowRight, Check, Loader2,
  BriefcaseBusiness, Mic, Target, MapPin, FileText, Users, Pencil, Wand2, Rocket, Upload,
} from "lucide-react";
import { synthesizeRole, type HrCreateResult, type HrMatch } from "@/lib/employer/copilotLocal";
import { IconTile } from "@/components/ui/IconTile";

const EASE = [0.16, 1, 0.3, 1] as const;
const SENIORITY = ["Junior", "Mid", "Senior", "Lead"];
const WORKTYPES = ["Full-time", "Contract"];
const QUICK = [
  "Backend engineer who can debug a production payment outage and own the incident",
  "Frontend engineer with real product sense who ships behind flags",
  "Data engineer for streaming pipelines, calm on-call, Hyderabad hybrid",
];
const STAGES = ["Reading the role", "Building the Role-DNA", "Drafting the interview", "Matching candidates"];

type Phase = "idle" | "building" | "done";

/**
 * HR command deck (bolt-inspired, ported to Frost Luxe). HR describes a role in
 * one prompt; the AI *creates* the assessment (Role-DNA + a tailored interview)
 * and *finds* evidence-backed candidates — streamed like a build. Local synthesis
 * today (synthesizeRole); swaps to the live role-DNA + matching endpoints later.
 */
export function HrCommandDeck() {
  const reduce = useReducedMotion();
  const [prompt, setPrompt] = useState("");
  const [seniority, setSeniority] = useState("Mid");
  const [workType, setWorkType] = useState("Full-time");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<HrCreateResult | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Streamed "create": advance the build stages, then reveal the result.
  useEffect(() => {
    if (phase !== "building") return;
    if (stage >= STAGES.length) {
      const t = setTimeout(() => setPhase("done"), reduce ? 0 : 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), reduce ? 100 : 620);
    return () => clearTimeout(t);
  }, [phase, stage, reduce]);

  const start = () => {
    if (prompt.trim().length < 8) return;
    setResult(synthesizeRole(prompt, seniority, workType));
    setStage(0);
    setPhase("building");
  };
  const reset = () => {
    setPhase("idle");
    setStage(0);
  };

  return (
    <div className="relative">
      {/* iris glow ray (bolt ray, light) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-[460px] overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[560px] w-[960px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(139,84,255,0.26) 0%, rgba(105,34,245,0.13) 22%, transparent 62%)", filter: "blur(26px)" }}
        />
      </div>

      <div className="relative">
        {phase === "idle" ? (
          <PromptDeck
            prompt={prompt}
            setPrompt={setPrompt}
            taRef={taRef}
            seniority={seniority}
            setSeniority={setSeniority}
            workType={workType}
            setWorkType={setWorkType}
            onStart={start}
            reduce={!!reduce}
          />
        ) : (
          <div className="space-y-5">
            {/* the request, echoed */}
            <div className="flex items-start justify-between gap-3">
              <div className="glass max-w-2xl rounded-[18px] rounded-tl-md px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Your brief</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ink)]">{prompt}</p>
                <p className="mt-1.5 text-[12px] text-[var(--ink-3)]">{seniority} · {workType}</p>
              </div>
              <button type="button" onClick={reset} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
                <Pencil size={13} /> New brief
              </button>
            </div>

            <BuildLog stage={stage} reduce={!!reduce} />

            {phase === "done" && result && <Results result={result} reduce={!!reduce} />}
          </div>
        )}
      </div>
    </div>
  );
}

function PromptDeck({
  prompt, setPrompt, taRef, seniority, setSeniority, workType, setWorkType, onStart, reduce,
}: {
  prompt: string; setPrompt: (v: string) => void; taRef: React.RefObject<HTMLTextAreaElement | null>;
  seniority: string; setSeniority: (v: string) => void; workType: string; setWorkType: (v: string) => void;
  onStart: () => void; reduce: boolean;
}) {
  const canRun = prompt.trim().length >= 8;
  const fileRef = useRef<HTMLInputElement>(null);
  const [jdName, setJdName] = useState<string | null>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJdName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPrompt(String(reader.result || "").slice(0, 6000));
    reader.readAsText(file);
  };
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip"><Wand2 size={14} className="text-[var(--iris)]" /> HR Copilot</span>
        <h2 className="mt-4 text-[clamp(1.7rem,1.3rem+1.6vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--ink)]">
          Paste a JD. <span className="grad-iris">We build the interview and find the people.</span>
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Drop in a job description — or describe the role in plain words. The Copilot drafts the assessment and returns candidates ranked by evidence, never identity.
        </p>
      </div>

      {/* the prompt box */}
      <div className="relative mx-auto mt-7 max-w-2xl">
        <div className="absolute -inset-[1.5px] rounded-[22px] opacity-70" style={{ background: "linear-gradient(135deg, var(--iris-line), transparent 60%)" }} aria-hidden />
        <div
          className="relative rounded-[22px] border bg-[var(--glass-hi)] p-2.5"
          style={{ borderColor: "var(--glass-line-hi)", boxShadow: "0 24px 60px -30px rgba(40,26,120,0.4), inset 0 1px 0 rgba(255,255,255,0.75)" }}
        >
          <textarea
            ref={taRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onStart(); } }}
            rows={3}
            placeholder="Paste a full job description here — or describe the role in plain words…"
            aria-label="Job description or role brief"
            className="w-full resize-none bg-transparent px-3 pt-3 pb-2 text-[15px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
          />
          <div className="flex flex-wrap items-center gap-2 px-1.5 pb-1 pt-1">
            <input ref={fileRef} type="file" accept=".txt,.md,.text" className="hidden" onChange={onFile} />
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)]">
              <Upload size={14} /> {jdName ? "Replace JD" : "Upload JD"}
            </button>
            {jdName && <span className="max-w-[150px] truncate rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{jdName}</span>}
            <Selector label="Seniority" value={seniority} options={SENIORITY} onChange={setSeniority} />
            <Selector label="Type" value={workType} options={WORKTYPES} onChange={setWorkType} />
            <div className="flex-1" />
            <button
              type="button"
              onClick={onStart}
              disabled={!canRun}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
            >
              Create &amp; find <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* quick starts */}
      <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setPrompt(q)} className="rounded-full border px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--iris-ink)]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            {q.length > 52 ? `${q.slice(0, 52)}…` : q}
          </button>
        ))}
      </div>

      <p className="mx-auto mt-5 flex max-w-2xl items-start justify-center gap-1.5 text-center text-[12px] leading-relaxed text-[var(--ink-3)]">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--iris)]" />
        Protected-class filters are refused and pedigree terms stripped. Every candidate is ranked by their own approved evidence.
      </p>
    </motion.div>
  );
}

function Selector({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--mist)]" aria-expanded={open}>
        <span className="text-[var(--ink-3)]">{label}:</span> {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 min-w-[130px] rounded-[12px] border p-1" style={{ background: "var(--glass-hi)", borderColor: "var(--glass-line-hi)", backdropFilter: "blur(16px)", boxShadow: "0 18px 40px -18px rgba(40,26,120,0.4)" }}>
            {options.map((o) => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }} className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors hover:bg-[var(--iris-ghost)]" style={{ color: o === value ? "var(--iris-ink)" : "var(--ink-2)" }}>
                {o} {o === value && <Check size={13} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BuildLog({ stage, reduce }: { stage: number; reduce: boolean }) {
  return (
    <div className="glass max-w-2xl rounded-[18px] rounded-tl-md p-4">
      <ul className="space-y-2.5">
        {STAGES.map((s, i) => {
          const done = i < stage;
          const active = i === stage;
          if (i > stage) return null;
          return (
            <motion.li
              key={s}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-2.5 text-[13.5px]"
            >
              {done ? (
                <span className="grid size-5 place-items-center rounded-full" style={{ background: "rgba(16,185,129,0.14)", color: "#047857" }}><Check size={13} /></span>
              ) : (
                <Loader2 size={16} className={reduce ? "text-[var(--iris)]" : "animate-spin text-[var(--iris)]"} />
              )}
              <span className={done ? "font-medium text-[var(--ink-2)]" : "font-semibold text-[var(--ink)]"}>{s}{active ? "…" : ""}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function Results({ result, reduce }: { result: HrCreateResult; reduce: boolean }) {
  if (result.refused) {
    return (
      <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[var(--r-card)] p-5" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}>
        <p className="flex items-start gap-2 text-[14px] font-semibold text-[#b91c1c]"><ShieldAlert size={18} className="mt-0.5 shrink-0" /> {result.refused}</p>
      </motion.div>
    );
  }
  const { role, interview, matches, stripped } = result;
  return (
    <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="space-y-4">
      {stripped.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold text-[var(--ink-3)]">Removed from your brief:</span>
          {stripped.map((s) => (<span key={s} className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold line-through" style={{ background: "var(--mist)", color: "var(--ink-3)" }}>{s}</span>))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Role-DNA */}
        <div className="glass rounded-[var(--r-card)] p-5">
          <div className="flex items-center gap-2.5">
            <IconTile icon={FileText} tone="iris" size="md" />
            <div><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Role-DNA · created</p><p className="text-[15.5px] font-bold text-[var(--ink)]">{role.title}</p></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
            <Meta label={role.seniority} /><Meta label={role.workType} />{role.location && <Meta label={role.location} icon />}
          </div>
          <p className="mt-4 text-[12px] font-semibold text-[var(--ink-3)]">Must have</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {role.mustHave.map((s) => (<span key={s} className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{s}</span>))}
          </div>
          <p className="mt-3 text-[12px] font-semibold text-[var(--ink-3)]">Behaviors the interview probes</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {role.behaviors.map((b) => (<span key={b} className="rounded-full px-2.5 py-0.5 text-[12px] font-medium" style={{ background: "var(--mist)", color: "var(--ink-2)" }}>{b}</span>))}
          </div>
        </div>

        {/* Interview blueprint */}
        <div className="glass rounded-[var(--r-card)] p-5">
          <div className="flex items-center gap-2.5">
            <IconTile icon={Mic} tone="iris" size="md" />
            <div><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Interview · drafted</p><p className="text-[15.5px] font-bold text-[var(--ink)]">{interview.minutes}-min adaptive conversation</p></div>
          </div>
          <ul className="mt-3 space-y-2.5">
            {interview.topics.map((t) => (
              <li key={t.label} className="flex items-start gap-2">
                <Target size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
                <div><p className="text-[13.5px] font-semibold text-[var(--ink)]">{t.label}</p><p className="text-[12px] leading-snug text-[var(--ink-3)]">{t.probes}</p></div>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            <Rocket size={14} /> Publish role — candidates can interview
          </button>
        </div>
      </div>

      {/* Matched candidates */}
      <div>
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-2)]"><Users size={15} className="text-[var(--iris-ink)]" /> {matches.length} candidate{matches.length === 1 ? "" : "s"} matched by evidenced fit</p>
        <div className="mt-3 space-y-3">
          {matches.map((m, i) => (<CandidateRow key={m.candidate.id} match={m} index={i} reduce={reduce} />))}
        </div>
      </div>
    </motion.div>
  );
}

function Meta({ label, icon }: { label: string; icon?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold" style={{ background: "var(--glass)", border: "1px solid var(--glass-line-hi)", color: "var(--ink-2)" }}>
      {icon && <MapPin size={12} />} {label}
    </span>
  );
}

function CandidateRow({ match, index, reduce }: { match: HrMatch; index: number; reduce: boolean }) {
  const c = match.candidate;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: reduce ? 0 : Math.min(index * 0.05, 0.25), ease: EASE }}
      className="glass rounded-[var(--r-card)] p-4"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 text-center">
          <div className="text-[22px] font-extrabold leading-none tracking-tight text-[var(--iris-ink)]">{match.score}</div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">% fit</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[14.5px] font-bold text-[var(--ink)]">{c.role}</p>
            <span className="text-[12px] text-[var(--ink-3)]">{c.location} · {c.availableFrom}</span>
          </div>
          {match.matched.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.matched.map((s) => (<span key={s} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}><ShieldCheck size={10} /> {s}</span>))}
            </div>
          )}
          <blockquote className="mt-2 flex gap-2 rounded-[var(--r-btn)] border-l-2 px-3 py-1.5 text-[12.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris)", background: "var(--glass)" }}>
            <Quote size={12} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" /> {c.quote}
          </blockquote>
          <Link href={`/employer/candidate/${c.id}`} className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--iris-ink)] transition-transform hover:translate-x-0.5">
            <Sparkles size={13} /> View evidence report <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
