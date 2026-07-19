"use client";

/**
 * Fit Check card — the role-evidence coverage %, scoped to ONE named role, shown
 * with the strict four-row contract so it can never read as a person-score. The
 * percent is evidence-only coverage of this role's rubric; the four rows are kept
 * separate and never blended into it.
 */

import type { FitCheck } from "@/lib/v1";

const BUCKET_FG: Record<FitCheck["bucket"], string> = {
  strong: "#047857",
  worth_discussing: "var(--iris-ink)",
  clarify: "#B45309",
  not_enough: "var(--ink-3)",
};

const WORK_REALITY_LABEL: Record<FitCheck["work_reality"], string> = {
  aligned: "Aligned",
  conflict: "May conflict",
  not_shared: "Not shared",
};

export function FitCheckCard({ fit, roleName }: { fit: FitCheck; roleName?: string }) {
  const fg = BUCKET_FG[fit.bucket];
  return (
    <div className="rounded-[var(--r-card)] p-4" style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-[var(--ink-3)]">
          Fit Check{roleName ? ` · ${roleName}` : ""}
        </span>
        <span className="text-[26px] font-extrabold leading-none" style={{ color: fg, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
          {fit.coverage_percent}%
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${fit.coverage_percent}%`, background: fg }} />
      </div>
      <p className="mt-1.5 text-[12px] font-semibold" style={{ color: fg }}>{fit.bucket_label}</p>

      {/* the four rows — kept separate, never blended into the percent */}
      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[12.5px] sm:grid-cols-2">
        <Row k="Role requirements" v={`${fit.role_requirements_clear} of ${fit.role_requirements_total} clear`} />
        <Row k="Work reality" v={WORK_REALITY_LABEL[fit.work_reality]} />
        <Row k="Evidence confidence" v={fit.evidence_confidence === "sufficient" ? "Sufficient" : "Limited"} />
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink-3)]">
        Evidence-only coverage of this role&rsquo;s rubric — not a prediction of performance, an offer, or a judgment of the person.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[var(--ink-3)]">{k}</dt>
      <dd className="font-semibold text-[var(--ink-2)]">{v}</dd>
    </div>
  );
}
