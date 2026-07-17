"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass, ShieldCheck, Sparkles, TrendingUp, Map as MapIcon } from "lucide-react";
import { v1, V1Error, isLiveBackend, type GrowthReport, type SkillEvidence } from "@/lib/v1";
import { MOCK_GROWTH_REPORT } from "@/lib/mock/growthReport";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import { ReadinessGauge } from "./ReadinessGauge";
import { RoleFitCard } from "./RoleFitCard";
import { EdgeStrip } from "./EdgeStrip";
import { GapCard } from "./GapCard";
import { SkillConstellation } from "./SkillConstellation";
import { RoadmapTimeline } from "./RoadmapTimeline";
import { FitBandChip, READINESS_NOTE } from "./chips";

/**
 * Candidate-owned Growth Report. Career guidance built from interview
 * evidence: best-fit directions, edges, growth gaps, and a cited roadmap.
 * Never a hiring verdict — readiness is requirement coverage, not odds.
 */
export function GrowthReportView() {
  const live = isLiveBackend();
  const [report, setReport] = useState<GrowthReport | null>(live ? null : MOCK_GROWTH_REPORT);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    v1.growthReport()
      .then(setReport)
      .catch((e: unknown) => {
        setError(e instanceof V1Error ? e.message : "Could not load your growth report.");
      });
  }, [live]);

  const evidencedSkills = useMemo(() => {
    if (!report) return [] as SkillEvidence[];
    const seen = new Set<string>();
    return report.role_fits
      .flatMap((fit) => fit.covered)
      .filter((s) => {
        if (seen.has(s.skill_id)) return false;
        seen.add(s.skill_id);
        return true;
      });
  }, [report]);

  if (error) return <p className="text-[14px] font-semibold text-[#b91c1c]">{error}</p>;
  if (!report) return <p className="text-[14px] text-[var(--ink-3)]">Building your report…</p>;

  const topFit = report.role_fits[0];
  const generatedOn = new Date(report.generated_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-20 md:space-y-24">
      {/* ── Hero bento: headline + disclaimer | readiness dial ─────────── */}
      <section aria-labelledby="growth-headline">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip">
            {live ? (
              <>
                <span className="livedot" /> Live · from your interview
              </>
            ) : (
              <>Preview · sample report</>
            )}
          </span>
          <span className="chip" style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
            generated {generatedOn}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <Reveal className="flex">
            <div className="glass flex w-full flex-col rounded-[var(--r-card)] p-7 md:p-9">
              <p className="eyebrow flex items-center gap-2">
                <Compass size={13} aria-hidden /> Where your evidence points
              </p>
              <h2
                id="growth-headline"
                className="mt-3 max-w-[26ch] text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-[var(--ink)]"
              >
                {report.headline}
              </h2>

              {/* the disclaimer is a feature, not fine print */}
              <div
                className="mt-6 flex items-start gap-3 rounded-[16px] border p-4"
                style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)" }}
              >
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" aria-hidden />
                <p className="text-[13.5px] font-medium leading-relaxed text-[var(--ink)]">{report.disclaimer}</p>
              </div>

              <p className="mt-auto pt-6 text-[11px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                taxonomy {report.taxonomy_version} · model {report.model_version}
              </p>
            </div>
          </Reveal>

          {topFit && (
            <Reveal delay={0.1} className="flex">
              <TiltCard intensity={4} className="w-full">
                <div className="glass flex h-full w-full flex-col items-center rounded-[var(--r-card)] p-7 text-center">
                  <p className="eyebrow">Best-fit direction</p>
                  <div className="my-2" style={{ transform: "translateZ(36px)" }}>
                    <ReadinessGauge pct={topFit.readiness_pct} size={216} variant="hero" />
                  </div>
                  <p className="text-[16px] font-extrabold tracking-tight text-[var(--ink)]">{topFit.role_title}</p>
                  <div className="mt-2">
                    <FitBandChip band={topFit.fit_band} />
                  </div>
                  {/* what readiness means — pinned to the first % on the page */}
                  <p className="mt-4 max-w-[30ch] border-t pt-3.5 text-[12px] leading-relaxed text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line)" }}>
                    {READINESS_NOTE}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Role fits ──────────────────────────────────────────────────── */}
      <section aria-labelledby="rolefits-heading">
        <SectionHead
          id="rolefits-heading"
          icon={<Compass size={13} aria-hidden />}
          eyebrow="Role directions"
          title="Where your evidence fits"
          note="Ranked by how much of each role's public requirements you've already evidenced. Directions to explore — not verdicts."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {report.role_fits.map((fit, i) => (
            <Reveal key={fit.role_id} delay={i * 0.08} className="h-full">
              <RoleFitCard fit={fit} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Edges ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="edges-heading">
        <SectionHead
          id="edges-heading"
          icon={<Sparkles size={13} aria-hidden />}
          eyebrow="Your edge"
          title="What sets you apart"
          note="Strengths worth leading with — in your own words, straight from your interview."
        />
        <EdgeStrip edges={report.edges} />
      </section>

      {/* ── Skill map ──────────────────────────────────────────────────── */}
      <section aria-labelledby="skillmap-heading">
        <SectionHead
          id="skillmap-heading"
          icon={<Sparkles size={13} aria-hidden />}
          eyebrow="Skill map"
          title="Your constellation"
          note="Lit skills are evidenced. Dim ones are adjacent skills that unlock more roles once you build evidence for them."
        />
        <Reveal>
          <SkillConstellation evidenced={evidencedSkills} toDevelop={report.skills_to_develop} />
        </Reveal>
      </section>

      {/* ── Growth gaps ────────────────────────────────────────────────── */}
      <section aria-labelledby="gaps-heading">
        <SectionHead
          id="gaps-heading"
          icon={<TrendingUp size={13} aria-hidden />}
          eyebrow="Growth gaps"
          title="Where to grow next"
          note="Each gap comes with the exact evidence to build and curated, cited ways to build it."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {report.gaps.map((gap, i) => (
            <Reveal key={gap.skill_id} delay={i * 0.08} className="h-full">
              <GapCard gap={gap} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Roadmap ────────────────────────────────────────────────────── */}
      <section aria-labelledby="roadmap-heading">
        <SectionHead
          id="roadmap-heading"
          icon={<MapIcon size={13} aria-hidden />}
          eyebrow="Roadmap"
          title="Your next 90 days"
          note="A sequenced plan of courses, exams and programs — every step cites the catalog it came from."
        />
        <RoadmapTimeline phases={report.roadmap} />
      </section>

      {/* ── Closing reassurance ────────────────────────────────────────── */}
      <footer
        className="rounded-[var(--r-card)] border p-6 text-center"
        style={{ borderColor: "var(--glass-line)" }}
      >
        <p className="mx-auto max-w-2xl text-[13px] leading-relaxed text-[var(--ink-2)]">{report.disclaimer}</p>
        <p className="mt-3 text-[11px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          report {report.candidate_id} · generated {generatedOn} · taxonomy {report.taxonomy_version} · model {report.model_version}
        </p>
      </footer>
    </div>
  );
}

type SectionHeadProps = {
  id: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  note: string;
};

function SectionHead({ id, icon, eyebrow, title, note }: SectionHeadProps) {
  return (
    <Reveal className="mb-8">
      <p className="eyebrow flex items-center gap-2">
        {icon} {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] font-extrabold tracking-tight text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--ink-2)]">{note}</p>
    </Reveal>
  );
}
