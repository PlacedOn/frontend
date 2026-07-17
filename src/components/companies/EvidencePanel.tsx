"use client";

import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Quote, Lock, EyeOff } from "@/components/ui/icons";

type Signal = { trait: string; score: number; quote: string };

const SIGNALS: Signal[] = [
  { trait: "Structured debugging", score: 94, quote: "I bisect the failure — reproduce it, then halve the surface until the cause is isolated." },
  { trait: "Handling ambiguity", score: 89, quote: "When the spec was unclear I wrote down my assumptions and confirmed them before building." },
  { trait: "Ownership", score: 91, quote: "I shipped the fix, then added the alert so it couldn't fail silently again." },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function EvidencePanel() {
  const reduce = useReducedMotion();

  return (
    <section id="evidence" className="shell scroll-mt-28 py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">What you see</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
          Approved signal. <span className="grad-iris">Never the raw interview.</span>
        </h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          You get evidence a hiring manager can defend: every trait backed by the
          candidate&apos;s own words. The full transcript stays sealed, so your process
          stays fair and easy to defend.
        </p>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
        className="mx-auto grid max-w-4xl gap-4 md:grid-cols-[1.5fr_1fr]"
      >
        {/* What you see */}
        <div className="glass rounded-[var(--r-card)] p-6">
          <div className="mb-5 flex items-center gap-2">
            <BadgeCheck size={18} animateOnView style={{ color: "var(--iris-ink)" }} />
            <p className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--ink)]">Candidate evidence, visible to you</p>
          </div>
          <div className="flex flex-col gap-3">
            {SIGNALS.map((s) => (
              <div key={s.trait} className="rounded-[1rem] p-4" style={{ background: "rgba(255,255,255,.55)", border: "1px solid var(--glass-line)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="font-[var(--font-mono)] text-[13px] font-bold" style={{ color: "var(--iris-ink)" }}>{s.score}%</span>
                  <span className="text-[14px] font-semibold text-[var(--ink)]">{s.trait}</span>
                </div>
                <p className="mt-2 flex gap-2 border-l-2 pl-3 text-[13px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-soft)" }}>
                  <Quote size={14} className="mt-0.5 shrink-0" style={{ color: "var(--iris-soft)" }} />
                  {s.quote}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What you never see */}
        <div className="rounded-[var(--r-card)] p-6" style={{ background: "var(--mist)", border: "1px solid var(--glass-line)" }}>
          <div className="mb-5 flex items-center gap-2">
            <EyeOff size={18} animateOnView className="text-[var(--ink-3)]" />
            <p className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--ink-2)]">What you never see</p>
          </div>
          <div className="relative overflow-hidden rounded-[1rem] p-5" style={{ border: "1px dashed var(--glass-line)" }}>
            <div aria-hidden className="flex flex-col gap-2.5" style={{ filter: "blur(5px)", opacity: 0.5 }}>
              {["So walk me through the outage…", "Honestly, at first I panicked and…", "My manager didn't know that I…", "I'd rather not say which team…"].map((line) => (
                <p key={line} className="text-[13px] text-[var(--ink-2)]">{line}</p>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: "var(--ink)", color: "#fff" }}>
                <Lock size={15} animateOnView /> Raw transcript · sealed
              </span>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--ink-3)]">
            Candidates approve what they share. You never handle unfiltered, off-the-record
            answers, which keeps you clear of bias and privacy risk.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
