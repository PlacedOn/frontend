"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Send, Square, Sparkles, RefreshCw } from "lucide-react";
import { useInterviewSession, type InterviewMessage } from "@/lib/interview/useInterviewSession";

interface InterviewRoomProps {
  initialId?: string;
}

export function InterviewRoom({ initialId }: InterviewRoomProps) {
  const reduce = useReducedMotion();
  const { live, messages, streaming, status, turn, error, sendAnswer, end } =
    useInterviewSession(initialId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAnswer = status === "awaiting";
  const ended = status === "ended";
  const reconnecting = status === "reconnecting";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, streaming, status, reduce]);

  const submit = () => {
    if (!canAnswer || !draft.trim()) return;
    sendAnswer(draft);
    setDraft("");
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
          <Link href="/pre-interview" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
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
        <h2 className="text-[1.4rem]">That's a wrap — nicely done.</h2>
        <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          We&rsquo;re turning your conversation into evidence-backed traits. You review every one before any employer sees it — nothing is shared by default.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/candidate/profile" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            Review your profile <ArrowRight size={16} />
          </Link>
          <Link href="/candidate" className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            Go to dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="chip !py-1 !px-2.5 !text-[11px]">
            <span className="livedot" /> {live ? "Live · adaptive" : "Demo mode"}
          </span>
          <span className="text-[12px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Question {turn || 1}
          </span>
        </div>
        <button type="button" onClick={end} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border px-3.5 py-2 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
          <Square size={12} /> End interview
        </button>
      </div>

      {!live && (
        <p className="rounded-[var(--r-card)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Demo mode runs a short scripted interview so you can feel the flow. Connect a backend for a live, adaptive AI interview.
        </p>
      )}

      {reconnecting && (
        <div role="status" aria-live="polite" className="flex items-center gap-2.5 rounded-[var(--r-card)] px-4 py-3 text-[13px] font-medium" style={{ background: "rgba(245,134,11,0.12)", color: "#B45309" }}>
          <RefreshCw size={15} className={reduce ? "" : "animate-spin"} />
          Reconnecting… your answer is saved — nothing is lost.
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="glass flex max-h-[52vh] min-h-[320px] flex-col gap-3.5 overflow-y-auto rounded-[var(--r-card)] p-6">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} reduce={!!reduce} />
        ))}

        {streaming && (
          <div className="self-start" style={{ maxWidth: "88%" }}>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>PlacedOn</p>
            <div className="rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed" style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--glass-line)" }}>
              {streaming}
              <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse" style={{ background: "var(--iris)" }} />
            </div>
          </div>
        )}

        {status === "thinking" && !streaming && (
          <div className="self-start rounded-2xl bg-white px-4 py-3.5" style={{ border: "1px solid var(--glass-line)" }}>
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ink-3)" }} animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="glass rounded-[var(--r-card)] p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!canAnswer}
          rows={3}
          placeholder={reconnecting ? "Reconnecting… your answer is safe here." : canAnswer ? "Answer in your own words — take your time." : "Listening…"}
          aria-label="Your answer"
          className="w-full resize-none bg-transparent px-3 py-2 text-[14.5px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] disabled:opacity-60"
        />
        <div className="mt-1 flex items-center justify-between gap-3 px-1">
          <span className="text-[11.5px] text-[var(--ink-3)]">Enter to send · Shift+Enter for a new line</span>
          <button type="button" onClick={submit} disabled={!canAnswer || !draft.trim()} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
            Send <Send size={15} />
          </button>
        </div>
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
        {isYou ? "You" : "PlacedOn"}
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
