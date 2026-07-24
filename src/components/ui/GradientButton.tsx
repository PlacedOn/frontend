import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The house "iris gradient" action, formalized. This exact linear-gradient +
 * shadow-iris pill was hand-rolled inline across the app (CandidateHub,
 * PreInterviewBody, …); this is the single source of truth.
 *
 * Renders a Link when `href` is set, otherwise a button.
 */
type Size = "md" | "lg";
type Variant = "primary" | "ghost";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const SIZE: Record<Size, string> = {
  md: "px-4 py-2.5 text-[13.5px]",
  lg: "px-6 py-3.5 text-[15px]",
};

function classesFor(size: Size, variant: Variant, disabled: boolean): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] font-bold transition-transform active:scale-[0.98] focus-visible:outline-none";
  const state = disabled ? "opacity-55 pointer-events-none" : "";
  const tone =
    variant === "primary"
      ? "text-white"
      : "text-[var(--ink-2)] hover:text-[var(--ink)] border";
  return `${base} ${SIZE[size]} ${tone} ${state}`;
}

function styleFor(variant: Variant): React.CSSProperties {
  if (variant === "primary") {
    return {
      background: "linear-gradient(135deg,var(--iris-soft),var(--iris))",
      boxShadow: "var(--shadow-iris)",
    };
  }
  return { borderColor: "var(--glass-line-hi)", background: "var(--glass)" };
}

export function GradientButton({
  children,
  href,
  onClick,
  type = "button",
  size = "md",
  variant = "primary",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const cls = `${classesFor(size, variant, disabled)} ${className}`.trim();
  const style = styleFor(variant);

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} style={style} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
