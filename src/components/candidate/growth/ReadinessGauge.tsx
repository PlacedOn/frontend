"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/ui/CountUp";
import { READINESS_NOTE } from "./chips";

type Props = {
  /** Coverage of the role's public requirements (0–100). Never selection odds. */
  pct: number;
  size?: number;
  /** Visual + type scale: "hero" for the headline dial, "mini" inside role cards. */
  variant?: "hero" | "mini";
};

const ARC_DEGREES = 264;
const START_ROTATION = 138; // arc opens at the bottom, symmetric

/**
 * Radial readiness dial. The arc = share of a role's PUBLIC requirements the
 * candidate has evidenced. Deliberately labelled "readiness", never a
 * probability of selection.
 */
export function ReadinessGauge({ pct, size = 220, variant = "hero" }: Props) {
  const reduce = useReducedMotion();
  const gradId = useId();
  // Observe the HTML wrapper, not the SVG circle: IntersectionObserver never
  // fires on SVG children (no CSS box), so whileInView on the circle is inert.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  const stroke = variant === "hero" ? 13 : 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = (ARC_DEGREES / 360) * c;
  const clamped = Math.max(0, Math.min(100, pct));
  const filled = arc * (clamped / 100);
  const ticks = variant === "hero" ? [0, 25, 50, 75, 100] : [];

  return (
    <div
      ref={rootRef}
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)}% readiness — ${READINESS_NOTE}`}
      title={READINESS_NOTE}
    >
      <svg width={size} height={size} className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--iris)" />
            <stop offset="100%" stopColor="var(--iris-soft)" />
          </linearGradient>
        </defs>
        <g style={{ transform: `rotate(${START_ROTATION}deg)`, transformOrigin: "50% 50%" }}>
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--mist)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
          />
          {/* value arc — dashoffset animates from empty to coverage */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
            initial={reduce ? false : { strokeDashoffset: arc }}
            animate={{ strokeDashoffset: reduce || inView ? arc - filled : arc }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, ease: [0.22, 0.68, 0.31, 1], delay: 0.15 }}
            style={reduce ? { strokeDashoffset: arc - filled } : undefined}
          />
        </g>
        {/* hero tick marks for instrument feel */}
        {ticks.map((t) => {
          const angle = ((START_ROTATION + (t / 100) * ARC_DEGREES) * Math.PI) / 180;
          const r1 = r - stroke * 1.15;
          const r2 = r - stroke * 1.75;
          // Round to 3dp so the server and client serialize identical coords —
          // raw float trig differs in the last digits and trips hydration.
          const round = (n: number) => Math.round(n * 1000) / 1000;
          return (
            <line
              key={t}
              x1={round(size / 2 + r1 * Math.cos(angle))}
              y1={round(size / 2 + r1 * Math.sin(angle))}
              x2={round(size / 2 + r2 * Math.cos(angle))}
              y2={round(size / 2 + r2 * Math.sin(angle))}
              stroke="var(--glass-line-hi)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="relative text-center" style={{ transform: "translateZ(30px)" }}>
        <p
          className={
            variant === "hero"
              ? "text-[clamp(2.6rem,2rem+2vw,3.4rem)] font-extrabold leading-none tracking-tight text-[var(--ink)]"
              : "text-[22px] font-extrabold leading-none tracking-tight text-[var(--ink)]"
          }
        >
          <CountUp to={Math.round(clamped)} duration={1400} />
          <span className={variant === "hero" ? "text-[0.5em] font-bold text-[var(--ink-3)]" : "text-[0.6em] font-bold text-[var(--ink-3)]"}>%</span>
        </p>
        <p
          className={
            variant === "hero"
              ? "mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--iris-ink)]"
              : "mt-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]"
          }
        >
          readiness
        </p>
      </div>
    </div>
  );
}
