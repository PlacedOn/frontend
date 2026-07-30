"use client";

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
 * The one button.
 *
 * This used to be a magnetic glass button: a three-stop violet gradient, a 36px
 * violet bloom, two inset highlights, and a spring that pulled the button
 * toward the cursor. On white it read as a neon pill floating off the page, and
 * because every primary action in the app routes through here, that one glow was
 * the single loudest violet on the site — the "high violet impact" that kept
 * surviving every repaint of the sections around it.
 *
 * Flat now. One accent fill, one real shadow in the neutral ramp, colour on
 * hover. The motion that remains is the motion that means something: the
 * pressed state. A cursor-following drift told the user nothing about what the
 * button does.
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
    "relative inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-fast,150ms)] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const styles: Record<Variant, string> = {
    primary:
      "bg-[var(--accent)] text-white shadow-[0_1px_2px_rgba(16,15,13,0.10)] outline-[var(--accent)] hover:bg-[var(--accent-ink)]",
    ghost:
      "border border-[var(--line-2)] bg-[var(--paper)] text-[var(--ink)] shadow-[var(--shadow-sm)] outline-[var(--accent)] hover:bg-[var(--paper-2)] hover:border-[var(--ink-3)]",
  };

  const cls = cn(base, styles[variant], className);

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}
