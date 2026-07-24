"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Send, Square, Sparkles, RefreshCw, PenTool, Mic, Volume2, VolumeX, ChevronDown } from "lucide-react";
import type { InterviewMessage, InterviewStatus } from "@/lib/interview/useInterviewSession";
import { useSpeechInput } from "@/lib/interview/useSpeechInput";
import { useSpeechOutput } from "@/lib/interview/useSpeechOutput";
import { Whiteboard } from "./Whiteboard";
import { emptyEvidence, type WhiteboardEvidence } from "@/lib/interview";

/**
 * Presentational interview shell — pure props, no transport. Both the demo hook
 * (useInterviewSession) and the authed hook (useLiveInterview) feed it the same
 * shape so the room looks identical whether it's scripted or a real session.
 *
 * UX: this is a *conversation*, not a form. The current question is the single
 * focal point; earlier exchanges recede into a disclosure; the mic is a
 * first-class control. Text is always available — voice is additive.
 */
export interface InterviewSurfaceProps {
  live: boolean;
  messages: InterviewMessage[];
  streaming: string;
  status: InterviewStatus;
  turn: number;
  error: string | null;
  onSend: (text: string) => void;
  onEnd: () => void;
  onRetry?: () => void;
  /** Where "Review your profile" points after the interview ends. */
  reviewHref?: string;
}

export function InterviewSurface({
  live,
  messages,
  streaming,
  status,
  turn,
  error,
  onSend,
  onEnd,
  onRetry,
  reviewHref = "/candidate/profile",
}: InterviewSurfaceProps) {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [showBoard, setShowBoard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [, setBoardEvidence] = useState<WhiteboardEvidence>(emptyEvidence);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAnswer = status === "awaiting";
  const ended = status === "ended";
  const reconnecting = status === "reconnecting";

  // Speech-to-text: finalised phrases append to the draft; the candidate reviews
  // and edits before sending. Text is always available; voice is additive.
  const appendChunk = useCallback((chunk: string) => {
    setDraft((d) => (d ? `${d} ${chunk}` : chunk));
  }, []);
  const speech = useSpeechInput(appendChunk);
  const tts = useSpeechOutput();

  // Never keep listening once it's no longer the candidate's turn.
  useEffect(() => {
    if (!canAnswer && speech.listening) speech.stop();
  }, [canAnswer, speech]);

  // Read each newly-arrived question aloud when read-aloud is on. Track the last
  // spoken id so history isn't re-read and the same question isn't repeated.
  const spokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (!tts.enabled) return;
    const last = messages[messages.length - 1];
    if (last && last.role !== "you" && last.id !== spokenRef.current) {
      spokenRef.current = last.id;
      tts.speak(last.text);
    }
  }, [messages, tts]);

  const toggleMic = () => {
    if (!canAnswer) return;
    if (speech.listening) {
      speech.stop();
    } else {
      tts.cancel(); // don't let the mic pick up the question being read aloud
      speech.start();
    }
  };

  // Auto-scroll the history box to the newest exchange while it's open.
  useEffect(() => {
    if (!showHistory) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, streaming, status, reduce, showHistory]);

  const submit = () => {
    if (!canAnswer || !draft.trim()) return;
    if (speech.listening) speech.stop();
    onSend(draft);
    setDraft("");
    speech.reset();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  if (status === "error") {
    return (
      <div className="glass rounded-[var(--r-card)] p-8 text-center">
        <h2 className="text-[1.3rem]">The connection dropped.</h2>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          {error ?? "We couldn't reach the interview engine."} Your progress is safe — you can restart when you're ready.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
              <RefreshCw size={15} /> Retry connection
            </button>
          )}
          <Link href="/pre-interview" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-5 py-3 text-[14px] font-semibold text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
            Restart <ArrowRight size={15} />
          </Link>
          <Link href="/candidate" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-5 py-3 text-[14px] font-semibold text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (ended) {
    return (
      <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass rounded-[var(--r-card)] p-8 text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <Sparkles size={22} />
        </span>
        <h2 className="text-[1.4rem]">That&rsquo;s a wrap — nicely done.</h2>
        <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          We&rsquo;re turning your conversation into evidence-backed traits. You review every one before any employer sees it — nothing is shared by default.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={reviewHref} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            Review your evidence <ArrowRight size={16} />
          </Link>
          <Link href="/candidate" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            Go to dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  // ── Derivations for the calm, single-question layout ──────────────
  const interviewerMsgs = messages.filter((m) => m.role !== "you");
  const currentQuestion = interviewerMsgs[interviewerMsgs.length - 1] ?? null;
  const lastAnswer = [...messages].reverse().find((m) => m.role === "you") ?? null;
  const thinking = status === "thinking" && !streaming;
  const focusKey = streaming ? "streaming" : currentQuestion?.id ?? (thinking ? "thinking" : "start");
  const questionCount = Math.max(turn || interviewerMsgs.length || 1, 1);

  return (
    <div className="flex flex-col gap-5">
      {/* progress + controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="chip !px-2.5 !py-1 !text-[11px]">
            <span className="livedot" /> {live ? "Live · adaptive" : "Demo"}
          </span>
          <div className="flex items-center gap-1.5" aria-label={`Question ${questionCount}`}>
            {Array.from({ length: Math.min(questionCount, 7) }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === questionCount - 1 ? 18 : 6,
                  background: i <= questionCount - 1 ? "var(--iris)" : "var(--mist)",
                  opacity: i === questionCount - 1 ? 1 : 0.5,
                }}
              />
            ))}
            <span className="ml-1 text-[12px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
              Q{questionCount}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tts.supported && (
            <button
              type="button"
              onClick={tts.toggle}
              aria-pressed={tts.enabled}
              aria-label={tts.enabled ? "Turn off reading questions aloud" : "Read questions aloud"}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-semibold transition-colors"
              style={tts.enabled ? { borderColor: "var(--iris)", background: "var(--iris-ghost)", color: "var(--iris-ink)" } : { borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }}
            >
              {tts.enabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">Read aloud</span>
            </button>
          )}
          <button type="button" onClick={onEnd} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
            <Square size={12} /> End
          </button>
        </div>
      </div>

      {reconnecting && (
        <div role="status" aria-live="polite" className="flex items-center gap-2.5 rounded-[var(--r-card)] px-4 py-3 text-[13px] font-medium" style={{ background: "rgba(245,134,11,0.12)", color: "#B45309" }}>
          <RefreshCw size={15} className={reduce ? "" : "animate-spin"} />
          Reconnecting… your answer is saved — nothing is lost.
        </div>
      )}

      {/* ── The current question: the single focal point ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={focusKey}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass relative overflow-hidden rounded-[var(--r-card)] p-6 md:p-8"
        >
          {/* soft iris wash at the top edge */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{ background: "radial-gradient(120% 100% at 50% 0%, var(--iris-ghost), transparent 70%)" }} />
          <div className="relative flex items-center justify-between gap-3">
            <p className="eyebrow">Placedon asks</p>
            {tts.supported && currentQuestion && !streaming && !thinking && (
              <button
                type="button"
                onClick={() => tts.speak(currentQuestion.text)}
                aria-label="Read this question aloud"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[var(--iris-ink)] transition-colors hover:bg-[var(--iris-ghost)]"
              >
                <Volume2 size={13} /> Hear it
              </button>
            )}
          </div>

          <div className="relative mt-3 min-h-[3.2em]">
            {streaming ? (
              <p className="text-[clamp(1.2rem,1.05rem+0.9vw,1.7rem)] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)]">
                {streaming}
                <span className="ml-0.5 inline-block h-[1.05em] w-[3px] translate-y-[3px] animate-pulse" style={{ background: "var(--iris)" }} />
              </p>
            ) : thinking ? (
              <span className="flex items-center gap-1.5" aria-label="Thinking">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--iris)" }} animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
                ))}
              </span>
            ) : (
              <p className="text-[clamp(1.2rem,1.05rem+0.9vw,1.7rem)] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)]">
                {currentQuestion?.text ?? "Let's begin — tell me a bit about the work you're proudest of."}
              </p>
            )}
          </div>

          {/* your previous answer, recessed for continuity */}
          {lastAnswer && !streaming && !thinking && (
            <p className="relative mt-4 border-l-2 pl-3 text-[13px] leading-relaxed text-[var(--ink-3)]" style={{ borderColor: "var(--iris-line)" }}>
              <span className="font-semibold text-[var(--ink-2)]">You:</span>{" "}
              {lastAnswer.text.length > 160 ? `${lastAnswer.text.slice(0, 160)}…` : lastAnswer.text}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* history disclosure — the full conversation, out of the way */}
      {messages.length > 1 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
          >
            <ChevronDown size={14} className="transition-transform" style={{ transform: showHistory ? "rotate(180deg)" : "none" }} />
            {showHistory ? "Hide conversation" : `Conversation so far · ${interviewerMsgs.length} question${interviewerMsgs.length === 1 ? "" : "s"}`}
          </button>
          {showHistory && (
            <div ref={scrollRef} className="glass mt-2 flex max-h-[40vh] flex-col gap-3.5 overflow-y-auto rounded-[var(--r-card)] p-5">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} reduce={!!reduce} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Composer: mic is first-class, text always available ── */}
      <div
        className="glass rounded-[var(--r-card)] p-4 transition-[box-shadow] duration-300"
        style={speech.listening ? { boxShadow: "0 0 0 2px var(--iris-line), var(--shadow-sm)" } : undefined}
      >
        <div className="flex items-start gap-3">
          {speech.supported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={!canAnswer}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? "Stop speaking" : "Answer by speaking"}
              className="relative grid size-12 shrink-0 place-items-center rounded-full transition-transform active:scale-[0.94] disabled:opacity-40"
              style={
                speech.listening
                  ? { background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", color: "#fff", boxShadow: "var(--shadow-iris)" }
                  : { background: "var(--glass-hi)", border: "1px solid var(--glass-line-hi)", color: "var(--iris-ink)" }
              }
            >
              {speech.listening && !reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid var(--iris)" }}
                  animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <Mic size={19} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={!canAnswer}
              rows={3}
              placeholder={
                reconnecting
                  ? "Reconnecting… your answer is safe here."
                  : !canAnswer
                    ? "Listening…"
                    : speech.supported
                      ? "Speak or type — answer in your own words, take your time."
                      : "Answer in your own words — take your time."
              }
              aria-label="Your answer"
              className="w-full resize-none bg-transparent px-1 py-1.5 text-[14.5px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] disabled:opacity-60"
            />
            {/* live interim transcript — words appearing as you speak */}
            {speech.listening && speech.interim && (
              <p className="px-1 pb-1 text-[14px] italic leading-relaxed text-[var(--ink-3)]" aria-live="polite">
                {speech.interim}…
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2.5" style={{ borderColor: "var(--glass-line)" }}>
          <span className="text-[11.5px] text-[var(--ink-3)]">
            {speech.listening ? "Listening — tap the mic to stop" : "Enter to send · Shift+Enter for a new line"}
          </span>
          <button type="button" onClick={submit} disabled={!canAnswer || !draft.trim()} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            Send <Send size={15} />
          </button>
        </div>

        {speech.error && (
          <p className="mt-1.5 px-1 text-[12px] font-medium text-[#b45309]" aria-live="polite">
            {speech.error}
          </p>
        )}
      </div>

      {!live && (
        <p className="rounded-[var(--r-card)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Demo mode runs a short scripted interview so you can feel the flow. Connect a backend for a live, adaptive AI interview.
        </p>
      )}

      {/* Optional whiteboard — solve visibly; we capture only what you produce, never your face. */}
      <div>
        <button
          type="button"
          onClick={() => setShowBoard((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
          style={{ background: showBoard ? "var(--iris-ghost)" : "var(--glass-hi)", border: "1px solid var(--glass-line-hi)", color: "var(--iris-ink)" }}
          aria-expanded={showBoard}
        >
          <PenTool size={14} /> {showBoard ? "Hide whiteboard" : "Show your work on a whiteboard"}
        </button>
        {showBoard && (
          <div className="mt-2">
            <Whiteboard onEvidence={setBoardEvidence} />
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 px-1 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        This is your space. Your raw answers stay yours — only the evidence you approve is ever shared with employers.
      </p>
    </div>
  );
}

function Bubble({ message, reduce }: { message: InterviewMessage; reduce: boolean }) {
  const isYou = message.role === "you";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={isYou ? "self-end" : "self-start"}
      style={{ maxWidth: "88%" }}
    >
      <p className={`mb-1 text-[11px] font-semibold tracking-wide text-[var(--ink-3)] ${isYou ? "text-right" : ""}`} style={{ fontFamily: "var(--font-mono)" }}>
        {isYou ? "You" : "Placedon"}
      </p>
      <div
        className="rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed"
        style={
          isYou
            ? { background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", color: "#fff" }
            : { background: "#fff", color: "var(--ink)", border: "1px solid var(--glass-line)" }
        }
      >
        {message.text}
      </div>
    </motion.div>
  );
}
