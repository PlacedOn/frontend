"use client";

import { SKILL_ICONS, SKILL_SLUG } from "./skillIcons";

// Brand colours for skills without a glyph (AWS logo is removed from Simple Icons).
const DOT: Record<string, string> = {
  AWS: "#FF9900",
  Scala: "#C22D40",
  "Customer discovery": "#0FA3A0",
  "Data pipelines": "#0FA3A0",
};

export function SkillIcon({ name, size = 14 }: { name: string; size?: number }) {
  const slug = SKILL_SLUG[name];
  const glyph = slug ? SKILL_ICONS[slug] : undefined;

  if (glyph) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={glyph.color} aria-hidden className="shrink-0">
        <path d={glyph.d} />
      </svg>
    );
  }

  const dot = DOT[name] ?? "var(--iris)";
  return <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: size - 5, height: size - 5, background: dot }} />;
}
