"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Eye, EyeOff } from "@/components/ui/icons";

type Trait = { label: string; score: number; quote: string };

const OVERALL = [
  { label: "Technical depth", value: 92 },
  { label: "Communication", value: 88 },
];

const TRAITS: Trait[] = [
  { label: "Structured debugging", score: 94, quote: "I bisect the failure — reproduce it, then halve the surface until the cause is isolated." },
  { label: "Handling ambiguity", score: 89, quote: "When the spec was unclear I wrote down my assumptions and confirmed them before building." },
  { label: "System design", score: 86, quote: "I'd start with the read/write ratio — it decides whether we cache or shard first." },
  { label: "Ownership", score: 91, quote: "I shipped the fix, then added the alert so it couldn't fail silently again." },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function SampleScorecard() {
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState<Record<number, boolean>>({});

  return (
    <section id="sample" className="shell scroll-mt-28 py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Your Trust Passport</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
          One conversation. <span className="grad-iris">Evidence you control.</span>
        </h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          Every score links back to your own words — and you decide, trait by trait,
          what an employer is allowed to see. This is a sample profile.
        </p>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
        className="glass mx-auto max-w-3xl rounded-[var(--r-card)] p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--glass-line)" }}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
              ML
            </span>
            <div>
              <p className="font-[var(--font-display)] text-[16px] font-semibold text-[var(--ink)]">Sample profile</p>
              <p className="text-[13px] text-[var(--ink-3)]">ML Engineer · 4 yrs</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            <BadgeCheck size={15} animateOnView /> Verified via interview
          </span>
        </div>

        {/* Overall bars */}
        <div className="grid gap-5 py-6 sm:grid-cols-2">
          {OVERALL.map((o) => (
            <div key={o.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13.5px] font-semibold text-[var(--ink-2)]">{o.label}</span>
                <span className="font-[var(--font-mono)] text-[15px] font-bold text-[var(--ink)]">{o.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${o.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Trait rows with visibility toggle */}
        <div className="flex flex-col gap-3">
          {TRAITS.map((t, i) => {
            const isHidden = hidden[i];
            return (
              <div
                key={t.label}
                className="rounded-[1rem] p-4 transition-colors"
                style={{ background: isHidden ? "var(--mist)" : "rgba(255,255,255,.55)", border: "1px solid var(--glass-line)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-[var(--font-mono)] text-[13px] font-bold" style={{ color: "var(--iris-ink)" }}>{t.score}%</span>
                    <span className="text-[14px] font-semibold text-[var(--ink)]">{t.label}</span>
                  </div>
                  <button
                    onClick={() => setHidden((h) => ({ ...h, [i]: !h[i] }))}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors"
                    style={
                      isHidden
                        ? { background: "var(--mist)", color: "var(--ink-3)" }
                        : { background: "var(--iris-ghost)", color: "var(--iris-ink)" }
                    }
                    aria-pressed={!isHidden}
                    aria-label={isHidden ? `Show ${t.label} to employers` : `Hide ${t.label} from employers`}
                  >
                    {isHidden ? <><EyeOff size={13} /> Hidden</> : <><Eye size={13} /> Employer-visible</>}
                  </button>
                </div>
                {!isHidden && (
                  <p className="mt-2.5 border-l-2 pl-3 text-[13px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-soft)" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[13px] text-[var(--ink-3)]">
          Tap any trait to hide it. Employers only ever see what stays visible — never your raw interview.
        </p>
      </motion.div>
    </section>
  );
}
