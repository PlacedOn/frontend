import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Primitives — the layer that has never existed here, and whose absence is why
 * six redesigns all read as "no change".
 *
 * The page currently carries 7+ distinct section paddings and 8+ container
 * widths because every section was built standalone. Recolouring bones that do
 * not line up cannot produce a designed page. These components own spacing,
 * measure, type, and colour so sections stop deciding for themselves.
 *
 * The rule, and the whole point: a section may not set its own padding,
 * max-width, font-size, or colour. If it needs to, the primitive is wrong and
 * the primitive gets fixed.
 *
 * See docs/FRONTEND-REBUILD-SPEC.md for the values and the reasoning.
 */

/* ── layout ─────────────────────────────────────────────────────────── */

/** Outer bound. One of exactly two widths in the system. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full", className)}
      style={{ maxWidth: "var(--w-page)", paddingInline: "var(--pad-page)" }}
    >
      {children}
    </div>
  );
}

/** Prose measure. The other of the two widths. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ maxWidth: "var(--w-text)" }}>
      {children}
    </div>
  );
}

/**
 * A page section. Owns the one section rhythm (--space-xl) and the tone.
 *
 * `tone="ink"` swaps the foreground tokens for their on-dark equivalents, so
 * children never need to know what ground they are on — Eyebrow, Text and
 * Button all read --local-* and adapt. That is what stops dark sections from
 * needing a parallel set of components.
 */
export function Section({
  tone = "paper",
  labelledBy,
  children,
  className,
}: {
  tone?: "paper" | "ink";
  /** id of this section's heading. Required — a section without one is unlabelled to a screen reader. */
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  const ink = tone === "ink";
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("relative", className)}
      style={{
        paddingBlock: "var(--space-xl)",
        background: ink ? "var(--ink-bg)" : "var(--paper)",
        // consumed by every primitive below
        ["--local-fg" as string]: ink ? "var(--on-ink)" : "var(--ink)",
        ["--local-fg-2" as string]: ink ? "var(--on-ink-2)" : "var(--ink-2)",
        ["--local-fg-3" as string]: ink ? "var(--on-ink-3)" : "var(--ink-3)",
        ["--local-line" as string]: ink ? "rgba(255,255,255,0.14)" : "var(--line)",
      }}
    >
      {children}
    </section>
  );
}

/** Hairline. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0", className)} style={{ height: 1, background: "var(--local-line, var(--line))" }} />;
}

/* ── type ───────────────────────────────────────────────────────────── */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn("uppercase", className)}
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-med)" as unknown as number,
        letterSpacing: "var(--tracking-label)",
        color: "var(--local-fg-3, var(--ink-3))",
      }}
    >
      {children}
    </p>
  );
}

const HEADING_SIZE = {
  1: { size: "var(--text-hero)", tracking: "var(--tracking-hero)", leading: "var(--leading-hero)" },
  2: { size: "var(--text-3xl)", tracking: "var(--tracking-head)", leading: "var(--leading-head)" },
  3: { size: "var(--text-lg)", tracking: "-0.015em", leading: "1.25" },
} as const;

/**
 * Heading. Colour is set inline deliberately: globals.css carries a
 * `h1,h2,h3,h4 { color }` base rule, and while it now lives in @layer base
 * (so utilities win), an explicit value here removes the question entirely.
 * Two invisible-headline bugs came from getting this wrong.
 */
export function Heading({
  level,
  id,
  children,
  className,
}: {
  level: 1 | 2 | 3;
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const Tag = (["h1", "h2", "h3"] as const)[level - 1];
  const s = HEADING_SIZE[level];
  return (
    <Tag
      id={id}
      className={cn("text-balance", className)}
      style={{
        fontSize: s.size,
        fontWeight: "var(--weight-head)" as unknown as number,
        letterSpacing: s.tracking,
        lineHeight: s.leading,
        color: "var(--local-fg, var(--ink))",
      }}
    >
      {children}
    </Tag>
  );
}

export function Text({
  size = "base",
  tone = "body",
  as: Tag = "p",
  children,
  className,
}: {
  size?: "sm" | "base" | "lg";
  tone?: "body" | "muted" | "strong";
  as?: "p" | "span" | "div";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      className={className}
      style={{
        fontSize: `var(--text-${size})`,
        lineHeight: "var(--leading-body)",
        color:
          tone === "muted"
            ? "var(--local-fg-3, var(--ink-3))"
            : tone === "strong"
              ? "var(--local-fg, var(--ink))"
              : "var(--local-fg-2, var(--ink-2))",
      }}
    >
      {children}
    </Tag>
  );
}

/* ── controls ───────────────────────────────────────────────────────── */

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;

/* md and lg clear the 44px touch minimum; sm is desktop-only UI. */
const BTN_SIZE = { sm: "h-9 px-4 text-[13.5px]", md: "h-11 px-6 text-[15px]", lg: "h-13 px-7 text-[15.5px]" };

export function Button({ variant = "primary", size = "md", href, children, className, ...rest }: ButtonProps) {
  const base = cn(
    "inline-flex cursor-pointer select-none items-center justify-center rounded-full font-semibold",
    "transition-[background-color,border-color,color,transform] duration-[var(--dur-fast)]",
    "active:translate-y-px",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    BTN_SIZE[size],
    className,
  );

  // Variants read --local-* so the same component works on paper and on ink.
  const style: Record<string, string> = {
    primary: {
      background: "var(--btn-primary-bg, var(--accent))",
      color: "var(--btn-primary-fg, #fff)",
      outlineColor: "var(--accent)",
    },
    secondary: {
      background: "transparent",
      color: "var(--local-fg, var(--ink))",
      border: "1px solid var(--local-line, var(--line-2))",
      outlineColor: "var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--local-fg-2, var(--ink-2))",
      outlineColor: "var(--accent)",
    },
  }[variant] as Record<string, string>;

  if (href) {
    return (
      <Link href={href} className={base} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button className={base} style={style} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  interactive = false,
  children,
  className,
}: {
  interactive?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--paper)]",
        interactive &&
          "transition-[box-shadow,transform] duration-[var(--dur-fast)] hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(16,15,13,0.06),0_12px_28px_-14px_rgba(16,15,13,0.10)]",
        className,
      )}
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--r-card)",
        boxShadow: "0 1px 2px rgba(16,15,13,0.05)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Field. The label always exists in the DOM — visually hidden when `hideLabel`,
 * never absent, so the control is always named. hint and error are wired
 * through aria-describedby rather than left as loose text.
 */
export function Field({
  label,
  hideLabel = false,
  hint,
  error,
  id,
  className,
  ...inputProps
}: {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  id: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "className">) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1.5 block text-[var(--text-sm)] font-medium"}>
        {label}
      </label>
      <input
        id={id}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        className="w-full rounded-[var(--r-md)] px-3.5 py-2.5 text-[var(--text-base)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{
          border: `1px solid ${error ? "var(--danger)" : "var(--line-2)"}`,
          color: "var(--ink)",
          outlineColor: "var(--accent)",
        }}
        {...inputProps}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[var(--text-xs)]" style={{ color: "var(--ink-3)" }}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="mt-1.5 text-[var(--text-xs)]" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
