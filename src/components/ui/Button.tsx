"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
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

/** Clean static button — no hover offset drift. */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  ariaLabel,
}: Props) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold cursor-pointer select-none transition-all duration-[var(--d-std)] whitespace-nowrap shrink-0";
  const styles: Record<Variant, string> = {
    primary: "text-white hover:brightness-105",
    ghost: "text-[var(--ink)] hover:bg-white/80",
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
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      style={inline}
      whileTap={{ scale: 0.98 }}
      className={cn(base, styles[variant], className)}
    >
      {children}
    </Tag>
  );
}
