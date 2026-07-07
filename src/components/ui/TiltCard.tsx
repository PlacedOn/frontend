"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** max tilt in degrees */
  intensity?: number;
};

/**
 * Cursor-reactive 3D tilt + iris glow that follows the pointer.
 * Sets --mx/--my custom props for a glow layer to consume.
 */
export function TiltCard({ children, className, intensity = 3.5 }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * intensity * 2);
    rx.set((0.5 - py) * intensity * 2);
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      className={cn("group relative", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--d-std)] group-hover:opacity-100"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), var(--iris-ghost), transparent 60%)",
        }}
      />
      {children}
    </motion.div>
  );
}
