"use client";

/**
 * The Seam — the threshold between the presentation layer (porcelain, "a person
 * talking") and the evidence layer (dark, "an instrument panel"). The ground
 * visibly changes here; this is where the firewall is taught by feel, not by a
 * badge. Rule draws in via transform:scaleX (never width); label slides in once.
 */

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function LayerSeam() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center overflow-hidden py-20"
      style={{ background: "linear-gradient(180deg, var(--porcelain) 0%, #1a1d3a 62%, #13152e 100%)" }}
    >
      <div className="relative flex w-full max-w-[var(--max)] items-center gap-4 px-6">
        {/* left rule — draws outward from the label */}
        <motion.span
          className="h-px flex-1 origin-right"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,84,255,0.5))" }}
          initial={reduce ? { opacity: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: reduce ? 0 : 0.62, ease: EASE_OUT }}
        />
        <motion.span
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85"
          style={{ fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,84,255,0.3)", backdropFilter: "blur(6px)" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: reduce ? 0.3 : 0.5, ease: EASE_OUT, delay: 0.15 }}
        >
          <ShieldCheck size={13} className="text-[var(--iris-soft)]" />
          Evidence — verified by an honest interview
        </motion.span>
        <motion.span
          className="h-px flex-1 origin-left"
          style={{ background: "linear-gradient(90deg, rgba(139,84,255,0.5), transparent)" }}
          initial={reduce ? { opacity: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: reduce ? 0 : 0.62, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}
