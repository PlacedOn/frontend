"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * A subtle 3D tilt on hover — the card leans toward the cursor on two
 * spring-smoothed axes (CSS 3D, no WebGL). Enterprise-calm: a few degrees,
 * never a novelty flip. Under reduced-motion it renders a plain, static wrapper.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    ry.set(nx * max);
    rx.set(-ny * max);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={className} style={{ perspective: "800px" }}>
      <motion.div className="h-full" style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
