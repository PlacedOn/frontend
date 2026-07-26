import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "ink" | "iris" | "green" | "amber";
type Size = "sm" | "md" | "lg";

/**
 * Keyline icon tile — a flat paper square with a hairline border and a
 * monochrome icon at a consistent 1.75 stroke. Colour is deliberately retired:
 * saturated coloured tiles read as template/AI-slop, so every tone now renders
 * the same calm ink treatment. The `tone` prop is kept for source compatibility.
 */
const INK_TILE = { fg: "var(--ink-2)", bg: "var(--white)", border: "var(--glass-line-hi)" };
const TONE: Record<Tone, { fg: string; bg: string; border: string }> = {
  ink: INK_TILE,
  iris: INK_TILE,
  green: INK_TILE,
  amber: INK_TILE,
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
      style={{ color: t.fg, background: t.bg, borderColor: t.border }}
    >
      <Icon size={s.icon} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
