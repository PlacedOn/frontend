"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Minus } from "@/components/ui/icons";

const FAQS = [
  {
    q: "How are candidates verified?",
    a: "Every candidate completes an interview before they ever reach you. We turn that conversation into traits, each backed by their own words. So what you see is proven, not just claimed.",
  },
  {
    q: "Can I trust the scores?",
    a: "Every trait links to the exact moment it came from, so a hiring manager can read the evidence and push back. Nothing is a mystery, and candidates can challenge their own scores before they publish.",
  },
  {
    q: "Is it compliant?",
    a: "Yes. Our scoring is bias-audited and built to align with NYC Local Law 144 and the EU AI Act. And since you only ever see approved evidence, never a raw transcript, your process stays fair and easy to defend.",
  },
  {
    q: "Why don't I get the full transcript?",
    a: "Off-the-record answers create bias and privacy risk for you, and they stop candidates from being honest. Sealing the transcript and sharing only approved signal protects both sides and keeps your decisions clean.",
  },
  {
    q: "How fast can we start?",
    a: "Post a role in minutes. Matching candidates arrive already interviewed, so there's no screening backlog to clear before you see real signal.",
  },
  {
    q: "How does pricing work?",
    a: "Employers pay to hire; candidates never pay. Book a demo and we'll walk you through a plan that fits how much you hire. No setup fee, cancel anytime.",
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function CompaniesFaq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Questions</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">What hiring teams ask.</h2>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="glass overflow-hidden rounded-[var(--r-card)]">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-[var(--font-display)] text-[15.5px] font-semibold text-[var(--ink)]">{f.q}</span>
                <span className="shrink-0 text-[var(--ink-3)]">{isOpen ? <Minus size={18} animateOnView /> : <Plus size={18} animateOnView />}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 leading-relaxed text-[var(--ink-2)]">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
