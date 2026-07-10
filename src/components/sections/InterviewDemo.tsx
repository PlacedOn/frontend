"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Circle, User } from "lucide-react";

type Turn = { who: "ai" | "you"; text: string };

const SCRIPT: Turn[] = [
  { who: "ai", text: "Tell me about a decision you made with incomplete information." },
  { who: "you", text: "We shipped the beta before the data pipeline was ready — I bet on learning speed over certainty." },
  { who: "ai", text: "What told you that was the right call?" },
  { who: "you", text: "Two weeks of real usage beat two months of guessing. I set a rollback line so the risk was bounded." },
];

type Trait = { label: string; score: number };
const TRAITS: Trait[] = [
  { label: "Ambiguity tolerance", score: 92 },
  { label: "Decision velocity", score: 88 },
  { label: "Risk framing", score: 84 },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

function formatClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function InterviewDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);
  const [clock, setClock] = useState(247);

  // reveal the transcript turn by turn
  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (i: number) => {
      if (!alive || i >= SCRIPT.length) return;
      setTyping(true);
      timers.push(
        setTimeout(() => {
          if (!alive) return;
          setTyping(false);
          setShown(i + 1);
          timers.push(setTimeout(() => run(i + 1), 620));
        }, 720),
      );
    };
    timers.push(setTimeout(() => run(0), 400));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  // ticking session clock
  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setClock((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const done = shown >= SCRIPT.length;
  // the interviewer is "speaking" while asking (last shown turn is AI or nothing yet)
  const lastTurn = shown > 0 ? SCRIPT[shown - 1] : null;
  const interviewerSpeaking = !lastTurn || lastTurn.who === "ai" || typing;

  return (
    <div
      ref={ref}
      className="glass relative overflow-hidden rounded-[var(--r-card)] p-2.5"
      style={{ boxShadow: "var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.7)" }}
    >
      {/* orbiting accent beam */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[var(--r-card)] opacity-70"
        style={{ background: "conic-gradient(from 0deg, transparent, var(--iris-ghost) 12%, transparent 26%)" }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* session header */}
      <div className="relative mb-2.5 flex items-center justify-between px-1.5 pt-1">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(220,38,38,.1)", color: "#dc2626" }}>
            <motion.span aria-hidden animate={reduce ? undefined : { opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <Circle size={8} fill="#dc2626" strokeWidth={0} />
            </motion.span>
            REC
          </span>
          <span className="text-[11px] font-semibold text-[var(--ink-2)]">Live interview</span>
        </span>
        <span className="text-[11px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          {formatClock(clock)} · adaptive
        </span>
      </div>

      <div className="relative grid gap-2.5 md:grid-cols-[1fr_1.05fr]">
        {/* LEFT — the live interview stage (call-style) */}
        <div className="relative flex flex-col overflow-hidden rounded-[18px] p-4" style={{ background: "linear-gradient(160deg, rgba(105,34,245,.12), rgba(105,34,245,.03))", border: "1px solid var(--glass-line)" }}>
          {/* interviewer presence */}
          <div className="relative mx-auto mt-1 grid h-[110px] w-[110px] place-items-center">
            {!reduce &&
              [0, 1].map((r) => (
                <motion.span
                  key={r}
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1.5px solid var(--iris)" }}
                  animate={{ scale: [1, 1.55], opacity: [0.4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: r * 1.1 }}
                />
              ))}
            <span className="relative grid h-[74px] w-[74px] place-items-center rounded-full" style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris) 60%, var(--iris-ink))", boxShadow: "var(--shadow-iris)" }}>
              <svg width="30" height="30" viewBox="133 119 354 400" aria-hidden>
                <path d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z" fill="#fff" />
                <path d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z" fill="#fff" />
              </svg>
            </span>
          </div>

          <p className="mt-3 text-center text-[12.5px] font-semibold text-[var(--ink)]">Placedon interviewer</p>
          {/* speaking waveform */}
          <span className="mt-2 flex h-5 items-center justify-center gap-[3px]" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <motion.span
                key={d}
                className="w-[3px] rounded-full"
                style={{ background: "var(--iris)", height: "100%", originY: 0.5 }}
                animate={reduce || !interviewerSpeaking ? { scaleY: 0.25 } : { scaleY: [0.25, 1, 0.4, 0.8, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: d * 0.08, ease: "easeInOut" }}
              />
            ))}
          </span>
          <p className="mt-1.5 text-center text-[10.5px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            {interviewerSpeaking ? "speaking…" : "listening…"}
          </p>

          {/* candidate tile */}
          <div className="mt-auto flex items-center gap-2.5 rounded-[14px] p-2.5" style={{ background: "rgba(255,255,255,.6)", border: "1px solid var(--glass-line)" }}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--mist)", color: "var(--ink-2)" }}>
              <User size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-[var(--ink)]">You</p>
              <p className="text-[10px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>mic on · text or voice</p>
            </div>
            <span className="flex h-4 items-center gap-[2px]" aria-hidden>
              {[0, 1, 2, 3].map((d) => (
                <motion.span
                  key={d}
                  className="w-[2.5px] rounded-full"
                  style={{ background: "var(--ink-3)", height: "100%", originY: 0.5 }}
                  animate={reduce || interviewerSpeaking ? { scaleY: 0.3 } : { scaleY: [0.3, 0.9, 0.4, 0.7, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.1, ease: "easeInOut" }}
                />
              ))}
            </span>
          </div>
        </div>

        {/* RIGHT — the transcript (side chat) */}
        <div className="flex flex-col rounded-[18px] p-3.5" style={{ background: "rgba(255,255,255,.6)", border: "1px solid var(--glass-line)" }}>
          <p className="mb-2.5 text-[10.5px] uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Transcript
          </p>
          <div className="flex flex-col gap-2">
            {SCRIPT.slice(0, shown).map((t, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34, ease }}
                className={t.who === "you" ? "self-end" : "self-start"}
                style={{ maxWidth: "92%" }}
              >
                <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {t.who === "ai" ? "Placedon" : "You"}
                </p>
                <div
                  className="rounded-2xl px-3 py-2 text-[12.5px] leading-snug"
                  style={
                    t.who === "you"
                      ? { background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", color: "#fff" }
                      : { background: "#fff", color: "var(--ink)", border: "1px solid var(--glass-line)" }
                  }
                >
                  {t.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="self-start rounded-2xl bg-white px-3 py-2.5" style={{ border: "1px solid var(--glass-line)" }}>
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--ink-3)" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* signal strip — keeps the value prop without looking like a chat */}
      <div className="relative mt-2.5 rounded-[16px] p-3" style={{ background: "rgba(255,255,255,.72)", border: "1px solid var(--glass-line)" }}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10.5px] uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Signal extracted, live
          </p>
          <span className="text-[10.5px] text-[var(--ink-3)]">every score → a transcript moment</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {TRAITS.map((tr, i) => (
            <motion.div
              key={tr.label}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={done ? { opacity: 1, y: 0 } : reduce ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease }}
            >
              <div className="mb-1 flex items-baseline justify-between">
                <span className="truncate text-[11px] font-medium text-[var(--ink-2)]">{tr.label}</span>
                <span className="text-[12px] font-bold" style={{ color: "var(--iris-ink)", fontVariantNumeric: "tabular-nums" }}>{tr.score}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))" }}
                  initial={{ width: 0 }}
                  animate={done ? { width: `${tr.score}%` } : reduce ? { width: `${tr.score}%` } : {}}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
