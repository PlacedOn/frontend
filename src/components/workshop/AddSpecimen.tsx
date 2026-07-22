"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, Loader2, ShieldCheck, X } from "lucide-react";
import { addArtifact } from "@/app/candidate/network/actions";
import { ARTIFACT_KINDS, ARTIFACT_KIND_LABEL } from "@/lib/network/schema";
import type { ArtifactKind } from "@/lib/network/types";

type Props = {
  /** Called after a successful write so the shelf can re-read. */
  onAdded: () => void;
};

type State =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

/**
 * The third door onto the shelf, for work that lives nowhere we can crawl —
 * a college project, a client site, a PDF write-up, work behind a company
 * login. Without it the only routes in are the interview and GitHub import,
 * which silently excludes anyone whose work simply isn't on GitHub.
 *
 * What gets added is an unsealed self-claim, and the UI says so: it is not
 * verified, and it must not read as though it were.
 */
export function AddSpecimen({ onAdded }: Props) {
  const reduce = useReducedMotion();
  const [isOpen, setOpen] = useState(false);
  const [kind, setKind] = useState<ArtifactKind>("project");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  function reset() {
    setTitle("");
    setUrl("");
    setSummary("");
    setKind("project");
    setState({ kind: "idle" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || state.kind === "saving") return;
    setState({ kind: "saving" });

    const result = await addArtifact({ kind, title, url, summary });
    if (result.error) {
      setState({ kind: "error", message: result.error });
      return;
    }

    setState({ kind: "done", message: "Added to your shelf — unsealed until there's proof behind it." });
    onAdded();
    window.setTimeout(() => {
      setOpen(false);
      reset();
    }, 1400);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[13px] border px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition-transform active:scale-[0.97]"
        style={{ background: "var(--mist)", borderColor: "var(--glass-line)" }}
      >
        <Plus size={16} aria-hidden /> Add work by hand
      </button>
    );
  }

  return (
    <motion.section
      aria-labelledby="add-specimen-heading"
      className="glass rounded-[var(--r-card)] p-6"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 0.68, 0.31, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Plus size={13} aria-hidden /> Add work by hand
          </p>
          <h2
            id="add-specimen-heading"
            className="mt-2 text-[clamp(1.1rem,1rem+0.5vw,1.35rem)] font-extrabold tracking-tight text-[var(--ink)]"
          >
            Not everything lives on GitHub.
          </h2>
          <p className="mt-1.5 max-w-[52ch] text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            A college project, a client site, a write-up, work behind a company login — add
            it here. It joins your shelf unsealed, and seals when there is something we can
            point to.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          style={{ background: "var(--mist)" }}
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-[var(--ink-2)]">What kind of work</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ArtifactKind)}
              disabled={state.kind === "saving"}
              className="rounded-[12px] border px-3 py-2.5 text-[14px] font-semibold text-[var(--ink)] outline-none disabled:opacity-60"
              style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
            >
              {ARTIFACT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {ARTIFACT_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-[var(--ink-2)]">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder="Final-year project: crop price predictor"
              disabled={state.kind === "saving"}
              className="rounded-[12px] border px-3 py-2.5 text-[14px] font-semibold text-[var(--ink)] outline-none placeholder:font-normal placeholder:text-[var(--ink-3)] disabled:opacity-60"
              style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-[var(--ink-2)]">
            Link <span className="font-normal text-[var(--ink-3)]">— optional</span>
          </span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            maxLength={2000}
            placeholder="https://…"
            disabled={state.kind === "saving"}
            className="rounded-[12px] border px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] disabled:opacity-60"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-[var(--ink-2)]">
            What you actually did <span className="font-normal text-[var(--ink-3)]">— optional</span>
          </span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="The part you built, the problem it solved, what you'd do differently."
            disabled={state.kind === "saving"}
            className="resize-y rounded-[12px] border px-3 py-2.5 text-[14px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] disabled:opacity-60"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          />
        </label>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={state.kind === "saving" || !title.trim()}
            className="inline-flex items-center gap-2 rounded-[13px] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-45"
            style={{ background: "var(--iris)", boxShadow: "0 8px 22px -8px rgba(105,34,245,.6)" }}
          >
            {state.kind === "saving" ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <Plus size={15} aria-hidden />
            )}
            Add to my shelf
          </button>

          <div className="min-h-[20px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {state.kind === "done" ? (
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
                <motion.p
                  key="err"
                  className="text-[12.5px] font-semibold text-[#b45309]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {state.message}
                </motion.p>
              ) : (
                <p className="text-[12px] font-medium text-[var(--ink-3)]">
                  Added by you — shown as unsealed until it can be verified.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </motion.section>
  );
}
