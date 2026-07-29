"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus, Minus, Mic, ClipboardCheck, ShieldCheck, Sparkles } from "@/components/ui/icons";

type Step = {
  icon: typeof Mic;
  title: string;
  blurb: string;
  bullets: string[];
  highlight?: boolean;
};

const STEPS: Step[] = [
  {
    icon: Mic,
    title: "Take the interview",
    blurb: "A 25–30 minute conversation. No resume, no whiteboard theatre.",
    bullets: ["Works on any device", "Accommodations available", "Free, always"],
  },
  {
    icon: ClipboardCheck,
    title: "Review your evidence",
    blurb: "We turn the conversation into traits, each backed by a quote from you.",
    bullets: ["See every score's source", "Contest anything that feels off", "Nothing is public yet"],
  },
  {
    icon: ShieldCheck,
    title: "Approve what employers see",
    blurb: "You decide, trait by trait, what leaves your profile. Your raw interview never does.",
    bullets: ["Hide any trait", "Employers never see the transcript", "Change it anytime"],
    highlight: true,
  },
  {
    icon: Sparkles,
    title: "Get matched",
    blurb: "Roles come to you with the reason attached, matched on evidence, not keywords.",
    bullets: ["See why each role fits", "Approve intros one by one", "No cold applications"],
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function JourneySteps() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(2);

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">How it works for you</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Four steps. You hold the veto.</h2>
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
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border"
                  style={{ background: "color-mix(in oklab, var(--iris) 6%, transparent)", borderColor: "var(--iris-line)", color: "var(--iris-ink)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
                >
                  <Icon size={20} animateOnView animateOnHover />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-[var(--font-mono)] text-[12px] font-bold text-[var(--ink-3)]">0{i + 1}</span>
                    {step.highlight && (
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                        Your edge
                      </span>
                    )}
                  </div>
                  <p className="font-[var(--font-display)] text-[16px] font-semibold text-[var(--ink)]">{step.title}</p>
                </div>
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
