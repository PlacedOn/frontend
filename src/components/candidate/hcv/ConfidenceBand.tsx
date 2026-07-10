"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  score: number; // 0–100
  uncertainty: number; // 0–1
  delay?: number;
};

// How many score-points of half-width one full unit of uncertainty maps to.
const MARGIN = 34;
const ease = [0.22, 0.68, 0.31, 1] as const;

/**
 * The signature Placedon viz: a score shown *with* its calibrated confidence
 * interval. The point estimate is a marker; the translucent band around it is
 * the uncertainty (tight = sure, wide = still forming). RemoteStar shows a flat
 * number — this shows how sure we are.
 */
export function ConfidenceBand({ score, uncertainty, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const hw = uncertainty * MARGIN;
  const lo = Math.max(0, score - hw);
  const hi = Math.min(100, score + hw);

  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-full"
      style={{ background: "var(--mist)" }}
      role="img"
      aria-label={`Score ${score} out of 100, ${Math.round((1 - uncertainty) * 100)} percent confidence`}
    >
      {/* filled portion up to the point estimate */}
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--iris-soft), var(--iris))" }}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${score}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease, delay }}
      />
      {/* uncertainty interval — the band around the estimate */}
      <motion.div
        className="absolute inset-y-0"
        style={{
          left: `${lo}%`,
          width: `${hi - lo}%`,
          background: "rgba(255,255,255,0.5)",
          borderLeft: "1px solid rgba(255,255,255,0.6)",
          borderRight: "1px solid rgba(255,255,255,0.6)",
          mixBlendMode: "overlay",
        }}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.5 }}
      />
      {/* point-estimate marker */}
      <motion.span
        className="absolute inset-y-0 w-[2px]"
        style={{ left: `calc(${score}% - 1px)`, background: "#fff", boxShadow: "0 0 4px rgba(0,0,0,.25)" }}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: delay + 0.6 }}
      />
    </div>
  );
}
