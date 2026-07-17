"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, BadgeCheck } from "@/components/ui/icons";

type Candidate = {
  name: string;
  role: string;
  experience: string;
  strengths: string[];
  match: number;
  reason: string;
};

const CANDIDATES: Candidate[] = [
  {
    name: "Aisha S.",
    role: "ML Engineer",
    experience: "4 yrs · remote",
    strengths: ["Structured debugging", "Ambiguity"],
    match: 94,
    reason: "reasoned cleanly through an under-specified failure, stated assumptions first",
  },
  {
    name: "Rahul V.",
    role: "Backend Engineer",
    experience: "6 yrs · hybrid",
    strengths: ["System design", "Ownership"],
    match: 91,
    reason: "walked read/write tradeoffs before reaching for a cache; owned the incident fix end-to-end",
  },
  {
    name: "Meera K.",
    role: "Platform Engineer",
    experience: "5 yrs · remote",
    strengths: ["Reliability", "Communication"],
    match: 88,
    reason: "explained a rollback decision a non-engineer could follow, no jargon",
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function CandidateMatchCarousel() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    setDir(n);
    setI((prev) => (prev + n + CANDIDATES.length) % CANDIDATES.length);
  };

  const c = CANDIDATES[i];

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Your shortlist, pre-interviewed</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Ranked on proof, with the reason.</h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          Each candidate comes with <em>why</em> they fit — the exact evidence, not a keyword overlap. Sample profiles shown.
        </p>
      </div>

      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[var(--iris-ghost)]"
          style={{ border: "1px solid var(--glass-line)", color: "var(--ink-2)" }}
          aria-label="Previous candidate"
        >
          <ChevronLeft size={20} animateOnHover />
        </button>

        <div className="relative min-h-[300px] min-w-0 flex-1 sm:min-h-[260px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease }}
              className="glass rounded-[var(--r-card)] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
                    {c.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--ink)]">{c.name}</h3>
                    <p className="truncate text-[13px] text-[var(--ink-3)]">{c.role} · {c.experience}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[var(--font-mono)] text-[26px] font-bold leading-none" style={{ color: "var(--iris-ink)" }}>{c.match}%</p>
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">match</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  <BadgeCheck size={13} /> Verified via interview
                </span>
                {c.strengths.map((s) => (
                  <span key={s} className="rounded-full px-3 py-1 text-[12.5px] font-medium text-[var(--ink-2)]" style={{ border: "1px solid var(--glass-line)" }}>{s}</span>
                ))}
              </div>

              <div className="mt-4 rounded-[0.9rem] p-3.5" style={{ background: "var(--mist)" }}>
                <p className="text-[13px] leading-relaxed text-[var(--ink-2)]">
                  <span className="font-semibold text-[var(--ink)]">Why they fit:</span> {c.reason}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[var(--iris-ghost)]"
          style={{ border: "1px solid var(--glass-line)", color: "var(--ink-2)" }}
          aria-label="Next candidate"
        >
          <ChevronRight size={20} animateOnHover />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {CANDIDATES.map((_, n) => (
          <button
            key={n}
            onClick={() => { setDir(n > i ? 1 : -1); setI(n); }}
            className="h-2 cursor-pointer rounded-full transition-all"
            style={{ width: n === i ? 24 : 8, background: n === i ? "var(--iris)" : "var(--glass-line)" }}
            aria-label={`Go to candidate ${n + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
