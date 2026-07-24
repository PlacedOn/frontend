import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "ink" | "iris" | "green" | "amber";
type Size = "sm" | "md" | "lg";

/**
 * Keyline icon tile — the house replacement for the "icon in a saturated colored
 * circle" pattern (a template/AI-slop tell). A rounded square with a hairline
 * border and a barely-there tint, the icon carrying the colour at a consistent
 * 1.75 stroke. Reads crafted and editorial, not stock. Pilot for the icon refresh.
 */
const TONE: Record<Tone, { fg: string; bg: string; border: string }> = {
  ink: { fg: "var(--ink-2)", bg: "var(--glass-hi)", border: "var(--glass-line-hi)" },
  iris: { fg: "var(--iris-ink)", bg: "rgba(105,34,245,0.06)", border: "var(--iris-line)" },
  green: { fg: "#047857", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.22)" },
  amber: { fg: "#B45309", bg: "rgba(245,134,11,0.08)", border: "rgba(245,134,11,0.24)" },
};

const SIZE: Record<Size, { box: string; icon: number }> = {
  sm: { box: "size-8 rounded-[9px]", icon: 15 },
  md: { box: "size-10 rounded-[11px]", icon: 18 },
  lg: { box: "size-12 rounded-[13px]", icon: 22 },
};

type Props = {
  icon: ComponentType<LucideProps>;
  tone?: Tone;
  size?: Size;
  className?: string;
};

export function IconTile({ icon: Icon, tone = "ink", size = "md", className }: Props) {
  const t = TONE[tone];
  const s = SIZE[size];
  return (
    <span
      className={cn("grid shrink-0 place-items-center border", s.box, className)}
      style={{ color: t.fg, background: t.bg, borderColor: t.border, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
    >
      <Icon size={s.icon} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
