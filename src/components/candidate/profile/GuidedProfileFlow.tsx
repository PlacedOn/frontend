"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useProfileBuilder, profileGaps } from "./useProfileBuilder";
import { ProfileReadiness } from "./ProfileReadiness";
import { IdentitySection } from "./IdentitySection";
import { IntentSection } from "./IntentSection";
import { SkillsSection } from "./SkillsSection";
import { HighlightsSection } from "./HighlightsSection";
import { TimelineSection } from "./TimelineSection";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { id: "identity", label: "You", hint: "Who you are", Comp: IdentitySection },
  { id: "intent", label: "Goals", hint: "What you're looking for", Comp: IntentSection },
  { id: "skills", label: "Skills", hint: "What you'd claim", Comp: SkillsSection },
  { id: "highlights", label: "Stories", hint: "What you've shipped", Comp: HighlightsSection },
  { id: "timeline", label: "History", hint: "Your background", Comp: TimelineSection },
] as const;

/**
 * Guided, mobile-first profile creation. Same fields, same autosave hook, same
 * sections as the long-form builder — but one step at a time, with progress and
 * a clear next, so a first-time candidate is led rather than faced with a wall.
 * The profile is claims + intent; the interview is what verifies them, so the
 * flow ends by handing off to the interview.
 */
export function GuidedProfileFlow() {
  const reduce = useReducedMotion();
  const { profile, update, saveState, fromBackend, momentum } = useProfileBuilder();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const last = STEPS.length - 1;
  const Current = STEPS[step].Comp;

  const next = () => (step < last ? setStep((s) => s + 1) : setDone(true));
  const back = () => (done ? setDone(false) : setStep((s) => Math.max(0, s - 1)));

  if (done) {
    return (
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 0.4, ease: EASE }}
        className="glass mx-auto max-w-xl rounded-[26px] p-7 text-center md:p-9"
      >
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
          <Check size={22} aria-hidden />
        </span>
        <h2 className="text-[clamp(1.3rem,1.1rem+1vw,1.7rem)] font-extrabold tracking-tight text-[var(--ink)]">
          Your profile is a start — now let&rsquo;s make it evidence.
        </h2>
        <p className="mx-auto mt-2.5 max-w-[42ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Everything you wrote is a <b className="font-semibold text-[var(--ink)]">claim</b>. The interview is what turns it into proof
          only you control — it probes exactly what you flagged, in your own words.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/pre-interview"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            <Sparkles size={16} aria-hidden /> Take your interview
          </Link>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          >
            <ArrowLeft size={15} aria-hidden /> Keep editing
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <ProfileReadiness momentum={momentum} gaps={profileGaps(profile)} onJump={setStep} />

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-[var(--ink-2)]">
            Step {step + 1} of {STEPS.length} · <span className="text-[var(--ink-3)]">{STEPS[step].hint}</span>
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ink-3)]">
            {fromBackend && <span className="livedot" />}
            {saveState === "saving" ? "Saving…" : fromBackend ? "Autosaving" : `${momentum}% complete`}
          </span>
        </div>
        {/* segmented step bar */}
        <div className="mt-2 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--iris)" : "var(--mist)" }}
            />
          ))}
        </div>
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={STEPS[step].id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: reduce ? 0.2 : 0.32, ease: EASE }}
        >
          <Current profile={profile} update={update} />
        </motion.div>
      </AnimatePresence>

      {/* Nav — sticky-feeling, thumb-reachable */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-[14px] border px-5 py-3 text-[14px] font-bold text-[var(--ink-2)] transition-colors disabled:opacity-40"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        <button
          type="button"
          onClick={next}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98] sm:flex-none"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          {step === last ? "Finish" : "Next"} <ArrowRight size={16} aria-hidden />
        </button>
      </div>
      <p className="text-center text-[12px] text-[var(--ink-3)]">
        Saved as you go. It never asks about college or background — only your work.
      </p>
    </div>
  );
}
