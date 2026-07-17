"use client";

import { Hammer, Target } from "lucide-react";
import type { RoleGap } from "@/lib/v1";
import { TiltCard } from "@/components/ui/TiltCard";
import { SeverityChip } from "./chips";
import { LearningStepRow } from "./LearningStepRow";

/**
 * One growth gap, framed as the next thing to build — never a deficiency
 * verdict. Surfaces why the role expects it, the exact evidence to build,
 * concrete actions, and cited learning steps.
 */
export function GapCard({ gap }: { gap: RoleGap }) {
  return (
    <TiltCard intensity={2.5} className="h-full">
      <article className="glass flex h-full flex-col rounded-[var(--r-card)] p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[17px] font-extrabold tracking-tight text-[var(--ink)]">{gap.skill_label}</h3>
          <SeverityChip severity={gap.severity} />
        </header>

        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{gap.why}</p>

        {/* the single most useful line: what evidence to build next */}
        <div
          className="mt-4 flex items-start gap-2.5 rounded-[14px] px-4 py-3"
          style={{ background: "var(--iris-ghost)" }}
        >
          <Target size={15} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" aria-hidden />
          <p className="text-[13px] leading-relaxed">
            <span className="font-bold text-[var(--iris-ink)]">Next evidence to build: </span>
            <span className="font-medium text-[var(--ink)]">{gap.next_evidence}</span>
          </p>
        </div>

        {gap.build_actions.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {gap.build_actions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-[13px] text-[var(--ink-2)]">
                <Hammer size={13} className="mt-[3px] shrink-0 text-[var(--ink-3)]" aria-hidden />
                {action}
              </li>
            ))}
          </ul>
        )}

        {gap.learning.length > 0 && (
          <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              Curated ways to close it
            </p>
            <ul className="mt-2.5 space-y-2">
              {gap.learning.map((step) => (
                <LearningStepRow key={`${step.source}-${step.title}`} step={step} />
              ))}
            </ul>
          </div>
        )}
      </article>
    </TiltCard>
  );
}
