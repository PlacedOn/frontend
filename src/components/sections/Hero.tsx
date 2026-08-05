"use client";

/* ─────────────────────────────────────────────────────────────────────────────
 * DIRECTION: Editorial broadsheet — type-as-hero, with ONE diagram.
 *
 * Chosen over the alternatives (cinematic full-bleed; dark constellation) for
 * two reasons. Harvey's full-bleed hero rests on a licensed photograph and this
 * hero may not use imagery. Anthropic's near-black ground would fight a fixed,
 * white-glass <Nav> and the fixed <QuietGround> that every page sits on, so
 * inverting only the hero would mean re-theming site chrome from a section
 * component. What is portable from both is the discipline: typography carries
 * the frame, a single visual idea sits beside it, and nothing is decorated.
 *
 * The one visual idea is THE NARROWING. Three hairlines of decreasing width,
 * each stepped further right, each labelled: a whole conversation, the passage
 * inside it, the single judgement that passage is allowed to support. It is the
 * product's actual claim drawn as a diagram — evidence narrows, and the last
 * rule is short because one judgement is a small thing to have earned. It is
 * built from rules and type only, and it is explicitly captioned as a diagram.
 *
 * It sits on the "instrument" register — the dark evidence-world ground already
 * defined in globals.css (--instrument / --instrument-ink / --instrument-line /
 * --vitrine). That gives the light page real depth and layering without a
 * gradient blob, without a card grid, and without inventing a palette: every
 * value here is an existing token.
 *
 * WHY THIS REPLACED THE OLD HERO — the previous version floated nine glass
 * cards carrying named candidates ("Aarav Rao — Backend engineer"), an
 * evidenced-trait meter ("Systems thinking · Strong · 68% evidenced"), a
 * verification badge ("Verified · 22-min conversation"), a fit line ("Fits 4 of
 * 5 role signals") and a seven-bar "INTERVIEW ACTIVITY · last 7 days" chart.
 * Measured against Supabase on 2026-08-01 the product has 0 interview_sessions,
 * 0 report_card_items, 1 job and 5 users. Every name, percentage, duration and
 * bar in that field was invented. A product whose entire claim is "no judgement
 * without evidence" cannot open with fabricated evidence, so all of it is gone
 * rather than restyled.
 *
 * Nothing below is invented. The headline is a position. The deck describes the
 * method. The diagram is captioned as a diagram. The closing band states three
 * product policies — rules the company holds, not measurements it has taken.
 * No metric, no named person, no logo wall, no testimonial, no photograph.
 *
 * CASCADE NOTE: globals.css carries an UNLAYERED `h1,h2,h3,h4 { font-weight:
 * 600; letter-spacing: -0.015em; line-height: 1.05; color: var(--ink) }`.
 * Unlayered rules beat layered Tailwind utilities regardless of specificity, so
 * `font-*`, `tracking-*`, `leading-*` and `text-white` on a heading are silently
 * inert. Two consequences, both handled: the h1 display setting is applied
 * inline on the element, and the dark instrument panel deliberately contains NO
 * h1–h4 — its label is a <figcaption> and its rows are <li>, because a heading
 * in there would inherit `color: var(--ink)` (#0E1020) on an #0E1020 ground and
 * vanish. The accented word in the h1 is a child <span> with its own `color`,
 * which is a direct declaration on that element and so is unaffected.
 *
 * CONTRAST on the instrument ground (#0E1020): --instrument-ink #A9A7C8 ≈ 8.2:1,
 * --instrument-ink-2 #7F7DA0 ≈ 4.8:1, --white 18.6:1 — all pass AA for text.
 * --iris (#6922F5) is only ≈2.8:1 there, so on the dark panel the brand colour
 * is carried by --iris-soft (#8B54FF, ≈4.3:1) and used on a RULE, never on
 * text — a rule is a non-text element, where the AA threshold is 3:1.
 *
 * MOTION: transform and opacity only. Rules wipe with scaleX from the left, so
 * the narrowing animates as the drawing of itself; text lifts with translateY
 * behind a fixed-size mask. No width, height, top, left, margin or font-size is
 * ever animated. Under prefers-reduced-motion every element mounts at its
 * finished state with zero duration — the complete composition, not a degraded
 * one.
 * ────────────────────────────────────────────────────────────────────────── */

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The one visual idea, as data. `width` is the static rendered length of each
 * hairline — the narrowing itself. It is a layout value, never animated; the
 * reveal animates scaleX from 0 to 1 against it.
 */
const NARROWING = [
  {
    label: "One conversation",
    note: "adaptive, same questions asked of no two people",
    width: "100%",
    indent: "0%",
    accent: false,
  },
  {
    label: "The passage inside it",
    note: "the moment the candidate actually said the thing",
    width: "58%",
    indent: "14%",
    accent: false,
  },
  {
    label: "The one judgement it supports",
    note: "and nothing beyond what the passage earned",
    width: "30%",
    indent: "32%",
    accent: true,
  },
] as const;

/** Product policies. Each is a rule the company holds, not a measurement. */
const POLICIES = [
  "Free for candidates",
  "Nothing reaches an employer without the candidate’s yes",
  "Resume, name and college are never inputs",
] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();

  /** Lift-and-fade. Under reduced motion the element mounts already finished. */
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.75, delay, ease: EASE },
  });

  /** Hairline wipe from the left. */
  const wipe = (delay: number, duration = 0.9) => ({
    initial: reduce ? false : { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: reduce ? { duration: 0 } : { duration, delay, ease: EASE },
  });

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      /* Vertical rhythm is tuned against a 1440×900 laptop: measured, the
         thesis, deck, CTA and the complete diagram all resolve by y=821, and
         the closing policy band starts at y=870 — sitting on the fold, so it
         is the first thing a scroll reveals rather than something missed. That
         band is the honest replacement for the logo wall this product cannot
         truthfully have, so it is placed to be found. */
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20"
    >
      <div className="shell relative w-full">
        {/* ── masthead band ────────────────────────────────────────────── */}
        <Rule {...wipe(0.05)} />
        <motion.div
          {...rise(0.1)}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-3"
        >
          <p className="eyebrow">Evidence-based hiring</p>
          <Link
            href="/trust"
            className="eyebrow group inline-flex items-center gap-2 transition-colors duration-[var(--d-micro)] hover:text-[var(--iris-ink)]"
          >
            <span className="border-b border-transparent pb-px transition-colors duration-[var(--d-micro)] group-hover:border-[var(--iris-line)]">
              LL144 &amp; EU AI Act aligned
            </span>
          </Link>
        </motion.div>

        {/* ── thesis: the type is the hero ─────────────────────────────── */}
        <h1
          id="hero-heading"
          /* The min of the top clamp is deliberately generous: below `sm` the
             masthead row wraps into two stacked eyebrows, and without it the
             pair glues itself to the headline. */
          className="mt-[clamp(2.75rem,1.5rem+2.6vw,3.5rem)] max-w-[17ch] text-[clamp(2rem,0.95rem+5.3vw,4.9rem)]"
          /* Set inline: the unlayered h1 rule in globals.css would otherwise
             override any Tailwind font/tracking/leading utility placed here. */
          style={{ fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 0.98 }}
        >
          <Line reduce={!!reduce} delay={0.18}>
            A resume is a claim.
          </Line>
          <Line reduce={!!reduce} delay={0.3}>
            A conversation is{" "}
            <span style={{ color: "var(--iris)" }}>evidence</span>.
          </Line>
        </h1>

        {/* ── deck + the diagram ───────────────────────────────────────── */}
        <div className="mt-[clamp(2.25rem,1.5rem+2.2vw,3rem)] grid gap-x-12 gap-y-[clamp(2.5rem,1.5rem+3vw,4rem)] lg:grid-cols-12">
          {/* Bottom-anchored on lg: the deck and CTA settle onto the diagram's
              baseline (Harvey's copy-bottom-left move) instead of hanging from
              the top of a much taller column. The space this frees collects
              under the headline, where it reads as breathing room rather than
              as a gap beside the CTA. */}
          <div className="lg:col-span-5 lg:self-end">
            <motion.p
              {...rise(0.46)}
              className="max-w-[42ch] text-[clamp(1.02rem,0.98rem+0.36vw,1.2rem)] leading-[1.62] text-[var(--ink-2)]"
            >
              PlacedOn replaces the resume screen with one adaptive conversation
              — then ties every judgement back to the moment in the transcript
              that earned it.
            </motion.p>

            <motion.div
              {...rise(0.56)}
              className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <Button href="/pre-interview" className="!px-7 !py-4 text-[15.5px]">
                Start your interview
              </Button>
              <button
                type="button"
                onClick={() => open("employer")}
                className="cursor-pointer border-b border-[var(--glass-line-hi)] pb-1 text-[15px] font-medium text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:border-[var(--iris)] hover:text-[var(--iris-ink)]"
              >
                Book a demo for your team
              </button>
            </motion.div>
          </div>

          <motion.div {...rise(0.62)} className="lg:col-span-6 lg:col-start-7">
            <NarrowingDiagram reduce={!!reduce} wipe={wipe} />
          </motion.div>
        </div>

        {/* ── colophon: three policies, stated as policies ─────────────── */}
        <div className="mt-[clamp(2.5rem,1.5rem+2.4vw,3rem)]">
          <Rule {...wipe(1.05)} />
          <motion.ul
            {...rise(1.1)}
            className="grid gap-x-12 gap-y-2 pt-4 sm:grid-cols-3"
          >
            {POLICIES.map((policy) => (
              <li
                key={policy}
                className="text-[13px] leading-[1.5] text-[var(--ink-3)]"
              >
                {policy}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/**
 * THE NARROWING — the hero's single visual idea.
 *
 * Deliberately contains no h1–h4: see the CASCADE NOTE at the top of the file.
 * The dark ground would render any heading in --ink on --instrument, invisible.
 */
function NarrowingDiagram({
  reduce,
  wipe,
}: {
  reduce: boolean;
  wipe: (delay: number, duration?: number) => Record<string, unknown>;
}) {
  return (
    <figure
      /* <figure> itself carries the panel, so the <figcaption> can be a direct
         child — nesting it in a wrapper div is invalid HTML. The caption is the
         LAST child (also valid) because it is the disclaimer, and a disclaimer
         belongs after the thing it disclaims. The top line is a plain <p>. */
      className="relative m-0 overflow-hidden rounded-[var(--r-card)] px-[clamp(20px,4vw,38px)] pt-[clamp(22px,3vw,28px)] pb-[clamp(20px,3vw,24px)]"
      style={{
        background:
          "linear-gradient(158deg, var(--instrument-2) 0%, var(--instrument) 68%)",
        border: "1px solid var(--instrument-line)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* A single faint display-case wash so the panel is a surface, not a
          rectangle of paint. Static; nothing here animates. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(78% 58% at 8% 0%, var(--vitrine) 0%, transparent 72%)",
        }}
      />

      <p
        className="relative"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--instrument-ink-2)",
        }}
      >
        How one signal narrows
      </p>

      <ol className="relative mt-[clamp(20px,2.6vw,26px)] space-y-[clamp(18px,2.4vw,26px)]">
        {NARROWING.map((stage, i) => (
          <motion.li
            key={stage.label}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.55, delay: 0.74 + i * 0.14, ease: EASE }
            }
            /* Static indent. The step to the right is layout, not motion —
               animating margin is forbidden and would also thrash layout. */
            style={{ marginInlineStart: stage.indent }}
          >
            <p
              className="text-[clamp(14px,0.86rem+0.16vw,15.5px)] leading-[1.35]"
              style={{
                color: stage.accent ? "var(--white)" : "var(--instrument-ink)",
                fontWeight: stage.accent ? 600 : 500,
              }}
            >
              {stage.label}
            </p>
            <p
              className="mt-[5px] text-[12.5px] leading-[1.45]"
              style={{ color: "var(--instrument-ink-2)" }}
            >
              {stage.note}
            </p>
            {/* The rule IS the narrowing. Width is static; only scaleX moves. */}
            <motion.span
              aria-hidden
              {...wipe(0.86 + i * 0.14, 1.05)}
              className="mt-3 block h-px origin-left"
              style={{
                width: stage.width,
                /* --instrument-line (white @ 10%) is a border tone: at 1px on
                   this ground it is too faint to compare lengths, and the
                   comparison IS the idea. --instrument-ink-2 reads as a quiet
                   hairline at ~4.8:1 — well past the 3:1 AA floor for non-text
                   — while --iris-soft marks the terminus. */
                background: stage.accent
                  ? "var(--iris-soft)"
                  : "var(--instrument-ink-2)",
              }}
            />
          </motion.li>
        ))}
      </ol>

      <figcaption
        className="relative mt-[clamp(18px,2.2vw,22px)] max-w-[46ch] text-[12px] leading-[1.5]"
        style={{ color: "var(--instrument-ink-2)" }}
      >
        A diagram of the method. Not a product screenshot, not a recording, and
        not anybody’s results.
      </figcaption>
    </figure>
  );
}

/** A full-measure hairline that wipes in from the left. */
function Rule(props: Record<string, unknown>) {
  return (
    <motion.span
      aria-hidden
      {...props}
      className="block h-px w-full origin-left"
      style={{ background: "var(--glass-line-hi)" }}
    />
  );
}

/**
 * One headline line, lifted in behind a mask. The mask is padded so the
 * display setting's tight leading cannot clip letterforms.
 */
function Line({
  children,
  delay,
  reduce,
}: {
  children: React.ReactNode;
  delay: number;
  reduce: boolean;
}) {
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: "108%" }}
        animate={{ y: "0%" }}
        transition={reduce ? { duration: 0 } : { duration: 0.95, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}
