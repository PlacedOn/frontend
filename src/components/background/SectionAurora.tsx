"use client";

import { motion } from "motion/react";

/*
 * SectionAurora — a lightweight, always-on luminous backdrop for content
 * sections in the Frost Luxe system. A few soft lavender blobs drift and
 * breathe on GPU-friendly transforms (no canvas, no WebGL), so many sections
 * can carry live motion cheaply. Sits behind content, non-interactive.
 *
 * Drop as the first child of a `relative overflow-hidden` section; place the
 * section's content in a `relative z-[1]` container above it.
 */

type Blob = {
  color: string;
  size: string;
  from: { x: string; y: string };
  x: string[];
  y: string[];
  scale: number[];
  duration: number;
};

const BLOBS: Blob[] = [
  {
    color: "rgba(171, 149, 255,0.30)",
    size: "48%",
    from: { x: "-6%", y: "-14%" },
    x: ["-6%", "14%", "-2%", "-6%"],
    y: ["-14%", "6%", "18%", "-14%"],
    scale: [1, 1.18, 0.94, 1],
    duration: 16,
  },
  {
    color: "rgba(150,190,255,0.24)",
    size: "44%",
    from: { x: "70%", y: "-8%" },
    x: ["70%", "52%", "78%", "70%"],
    y: ["-8%", "14%", "0%", "-8%"],
    scale: [1.1, 0.9, 1.2, 1.1],
    duration: 19,
  },
  {
    color: "rgba(171, 149, 255,0.26)",
    size: "50%",
    from: { x: "36%", y: "58%" },
    x: ["36%", "58%", "22%", "36%"],
    y: ["58%", "40%", "62%", "58%"],
    scale: [1, 1.16, 0.92, 1],
    duration: 22,
  },
];

export function SectionAurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {BLOBS.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.from.x,
            top: b.from.y,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            filter: "blur(64px)",
            willChange: "transform",
          }}
          animate={{ left: b.x, top: b.y, scale: b.scale }}
          transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
