"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import type { RoadmapPhase } from "@/lib/v1";
import { LearningStepRow } from "./LearningStepRow";

/**
 * Sequenced growth roadmap. The spine draws itself as you scroll; each phase
 * rises into view. Every step is a cited catalog item — courses, exams,
 * programs — never AI-invented.
 */
export function RoadmapTimeline({ phases }: { phases: RoadmapPhase[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.55"],
  });
  const spine = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const ordered = [...phases].sort((a, b) => a.order - b.order);

  return (
    <ol ref={ref} className="relative space-y-8 pl-[52px] sm:space-y-10">
      {/* spine track + scroll-drawn fill (transform-only animation) */}
      <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-px" style={{ background: "var(--glass-line-hi)" }} />
      <motion.span
        aria-hidden
        className="absolute top-2 bottom-2 left-[18px] w-[3px] rounded-full"
        style={{
          background: "linear-gradient(180deg, var(--iris), var(--iris-soft))",
          scaleY: reduce ? 1 : spine,
          transformOrigin: "top",
        }}
      />

      {ordered.map((phase, i) => (
        <motion.li
          key={phase.order}
          className="relative"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 0.68, 0.31, 1] }}
        >
          {/* numbered marker sits on the spine */}
          <span
            className="absolute top-0 -left-[52px] grid size-10 place-items-center rounded-full text-[15px] font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, var(--iris-soft), var(--iris))",
              boxShadow: "var(--shadow-iris)",
            }}
            aria-hidden
          >
            {phase.order}
          </span>

          <div className="glass rounded-[var(--r-card)] p-6">
            <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-[18px] font-extrabold tracking-tight text-[var(--ink)]">{phase.title}</h3>
              <p
                className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--iris-ink)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {phase.horizon}
              </p>
            </header>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">{phase.focus}</p>

            {phase.steps.length > 0 && (
              <ul className="mt-4 space-y-2">
                {phase.steps.map((step) => (
                  <LearningStepRow key={`${step.source}-${step.title}`} step={step} />
                ))}
              </ul>
            )}

            {phase.targets.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
                <span className="font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">Unlocks</span>
                {phase.targets.map((target) => (
                  <span
                    key={target}
                    className="rounded-full px-2.5 py-1 font-semibold text-[var(--iris-ink)]"
                    style={{ background: "var(--iris-ghost)" }}
                  >
                    {target}
                  </span>
                ))}
              </p>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
