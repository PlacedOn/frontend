"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

type Gap = { label: string; step: number };

/**
 * Completeness + "gaps to close" — the candidate-side mirror of the HR gap view.
 * Frames profile-building as an actionable checklist (goal-gradient nudge), never
 * a talent score. Each gap jumps to the step that fixes it.
 */
export function ProfileReadiness({
  momentum,
  gaps,
  onJump,
}: {
  momentum: number;
  gaps: Gap[];
  onJump: (step: number) => void;
}) {
  const ready = gaps.length === 0;
  return (
    <div className="glass rounded-[20px] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Profile readiness</p>
          <p className="mt-1 text-[15px] font-bold text-[var(--ink)]">
            {ready ? "Every basic is in — you're interview-ready." : "A few things to add before you interview"}
          </p>
        </div>
        <span className="text-[15px] font-extrabold text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
          {momentum}%
        </span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
        <span className="block h-full rounded-full transition-all" style={{ width: `${momentum}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
      </div>

      {ready ? (
        <p className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#047857]">
          <CheckCircle2 size={15} aria-hidden /> Nothing missing — take your interview when you&rsquo;re ready.
        </p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-1.5">
          {gaps.slice(0, 4).map((g) => (
            <li key={g.label}>
              <button
                type="button"
                onClick={() => onJump(g.step)}
                className="group flex w-full items-center gap-2.5 rounded-[12px] border px-3 py-2 text-left text-[13.5px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-white hover:text-[var(--ink)]"
                style={{ borderColor: "var(--glass-line-hi)" }}
              >
                <Circle size={13} className="shrink-0 text-[var(--ink-3)]" aria-hidden />
                <span className="flex-1">{g.label}</span>
                <ArrowRight size={14} className="shrink-0 text-[var(--ink-3)] transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
