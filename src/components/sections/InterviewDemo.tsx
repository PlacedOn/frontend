"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

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

export function InterviewDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);

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

  const done = shown >= SCRIPT.length;

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
        style={{
          background:
            "conic-gradient(from 0deg, transparent, var(--iris-ghost) 12%, transparent 26%)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative grid gap-2.5 md:grid-cols-[1.35fr_1fr]">
        {/* transcript */}
        <div
          className="rounded-[18px] p-4"
          style={{ background: "rgba(255,255,255,.55)", border: "1px solid var(--glass-line)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="chip !py-1 !px-2.5 !text-[11px]">
              <span className="livedot" /> Live interview
            </span>
            <span className="text-[11px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
              adaptive · unscripted
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {SCRIPT.slice(0, shown).map((t, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34, ease: [0.22, 0.68, 0.31, 1] }}
                className={t.who === "you" ? "self-end" : "self-start"}
                style={{ maxWidth: "88%" }}
              >
                <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {t.who === "ai" ? "PlacedOn" : "Candidate"}
                </p>
                <div
                  className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug"
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
              <div className="self-start rounded-2xl bg-white px-3.5 py-3" style={{ border: "1px solid var(--glass-line)" }}>
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

        {/* extracted signal */}
        <div
          className="rounded-[18px] p-4"
          style={{ background: "rgba(255,255,255,.72)", border: "1px solid var(--glass-line)" }}
        >
          <p className="mb-3 text-[11px] uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Signal extracted
          </p>
          <div className="flex flex-col gap-3.5">
            {TRAITS.map((tr, i) => (
              <motion.div
                key={tr.label}
                initial={reduce ? false : { opacity: 0, x: 10 }}
                animate={done ? { opacity: 1, x: 0 } : reduce ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.12, ease: [0.34, 1.45, 0.5, 1] }}
              >
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12.5px] font-medium text-[var(--ink)]">{tr.label}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--iris-ink)", fontVariantNumeric: "tabular-nums" }}>
                    {tr.score}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))" }}
                    initial={{ width: 0 }}
                    animate={done ? { width: `${tr.score}%` } : reduce ? { width: `${tr.score}%` } : {}}
                    transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.22, 0.68, 0.31, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 rounded-xl px-3 py-2.5 text-[11.5px] leading-snug text-[var(--ink-2)]" style={{ background: "var(--iris-ghost)" }}>
            Every score links to the exact transcript moment it came from.
          </div>
        </div>
      </div>
    </div>
  );
}
