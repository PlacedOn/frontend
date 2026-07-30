"use client";

import { Clock, ShieldCheck, Sparkles, Check, Quote } from "@/components/ui/icons";
import type { CandidateReport } from "@/lib/mock/candidateReport";

// Integrity is a pass/attention signal, never a number ranking the person.
function integrityLabel(trust: number, anomaly: boolean): string {
  if (anomaly) return "Integrity: attention flagged";
  if (trust >= 85) return "Integrity checks passed";
  return "Integrity: some signals to review";
}

export function InterviewSummary({ interview }: { interview: CandidateReport["interview"] }) {
  const chips = [
    { icon: <Clock size={13} className="text-[var(--ink-3)]" />, label: `${interview.durationMin} min` },
    { icon: <Sparkles size={13} className="text-[var(--iris-ink)]" />, label: interview.adaptive ? "Adaptive interview" : "Fixed script" },
    { icon: <ShieldCheck size={13} className="text-[var(--iris-ink)]" />, label: integrityLabel(interview.trustScore, interview.anomaly) },
    ...(!interview.anomaly ? [{ icon: <Check size={13} className="text-[var(--ok)]" />, label: "No anomalies flagged" }] : []),
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-[15px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Interview summary
        </h2>
        <span className="text-[11.5px] text-[var(--ink-3)]">{interview.date}</span>
      </div>

      <div className="glass mt-3 flex flex-col gap-5 rounded-[var(--r-card)] p-6 md:p-7">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-2)]" style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}>
              {c.icon} {c.label}
            </span>
          ))}
        </div>

        <p className="text-[15px] leading-relaxed text-[var(--ink)]">{interview.summary}</p>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Representative moments</p>
          <ul className="mt-3 flex flex-col gap-3">
            {interview.exchanges.map((ex, i) => (
              <li key={i} className="rounded-[var(--r-card)] p-4" style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  {ex.trait}
                </span>
                <p className="mt-2 text-[13px] font-semibold text-[var(--ink-2)]">{ex.question}</p>
                <p className="mt-1.5 flex gap-2 text-[13.5px] italic leading-relaxed text-[var(--ink)]">
                  <Quote size={13} className="mt-1 shrink-0 text-[var(--iris-ink)]" />
                  &ldquo;{ex.answer}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
