"use client";

import { motion, useReducedMotion } from "motion/react";
import { Users, Flame, ShieldCheck } from "lucide-react";

const COMING = (
  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: "var(--mist)", color: "var(--ink-3)" }}>
    Arriving next
  </span>
);

/**
 * Circle — the people layer. Honest teaser (its tables/actions don't exist yet):
 * no fake avatars, no "0 connections" counter. Frames a no-network user as
 * normal, and describes vouches as witnessed fact, not a like.
 */
export function CircleTeaser({ roleFamily }: { roleFamily: string | null }) {
  return (
    <section aria-labelledby="circle-heading" className="glass flex w-full flex-col rounded-[var(--r-card)] p-6 md:p-7">
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          <Users size={13} aria-hidden /> Your circle
        </p>
        {COMING}
      </div>
      <h2 id="circle-heading" className="mt-2 text-[clamp(1.2rem,1rem+0.7vw,1.5rem)] font-extrabold tracking-tight text-[var(--ink)]">
        You don't need a network to start
      </h2>
      <p className="mt-2 max-w-[42ch] text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        Most people don't start with one — that's normal. When your circle opens, you'll sit with up to
        30 people building toward {roleFamily ? <b className="font-semibold text-[var(--ink)]">{roleFamily}</b> : "the same role"}, see their real progress, and vouch for work you've actually reviewed.
      </p>

      {/* abstract seats — not stock avatars, not a counter */}
      <div className="mt-auto flex items-center gap-2 pt-6" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="size-8 rounded-full border border-dashed" style={{ borderColor: "var(--glass-line-hi)", opacity: 1 - i * 0.13 }} />
        ))}
        <span className="ml-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ink-3)]">
          <ShieldCheck size={13} aria-hidden /> vouches, not likes
        </span>
      </div>
    </section>
  );
}

/**
 * Momentum — the parting high-note (peak-end, rendered last). Honest teaser with
 * one slow float on its mark so the "destination" card feels alive at rest.
 */
export function MomentumTeaser({ artifactCount, coverage }: { artifactCount: number; coverage: number }) {
  const reduce = useReducedMotion();
  const started = artifactCount > 0 || coverage > 0;

  return (
    <section aria-labelledby="momentum-heading" className="glass relative flex w-full flex-col overflow-hidden rounded-[var(--r-card)] p-6 md:p-7">
      <div className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          <Flame size={13} aria-hidden /> Momentum
        </p>
        {COMING}
      </div>

      <motion.div
        aria-hidden
        className="mt-4 grid size-12 place-items-center rounded-2xl"
        style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame size={22} />
      </motion.div>

      <p className="mt-auto pt-5 text-[14px] font-semibold leading-relaxed text-[var(--ink)]">
        {started
          ? "You've started building. Each week, your recap will land here — what you shipped, how your ring moved, and one thing to try next."
          : "Your weekly recap will land here — the work you shipped, how your ring moved, and one thing worth trying next."}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
        It'll always end on the part worth remembering: that you kept going.
      </p>
    </section>
  );
}
