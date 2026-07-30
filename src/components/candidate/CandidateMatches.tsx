"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MapPin, Quote, X, Check, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import type { Confidence, RoleMatch } from "@/lib/types";
import { getCandidateMatches, submitInterest, dismissMatch } from "@/lib/mock/matches";

const CONFIDENCE_STYLE: Record<Confidence, { bg: string; fg: string; label: string }> = {
  high: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)", label: "High confidence" },
  medium: { bg: "rgba(245,134,11,0.12)", fg: "var(--warn)", label: "Medium confidence" },
  low: { bg: "var(--mist)", fg: "var(--ink-3)", label: "Emerging signal" },
};

const UNDO_MS = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Renders children into document.body so overlays escape any parent
 * stacking context (RoutePage's <main> sets a z-index). */
function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Busy = { jobId: string; kind: "interest" | "dismiss" } | null;

export function CandidateMatches() {
  const reduce = useReducedMotion();
  const [matches, setMatches] = useState<RoleMatch[] | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ match: RoleMatch; index: number } | null>(null);
  const [error, setError] = useState<string>("");
  const undoTimer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    getCandidateMatches().then((m) => alive && setMatches(m));
    return () => {
      alive = false;
    };
  }, []);

  const clearUndoTimer = () => {
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = null;
  };
  useEffect(() => clearUndoTimer, []);

  const handleInterest = useCallback(async (jobId: string) => {
    setError("");
    setBusy({ jobId, kind: "interest" });
    setMatches((prev) =>
      prev ? prev.map((m) => (m.job_id === jobId ? { ...m, status: "interested" } : m)) : prev,
    );
    try {
      await submitInterest(jobId);
    } catch {
      setMatches((prev) =>
        prev ? prev.map((m) => (m.job_id === jobId ? { ...m, status: "new" } : m)) : prev,
      );
      setError("Could not save your interest. Please try again.");
    } finally {
      setBusy(null);
    }
  }, []);

  const handleDismiss = useCallback(
    async (jobId: string) => {
      setError("");
      const list = matches ?? [];
      const index = list.findIndex((m) => m.job_id === jobId);
      if (index < 0) return;
      const removed = list[index]!;
      setBusy({ jobId, kind: "dismiss" });
      setMatches(list.filter((m) => m.job_id !== jobId));
      setOpenJobId((cur) => (cur === jobId ? null : cur));
      try {
        await dismissMatch(jobId);
        clearUndoTimer();
        setUndo({ match: { ...removed, status: "dismissed" }, index });
        undoTimer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
      } catch {
        setMatches((prev) => {
          const next = [...(prev ?? [])];
          next.splice(index, 0, removed);
          return next;
        });
        setError("Could not update. Please try again.");
      } finally {
        setBusy(null);
      }
    },
    [matches],
  );

  const handleUndo = useCallback(() => {
    if (!undo) return;
    clearUndoTimer();
    setMatches((prev) => {
      const next = [...(prev ?? [])];
      next.splice(undo.index, 0, { ...undo.match, status: "new" });
      return next;
    });
    setUndo(null);
  }, [undo]);

  if (matches === null) {
    return (
      <ul className="grid gap-4 md:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="glass h-64 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        ))}
      </ul>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="glass rounded-[var(--r-card)] p-10 text-center">
        <IconTile icon={Sparkles} tone="iris" size="lg" className="mx-auto mb-4" />
        <h2 className="text-[1.3rem]">Matches appear once your profile is live.</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Finish one calm interview and approve your profile — then roles that fit your evidence show up here.
        </p>
        <Link
          href="/pre-interview"
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
        >
          Take your interview <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  const openMatch = matches.find((m) => m.job_id === openJobId) ?? null;

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-[13.5px]" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-3">
        <AnimatePresence initial={false}>
          {matches.map((m, i) => (
            <motion.li
              key={m.job_id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.42, ease: EASE }}
              className="glass flex h-full flex-col rounded-[var(--r-card)] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[var(--ink)]">{m.company}</span>
                <ConfidencePill confidence={m.evidence[0]?.confidence ?? "medium"} />
              </div>
              <p className="mt-1 text-[14px] text-[var(--ink-2)]">{m.title}</p>
              <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-[var(--ink-3)]">
                <MapPin size={13} /> {m.location}
              </p>
              <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{m.match_summary}</p>

              <button
                type="button"
                onClick={() => setOpenJobId(m.job_id)}
                className="mt-4 inline-flex w-fit cursor-pointer items-center gap-1.5 text-[13px] font-semibold transition-colors hover:opacity-80"
                style={{ color: "var(--iris-ink)" }}
              >
                <Quote size={13} /> Why this matches
              </button>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
                {m.status === "interested" ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold"
                    style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
                  >
                    <Check size={14} strokeWidth={3} /> Interest sent
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy?.jobId === m.job_id}
                      onClick={() => handleInterest(m.job_id)}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--r-btn)] py-2.5 text-[13.5px] font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                      style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
                    >
                      {busy?.jobId === m.job_id && busy.kind === "interest" ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Saving…
                        </>
                      ) : (
                        "I'm interested"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={busy?.jobId === m.job_id}
                      onClick={() => handleDismiss(m.job_id)}
                      className="cursor-pointer rounded-[var(--r-btn)] border px-3 py-2.5 text-[13.5px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] disabled:cursor-wait disabled:opacity-70"
                      style={{ borderColor: "var(--glass-line-hi)" }}
                    >
                      {busy?.jobId === m.job_id && busy.kind === "dismiss" ? "Updating…" : "Not interested"}
                    </button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <MatchReasonDrawer match={openMatch} onClose={() => setOpenJobId(null)} />

      <Portal>
      <AnimatePresence>
        {undo && (
          <motion.div
            className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div
              className="glass flex items-center gap-4 rounded-full py-2.5 pl-5 pr-2.5 text-[13.5px]"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <span className="text-[var(--ink-2)]">
                Removed <span className="font-semibold text-[var(--ink)]">{undo.match.company}</span>
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="cursor-pointer rounded-full px-3.5 py-1.5 font-semibold text-white"
                style={{ background: "var(--iris)" }}
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </>
  );
}

function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const s = CONFIDENCE_STYLE[confidence];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

function MatchReasonDrawer({ match, onClose }: { match: RoleMatch | null; onClose: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!match) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [match, onClose]);

  return (
    <Portal>
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
            style={{ background: "rgba(14,16,32,0.42)", }}
            tabIndex={-1}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Why ${match.company} matches`}
            className="glass absolute bottom-0 right-0 top-0 flex w-full max-w-[440px] flex-col overflow-y-auto p-7"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.34, ease: EASE }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Why this matches</p>
                <h2 className="mt-1.5 text-[1.35rem]">{match.company}</h2>
                <p className="text-[14px] text-[var(--ink-2)]">{match.title}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-white/70 hover:text-[var(--ink)]"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-5 text-[14px] leading-relaxed text-[var(--ink-2)]">{match.match_summary}</p>

            {match.evidence.length > 0 && (
              <>
            <h3 className="mt-7 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
              Evidence from your interview
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {match.evidence.map((ev) => (
                <li key={ev.trait} className="rounded-[var(--r-card)] p-4" style={{ background: "var(--mist)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold text-[var(--ink)]">{ev.trait}</span>
                    <ConfidencePill confidence={ev.confidence} />
                  </div>
                  <p className="mt-2 border-l-2 pl-3 text-[13.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
                    &ldquo;{ev.quote}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
              </>
            )}

            {match.missing_signals.length > 0 && (
              <>
                <h3 className="mt-7 text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">
                  Signals still light
                </h3>
                <p className="mt-2 text-[13px] text-[var(--ink-3)]">
                  Not a rejection — areas your next interview could strengthen.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {match.missing_signals.map((s) => (
                    <span
                      key={s}
                      className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                      style={{ background: "rgba(245,134,11,0.12)", color: "var(--warn)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
