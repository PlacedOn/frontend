"use client";

/*
 * "Three surfaces, one signal" — the interview → trust passport → employer view,
 * shown as a real 3D card deck. The three surfaces are layered in perspective;
 * the deck auto-advances (front card cycles to the back on a spring), tilts
 * toward the pointer, and any surface is clickable from the rail. Real content,
 * not skeleton bars. Motion follows the Apple/Emil discipline: springs, depth via
 * scale+blur, all disabled under reduced-motion.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion, useReducedMotion, useMotionValue, useSpring, useTransform,
} from "motion/react";
import {
  MessageSquareText, BadgeCheck, ScanSearch, ArrowRight, ShieldCheck, Quote, type LucideIcon,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 4200;
const SPRING = { type: "spring", stiffness: 220, damping: 26 } as const;

/* ── card content (real, not skeletons) ───────────────────────── */

function Screen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[calc(var(--r-card)+6px)] p-5 md:p-6"
      style={{
        // near-opaque so stacked cards don't bleed through each other
        background: "linear-gradient(158deg, #ffffff, #f7f5fe 82%)",
        border: "1px solid var(--glass-line-hi)",
        boxShadow: "0 34px 80px -38px rgba(30,24,70,0.55), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((d) => (<span key={d} className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />))}
        </span>
        <span className="ml-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
      </div>
      <div className="h-[240px] md:h-[264px]">{children}</div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex items-center gap-[3.5px]" aria-hidden>
      {[14, 24, 34, 20, 30, 40, 18, 28, 22, 36, 16, 26, 30, 14, 22].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3.5px] rounded-full"
          style={{ height: h, background: "linear-gradient(180deg,#8B54FF,#B79BFF)" }}
          animate={{ scaleY: [0.5, 1, 0.6, 1, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

function InterviewCard() {
  return (
    <Screen label="The interview">
      <div className="flex h-full flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>Placedon asks</p>
        <p className="mt-1.5 text-[16.5px] font-semibold leading-snug text-[var(--ink)]">How did you decide what to rule out — and what did that tell you?</p>
        <div className="mt-4 max-w-[82%] self-end rounded-2xl rounded-tr-md px-3.5 py-2.5 text-[13px] leading-relaxed text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
          I bisected by cost first — ruled out the cache path, which pointed straight at the write lock.
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Waveform />
          <span className="text-[12px] font-medium text-[var(--ink-3)]">Q2 · voice or text</span>
        </div>
      </div>
    </Screen>
  );
}

function PassportCard() {
  return (
    <Screen label="The Trust Passport">
      <div className="flex h-full flex-col justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>
            <ShieldCheck size={12} /> Verified via interview
          </span>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-bold text-[var(--ink)]">Systems thinking</span>
            <span className="text-[12.5px] font-semibold text-[var(--ink-3)]"><span className="text-[var(--iris-ink)]">Strong</span> · 71–88%</span>
          </div>
          <span className="mt-2 block h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <motion.span className="block h-full rounded-full" style={{ background: "linear-gradient(90deg,#8B54FF,var(--iris))", transformOrigin: "left" }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 0.82 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: EASE }} />
          </span>
        </div>
        <figure className="rounded-[14px] border p-3.5" style={{ background: "var(--iris-ghost)", borderColor: "var(--iris-line)" }}>
          <Quote size={13} className="text-[var(--iris)]" aria-hidden />
          <blockquote className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-2)]">“I'd cache the read path and measure before touching the write side.”</blockquote>
          <figcaption className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--iris-ink)]"><span className="livedot" /> Traceable to transcript · 08:41</figcaption>
        </figure>
      </div>
    </Screen>
  );
}

function EmployerCard() {
  const rows = [
    { role: "Backend engineer", fit: 88, tag: "Shortlisted", top: true },
    { role: "Platform / DevOps engineer", fit: 68, tag: "Reviewing", top: false },
  ];
  return (
    <Screen label="The employer view">
      <div className="flex h-full flex-col justify-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>Ranked by evidenced fit</p>
        {rows.map((r) => (
          <div key={r.role} className="rounded-[16px] border p-3.5" style={{ background: "var(--glass-hi)", borderColor: r.top ? "var(--iris-line)" : "var(--glass-line)" }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-bold text-[var(--ink)]">{r.role}</span>
              <span className="text-[16px] font-extrabold text-[var(--iris)]" style={{ fontFamily: "var(--font-mono)" }}>{r.fit}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {["Production debugging", "Incident response"].map((s) => (
                  <span key={s} className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{s}</span>
                ))}
              </div>
              <span className="shrink-0 text-[11px] font-bold" style={{ color: r.top ? "#047857" : "var(--ink-3)" }}>{r.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

type Surface = { key: string; icon: LucideIcon; eyebrow: string; title: string; line: string; Card: () => React.JSX.Element };

const SURFACES: Surface[] = [
  { key: "interview", icon: MessageSquareText, eyebrow: "The interview", title: "One honest conversation", line: "25–30 min, adaptive to how they think — voice or text.", Card: InterviewCard },
  { key: "passport", icon: BadgeCheck, eyebrow: "The Trust Passport", title: "Strengths, backed by evidence", line: "Every trait tied to the candidate’s own words — they approve what’s shared.", Card: PassportCard },
  { key: "employer", icon: ScanSearch, eyebrow: "The employer view", title: "Matched on how people think", line: "Search in plain English, see why each fits — evidence, not keywords.", Card: EmployerCard },
];

const DEPTH = [
  { y: 0, scale: 1, opacity: 1, blur: 0 },
  { y: -22, scale: 0.94, opacity: 0.9, blur: 0.6 },
  { y: -40, scale: 0.88, opacity: 0.7, blur: 1.4 },
];

export function FeaturedSurfaces() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % SURFACES.length), DURATION);
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  // pointer tilt on the whole deck
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 18 });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 18 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetTilt = () => { px.set(0); py.set(0); };

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
          className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Step rail */}
          <ul className="flex flex-col gap-3">
            {SURFACES.map((s, i) => {
              const isActive = i === active;
              const Icon = s.icon;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className="group w-full cursor-pointer rounded-[var(--r-card)] p-4 text-left transition-colors"
                    style={{ background: isActive ? "var(--glass-hi)" : "transparent", border: `1px solid ${isActive ? "var(--iris-line)" : "transparent"}`, boxShadow: isActive ? "var(--shadow-sm)" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border transition-colors" style={{ background: isActive ? "rgba(105,34,245,0.10)" : "rgba(105,34,245,0.05)", borderColor: isActive ? "var(--iris)" : "var(--iris-line)", color: "var(--iris-ink)" }}>
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>{s.eyebrow}</p>
                        <p className="text-[15px] font-bold leading-tight text-[var(--ink)]">{s.title}</p>
                      </div>
                    </div>
                    {isActive && (
                      <>
                        <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{s.line}</p>
                        <span className="mt-3 block h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                          <motion.span key={active} className="block h-full rounded-full" style={{ background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} initial={{ width: reduce || paused ? "100%" : "0%" }} animate={{ width: "100%" }} transition={{ duration: reduce || paused ? 0 : DURATION / 1000, ease: "linear" }} />
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

          {/* 3D card deck */}
          <div className="relative" style={{ perspective: 1400 }} onPointerMove={onMove} onPointerLeave={resetTilt}>
            <motion.div className="relative mx-auto h-[360px] max-w-md md:h-[380px]" style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}>
              {SURFACES.map((s, i) => {
                const pos = (i - active + SURFACES.length) % SURFACES.length;
                const d = DEPTH[pos];
                const Card = s.Card;
                return (
                  <motion.div
                    key={s.key}
                    className="absolute inset-x-0 top-4 cursor-pointer"
                    style={{ zIndex: SURFACES.length - pos, transformStyle: "preserve-3d" }}
                    animate={reduce ? { opacity: pos === 0 ? 1 : 0 } : { y: d.y, scale: d.scale, opacity: d.opacity, filter: `blur(${d.blur}px)` }}
                    transition={reduce ? { duration: 0.2 } : SPRING}
                    onClick={() => pos !== 0 && setActive(i)}
                    aria-hidden={pos !== 0}
                  >
                    <Card />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
