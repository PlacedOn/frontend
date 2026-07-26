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
          // Vibrant appealing violet with a glossy glass sheen — clean and
          // saturated, not muddy. Bright inset top highlight reads as glass.
          background:
            "linear-gradient(135deg, #9a6bff 0%, #7d47f0 55%, #6b36e6 120%)",
          border: "1px solid rgba(255,255,255,0.26)",
          boxShadow:
            "0 16px 36px -12px rgba(123,69,240,0.62), inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -12px 24px -14px rgba(70,30,160,0.55)",
        }
      : {
          // Frosted clear glass for secondary actions.
          background:
            "linear-gradient(158deg, rgba(255,255,255,0.80), rgba(244,242,255,0.56) 72%)",
          border: "1px solid rgba(255,255,255,0.72)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          boxShadow:
            "0 10px 26px -14px rgba(30,24,70,0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
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
