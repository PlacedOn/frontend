"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Quote, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { HeroAurora } from "@/components/background/HeroAurora";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Scale-AI-inspired hero: editorial, asymmetric, evidence-forward. The right
 * column is the actual product output (a trait, its confidence interval, and the
 * transcript line it traces to), rendered as a real 3D surface — it tilts toward
 * the pointer with spring physics, and its layers sit at different depths, so the
 * motion sells the product instead of decorating around it. No floating blob.
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

  // Pointer-tracked 3D tilt (decorative — Apple/Emil spring pattern). Normalised
  // pointer offset drives rotateX/rotateY through a spring so it has momentum,
  // never a hard 1:1 snap. Off entirely under reduced-motion.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 150, damping: 18, mass: 0.6 };
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), spring);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), spring);
  const glareX = useSpring(useTransform(px, [-0.5, 0.5], [12, 88]), spring);
  const glareY = useSpring(useTransform(py, [-0.5, 0.5], [8, 92]), spring);

  const onTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetTilt = () => {
    px.set(0);
    py.set(0);
  };

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

        {/* ── Right: the actual product output, as a 3D surface ─────── */}
        <motion.div
          className="relative mx-auto w-full min-w-0 max-w-md lg:mx-0"
          style={reduce ? undefined : { y: cardY, perspective: 1100 }}
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
          onPointerMove={onTilt}
          onPointerLeave={resetTilt}
        >
          <EvidenceCard reduce={!!reduce} rotX={rotX} rotY={rotY} glareX={glareX} glareY={glareY} />
        </motion.div>
      </div>
    </section>
  );
}

type CardProps = {
  reduce: boolean;
  rotX: MotionValue<number>;
  rotY: MotionValue<number>;
  glareX: MotionValue<number>;
  glareY: MotionValue<number>;
};

/**
 * A faithful miniature of a PlacedOn evidence profile — the thing employers
 * actually receive. Its layers sit at different translateZ depths so the pointer
 * tilt reveals real parallax; a pointer-following glare reads the surface as glass.
 */
function EvidenceCard({ reduce, rotX, rotY, glareX, glareY }: CardProps) {
  // Hooks run unconditionally at the top; the value is only *used* when motion
  // is allowed. A pointer-following radial glare reads the surface as glass.
  const glare = useTransform([glareX, glareY], (latest: number[]) => {
    const [x, y] = latest;
    return `radial-gradient(140px circle at ${x}% ${y}%, rgba(255,255,255,0.5), transparent 60%)`;
  });

  return (
    <motion.div
      className="relative rounded-[26px] border p-6 md:p-7"
      style={{
        transformStyle: "preserve-3d",
        rotateX: reduce ? 0 : rotX,
        rotateY: reduce ? 0 : rotY,
        background: "linear-gradient(160deg, var(--glass-hi), var(--glass) 72%)",
        borderColor: "var(--glass-line-hi)",
        backdropFilter: "blur(22px) saturate(1.35)",
        WebkitBackdropFilter: "blur(22px) saturate(1.35)",
        boxShadow: "0 40px 90px -40px rgba(40,26,120,0.5), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* pointer-following glare — sits just above the surface */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          style={{
            background: glare,
            mixBlendMode: "soft-light",
          }}
        />
      )}

      {/* header */}
      <div className="flex items-center gap-3" style={{ transform: "translateZ(28px)" }}>
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
      <div className="mt-6" style={{ transform: "translateZ(38px)" }}>
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] font-bold text-[var(--ink)]">Systems thinking</p>
          <p className="text-[12.5px] font-semibold text-[var(--ink-3)]">
            <span className="text-[var(--iris-ink)]">Strong</span> · 71–88%
          </p>
        </div>
        <div className="relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          {/* the interval band, not a single fake score */}
          <motion.span
            className="block h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))", transformOrigin: "left" }}
            initial={reduce ? { width: "80%" } : { scaleX: 0 }}
            animate={reduce ? { width: "80%" } : { scaleX: 0.8 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
          />
          {/* continuous scan shimmer — the signal being read */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-1/3"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
              animate={{ x: ["-120%", "360%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.6, repeatDelay: 1.4 }}
            />
          )}
        </div>
      </div>

      {/* the grounding transcript line — the whole point */}
      <figure
        className="mt-5 rounded-[16px] border p-4"
        style={{ background: "var(--iris-ghost)", borderColor: "var(--iris-line)", transform: "translateZ(48px)" }}
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

      {/* floating fit pill — lifts highest for the strongest parallax */}
      <motion.div
        aria-hidden
        className="absolute -top-4 right-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold text-[var(--ink)] md:-right-4"
        style={{
          transform: "translateZ(72px)",
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
    </motion.div>
  );
}
