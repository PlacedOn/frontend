"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Scroll-reveal wrapper: rises + fades in once, respects reduced motion. */
export function Reveal({ children, delay = 0, y = 26, className }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.22, 0.68, 0.31, 1] }}
    >
      {children}
    </motion.div>
  );
}
