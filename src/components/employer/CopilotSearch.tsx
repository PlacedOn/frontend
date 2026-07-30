"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Search, X, Plus, ShieldCheck, ShieldAlert, Quote, ArrowRight, MapPin, Clock, Sparkles,
} from "lucide-react";
import type { Band } from "@/lib/v1";
import {
  localCopilotSearch, SUGGESTED_SKILLS, type HrSearchResult, type HrMatch,
} from "@/lib/employer/copilotLocal";

const EASE = [0.16, 1, 0.3, 1] as const;

const BAND_FG: Record<Band, string> = {
  supported: "var(--ok)",
  emerging: "var(--iris-ink)",
  needs_more_evidence: "var(--warn)",
};
const BAND_LABEL: Record<Band, string> = {
  supported: "Strong evidence",
  emerging: "Emerging evidence",
  needs_more_evidence: "Needs more evidence",
};

const EXAMPLES = [
  "Junior backend who can debug production payment issues",
  "Someone who stays calm and owns an incident end to end",
  "Frontend engineer with real product sense",
];

/**
 * HR Copilot — describe a role in plain words, tag the must-have skills, and get
 * candidates ranked by evidenced fit. The fairness firewall refuses protected-
 * class asks and strips pedigree terms. Runs on the local evidence pool today;
 * the same UI routes through v1.copilotSearch once the backend is connected.
 */
export function CopilotSearch() {
  const reduce = useReducedMotion();
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [res, setRes] = useState<HrSearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setTags((prev) => (prev.some((x) => x.toLowerCase() === t.toLowerCase()) ? prev : [...prev, t]));
    setDraft("");
  };
  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const canRun = prompt.trim().length >= 3 || tags.length > 0;

  const run = () => {
    if (!canRun) return;
    setBusy(true);
    // Local, synchronous ranking today; swap to v1.copilotSearch when live.
    const out = localCopilotSearch(prompt, tags);
    // Small delay so the state change reads as a real search, not a flicker.
    window.setTimeout(() => {
      setRes(out);
      setBusy(false);
    }, reduce ? 0 : 260);
  };

  const suggestions = SUGGESTED_SKILLS.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div className="space-y-5">
      {/* ── Composer ─────────────────────────────────────────────── */}
      <div className="glass rounded-[var(--r-card)] p-5 md:p-6">
        <label htmlFor="hr-prompt" className="text-[13px] font-semibold text-[var(--ink-2)]">
          Describe the role — the work and behaviours, never identity
        </label>
        <textarea
          id="hr-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
          }}
          rows={2}
          placeholder="e.g. a backend engineer who can debug a production payment outage and reason about rollbacks…"
          className="mt-2 w-full resize-none rounded-[var(--r-btn)] border bg-[var(--glass)] px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-[var(--ink-3)] focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)" }}
        />

        {/* example prompts */}
        <div className="mt-2.5 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="rounded-full px-3 py-1 text-[12px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--iris-ink)]"
              style={{ background: "var(--mist)" }}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* must-have skills — tags input */}
        <div className="mt-5">
          <p className="text-[13px] font-semibold text-[var(--ink-2)]">Must-have skills</p>
          <div
            className="mt-2 flex flex-wrap items-center gap-2 rounded-[var(--r-btn)] border bg-[var(--glass)] px-2.5 py-2 transition-colors focus-within:border-[var(--iris)]"
            style={{ borderColor: "var(--glass-line-hi)" }}
            onClick={() => inputRef.current?.focus()}
          >
            <AnimatePresence initial={false}>
              {tags.map((t) => (
                <motion.span
                  key={t}
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-[13px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))" }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(t); }}
                    aria-label={`Remove ${t}`}
                    className="grid size-4 place-items-center rounded-full bg-white/25 transition-colors hover:bg-white/40"
                  >
                    <X size={11} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              placeholder={tags.length ? "Add another…" : "Type a skill and press Enter"}
              className="min-w-[10ch] flex-1 bg-transparent px-1.5 py-1 text-[14px] outline-none placeholder:text-[var(--ink-3)]"
            />
          </div>

          {/* tag selector — suggested skills */}
          {suggestions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] font-medium text-[var(--ink-2)] transition-all hover:-translate-y-0.5 hover:text-[var(--iris-ink)] active:scale-[0.97]"
                  style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)" }}
                >
                  <Plus size={12} /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--ink-3)]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--iris)]" />
            Protected-class filters are refused; pedigree terms are stripped. Every result is backed by the candidate&rsquo;s own approved evidence.
          </p>
          <button
            type="button"
            onClick={run}
            disabled={!canRun || busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            <Search size={16} /> {busy ? "Searching…" : "Find candidates"}
          </button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      {res?.refused && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="rounded-[var(--r-card)] p-5"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}
        >
          <p className="flex items-start gap-2 text-[14px] font-semibold text-[var(--bad)]">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" /> {res.refused}
          </p>
        </motion.div>
      )}

      {res && !res.refused && (
        <div className="space-y-4">
          {res.stripped.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-[var(--ink-3)]">Removed from your ask:</span>
              {res.stripped.map((s) => (
                <span
                  key={s}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold line-through"
                  style={{ background: "var(--mist)", color: "var(--ink-3)" }}
                  title="Removed — PlacedOn doesn't rank on pedigree"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <p className="text-[13px] font-semibold text-[var(--ink-2)]">
            {res.matches.length} candidate{res.matches.length === 1 ? "" : "s"} ranked by evidenced fit
          </p>

          {res.matches.map((m, i) => (
            <ResultCard key={m.candidate.id} match={m} index={i} reduce={!!reduce} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ match, index, reduce }: { match: HrMatch; index: number; reduce: boolean }) {
  const c = match.candidate;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(index * 0.06, 0.3), ease: EASE }}
      className="glass rounded-[var(--r-card)] p-5"
    >
      <div className="flex items-start gap-4">
        {/* match score */}
        <div className="shrink-0 text-center">
          <div className="text-[26px] font-extrabold leading-none tracking-tight text-[var(--iris-ink)]">{match.score}</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">% fit</div>
          <div className="mx-auto mt-1.5 h-1.5 w-12 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <span className="block h-full rounded-full" style={{ width: `${match.score}%`, background: "linear-gradient(90deg, var(--iris-soft), var(--iris))" }} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[15px] font-bold text-[var(--ink)]">{c.role}</p>
            <span className="text-[12px] font-bold" style={{ color: BAND_FG[c.band] }}>{BAND_LABEL[c.band]}</span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-[var(--ink-3)]">
            <span className="flex items-center gap-1"><MapPin size={12} /> {c.location}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {c.availableFrom}</span>
            <span className="font-mono">· {c.id}</span>
          </p>

          {/* matched / missing skills */}
          {(match.matched.length > 0 || match.missing.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {match.matched.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  <ShieldCheck size={11} /> {s}
                </span>
              ))}
              {match.missing.map((s) => (
                <span key={s} className="rounded-full px-2.5 py-0.5 text-[12px] font-medium text-[var(--ink-3)]" style={{ background: "var(--mist)" }} title="Not yet evidenced">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* grounding evidence quote */}
          <blockquote className="mt-3 flex gap-2 rounded-[var(--r-btn)] border-l-2 px-3 py-2 text-[13px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris)", background: "var(--glass)" }}>
            <Quote size={13} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" /> {c.quote}
          </blockquote>

          <Link
            href={`/employer/candidate/${c.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--iris-ink)] transition-transform hover:translate-x-0.5"
          >
            <Sparkles size={14} /> View evidence report <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
