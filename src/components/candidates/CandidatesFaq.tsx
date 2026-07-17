"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Minus } from "@/components/ui/icons";

const FAQS = [
  {
    q: "Is it really free for candidates?",
    a: "Yes. Taking the interview and building your Trust Passport costs nothing, and always will. Employers pay to hire — you never do.",
  },
  {
    q: "How long does the interview take?",
    a: "About 25–30 minutes. It adapts to your answers, works on any device, and you can request accommodations before you start.",
  },
  {
    q: "Who sees my results?",
    a: "Only you — until you approve. You review every trait, hide anything you want, and no employer ever sees your raw interview. They only see what you publish.",
  },
  {
    q: "Can I retake it?",
    a: "Yes. If you feel a session didn't represent you, you can retake it. Your latest approved profile is the one employers see.",
  },
  {
    q: "What if I disagree with a score?",
    a: "Every trait links to your own words, so you can see exactly where it came from — and contest it. Nothing you disagree with has to be published.",
  },
  {
    q: "Do I still need a resume?",
    a: "No. The whole point is to be judged on how you actually think and work, not on a document that filters get to reject before a human reads it.",
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function CandidatesFaq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Questions</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Everything you might be wondering.</h2>
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
