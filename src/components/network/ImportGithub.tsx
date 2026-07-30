"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GitBranch, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { v1, V1Error, type ImportGithubSummary } from "@/lib/v1";

type Props = {
  live: boolean;
  onImported: (summary: ImportGithubSummary) => void;
};

type State =
  | { kind: "idle" }
  | { kind: "importing" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

function summarise(s: ImportGithubSummary): string {
  if (s.imported === 0) {
    if (s.skipped_existing > 0) return "You're already up to date — those repos are on your profile.";
    if (s.skipped_flagged > 0) return "Nothing new to add from there just yet.";
    return "No public repositories found under that handle.";
  }
  const repos = `${s.imported} ${s.imported === 1 ? "repo is" : "repos are"} now verified evidence`;
  const skills = s.linked > 0 ? `, mapped to ${s.linked} ${s.linked === 1 ? "skill" : "skills"}` : "";
  return `${repos}${skills} — watch your ring move.`;
}

/**
 * The way in. Paste a GitHub handle; public repos become verified proof-of-work
 * that feeds the same readiness engine. The loading state stays scoped to this
 * one control (never a global spinner), and success speaks in a human voice.
 */
export function ImportGithub({ live, onImported }: Props) {
  const reduce = useReducedMotion();
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const username = handle.trim().replace(/^@/, "");
    if (!username || state.kind === "importing") return;
    setState({ kind: "importing" });
    try {
      const summary = await v1.importGithub(username);
      setState({ kind: "done", message: summarise(summary) });
      onImported(summary);
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof V1Error ? err.message : "We couldn't reach GitHub just now. Please try again.",
      });
    }
  }

  return (
    <section
      id="import"
      aria-labelledby="import-heading"
      className="glass flex flex-col gap-4 rounded-[var(--r-card)] p-6 md:flex-row md:items-center md:justify-between md:p-7"
    >
      <div className="max-w-[42ch]">
        <p className="eyebrow flex items-center gap-2">
          <GitBranch size={13} aria-hidden /> Bring in your work
        </p>
        <h2 id="import-heading" className="mt-2 text-[clamp(1.2rem,1rem+0.7vw,1.5rem)] font-extrabold tracking-tight text-[var(--ink)]">
          Past the resume. Into the work.
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          Your public repositories become verified evidence — real, yours, and counted toward your readiness.
        </p>
      </div>

      <div className="w-full md:w-auto md:min-w-[320px]">
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2.5" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}>
            <span className="text-[14px] font-semibold text-[var(--ink-3)]">@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your-github"
              aria-label="Your GitHub username"
              disabled={!live || state.kind === "importing"}
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={!live || state.kind === "importing" || !handle.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 active:scale-[0.95] disabled:opacity-45"
            style={{ background: "var(--iris)" }}
            aria-label="Import from GitHub"
          >
            {state.kind === "importing" ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <ArrowRight size={17} aria-hidden />}
          </button>
        </form>

        <div className="mt-2 min-h-[20px] px-1">
          <AnimatePresence mode="wait">
            {!live ? (
              <p className="text-[12px] font-medium text-[var(--ink-3)]">Connect the backend to import your work.</p>
            ) : state.kind === "done" ? (
              <motion.p
                key="done"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--iris-ink)]"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ShieldCheck size={14} aria-hidden /> {state.message}
              </motion.p>
            ) : state.kind === "error" ? (
              <motion.p key="err" className="text-[12.5px] font-semibold text-[var(--warn)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {state.message}
              </motion.p>
            ) : (
              <p className="text-[12px] font-medium text-[var(--ink-3)]">Public repos only. Nothing private is ever read.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
