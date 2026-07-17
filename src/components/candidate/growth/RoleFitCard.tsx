"use client";

import { Building2 } from "lucide-react";
import type { RoleFit } from "@/lib/v1";
import { TiltCard } from "@/components/ui/TiltCard";
import { ReadinessGauge } from "./ReadinessGauge";
import { FitBandChip, BandDot, BAND_LABEL, EvidenceRef, SeverityChip, READINESS_NOTE } from "./chips";

/**
 * One role direction the evidence fits. Readiness = coverage of the role's
 * public requirements — guidance for the candidate, never a hiring verdict.
 */
export function RoleFitCard({ fit }: { fit: RoleFit }) {
  return (
    <TiltCard intensity={2.5} className="h-full">
      <article className="glass flex h-full flex-col rounded-[var(--r-card)] p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{fit.role_family}</p>
            <h3 className="mt-1 text-[19px] font-extrabold leading-snug tracking-tight text-[var(--ink)]">
              {fit.role_title}
            </h3>
            <div className="mt-2.5">
              <FitBandChip band={fit.fit_band} />
            </div>
          </div>
          <div className="shrink-0" style={{ transform: "translateZ(24px)" }}>
            <ReadinessGauge pct={fit.readiness_pct} size={104} variant="mini" />
          </div>
        </header>

        {/* what the evidence already covers */}
        {fit.covered.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              Requirements you&rsquo;ve evidenced
            </p>
            <ul className="mt-2.5 space-y-3">
              {fit.covered.map((skill) => (
                <li key={skill.skill_id}>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] font-bold text-[var(--ink)]">
                    <BandDot band={skill.band} />
                    {skill.skill_label}
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                      {BAND_LABEL[skill.band]}
                    </span>
                    <EvidenceRef sessionRef={skill.session_ref} similarity={skill.similarity} />
                  </p>
                  {skill.quote && (
                    <blockquote
                      className="mt-1.5 border-l-2 pl-3 text-[12.5px] leading-relaxed text-[var(--ink-2)]"
                      style={{ borderColor: "var(--iris-line)" }}
                    >
                      &ldquo;{skill.quote}&rdquo;
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* what the role still asks for */}
        {fit.gaps.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              Still to evidence for this role
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {fit.gaps.map((gap) => (
                <li key={gap.skill_id} className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
                  {gap.skill_label}
                  <SeverityChip severity={gap.severity} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* orgs whose public requirements this evidence maps to — guidance only */}
        {fit.companies.length > 0 && (
          <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              Where this evidence maps well
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {fit.companies.map((company) => (
                <li key={company.company_name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[var(--ink)]">
                      <Building2 size={13} className="shrink-0 text-[var(--ink-3)]" aria-hidden />
                      <span className="truncate">{company.company_name}</span>
                    </p>
                    <p className="shrink-0 text-[12px] font-bold text-[var(--iris-ink)]" title={READINESS_NOTE}>
                      {company.readiness_pct}% <span className="font-semibold text-[var(--ink-3)]">readiness</span>
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, company.readiness_pct))}%`,
                        background: "linear-gradient(90deg, var(--iris), var(--iris-soft))",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--ink-2)]">{company.note}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-auto pt-5 text-[11px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          as of {fit.as_of} · {fit.role_id}
        </p>
      </article>
    </TiltCard>
  );
}
