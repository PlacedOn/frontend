import Link from "next/link";
import type { ReactNode } from "react";
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

/**
 * Button — flat and calm. Solid ink for primary, a hairline paper surface for
 * secondary. No magnetic motion, no gradient, no glass: the label leads, a
 * quiet hover confirms it's interactive.
 */
export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  ariaLabel,
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[15px] font-semibold cursor-pointer select-none transition-colors duration-[var(--d-micro)]";

  const styles: Record<Variant, string> = {
    primary: "bg-[var(--ink)] text-[var(--white)] hover:bg-[color-mix(in_oklab,var(--ink),#000_14%)]",
    ghost:
      "bg-[var(--white)] text-[var(--ink)] border border-[var(--glass-line)] hover:border-[var(--glass-line-hi)] hover:bg-[var(--mist)]",
  };

  const cls = cn(base, styles[variant], className);

  if (href) {
    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}
