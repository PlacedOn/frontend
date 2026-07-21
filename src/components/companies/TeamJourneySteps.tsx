"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Minus, PlusCircle, Users, ScanSearch, Handshake } from "lucide-react";

type Step = {
  icon: typeof Users;
  title: string;
  blurb: string;
  bullets: string[];
  highlight?: boolean;
};

const STEPS: Step[] = [
  {
    icon: PlusCircle,
    title: "Post a role",
    blurb: "Describe the work, not a wishlist of keywords. Setup takes minutes.",
    bullets: ["No resume parsing", "Define the signals that matter", "Live in minutes"],
  },
  {
    icon: Users,
    title: "Candidates arrive pre-interviewed",
    blurb: "Everyone who matches has already done a full interview, so there are no screening calls to schedule.",
    bullets: ["Zero triage backlog", "No first-round scheduling", "Signal on day one"],
  },
  {
    icon: ScanSearch,
    title: "Review approved evidence",
    blurb: "Read how each candidate actually thinks. Traits backed by their own words, ranked by fit. Never a raw transcript.",
    bullets: ["Every score is sourced", "Defensible to hiring managers", "Bias-audited & contestable"],
    highlight: true,
  },
  {
    icon: Handshake,
    title: "Request an intro",
    blurb: "Reach out to the people worth your time. Candidates opt in, so first conversations start warm.",
    bullets: ["No cold outreach", "Mutual opt-in", "Faster to offer"],
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function TeamJourneySteps() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(2);

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">How it works for teams</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">From open role to warm intro.</h2>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {STEPS.map((step, i) => {
          const isOpen = open === i;
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="glass overflow-hidden rounded-[var(--r-card)]"
              style={step.highlight ? { boxShadow: "0 0 0 1.5px var(--iris-soft), var(--shadow-md)" } : undefined}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: step.highlight ? "linear-gradient(135deg,var(--iris-soft),var(--iris))" : "var(--iris-ghost)", color: step.highlight ? "#fff" : "var(--iris-ink)" }}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-[var(--font-mono)] text-[12px] font-bold text-[var(--ink-3)]">0{i + 1}</span>
                    {step.highlight && (
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                        The difference
                      </span>
                    )}
                  </div>
                  <p className="font-[var(--font-display)] text-[16px] font-semibold text-[var(--ink)]">{step.title}</p>
                </div>
                <span className="shrink-0 text-[var(--ink-3)]">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span>
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
                    <div className="px-5 pb-5 pl-20">
                      <p className="leading-relaxed text-[var(--ink-2)]">{step.blurb}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {step.bullets.map((b) => (
                          <li key={b} className="rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: "var(--mist)", color: "var(--ink-2)" }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
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
