"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { OverlayPortal } from "@/components/ui/OverlayPortal";

export type Trait = {
  label: string;
  /** The candidate's own words, verbatim — never our paraphrase of them. */
  said: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Accepting the traits — assembles the ring on the Workshop behind this. */
  onAccept: () => void;
  traits: Trait[];
};

/** Beat between trait chips materializing, in ms. Slow on purpose: each one is
 *  a thing the candidate said, and it should land before the next arrives. */
const TRAIT_BEAT = 750;
const FIRST_TRAIT_DELAY = 500;
const FOOT_AFTER = 400;
const CTA_AFTER = 900;

/**
 * The peak moment — the instant an interview becomes evidence. This is the only
 * place in the product where motion overshoots: things here are *materializing*,
 * not settling. The heading is "Here's what we heard," never "Your Results" —
 * nothing is scored, and nothing is public until the candidate says so.
 */
export function OnboardingPeak({ isOpen, onClose, onAccept, traits }: Props) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(0);
  const [showTail, setShowTail] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  useOverlayDismiss(isOpen, onClose);

  // Replay the sequence from the top each time the peak opens.
  useEffect(() => {
    if (!isOpen) {
      setRevealed(0);
      setShowTail(false);
      return;
    }
    if (reduce) {
      setRevealed(traits.length);
      setShowTail(true);
      return;
    }

    const timers = traits.map((_, i) =>
      window.setTimeout(() => setRevealed(i + 1), FIRST_TRAIT_DELAY + i * TRAIT_BEAT),
    );
    const tail = window.setTimeout(
      () => setShowTail(true),
      FIRST_TRAIT_DELAY + traits.length * TRAIT_BEAT + FOOT_AFTER,
    );

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(tail);
    };
  }, [isOpen, reduce, traits]);

  // Move focus to the CTA only once it is actually actionable.
  useEffect(() => {
    if (!showTail) return;
    const id = window.setTimeout(() => ctaRef.current?.focus(), reduce ? 0 : CTA_AFTER - FOOT_AFTER);
    return () => window.clearTimeout(id);
  }, [showTail, reduce]);

  return (
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Here's what we heard"
          className="fixed inset-0 z-[var(--z-peak)] flex flex-col justify-center overflow-y-auto px-6 py-14 md:px-14"
          style={{ background: "linear-gradient(165deg, var(--instrument), var(--instrument-2))" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 0.68, 0.31, 1] }}
        >
          <div className="mx-auto w-full max-w-[var(--max)]">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris-soft)]">
              The moment your evidence became real
            </p>
            {/* inline colour: the unlayered h1–h4 rule in globals.css beats
                Tailwind's layered text-white utility */}
            <h2
              className="mt-2 mb-9 text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-extrabold tracking-tight"
              style={{ color: "#fff" }}
            >
              Here&apos;s what we heard.
            </h2>

            <ul className="flex list-none flex-col gap-3.5" aria-live="polite">
              {traits.slice(0, revealed).map((t) => (
                <motion.li
                  key={t.label}
                  className="flex items-start gap-3"
                  initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.6, ease: [0.34, 1.45, 0.5, 1] } // the one overshoot in the product
                  }
                >
                  <span
                    className="mt-0.5 grid size-[26px] shrink-0 place-items-center rounded-full text-white"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 30%, var(--iris-soft), var(--iris) 70%)",
                    }}
                  >
                    <Check size={14} aria-hidden />
                  </span>
                  <div>
                    <div className="text-[15px] font-bold text-white">{t.label}</div>
                    <div className="mt-0.5 text-[13.5px] italic text-[var(--instrument-ink)]">
                      &ldquo;{t.said}&rdquo;
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.p
              className="mt-7 max-w-[46ch] text-[13.5px] text-[var(--instrument-ink)]"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: showTail ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5 }}
            >
              Nothing here is visible to anyone yet. Review it, edit anything that&apos;s wrong,
              decide what goes on the record.
            </motion.p>

            <motion.div
              className="mt-5 flex flex-wrap gap-2.5"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: showTail ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.4 }}
              // Keep the controls out of the tab order until they are visible.
              style={{ pointerEvents: showTail ? "auto" : "none" }}
              aria-hidden={!showTail}
            >
              <button
                ref={ctaRef}
                type="button"
                onClick={onAccept}
                className="inline-flex items-center gap-2 rounded-[13px] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97]"
                style={{ background: "var(--iris)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--iris) 60%, transparent)" }}
              >
                Put it on my ring →
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-[13px] border px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97]"
                style={{ background: "var(--vitrine)", borderColor: "var(--instrument-line)" }}
              >
                Not yet
              </button>
            </motion.div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
