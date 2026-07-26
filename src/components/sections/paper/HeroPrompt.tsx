"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUp, ArrowRight, ShieldCheck } from "lucide-react";
import { localCopilotSearch, type HrSearchResult } from "@/lib/employer/copilotLocal";

/**
 * The hero as a working product surface — describe who you want to hire and get
 * evidence-ranked candidates right here, no sign-in (OpenAI/Scale "describe →
 * results" pattern). Runs the real local copilot, so the fairness firewall shows
 * live: protected-class asks are refused, pedigree is stripped. This IS the
 * product, not a picture of it.
 */

type Mode = "hire" | "interview";

const PLACEHOLDERS = [
  "Backend engineers who've owned a production incident",
  "A product engineer who ships under ambiguity",
  "Data engineers strong on pipelines and reliability",
  "Someone who mentors and communicates clearly",
];

const CHIPS = [
  "Backend engineers who've owned incidents",
  "Product sense and ownership",
  "Data pipelines and reliability",
];

const BAND_LABEL: Record<string, string> = { supported: "Supported", emerging: "Emerging", needs_more_evidence: "Light" };

export function HeroPrompt() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("hire");
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<HrSearchResult | null>(null);
  const [ph, setPh] = useState(0);

  // Rotating placeholder — a calm hint at what you can ask.
  useEffect(() => {
    if (reduce || mode !== "hire" || draft) return;
    const id = setInterval(() => setPh((p) => (p + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(id);
  }, [reduce, mode, draft]);

  const run = (text: string) => {
    if (mode === "interview") {
      router.push("/pre-interview");
      return;
    }
    const q = text.trim();
    if (q.length < 3) return;
    setResult(localCopilotSearch(q, []));
  };

  const onChip = (label: string) => {
    setDraft(label);
    run(label);
  };

  const placeholder = mode === "interview" ? "Take your adaptive AI interview →" : PLACEHOLDERS[ph];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* mode toggle */}
      <div className="mx-auto mb-4 grid w-fit grid-cols-2 rounded-full border p-1" style={{ borderColor: "var(--glass-line)", background: "var(--white)" }}>
        {(["hire", "interview"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setResult(null); }}
              aria-pressed={active}
              className="relative rounded-full px-5 py-2 text-[13.5px] font-semibold transition-colors"
              style={active ? { color: "var(--white)" } : { color: "var(--ink-2)" }}
            >
              {active && (
                <motion.span layoutId="hero-mode" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full" style={{ background: "var(--ink)" }} aria-hidden />
              )}
              <span className="relative">{m === "hire" ? "I want to hire" : "I want to interview"}</span>
            </button>
          );
        })}
      </div>

      {/* the prompt */}
      <div
        className="flex items-end gap-2 rounded-[20px] border bg-[var(--white)] p-2.5 transition-[border-color,box-shadow] duration-[var(--d-hover)] focus-within:border-[var(--ink)]"
        style={{ borderColor: "var(--glass-line-hi)", boxShadow: "var(--shadow-md)" }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run(draft);
            }
          }}
          rows={1}
          placeholder={placeholder}
          aria-label={mode === "hire" ? "Describe who you want to hire" : "Start your interview"}
          className="max-h-40 min-h-[2.6rem] w-full resize-none bg-transparent px-3 py-2 text-[15.5px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
        />
        <button
          type="button"
          onClick={() => run(draft)}
          aria-label={mode === "hire" ? "Find candidates" : "Start interview"}
          className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[var(--ink)] text-[var(--white)] transition-[background-color,transform] duration-[var(--d-hover)] hover:bg-[color-mix(in_oklab,var(--ink),#000_14%)] active:scale-[0.96]"
        >
          <ArrowUp size={19} />
        </button>
      </div>

      {/* suggestion chips (hire mode) */}
      {mode === "hire" && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChip(c)}
              className="lift rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
              style={{ borderColor: "var(--glass-line)", background: "var(--white)" }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* live results */}
      <AnimatePresence mode="wait">
        {mode === "hire" && result && (
          <motion.div
            key={result.refused ? "refused" : "matches"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-left"
          >
            <Results result={result} reduce={!!reduce} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Results({ result, reduce }: { result: HrSearchResult; reduce: boolean }) {
  if (result.refused) {
    return (
      <div className="glass rounded-[var(--r-card)] p-5">
        <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[var(--ink)]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
          {result.refused}
        </p>
        <p className="mt-2 pl-6 text-[12.5px] text-[var(--ink-3)]">That&rsquo;s the point — PlacedOn matches on evidenced work, never identity.</p>
      </div>
    );
  }

  const top = result.matches.slice(0, 3);
  if (top.length === 0) {
    return <p className="glass rounded-[var(--r-card)] p-5 text-[13.5px] text-[var(--ink-2)]">No one in the sample pool matches that yet. Try different skills or situations.</p>;
  }

  return (
    <div className="glass rounded-[var(--r-card)] p-4">
      {result.stripped.length > 0 && (
        <p className="mb-3 flex items-center gap-1.5 px-1 text-[12px] font-medium text-[var(--ink-3)]">
          <ShieldCheck size={12} /> Ignored {result.stripped.map((s) => `“${s}”`).join(", ")} — we match on work, not pedigree.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {top.map((m, i) => (
          <motion.li
            key={m.candidate.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduce ? 0 : i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 rounded-[var(--r-btn)] border p-3"
            style={{ borderColor: "var(--glass-line)", background: "var(--white)" }}
          >
            <span className="mt-0.5 shrink-0 font-mono text-[15px] font-bold tabular-nums text-[var(--ink)]" style={{ fontFamily: "var(--font-mono)" }}>
              {m.score}%
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                {m.candidate.role} · <span className="font-normal text-[var(--ink-3)]">{m.candidate.location}</span>
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--ink-2)]">
                {BAND_LABEL[m.candidate.band]} evidence · {m.matched.slice(0, 3).join(" · ") || "core engineering"}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
      <Link href="/companies" className="mt-3 inline-flex items-center gap-1.5 px-1 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--iris-ink)]">
        See how hiring teams use this <ArrowRight size={14} />
      </Link>
    </div>
  );
}
