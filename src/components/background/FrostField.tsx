"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Ambient light-world background: soft drifting color mist + a masked
 * dot grid. Fixed, non-interactive, sits beneath all content.
 */
export function FrostField() {
  const reduce = useReducedMotion();

  const orb = (
    delay: number,
    dur: number,
    style: React.CSSProperties,
  ): React.ReactElement => (
    <motion.span
      className="absolute rounded-full"
      style={{ filter: "blur(70px)", ...style }}
      animate={
        reduce ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }
      }
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden opacity-70">
        {orb(0, 30, {
          width: "42vw",
          height: "42vw",
          left: "-8%",
          top: "-10%",
          background:
            "radial-gradient(circle, rgba(139,84,255,.42), transparent 62%)",
        })}
        {orb(2, 36, {
          width: "38vw",
          height: "38vw",
          right: "-10%",
          top: "2%",
          background:
            "radial-gradient(circle, rgba(120,180,255,.38), transparent 64%)",
        })}
        {orb(1, 34, {
          width: "34vw",
          height: "34vw",
          left: "34%",
          bottom: "-16%",
          background:
            "radial-gradient(circle, rgba(255,196,132,.22), transparent 66%)",
        })}
      </div>
      {/* masked dot grid for texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(14,16,32,.14) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 20%, black 20%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 20%, black 20%, transparent 72%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
