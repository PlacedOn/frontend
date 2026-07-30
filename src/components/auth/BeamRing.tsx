"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  radius?: string;
};

/**
 * Liquid-Glass accent: a soft iris light beam that travels along a card
 * border. Rendered as a masked 1.5px ring so only the edge catches light.
 * Rotation is transform-only (compositor-friendly) and reduced-motion safe:
 * with motion off it settles into a static corner-lit gradient.
 */
export function BeamRing({ radius = "var(--r-card)" }: Props) {
  const reduce = useReducedMotion();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        borderRadius: radius,
        padding: 1.5,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
      }}
    >
      {reduce ? (
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(125deg, var(--iris-line) 0%, transparent 38%, transparent 62%, var(--iris-line) 100%)",
          }}
        />
      ) : (
        <motion.span
          className="absolute"
          style={{
            inset: "-75%",
            willChange: "transform",
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(115, 54, 255,0.5) 52deg, rgba(142, 100, 255,0.26) 84deg, transparent 128deg, transparent 214deg, rgba(142, 100, 255,0.22) 262deg, transparent 306deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      )}
    </span>
  );
}
