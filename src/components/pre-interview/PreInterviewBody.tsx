"use client";

import type { CSSProperties, ComponentType } from "react";
import { TopicPreview } from "@/components/pre-interview/TopicPreview";
import { track } from "@/lib/track";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { AnimateIcon, Accessibility, Eye, Lock, MessageSquareText, Mic, ShieldCheck } from "@/components/ui/icons";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CalmField } from "./CalmField";
import { VoiceTextCaption, VoiceTextMorph } from "./VoiceTextMorph";

const ease = [0.16, 1, 0.3, 1] as const;

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, delay, ease },
});

const glassCard: CSSProperties = {
  background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 74%)",
  border: "1px solid var(--glass-line)",
  boxShadow: "0 18px 44px -28px rgba(30,24,70,0.5)",
};

const mono: CSSProperties = { fontFamily: "var(--font-mono)" };

const FACTS = ["25–30 min", "No timer", "Pause anytime"] as const;

const CONSENT_POINTS = [
  "Only the conversation itself is kept",
  "You review every trait we surface",
  "Nothing reaches an employer without your approval",
] as const;

const STEPS = [
  { icon: ShieldCheck, label: "Consent", body: "You agree to what's kept before anything begins." },
  {
    icon: MessageSquareText,
    label: "Talk",
    body: "A 25–30 min conversation that adapts to how you think.",
  },
  { icon: Eye, label: "Review", body: "See every trait we found, in your own words." },
  { icon: Lock, label: "You decide", body: "Approve exactly what an employer can see." },
] as const;

type IconType = ComponentType<{ size?: number }>;

/* ── small pieces ─────────────────────────────────────────────── */

function TopHairline() {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-0 h-[3px] w-12 rounded-full transition-all duration-[var(--d-std)] group-hover:w-full"
      style={{ background: "linear-gradient(90deg, #8B54FF, #B79BFF)" }}
    />
  );
}

function IconBadge({ icon: Icon }: { icon: IconType }) {
  return (
    <AnimateIcon animateOnView animateOnHover>
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
      >
      </span>
    </AnimateIcon>
  );
}

type FloatChipProps = {
  className?: string;
  delay?: number;
  duration?: number;
  label: string;
};

/** Frosted chip that drifts gently around the breathing field. */
function FloatChip({ className, delay = 0, duration = 7.5, label }: FloatChipProps) {
  return (
    <motion.span
      className={cn(
        "absolute z-[1] inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold text-[var(--ink)]",
        className,
      )}
      style={{
        background: "linear-gradient(158deg, rgba(255,255,255,0.94), rgba(244,242,255,0.74))",
        border: "1px solid rgba(255,255,255,0.85)",
        boxShadow: "0 14px 30px -16px rgba(60,35,140,0.38)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        ...mono,
      }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {label}
    </motion.span>
  );
}

/** A role-match card orbiting the breathing orb — "the roles this one
 *  conversation opens" (one interview → match many). Sits at a translateZ depth
 *  so the deck tilt reveals real parallax. */
/**
 * A role this one conversation opens.
 *
 * Deliberately carries no match percentage. It used to render `{fit}%` — 88, 74,
 * 69 — beside each role, three decimal places of certainty about a person who
 * has not yet answered a single question. There is no data behind those numbers
 * and there cannot be at this point in the flow, which made them invented
 * metrics on the one screen whose job is to lower the stakes.
 *
 * The copy two columns to the left promises "No score staring back at you."
 * A reader who saw both at once learned which of the two to believe.
 *
 * What carries the meaning instead is the set: three different roles, one
 * conversation. That claim is true, and it is the actual product.
 */
function OrbRole({ className, z, role, delay = 0, reduce }: { className?: string; z: number; role: string; delay?: number; reduce: boolean }) {
  return (
    <motion.div
      className={cn("absolute z-[2]", className)}
      style={{ transform: `translateZ(${z}px)` }}
      animate={reduce ? undefined : { y: [-6, 6, -6] }}
      transition={reduce ? undefined : { duration: 7.5 + z / 24, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="flex items-center whitespace-nowrap rounded-[14px] border py-2 pl-3.5 pr-4"
        style={{ background: "rgba(255,255,255,0.96)", borderColor: "var(--iris-line)", boxShadow: "0 16px 34px -16px rgba(60,35,140,0.45)" }}
      >
        {/* A rule, not an icon — it marks the pill as one of a set without
            claiming to depict anything. */}
        <span aria-hidden className="mr-3 h-3.5 w-px shrink-0" style={{ background: "var(--iris)" }} />
        <span className="text-[13px] font-semibold tracking-[-0.005em] text-[var(--ink)]">{role}</span>
      </div>
    </motion.div>
  );
}

/* ── page body ────────────────────────────────────────────────── */

export function PreInterviewBody() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });
  const onOrbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetOrb = () => { px.set(0); py.set(0); };

  return (
    <>
      {/* Hero — big editorial reassurance + the breathing field */}
      <section className="shell grid items-center gap-12 pt-32 pb-20 md:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <motion.p {...rise(0)} className="eyebrow">
            Before you start
          </motion.p>

          <motion.h1 {...rise(0.08)} className="mt-5">
            <span className="block text-[clamp(3rem,1.6rem+5.2vw,5.4rem)] leading-[0.98] tracking-[-0.035em]">
              Take a breath.
            </span>
            <span className="mt-4 block text-[clamp(1.45rem,1.05rem+1.6vw,2.3rem)] leading-[1.18] tracking-[-0.02em] text-[var(--ink-2)]">
              One <span className="grad-iris font-semibold">conversation</span>, not a test — and the only one you take.
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.18)}
            className="mt-7 max-w-md text-[17px] leading-relaxed text-[var(--ink-2)]"
          >
            No timer. No trick questions. No score staring back at you. You interview once —
            your evidence does the rest, everywhere you&rsquo;re a fit.
          </motion.p>

          <motion.div
            {...rise(0.26)}
            className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full px-5 py-2.5"
            style={{
              background: "var(--glass-hi)",
              border: "1px solid var(--glass-line)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {FACTS.map((fact, i) => (
              <span
                key={fact}
                className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--iris-ink)]"
                style={mono}
              >
                {i > 0 && (
                  <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: "var(--iris-line)" }} />
                )}
                {fact}
              </span>
            ))}
          </motion.div>

          <motion.div {...rise(0.34)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/interview/consent" onClick={() => track("pre_interview_start")} className="!px-7 !py-3.5">
              Begin interview
            </Button>
            <Button href="#expect" variant="ghost">
              What to expect
            </Button>
          </motion.div>
        </div>

        {/* Centerpiece — breathing orb, 3D-tilt, and the roles one conversation opens */}
        <div
          className="relative order-first mx-auto w-full max-w-[300px] sm:max-w-[440px] lg:order-none"
          style={{ perspective: 1200 }}
          onPointerMove={onOrbMove}
          onPointerLeave={resetOrb}
        >
          <motion.div
            className="relative"
            style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease }}
          >
            <div
              aria-hidden
              className="absolute inset-[6%] rounded-full"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.66), rgba(244,242,255,0.28) 70%)",
                border: "1px solid rgba(255,255,255,0.78)",
                boxShadow: "0 44px 90px -42px rgba(90,58,180,0.5), inset 0 1px 0 rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            />
            <div aria-hidden className="absolute inset-[15%] rounded-full" style={{ border: "1px solid rgba(139,84,255,0.14)" }} />
            <CalmField />

            {/* one interview → the roles it opens */}
            <OrbRole className="right-[-10%] top-[11%]" z={72} role="Backend engineer" reduce={!!reduce} />
            <OrbRole className="left-[-13%] top-[45%]" z={52} role="Frontend" delay={1.1} reduce={!!reduce} />
            <OrbRole className="right-[-4%] bottom-[11%]" z={62} role="Data engineer" delay={2} reduce={!!reduce} />

            {/* calm reassurance */}
            <FloatChip className="left-[-2%] top-[74%]" label="Voice or text" />
            <FloatChip className="bottom-[-3%] left-[36%]" delay={2.2} duration={9.5} label="You approve" />
          </motion.div>
        </div>
      </section>

      {/* Reassurances — asymmetric bento anchored by one living focal card */}
      <section className="shell pb-8" aria-label="How this interview stays on your terms">
        <motion.p {...rise(0)} className="eyebrow mb-6">
          On your terms
        </motion.p>
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {/* Focal — voice/text with the morphing waveform bleeding to the card edges */}
          <motion.article
            {...rise(0.05)}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col overflow-hidden rounded-[var(--r-card)] lg:col-span-8 lg:row-span-2"
            style={glassCard}
          >
            <TopHairline />
            <div className="p-7 pb-0 md:p-8 md:pb-0">
              <div className="flex items-center gap-3">
                <IconBadge icon={Mic} />
                <IconBadge icon={MessageSquareText} />
              </div>
              <h2 className="mt-6 text-[clamp(1.5rem,1.2rem+1vw,2rem)] tracking-[-0.015em]">
                Voice or text — your call
              </h2>
              <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed text-[var(--ink-2)]">
                Answer out loud or type — whichever lets you think best. Switch at any point,
                mid-interview, even mid-question. Neither mode is scored differently.
              </p>
            </div>
            <div className="relative mt-5 min-h-[190px] flex-1 sm:min-h-[210px]">
              <VoiceTextMorph className="absolute inset-0" />
            </div>
            <VoiceTextCaption />
          </motion.article>

          {/* Your consent — tinted supporting card with a stepped checklist */}
          <motion.article
            {...rise(0.12)}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[var(--r-card)] p-7 lg:col-span-4"
            style={{
              ...glassCard,
              background:
                "linear-gradient(158deg, rgba(246,242,255,0.95), rgba(235,228,255,0.62) 74%)",
            }}
          >
            <TopHairline />
            <div className="flex items-center gap-4">
              <IconBadge icon={ShieldCheck} />
              <h2 className="text-[1.25rem] tracking-[-0.01em]">Your consent, not fine print</h2>
            </div>
            <ul className="relative mt-5 flex flex-col gap-3.5">
              <span
                aria-hidden
                className="absolute bottom-3 left-[9px] top-3 w-px"
                style={{ background: "linear-gradient(180deg, var(--iris-line), transparent)" }}
              />
              {CONSENT_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.14, ease }}
                  className="relative flex items-start gap-3 text-[14px] leading-snug text-[var(--ink-2)]"
                >
                  <span
                    className="relative z-[1] mt-[1px] grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full"
                    style={{
                      background: "var(--glass-hi)",
                      border: "1px solid var(--iris-line)",
                      color: "var(--iris)",
                    }}
                  >
                  </span>
                  {point}
                </motion.li>
              ))}
            </ul>
          </motion.article>

          {/* Accommodations — quiet card with a ghost glyph */}
          <motion.article
            {...rise(0.19)}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[var(--r-card)] p-7 lg:col-span-4"
            style={glassCard}
          >
            <TopHairline />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-7 -right-5 select-none"
              style={{ color: "rgba(105,34,245,0.055)" }}
            >
            </span>
            <div className="flex items-center gap-4">
              <IconBadge icon={Accessibility} />
              <h2 className="text-[1.25rem] tracking-[-0.01em]">Accommodations, no questions asked</h2>
            </div>
            <p className="relative mt-4 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
              Extra time, screen-reader support, reduced motion — just ask. There&rsquo;s no timer,
              so there&rsquo;s nothing to fall behind on. No penalty, ever.
            </p>
          </motion.article>
        </div>
      </section>

      {/* What happens next — four calm steps with ghost numerals */}
      <section id="expect" className="shell scroll-mt-28 py-20 md:py-28">
        <TopicPreview />
        <motion.p {...rise(0)} className="eyebrow mb-10">
          What happens next
        </motion.p>
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <motion.span
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px origin-left lg:block"
            style={{ background: "linear-gradient(90deg, var(--iris-line), transparent)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
          />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.label} {...rise(i * 0.12)} className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 left-8 select-none text-[76px] font-semibold leading-none"
                  style={{ ...mono, color: "rgba(105,34,245,0.07)" }}
                >
                  {`0${i + 1}`}
                </span>
                <span
                  className="relative z-[1] grid h-12 w-12 place-items-center rounded-full text-white"
                  style={{
                    background: "linear-gradient(135deg, #9A6BFF, #7C48F1)",
                    boxShadow: "0 12px 28px -12px rgba(120,74,240,0.6)",
                  }}
                >
                </span>
                <p
                  className="relative z-[1] mt-4 text-[12px] uppercase tracking-[0.16em] text-[var(--iris-ink)]"
                  style={mono}
                >
                  Step {i + 1} · {step.label}
                </p>
                <p className="relative z-[1] mt-1.5 max-w-[15rem] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                  {step.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA — glass panel with a slow breathing aura */}
      <section className="shell pb-28">
        <motion.div
          {...rise(0)}
          className="relative overflow-hidden rounded-[calc(var(--r-card)+10px)] p-8 md:p-12"
          style={{
            ...glassCard,
            boxShadow: "0 28px 70px -32px rgba(30,24,70,0.55)",
          }}
        >
          <motion.span
            aria-hidden
            className="absolute -right-24 -top-28 h-80 w-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(154,107,255,0.35), transparent 65%)",
              filter: "blur(30px)",
            }}
            animate={{ scale: [1, 1.16, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(183,155,255,0.3), transparent 65%)",
              filter: "blur(28px)",
            }}
            animate={{ scale: [1.14, 1, 1.14], opacity: [0.5, 0.75, 0.5] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-[clamp(1.7rem,1.3rem+1.6vw,2.5rem)] leading-[1.1] tracking-[-0.02em]">
                Ready when you are.
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--ink-2)]">
                The interview adapts to you and takes 25&ndash;30 minutes. Pause anytime — nothing
                is shared until you approve it.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
              <Button href="/interview/consent" onClick={() => track("pre_interview_start")} className="!px-8 !py-4 text-[15.5px]">
                Begin interview
              </Button>
              <p
                className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-2)] opacity-70"
                style={mono}
              >
                No timer starts when you click
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
