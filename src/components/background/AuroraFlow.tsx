"use client";

import { motion, useReducedMotion } from "motion/react";

/*
 * AuroraFlow — a living, visible backdrop in the Frost Luxe palette.
 * Flowing violet gradient waves + slow drifting "cloud" shapes + a subtle
 * rotating aurora sheen, over a masked dot grid and fine grain. Fixed,
 * non-interactive, compositor-friendly (transform/opacity only), and
 * reduced-motion safe. Sits beneath all content at z-0.
 */

type Blob = {
  color: string;
  size: string;
  left: string;
  top: string;
  x: number[];
  y: number[];
  scale: number[];
  duration: number;
};

const BLOBS: Blob[] = [
  { color: "rgba(139,84,255,0.42)", size: "52vw", left: "2%", top: "-14%", x: [0, 120, -40, 0], y: [0, 60, 120, 0], scale: [1, 1.15, 0.95, 1], duration: 22 },
  { color: "rgba(105,34,245,0.34)", size: "46vw", left: "54%", top: "6%", x: [0, -110, 60, 0], y: [0, 80, -30, 0], scale: [1.05, 0.9, 1.2, 1.05], duration: 27 },
  { color: "rgba(120,178,255,0.32)", size: "42vw", left: "66%", top: "34%", x: [0, -80, 40, 0], y: [0, -60, 40, 0], scale: [0.95, 1.2, 1, 0.95], duration: 30 },
  { color: "rgba(255,196,132,0.20)", size: "40vw", left: "22%", top: "44%", x: [0, 90, -50, 0], y: [0, -40, 60, 0], scale: [1.1, 0.92, 1.15, 1.1], duration: 25 },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AuroraFlow() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* slow rotating aurora sheen */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax]"
        style={{
          marginLeft: "-75vmax",
          marginTop: "-75vmax",
          background:
            "conic-gradient(from 0deg, rgba(139,84,255,0.14), rgba(120,178,255,0.06), rgba(255,196,132,0.05), rgba(105,34,245,0.14), rgba(139,84,255,0.14))",
          filter: "blur(50px)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* flowing gradient waves */}
      {BLOBS.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            top: b.top,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            filter: "blur(56px)",
            willChange: "transform",
          }}
          animate={reduce ? undefined : { x: b.x, y: b.y, scale: b.scale }}
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* drifting soft cloud shapes (remotestar-style) */}
      <motion.span
        className="absolute"
        style={{
          left: "-12%",
          top: "12%",
          width: "46vw",
          height: "22vw",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.66), transparent 70%)",
          filter: "blur(24px)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: ["0%", "18%", "0%"], y: ["0%", "6%", "0%"] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute"
        style={{
          right: "-14%",
          top: "40%",
          width: "50vw",
          height: "24vw",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.6), transparent 72%)",
          filter: "blur(28px)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: ["0%", "-16%", "0%"], y: ["0%", "-5%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* grain for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat" }}
      />

      {/* masked dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(14,16,32,.14) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage: "radial-gradient(ellipse 78% 60% at 50% 20%, black 18%, transparent 76%)",
          WebkitMaskImage: "radial-gradient(ellipse 78% 60% at 50% 20%, black 18%, transparent 76%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
