"use client";

import { motion, useReducedMotion } from "motion/react";

/*
 * Living gradient-mesh backdrop. Adapted from 21st.dev "Aurora Background"
 * by @dev.yadhakim (Linear/Vercel/Stripe-style morphing blobs), retuned to
 * the Placedon Frost Luxe palette and made reduced-motion safe. Fixed,
 * non-interactive, sits beneath all content with a masked dot grid on top.
 */

type Blob = {
  color: string;
  size: string;
  x: string[];
  y: string[];
  scale: number[];
  duration: number;
};

const BLOBS: Blob[] = [
  { color: "rgba(139,84,255,0.34)", size: "60%", x: ["6%", "40%", "22%", "56%", "6%"], y: ["-16%", "8%", "34%", "-8%", "-16%"], scale: [1, 1.18, 0.92, 1.1, 1], duration: 26 },
  { color: "rgba(105,34,245,0.24)", size: "54%", x: ["58%", "24%", "74%", "40%", "58%"], y: ["54%", "22%", "48%", "72%", "54%"], scale: [1.1, 0.85, 1.25, 0.95, 1.1], duration: 31 },
  { color: "rgba(120,178,255,0.24)", size: "48%", x: ["78%", "36%", "60%", "16%", "78%"], y: ["-8%", "26%", "60%", "38%", "-8%"], scale: [0.9, 1.25, 1, 1.15, 0.9], duration: 28 },
  { color: "rgba(184,155,255,0.22)", size: "44%", x: ["28%", "64%", "12%", "48%", "28%"], y: ["66%", "12%", "30%", "58%", "66%"], scale: [1, 1.1, 0.85, 1.2, 1], duration: 34 },
  { color: "rgba(255,196,132,0.16)", size: "62%", x: ["48%", "14%", "66%", "30%", "48%"], y: ["30%", "56%", "-8%", "48%", "30%"], scale: [1.2, 0.9, 1.1, 0.88, 1.2], duration: 23 },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AuroraMesh() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      <div className="absolute inset-0 overflow-hidden">
        {BLOBS.map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              left: b.x[0],
              top: b.y[0],
              background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
              filter: "blur(78px)",
              willChange: "transform",
            }}
            animate={reduce ? undefined : { left: b.x, top: b.y, scale: b.scale }}
            transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* noise for depth */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat" }}
      />

      {/* masked dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(14,16,32,.13) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage: "radial-gradient(ellipse 72% 56% at 50% 18%, black 20%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(ellipse 72% 56% at 50% 18%, black 20%, transparent 74%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
