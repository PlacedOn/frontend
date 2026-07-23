"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Quote, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { HeroAurora } from "@/components/background/HeroAurora";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Scale-AI-inspired hero: editorial, asymmetric, evidence-forward. The left
 * column states plainly what PlacedOn does and hands the visitor one obvious way
 * to start. The right column is not decoration — it's the actual product output
 * (a trait, its confidence interval, and the transcript line it traces to), so a
 * first-time visitor understands the whole promise at a glance. No centred blob,
 * no poetry — the artifact does the persuading.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const sectionRef = useRef<HTMLElement>(null);

  // Subtle scroll parallax so copy and artifact drift at different rates.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0">
        <HeroAurora />
      </div>
      {/* legibility wash — brighter toward the copy side (left) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(247,249,254,0.86) 0%, rgba(247,249,254,0.5) 42%, rgba(247,249,254,0) 78%)",
        }}
      />

      <div className="shell relative z-[1] grid w-full grid-cols-1 items-center gap-14 pt-32 pb-24 md:pt-28 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10 lg:pb-20">
        {/* ── Left: the message + the start ─────────────────────────── */}
        <motion.div className="min-w-0 max-w-xl" style={reduce ? undefined : { y: copyY, opacity: fade }}>
          <motion.a
            {...rise(0.04)}
            href="/trust"
            className="chip transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
          >
            <ShieldCheck size={14} className="text-[var(--iris)]" aria-hidden />
            LL144 &amp; EU AI Act aligned
          </motion.a>

          <motion.h1
            {...rise(0.12)}
            className="mt-6 text-balance text-[clamp(2.7rem,1rem+6.4vw,5.4rem)] leading-[0.98] tracking-[-0.035em] text-[var(--ink)]"
            style={{ fontWeight: 680 }}
          >
            Hire on <span className="grad-iris">evidence</span>, not résumés.
          </motion.h1>

          <motion.p
            {...rise(0.22)}
            className="mt-6 max-w-[46ch] text-[clamp(1.05rem,1rem+0.45vw,1.28rem)] leading-relaxed text-[var(--ink-2)]"
          >
            One adaptive conversation shows how a candidate actually thinks, decides and
            holds up under pressure — turned into a profile where{" "}
            <span className="font-semibold text-[var(--ink)]">
              every trait traces back to something they said.
            </span>
          </motion.p>

          <motion.div {...rise(0.32)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AnimateIcon animateOnHover>
              <Button href="/pre-interview" className="!px-7 !py-4 text-[15.5px]">
                <Sparkles size={17} aria-hidden /> Start your interview
                <ArrowRight size={17} />
              </Button>
            </AnimateIcon>
            <Button onClick={() => open("employer")} variant="ghost" className="!px-6 !py-4 text-[15px]">
              Book a demo
            </Button>
          </motion.div>

          <motion.div
            {...rise(0.44)}
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[var(--ink-3)]"
          >
            <span className="flex items-center gap-1.5">
              <span className="livedot" /> Free for candidates
            </span>
            <span className="hidden text-[var(--glass-line-hi)] sm:inline">·</span>
            <span>Every score tied to a transcript moment</span>
            <span className="hidden text-[var(--glass-line-hi)] sm:inline">·</span>
            <span>Zero résumé bias</span>
          </motion.div>
        </motion.div>

        {/* ── Right: the actual product output ──────────────────────── */}
        <motion.div
          className="relative mx-auto w-full min-w-0 max-w-md lg:mx-0"
          style={reduce ? undefined : { y: cardY }}
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
        >
          <EvidenceCard reduce={!!reduce} />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * A faithful miniature of a PlacedOn evidence profile — the thing employers
 * actually receive. Static content, real structure: a verified trait with its
 * confidence interval, and the candidate's own transcript line it's grounded in.
 */
function EvidenceCard({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="relative rounded-[26px] border p-6 md:p-7"
      style={{
        background: "linear-gradient(160deg, var(--glass-hi), var(--glass) 72%)",
        borderColor: "var(--glass-line-hi)",
        backdropFilter: "blur(22px) saturate(1.35)",
        WebkitBackdropFilter: "blur(22px) saturate(1.35)",
        boxShadow: "0 40px 90px -40px rgba(40,26,120,0.5), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* header */}
      <div className="flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          AR
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-[var(--ink)]">Backend engineer</p>
          <p className="text-[12.5px] text-[var(--ink-3)]">Evidence profile · 22-min conversation</p>
        </div>
        <span
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}
        >
          <ShieldCheck size={12} aria-hidden /> Verified
        </span>
      </div>

      {/* trait + confidence interval */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] font-bold text-[var(--ink)]">Systems thinking</p>
          <p className="text-[12.5px] font-semibold text-[var(--ink-3)]">
            <span className="text-[var(--iris-ink)]">Strong</span> · 71–88%
          </p>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          {/* the interval band, not a single fake score */}
          <motion.span
            className="block h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))", transformOrigin: "left" }}
            initial={reduce ? { width: "80%" } : { scaleX: 0 }}
            animate={reduce ? { width: "80%" } : { scaleX: 0.8 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
          />
        </div>
      </div>

      {/* the grounding transcript line — the whole point */}
      <figure
        className="mt-5 rounded-[16px] border p-4"
        style={{ background: "var(--iris-ghost)", borderColor: "var(--iris-line)" }}
      >
        <Quote size={15} className="text-[var(--iris)]" aria-hidden />
        <blockquote className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          “I'd cache the read path and measure before touching the write side — a rollback
          I can't reason about is worse than the bug.”
        </blockquote>
        <figcaption className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--iris-ink)]">
          <span className="livedot" /> Traceable to transcript · 08:41
        </figcaption>
      </figure>

      {/* floating fit pill — overlap for depth */}
      <motion.div
        aria-hidden
        className="absolute -top-4 right-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold text-[var(--ink)] md:-right-4"
        style={{
          background: "rgba(255,255,255,0.94)",
          borderColor: "var(--iris-line)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 16px 34px -12px rgba(40,26,120,0.5)",
        }}
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1, ease: EASE }}
      >
        <span className="grid size-4 place-items-center rounded-full text-white" style={{ background: "var(--iris)" }}>
          <ArrowRight size={10} />
        </span>
        Fits 4 of 5 role signals
      </motion.div>
    </div>
  );
}
