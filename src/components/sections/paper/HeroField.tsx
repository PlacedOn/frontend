"use client";

import { useReducedMotion } from "motion/react";

/**
 * A faint constellation behind the hero — nodes that twinkle and slowly drift,
 * echoing the capability network without shouting. Deliberately below the
 * attention threshold: it adds life, never distraction. Deterministic positions
 * (no hydration mismatch), GPU-only, and fully static under reduced-motion.
 */

const COLS = 9;
const ROWS = 5;

// Deterministic scatter — a grid nudged by a sine so it reads organic, not tiled.
const DOTS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const x = ((c + 0.5) / COLS) * 100 + Math.sin(i * 1.7) * 3.2;
  const y = ((r + 0.5) / ROWS) * 100 + Math.cos(i * 2.3) * 4.5;
  const accent = i % 17 === 0;
  return { x, y, accent, delay: (i % 11) * 0.5, rad: accent ? 2.4 : 1.7 };
});

export function HeroField() {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${reduce ? "" : "herofield--animate"}`}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <g className="hf-group">
        {DOTS.map((d, i) => (
          <circle
            key={i}
            className="hf-dot"
            cx={d.x}
            cy={d.y}
            r={d.rad}
            fill={d.accent ? "var(--iris)" : "var(--ink)"}
            style={{ opacity: reduce ? 0.08 : undefined, animationDelay: `${d.delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
