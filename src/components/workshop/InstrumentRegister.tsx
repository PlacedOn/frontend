"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Undo2 } from "lucide-react";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import type { Specimen } from "./SpecimenCard";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pct: number;
  specimens: Specimen[];
};

/** Stagger between unrolled facets, in seconds. */
const FILM_STAGGER = 0.07;

/**
 * The Instrument register — the Facet taken apart. Switching to the dark ground
 * is the wayfinding itself: you have left the everyday porcelain world and
 * entered the evidence world. Every facet is shown as one real, nameable thing,
 * so the number can never read as a hidden score.
 */
export function InstrumentRegister({ isOpen, onClose, pct, specimens }: Props) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  useOverlayDismiss(isOpen, onClose);

  const sealed = specimens.filter((s) => s.sealed).length;

  return (
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Your ring, taken apart"
          className="fixed inset-0 z-[var(--z-register)] flex flex-col justify-center overflow-y-auto px-6 py-14 md:px-14"
          style={{ background: "linear-gradient(165deg, var(--instrument), var(--instrument-2))" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 0.68, 0.31, 1] }}
          onAnimationComplete={() => closeRef.current?.focus()}
        >
          <div className="mx-auto w-full max-w-[var(--max)]">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris-soft)]">
              Instrument · your ring, taken apart
            </p>
            {/* inline colour: the unlayered h1–h4 rule in globals.css beats
                Tailwind's layered text-white utility */}
            <h2
              className="mt-1.5 text-[clamp(1.4rem,1.1rem+1.4vw,2rem)] font-extrabold tracking-tight"
              style={{ color: "#fff" }}
            >
              {pct}% — assembled from {sealed} verified {sealed === 1 ? "facet" : "facets"}, not a guess.
            </h2>
            <p className="mt-1 max-w-[52ch] text-[14px] text-[var(--instrument-ink)]">
              No hidden score. Each facet below is one real thing we can point to. This is the whole
              number, unrolled.
            </p>

            {/* grid, not flex-wrap: a lone film on the last row must stay a
                facet-sized card, never stretch to a full-width bar */}
            <ul className="mt-7 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
              {specimens.map((s, i) => (
                <motion.li
                  key={s.exNo}
                  className="rounded-[16px] border p-4"
                  style={{ background: "var(--vitrine)", borderColor: "var(--instrument-line)" }}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.5,
                    delay: reduce ? 0 : i * FILM_STAGGER,
                    ease: [0.22, 0.68, 0.31, 1],
                  }}
                >
                  <span className="font-mono text-[10.5px] tracking-[0.08em] text-[var(--instrument-ink-2)]">
                    {s.exNo}
                  </span>
                  <h3 className="mt-2 text-[15px] font-bold" style={{ color: "#fff" }}>
                    {s.title}
                  </h3>
                  <div className="mt-1 text-[12px] text-[var(--instrument-ink)]">{s.kind}</div>
                  <div
                    className="mt-3 h-[5px] rounded-full"
                    style={{
                      background: s.sealed
                        ? "linear-gradient(90deg, var(--iris), var(--iris-soft))"
                        : "rgba(255,255,255,.14)",
                    }}
                    aria-hidden
                  />
                </motion.li>
              ))}
            </ul>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="mt-9 inline-flex items-center gap-2 rounded-[13px] border px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97]"
              style={{ background: "var(--vitrine)", borderColor: "var(--instrument-line)" }}
            >
              <Undo2 size={16} aria-hidden /> Roll it back up
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
