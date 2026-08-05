"use client";

/**
 * The job browser's facet controls.
 *
 * Built from the SAME `Facet` and `SkillPill` primitives the directory rail uses
 * and dropped into the same `FilterRail` shell — a candidate who has seen one
 * filter surface on this product has seen both. What differs is only the
 * vocabulary and one rule: within a facet these are alternatives, not
 * requirements (see the note on `JobFilters`).
 *
 * Every facet is multi-select, including role. A candidate open to backend and
 * platform work is describing one search, and forcing them into two is the kind
 * of small friction that turns into "I'll just check the other one later".
 */

import { Facet } from "@/components/directory/FilterRail";
import { SkillPill } from "@/components/directory/SkillPill";
import { toggleJobFacetValue, type JobVocabulary } from "@/lib/jobs/filter";
import {
  SALARY_COPY,
  STAGE_COPY,
  WORK_MODE_COPY,
  type CompanyStage,
  type JobFilters,
  type SalaryBand,
  type WorkMode,
} from "@/types/jobs";

export interface JobFacetsProps {
  filters: JobFilters;
  vocabulary: JobVocabulary;
  roleCounts: ReadonlyMap<string, number>;
  stageCounts: ReadonlyMap<CompanyStage, number>;
  workModeCounts: ReadonlyMap<WorkMode, number>;
  salaryCounts: ReadonlyMap<SalaryBand, number>;
  /** Every change hands back a whole new filter object — never a mutation. */
  onChange: (next: JobFilters) => void;
}

export function JobFacets({
  filters,
  vocabulary,
  roleCounts,
  stageCounts,
  workModeCounts,
  salaryCounts,
  onChange,
}: JobFacetsProps) {
  return (
    <>
      <Facet title="Role" hint="Pick as many as you would take.">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.roles.map((role) => (
            <SkillPill
              key={role}
              label={role}
              count={roleCounts.get(role) ?? 0}
              selected={filters.roles.includes(role)}
              onToggle={() => onChange(toggleJobFacetValue(filters, "roles", role))}
            />
          ))}
        </div>
      </Facet>

      <Facet title="Stage" hint="How far along the company is — a description of the work, not of you.">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.stages.map((stage) => (
            <SkillPill
              key={stage}
              label={STAGE_COPY[stage]}
              count={stageCounts.get(stage) ?? 0}
              selected={filters.stages.includes(stage)}
              onToggle={() => onChange(toggleJobFacetValue(filters, "stages", stage))}
            />
          ))}
        </div>
      </Facet>

      <Facet title="Works from">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.workModes.map((mode) => (
            <SkillPill
              key={mode}
              label={WORK_MODE_COPY[mode]}
              count={workModeCounts.get(mode) ?? 0}
              selected={filters.workModes.includes(mode)}
              onToggle={() => onChange(toggleJobFacetValue(filters, "workModes", mode))}
            />
          ))}
        </div>
      </Facet>

      {/* Pay is a published band on the posting, shown because withholding it
          costs the candidate and nobody else. Ordered low to high, never
          alphabetically — the pills are a scale and should read as one. */}
      <Facet title="Pay" hint="What the role advertises, per year.">
        <div className="flex flex-wrap gap-1.5">
          {vocabulary.salaryBands.map((band) => (
            <SkillPill
              key={band}
              label={SALARY_COPY[band]}
              count={salaryCounts.get(band) ?? 0}
              selected={filters.salaryBands.includes(band)}
              onToggle={() => onChange(toggleJobFacetValue(filters, "salaryBands", band))}
            />
          ))}
        </div>
      </Facet>
    </>
  );
}
