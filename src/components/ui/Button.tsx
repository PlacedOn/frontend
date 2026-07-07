"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

/** Magnetic button — translates toward the cursor, springs back on leave. */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  ariaLabel,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18 });
  const y = useSpring(my, { stiffness: 260, damping: 18 });

  const handleMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.16);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.16);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold cursor-pointer select-none transition-shadow duration-[var(--d-std)] will-change-transform";
  const styles: Record<Variant, string> = {
    primary: "text-white",
    ghost: "text-[var(--ink)]",
  };

  const inline: React.CSSProperties =
    variant === "primary"
      ? {
          background:
            "linear-gradient(135deg, var(--iris-soft) 0%, var(--iris) 60%, var(--iris-ink) 130%)",
          boxShadow: "var(--shadow-iris)",
        }
      : {
          background: "var(--glass-hi)",
          border: "1px solid var(--glass-line-hi)",
          backdropFilter: "blur(12px)",
          boxShadow: "var(--shadow-sm)",
        };

  const Tag = (href ? motion.a : motion.button) as typeof motion.a;

  return (
    <Tag
      ref={ref as never}
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y, ...inline }}
      whileTap={{ scale: 0.97 }}
      className={cn(base, styles[variant], className)}
    >
      {children}
    </Tag>
  );
}
