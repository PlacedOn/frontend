"use client";

import { motion } from "motion/react";

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
  { color: "rgba(171, 149, 255,0.34)", size: "60%", x: ["6%", "44%", "18%", "58%", "6%"], y: ["-16%", "12%", "40%", "-12%", "-16%"], scale: [1, 1.24, 0.88, 1.14, 1], duration: 13 },
  { color: "rgba(142, 100, 255,0.26)", size: "54%", x: ["58%", "20%", "78%", "38%", "58%"], y: ["54%", "18%", "52%", "76%", "54%"], scale: [1.1, 0.82, 1.3, 0.92, 1.1], duration: 15 },
  { color: "rgba(150,190,255,0.24)", size: "48%", x: ["78%", "32%", "64%", "12%", "78%"], y: ["-8%", "30%", "66%", "40%", "-8%"], scale: [0.9, 1.3, 1, 1.18, 0.9], duration: 14 },
  { color: "rgba(203, 193, 255,0.24)", size: "44%", x: ["28%", "68%", "8%", "50%", "28%"], y: ["66%", "8%", "28%", "60%", "66%"], scale: [1, 1.14, 0.82, 1.24, 1], duration: 16 },
  { color: "rgba(255,205,150,0.15)", size: "62%", x: ["48%", "10%", "70%", "28%", "48%"], y: ["30%", "60%", "-10%", "50%", "30%"], scale: [1.24, 0.88, 1.14, 0.86, 1.24], duration: 11 },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AuroraMesh() {
  // Ambient decorative motion plays regardless of the OS reduced-motion
  // setting — the blobs morph slowly and are non-vestibular. (macOS "Reduce
  // Motion" was otherwise freezing the mesh to a single static frame.)
  const reduce = false;

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
