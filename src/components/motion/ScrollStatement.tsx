"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";

// Lazy-load the decorative depth field — it's below the fold and client-only,
// so deferring its chunk protects initial paint / LCP.
const EvidenceField = dynamic(
  () => import("@/components/motion/EvidenceField").then((m) => m.EvidenceField),
  { ssr: false },
);

/*
 * "The difference" — an editorial statement staged over a calm depth field.
 * Behind and beside the copy, the EvidenceField suspends three translucent
 * violet evidence planes and the Placedon mark in a gently tilting, orbit-
 * ringed composition (CSS/SVG/Motion only). Key phrases get the violet
 * highlighter sweep as they enter the viewport, a catchy line lands under
 * the statement, and a mono caption rail narrates it: many signals → one
 * conversation.
 */

const ease = [0.16, 1, 0.3, 1] as const;

type Run = { text: string; hl?: boolean };

const RUNS: Run[] = [
  { text: "A resume lists tasks. The interview shows " },
  { text: "judgment under pressure", hl: true },
  { text: ", and whether someone " },
  { text: "lifts the room", hl: true },
  { text: " when the work gets hard. " },
  { text: "One honest conversation", hl: true },
  { text: " — that’s what we help you hire on." },
];

function Highlight({ children }: { children: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.span
        aria-hidden
        className="absolute rounded-[0.28em]"
        style={{
          left: "-0.14em",
          right: "-0.14em",
          top: "0.08em",
          bottom: "0.02em",
          transformOrigin: "left center",
          background:
            "linear-gradient(100deg, rgba(183,155,255,0.5), rgba(154,107,255,0.55))",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{ duration: 0.7, ease }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

function CaptionRail() {
  return (
    <div
      className="mt-12 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-[var(--iris-ink)] md:mt-16"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className="inline-flex items-center gap-2.5">
        <span aria-hidden className="inline-flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-px w-4"
              style={{ background: "rgba(154,107,255,0.75)" }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
            />
          ))}
        </span>
        Many signals
      </span>
      <span className="inline-flex items-center gap-2.5 text-right">
        One conversation
        <motion.span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{
            background: "var(--iris-soft)",
            boxShadow: "0 0 0 3px rgba(154,107,255,0.22)",
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 0.45, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </div>
  );
}

export function ScrollStatement() {
  return (
    <section aria-label="Why interviews beat resumes" className="relative py-20 md:py-28">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[28px] md:rounded-[36px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.74), rgba(255,255,255,0.52))",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "0 30px 80px -34px rgba(105,34,245,0.22), 0 2px 8px rgba(14,16,32,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          {/* the depth field: evidence planes + mark suspended beside the copy */}
          <EvidenceField />

          {/* soft porcelain clearing behind the copy for readability */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(92% 86% at 28% 44%, rgba(247,249,254,0.62), rgba(247,249,254,0) 64%)",
            }}
          />

          <div className="relative z-[1] px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-20">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-9 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[var(--iris-ink)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="h-px w-8" style={{ background: "var(--iris-ink)" }} />
              Beyond the resume
            </motion.p>

            <p className="max-w-[46rem] text-[clamp(1.7rem,1rem+3.4vw,3.5rem)] font-semibold leading-[1.16] tracking-[-0.02em] text-[var(--ink)] lg:max-w-[52rem]">
              {RUNS.map((run, i) =>
                run.hl ? (
                  <Highlight key={i}>{run.text}</Highlight>
                ) : (
                  <span key={i}>{run.text}</span>
                ),
              )}
            </p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
              className="mt-7 text-[clamp(1.15rem,0.9rem+1vw,1.6rem)] font-semibold tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[var(--ink)]">Past the resume. </span>
              <span className="grad-iris">Into the work.</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, ease, delay: 0.25 }}
              className="mt-4 max-w-[34rem] text-[clamp(0.98rem,0.9rem+0.4vw,1.15rem)] leading-relaxed text-[var(--ink-2)]"
            >
              One calm conversation turns into candidate-approved evidence for
              better human hiring decisions.
            </motion.p>

            <CaptionRail />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
