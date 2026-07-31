"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

const ease = [0.22, 0.68, 0.31, 1] as const;

const PROOF = [
  { name: "Aisha S.", role: "ML Engineer", fit: "94%" },
  { name: "Rahul V.", role: "Frontend", fit: "91%" },
  { name: "Meera K.", role: "Product Eng", fit: "88%" },
];

export function CandidatesHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="relative flex min-h-[100svh] items-center pt-28 pb-16 md:pt-32">
      <div className="shell grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <motion.span {...rise(0.05)} className="chip">
            <span className="livedot" /> For candidates
          </motion.span>

          <motion.h1 {...rise(0.14)} className="mt-6 text-[clamp(2.5rem,1.2rem+5vw,4.6rem)]">
            Skip the resume pile. Get hired for how you{" "}
            <span className="grad-iris">actually work</span>.
          </motion.h1>

          <motion.p {...rise(0.24)} className="mt-6 text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-relaxed text-[var(--ink-2)]">
            Prove your skills in one honest conversation, then decide exactly what
            employers see. No resume roulette, no ghosting, no mystery score.
          </motion.p>

          <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-3">
            <AnimateIcon animateOnHover>
              <Button href="/pre-interview">
                Take your interview, free
              </Button>
            </AnimateIcon>
            <Button href="#sample" variant="ghost">
              See a sample profile
            </Button>
          </motion.div>

          <motion.p {...rise(0.44)} className="mt-6 flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
            You approve everything before any employer sees it.
          </motion.p>
        </div>

        {/* Proof strip — sample verified candidates */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="glass rounded-[var(--r-card)] p-5"
        >
          <p className="eyebrow mb-3">Verified via interview · sample</p>
          <ul className="flex flex-col gap-2.5">
            {PROOF.map((c) => (
              <li key={c.name} className="flex items-center gap-3 rounded-[1rem] p-3" style={{ background: "rgba(255,255,255,.55)", border: "1px solid var(--glass-line)" }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--ink)]">{c.name}</p>
                  <p className="text-[12.5px] text-[var(--ink-3)]">{c.role}</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  {c.fit} fit
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
