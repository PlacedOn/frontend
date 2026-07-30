"use client";

import { Quote, Eye, Lock } from "lucide-react";
import { ConfidenceBand } from "./ConfidenceBand";
import type { HcvDimension } from "@/lib/mock/hcv";

type Props = {
  dim: HcvDimension;
  index: number;
  onToggle: (index: number) => void;
  delay?: number;
};

export function HcvDimensionRow({ dim, index, onToggle, delay = 0 }: Props) {
  const confidencePct = Math.round(dim.confidence * 100);
  const wide = dim.uncertainty >= 0.2;

  return (
    <li className="glass flex flex-col rounded-[var(--r-card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15.5px] font-bold text-[var(--ink)]">{dim.label}</h3>
        <div className="shrink-0 text-right">
          <span className="font-[var(--font-mono)] text-[22px] font-bold leading-none" style={{ color: "var(--iris-ink)" }}>
            {dim.score}
          </span>
          <p className="mt-0.5 text-[11px] font-semibold text-[var(--ink-3)]">
            {confidencePct}% confident
          </p>
        </div>
      </div>

      <div className="mt-3">
        <ConfidenceBand score={dim.score} uncertainty={dim.uncertainty} delay={delay} />
        <p className="mt-1.5 text-[11px] text-[var(--ink-3)]">
          {wide ? "Still forming — one more example would make this clearer." : "Strong, clear evidence for this skill."}
        </p>
      </div>

      <p className="mt-3 flex gap-2 border-l-2 pl-3 text-[13px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
        <Quote size={13} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
        &ldquo;{dim.evidence}&rdquo;
      </p>

      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-pressed={dim.employerVisible}
        aria-label={dim.employerVisible ? `Hide ${dim.label} from employers` : `Make ${dim.label} employer-visible`}
        className="mt-4 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold transition-opacity hover:opacity-75"
        style={
          dim.employerVisible
            ? { background: "rgba(16,185,129,0.10)", color: "var(--ok)" }
            : { background: "var(--mist)", color: "var(--ink-3)" }
        }
      >
        {dim.employerVisible ? <Eye size={12} /> : <Lock size={12} />}
        {dim.employerVisible ? "Employer-visible" : "Hidden from employers"}
      </button>
    </li>
  );
}
