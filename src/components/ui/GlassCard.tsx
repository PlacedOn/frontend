import type { CSSProperties, ReactNode } from "react";

/**
 * The frosted "glass" surface, formalized. The `.glass` class + inline
 * radius/padding was re-declared locally all over the app; this centralises it.
 * Presentational only — pass motion wrappers around it when you need animation.
 */
type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Adds a subtle hover lift for clickable cards. */
  interactive?: boolean;
  as?: "div" | "article" | "section" | "li";
};

export function GlassCard({ children, className = "", style, interactive = false, as = "div" }: Props) {
  const Tag = as;
  const hover = interactive ? "transition-transform hover:-translate-y-0.5" : "";
  return (
    <Tag className={`glass rounded-[var(--r-card)] p-5 ${hover} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
