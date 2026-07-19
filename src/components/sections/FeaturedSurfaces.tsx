"use client";

/*
 * Product tour — the three real surfaces (interview → trust passport → employer
 * view) shown as ONE guided, auto-advancing showcase rather than three competing
 * cards. A step rail on the left drives a single large "screen" on the right;
 * it auto-advances, pauses on hover, and any step is clickable. Deliberately on
 * the light ground (palette relief between the heavier violet sections), with
 * iris as a precise accent. Previews are CSS/motion mock-ups — no screenshots.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageSquareText, BadgeCheck, ScanSearch, ArrowRight, type LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 5200;

/* ── enlarged, frame-sized mock previews ──────────────────────── */

function Bubble({ align, w, solid }: { align: "l" | "r"; w: string; solid?: boolean }) {
  return (
    <div className={`flex ${align === "l" ? "justify-start" : "justify-end"}`}>
      <span className="block h-4 rounded-full" style={{ width: w, background: solid ? "var(--iris)" : "rgba(105,34,245,0.14)" }} />
    </div>
  );
}

function InterviewMock() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-3.5">
        <Bubble align="l" w="66%" />
        <Bubble align="r" w="46%" solid />
        <Bubble align="l" w="58%" />
        <Bubble align="r" w="38%" solid />
        <Bubble align="l" w="50%" />
      </div>
      <div className="flex items-center gap-[4px] pt-6" aria-hidden>
        {[14, 24, 34, 20, 30, 40, 18, 28, 22, 36, 16, 26, 30, 14].map((h, i) => (
          <motion.span
            key={i}
            className="w-[4px] rounded-full"
            style={{ height: h, background: "linear-gradient(180deg,#8B54FF,#B79BFF)" }}
            animate={{ scaleY: [0.5, 1, 0.6, 1, 0.5] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.14 }}
          />
        ))}
      </div>
    </div>
  );
}

function PassportMock() {
  const traits = [
    { label: "Systems thinking", v: 88 },
    { label: "Clear communication", v: 76 },
    { label: "Handles ambiguity", v: 82 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: "var(--iris)" }}>
          <BadgeCheck size={16} />
        </span>
        <span className="text-[14px] font-bold text-[var(--ink)]">Verified via interview</span>
      </div>
      {traits.map((t, i) => (
        <div key={t.label}>
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-[var(--ink-2)]">{t.label}</span>
            <span className="font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--iris-ink)" }}>{t.v}</span>
          </div>
          <span className="block h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <motion.span
              className="block h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#8B54FF,#B79BFF)" }}
              initial={{ width: 0 }}
              animate={{ width: `${t.v}%` }}
              transition={{ duration: 1, delay: 0.15 + i * 0.12, ease: EASE }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function EmployerMock() {
  const rows = [
    { i: "A.K.", role: "Applied AI Engineer", m: 94 },
    { i: "R.M.", role: "Forward Deployed Eng", m: 89 },
    { i: "S.L.", role: "Solutions Engineer", m: 85 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {rows.map((r, i) => (
        <motion.div
          key={r.i}
          className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5"
          style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)" }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full text-[12px] font-bold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            {r.i}
          </span>
          <span className="flex-1 text-[14.5px] font-semibold text-[var(--ink)]">{r.role}</span>
          <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-mono)", color: "var(--iris)" }}>{r.m}%</span>
        </motion.div>
      ))}
    </div>
  );
}

type Step = { icon: LucideIcon; eyebrow: string; title: string; line: string; Mock: () => React.JSX.Element };

const STEPS: Step[] = [
  { icon: MessageSquareText, eyebrow: "The interview", title: "One honest conversation", line: "25–30 min, adaptive to how they think — voice or text.", Mock: InterviewMock },
  { icon: BadgeCheck, eyebrow: "The Trust Passport", title: "Strengths, backed by evidence", line: "Every trait tied to the candidate’s own words. They approve what’s shared.", Mock: PassportMock },
  { icon: ScanSearch, eyebrow: "The employer view", title: "Matched on how people think", line: "Search in plain English, see why each fits — evidence, not keywords.", Mock: EmployerMock },
];

export function FeaturedSurfaces() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), DURATION);
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  const ActiveMock = STEPS[active]!.Mock;
  const eyebrow = STEPS[active]!.eyebrow;

  return (
    <section className="relative py-20 md:py-28" aria-label="How Placedon works">
      <div className="shell relative z-[1]">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">See it in motion</p>
          <h2 className="mt-3 text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] tracking-[-0.02em]">
            Three surfaces. <span className="grad-iris">One honest signal.</span>
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--ink-2)]">
            Follow one candidate from the conversation, to the evidence passport, to the shortlist —
            watch each part of how Placedon works.
          </p>
        </div>

        <div
          className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Step rail */}
          <ul className="flex flex-col gap-3">
            {STEPS.map((s, i) => {
              const isActive = i === active;
              const Icon = s.icon;
              return (
                <li key={s.eyebrow}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className="group w-full cursor-pointer rounded-[var(--r-card)] p-4 text-left transition-colors"
                    style={{
                      background: isActive ? "var(--glass-hi)" : "transparent",
                      border: `1px solid ${isActive ? "var(--iris-line)" : "transparent"}`,
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors"
                        style={{ background: isActive ? "var(--iris)" : "var(--iris-ghost)", color: isActive ? "#fff" : "var(--iris-ink)" }}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                          {s.eyebrow}
                        </p>
                        <p className="text-[15px] font-bold leading-tight text-[var(--ink)]">{s.title}</p>
                      </div>
                    </div>
                    {isActive && (
                      <>
                        <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{s.line}</p>
                        {/* auto-advance progress */}
                        <span className="mt-3 block h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                          <motion.span
                            key={active}
                            className="block h-full rounded-full"
                            style={{ background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }}
                            initial={{ width: reduce || paused ? "100%" : "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: reduce || paused ? 0 : DURATION / 1000, ease: "linear" }}
                          />
                        </span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
            <Link href="/pre-interview" className="mt-1 inline-flex items-center gap-2 px-4 text-[14px] font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--iris-ink)" }}>
              Take a sample interview <ArrowRight size={15} />
            </Link>
          </ul>

          {/* Screen */}
          <div
            className="relative overflow-hidden rounded-[calc(var(--r-card)+6px)] p-6 md:p-8"
            style={{ background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 76%)", border: "1px solid var(--glass-line)", boxShadow: "0 30px 70px -34px rgba(30,24,70,0.5)" }}
          >
            {/* window chrome */}
            <div className="mb-6 flex items-center gap-2">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
              </span>
              <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
                {eyebrow}
              </span>
            </div>
            <div className="relative h-[300px] md:h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <ActiveMock />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
