"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Placedon brand mark (from placedon_mark.svg) set in an animated
 * frosted-glass tile: a slow rotating iris sheen behind the glyph,
 * a gentle float, and a soft glow pulse. Glyph is filled with
 * var(--iris) so it tracks the brand token.
 */
export function Logo({ size = 34, showWordmark = true, className }: Props) {
  const reduce = useReducedMotion();
  const radius = size * 0.3;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative grid place-items-center overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background:
            "linear-gradient(150deg, rgba(255,255,255,.92), rgba(255,255,255,.55))",
          border: "1px solid var(--glass-line-hi)",
          boxShadow: "var(--shadow-iris), inset 0 1px 0 rgba(255,255,255,.85)",
          backdropFilter: "blur(10px)",
        }}
        aria-hidden="true"
      >
        {/* rotating iris sheen */}
        <motion.span
          className="absolute inset-[-30%]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--iris-ghost) 80deg, transparent 190deg)",
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        {/* brand glyph */}
        <motion.svg
          width={size * 0.56}
          height={size * 0.56}
          viewBox="133 119 354 400"
          fill="none"
          className="relative"
          animate={reduce ? undefined : { y: [0, -1.4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z"
            fill="var(--iris)"
          />
          <path
            d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z"
            fill="var(--iris)"
          />
        </motion.svg>
      </span>

      {showWordmark && (
        <span
          className="text-[19px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Placed<span className="grad-iris">on</span>
        </span>
      )}
    </span>
  );
}
