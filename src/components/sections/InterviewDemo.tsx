"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Circle } from "lucide-react";

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

// Deterministic organic bar heights (no random → no hydration mismatch).
const wave = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    Math.max(0.22, Math.min(1, 0.4 + 0.42 * Math.abs(Math.sin(i * 0.7)) + 0.2 * Math.abs(Math.sin(i * 1.9 + 1)))),
  );
const WAVE = wave(34);
const MINI = wave(14);

// Ambient floating particles (fixed positions).
const PARTICLES = [
  { x: "12%", y: "22%", s: 4, d: 0 },
  { x: "82%", y: "16%", s: 3, d: 0.6 },
  { x: "70%", y: "62%", s: 5, d: 1.1 },
  { x: "22%", y: "70%", s: 3, d: 1.6 },
  { x: "50%", y: "12%", s: 3, d: 0.3 },
  { x: "88%", y: "48%", s: 4, d: 0.9 },
];

function formatClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Waveform({ bars, active, reduce, color = "var(--iris)", h = 26 }: { bars: number[]; active: boolean; reduce: boolean | null; color?: string; h?: number }) {
  return (
    <span className="flex items-center justify-center gap-[2px]" style={{ height: h }} aria-hidden>
      {bars.map((base, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full"
          style={{ background: color, height: "100%", originY: 0.5 }}
          animate={reduce ? { scaleY: base * 0.5 } : active ? { scaleY: [base * 0.35, base, base * 0.5, base * 0.82, base * 0.35] } : { scaleY: 0.18 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: (i % 8) * 0.09, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

// Mouth frames (0=neutral, 1=closed, 2=mid, 3=open wide, 4=neutral) cycled to
// simulate natural speech; a single closed frame when idle / reduced motion.
const TALK_SEQUENCE = [1, 3, 2, 4, 2, 3, 1, 2, 3, 0, 2, 4];
const FRAME_COUNT = 5;

function SpeakingAvatar({ speaking, reduce }: { speaking: boolean; reduce: boolean | null }) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    if (reduce || !speaking) {
      setFrame(1);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % TALK_SEQUENCE.length;
      setFrame(TALK_SEQUENCE[i]);
    }, 120);
    return () => clearInterval(id);
  }, [speaking, reduce]);

  return (
    <div className="relative grid place-items-center">
      <span
        aria-hidden
        className="absolute h-[164px] w-[164px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(105,34,245,.32), transparent 66%)", filter: "blur(18px)" }}
      />
      {!reduce &&
        speaking &&
        [0, 1].map((r) => (
          <motion.span
            key={r}
            aria-hidden
            className="absolute rounded-[28px]"
            style={{ width: 150, height: 180, border: "1.5px solid var(--iris)" }}
            animate={{ scale: [1, 1.16], opacity: [0.28, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: r * 1.4 }}
          />
        ))}
      <div
        className="relative overflow-hidden rounded-[24px]"
        style={{
          width: 148,
          height: 178,
          background: "linear-gradient(160deg, rgba(139,84,255,.24), rgba(105,34,245,.05))",
          border: "1px solid var(--glass-line)",
          boxShadow: "0 16px 40px -12px rgba(105,34,245,.45), inset 0 1px 0 rgba(255,255,255,.5)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/interviewer.webp)",
            backgroundSize: `${FRAME_COUNT * 100}% auto`,
            backgroundPositionX: `${frame * (100 / (FRAME_COUNT - 1))}%`,
            backgroundPositionY: "13%",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span
          className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide"
          style={{ background: "rgba(255,255,255,.82)", color: "#dc2626", backdropFilter: "blur(4px)" }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "#dc2626" }} />
          LIVE
        </span>
      </div>
    </div>
  );
}

export function InterviewDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);
  const [clock, setClock] = useState(247);

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
          timers.push(setTimeout(() => run(i + 1), 900));
        }, 900),
      );
    };
    timers.push(setTimeout(() => run(0), 500));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setClock((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const done = shown >= SCRIPT.length;
  const lastTurn = shown > 0 ? SCRIPT[shown - 1] : null;
  const speaking = !lastTurn || lastTurn.who === "ai" || typing;

  return (
    <div
      ref={ref}
      className="glass relative overflow-hidden rounded-[calc(var(--r-card)+4px)] p-3"
      style={{ boxShadow: "var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.75)" }}
    >
      {/* session header */}
      <div className="relative z-[1] mb-3 flex items-center justify-between px-1.5 pt-0.5">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide" style={{ background: "rgba(220,38,38,.1)", color: "#dc2626" }}>
            <motion.span aria-hidden animate={reduce ? undefined : { opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <Circle size={7} fill="#dc2626" strokeWidth={0} />
            </motion.span>
            REC
          </span>
          <span className="text-[11.5px] font-semibold text-[var(--ink-2)]">Live interview</span>
        </span>
        <span className="text-[11.5px] tracking-wide text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          {formatClock(clock)} · adaptive
        </span>
      </div>

      <div className="relative grid gap-3 md:grid-cols-[1fr_1.04fr]">
        {/* LEFT — live interviewer stage */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-[20px] px-4 pb-4 pt-6" style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(105,34,245,.16), rgba(105,34,245,.02) 70%)", border: "1px solid var(--glass-line)" }}>
          {/* ambient particles */}
          {!reduce &&
            PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute rounded-full"
                style={{ left: p.x, top: p.y, width: p.s, height: p.s, background: "var(--iris)", opacity: 0.35 }}
                animate={{ y: [0, -9, 0], opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
              />
            ))}

          {/* live video portrait of the interviewer, lip-syncing while speaking */}
          <SpeakingAvatar speaking={speaking} reduce={reduce} />

          <p className="mt-4 text-[13px] font-bold text-[var(--ink)]">Placedon interviewer</p>
          <div className="mt-3 w-full max-w-[210px]">
            <Waveform bars={WAVE} active={speaking} reduce={reduce} h={28} />
          </div>
          <p className="mt-2 text-[11px] tracking-wide text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            {speaking ? "speaking…" : "listening…"}
          </p>

          {/* candidate chip */}
          <div className="mt-5 flex w-full items-center gap-2.5 rounded-[15px] px-3 py-2.5" style={{ background: "rgba(255,255,255,.66)", border: "1px solid var(--glass-line)", backdropFilter: "blur(6px)" }}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#9a6bff,#6922F5)" }}>
              JS
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-bold text-[var(--ink)]">You</p>
              <p className="text-[10px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>mic on · text or voice</p>
            </div>
            <div className="w-[64px]">
              <Waveform bars={MINI} active={!speaking} reduce={reduce} color="var(--ink-3)" h={16} />
            </div>
          </div>
        </div>

        {/* RIGHT — transcript (side chat) */}
        <div className="flex flex-col rounded-[20px] p-4" style={{ background: "rgba(255,255,255,.62)", border: "1px solid var(--glass-line)" }}>
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Transcript
          </p>
          <div className="flex flex-col gap-2.5">
            {SCRIPT.slice(0, shown).map((t, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease }}
                className={`flex items-end gap-2 ${t.who === "you" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold"
                  style={t.who === "ai" ? { background: "var(--iris-ghost)", color: "var(--iris-ink)" } : { background: "linear-gradient(135deg,#9a6bff,#6922F5)", color: "#fff" }}
                >
                  {t.who === "ai" ? (
                    <svg width="11" height="11" viewBox="133 119 354 400" aria-hidden>
                      <path d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z" fill="currentColor" />
                      <path d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z" fill="currentColor" />
                    </svg>
                  ) : (
                    "JS"
                  )}
                </span>
                <div
                  className="rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-snug"
                  style={
                    t.who === "you"
                      ? { background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", color: "#fff", borderBottomRightRadius: 6, maxWidth: "82%" }
                      : { background: "#fff", color: "var(--ink)", border: "1px solid var(--glass-line)", borderBottomLeftRadius: 6, maxWidth: "82%" }
                  }
                >
                  {t.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  <svg width="11" height="11" viewBox="133 119 354 400" aria-hidden>
                    <path d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z" fill="currentColor" />
                    <path d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z" fill="currentColor" />
                  </svg>
                </span>
                <div className="rounded-2xl bg-white px-3.5 py-3" style={{ border: "1px solid var(--glass-line)", borderBottomLeftRadius: 6 }}>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--ink-3)" }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.16 }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* signal strip */}
      <div className="relative mt-3 rounded-[16px] p-3.5" style={{ background: "rgba(255,255,255,.74)", border: "1px solid var(--glass-line)" }}>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Signal extracted, live
          </p>
          <span className="hidden text-[10.5px] text-[var(--ink-3)] sm:inline">every score → a transcript moment</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TRAITS.map((tr, i) => (
            <motion.div
              key={tr.label}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={done ? { opacity: 1, y: 0 } : reduce ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-1">
                <span className="truncate text-[11px] font-medium text-[var(--ink-2)]">{tr.label}</span>
                <span className="text-[13px] font-bold" style={{ color: "var(--iris-ink)", fontVariantNumeric: "tabular-nums" }}>{tr.score}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))" }}
                  initial={{ width: 0 }}
                  animate={done ? { width: `${tr.score}%` } : reduce ? { width: `${tr.score}%` } : {}}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
