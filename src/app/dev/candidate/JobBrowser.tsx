"use client";

/**
 * The candidate's job browse grid.
 *
 * ══ WHY THE FILTERS ARE LOCAL STATE AND NOT THE URL ══
 * The directory deliberately went the other way, and the argument there was
 * specific: a recruiter's most common act is sending a colleague "here are the
 * six people who clear this bar", and a screenshot is what they send when the
 * URL does not carry it. A candidate filtering their own job list has no such
 * recipient — the search is not a thing they hand to anybody, and the state does
 * not need to survive a paste into Slack.
 *
 * The cost of being wrong about that is one afternoon: `filtersFromSearchParams`
 * is pure and has no dependency on the directory's shape, so the same pattern
 * ports here without touching a component. What is NOT reversible cheaply is
 * building it now and dragging a `useSearchParams` Suspense boundary through a
 * page that has no other reason to need one.
 *
 * ══ WHY THE RAIL IS THE DIRECTORY'S RAIL ══
 * `FilterRail` is a shell that takes its facets as children; the job facets are
 * a different set of controls inside the identical chrome, disclosure behaviour
 * and mobile trigger. There is no second rail component to keep in sync.
 */

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FilterRail } from "@/components/directory/FilterRail";
import { ActiveFilterChips } from "@/components/directory/ActiveFilterChips";
import { EmptyState } from "@/components/directory/EmptyState";
import { JobFacets } from "@/components/jobs/JobFacets";
import { JobCard } from "@/components/jobs/JobCard";
import {
  activeJobFilters,
  buildJobVocabulary,
  filterJobs,
  jobFacetCounts,
} from "@/lib/jobs/filter";
import { buildCoverage, standingForTopics } from "@/lib/candidate/coverage";
import {
  FIXTURE_CANDIDATE_READINGS,
  FIXTURE_INTERVIEW_PLAN,
} from "@/mocks/candidateInterview";
import { FIXTURE_JOBS } from "@/mocks/candidateJobs";
import { EMPTY_JOB_FILTERS, type JobFilters } from "@/types/jobs";

const COVERAGE = buildCoverage(FIXTURE_INTERVIEW_PLAN, FIXTURE_CANDIDATE_READINGS);

export function JobBrowser() {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS);
  const [railOpen, setRailOpen] = useState(false);

  const jobs = FIXTURE_JOBS;

  // Derived from the data, never hand-listed — a facet offering a role nobody
  // is hiring for is a dead end the user has to discover by clicking it.
  const vocabulary = useMemo(() => buildJobVocabulary(jobs), [jobs]);
  const results = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const chips = useMemo(() => activeJobFilters(filters), [filters]);

  const roleCounts = useMemo(
    () => jobFacetCounts(jobs, filters, "roles", (j) => j.role, vocabulary.roles),
    [jobs, filters, vocabulary.roles],
  );
  const stageCounts = useMemo(
    () => jobFacetCounts(jobs, filters, "stages", (j) => j.stage, vocabulary.stages),
    [jobs, filters, vocabulary.stages],
  );
  const workModeCounts = useMemo(
    () => jobFacetCounts(jobs, filters, "workModes", (j) => j.workMode, vocabulary.workModes),
    [jobs, filters, vocabulary.workModes],
  );
  const salaryCounts = useMemo(
    () => jobFacetCounts(jobs, filters, "salaryBands", (j) => j.salaryBand, vocabulary.salaryBands),
    [jobs, filters, vocabulary.salaryBands],
  );

  const clearAll = () => setFilters(EMPTY_JOB_FILTERS);

  return (
    <section aria-labelledby="jobs-heading" className="mt-20">
      <p className="eyebrow">Open roles</p>
      <h2
        id="jobs-heading"
        className="mt-2.5 max-w-[24ch] text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Roles you can interview for
      </h2>
      <p
        className="mt-4 max-w-[70ch] text-[14.5px] leading-relaxed"
        style={{ color: "var(--ink-2)" }}
      >
        Each card lists what that role&rsquo;s interview will ask about and where you currently
        stand on each topic. There is no match percentage: a single number telling you how well you
        fit a job is a score about you in a job&rsquo;s clothing, and it would be the first thing
        anyone sorted by.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-[248px_minmax(0,1fr)] md:gap-8">
        <FilterRail
          title="Narrow the roles"
          label="Role filters"
          activeCount={chips.length}
          onClearAll={clearAll}
          open={railOpen}
          onToggleOpen={() => setRailOpen((v) => !v)}
          note="Within a group these are alternatives — picking Remote and Hybrid means either suits you. Across groups they all apply. There is no sort control: ordering roles by pay alone is a ranking we would be doing on your behalf."
        >
          <JobFacets
            filters={filters}
            vocabulary={vocabulary}
            roleCounts={roleCounts}
            stageCounts={stageCounts}
            workModeCounts={workModeCounts}
            salaryCounts={salaryCounts}
            onChange={setFilters}
          />
        </FilterRail>

        {/* `min-w-0` is what actually prevents horizontal overflow: without it a
            grid item's min-content width wins and the whole page scrolls. */}
        <div className="min-w-0">
          {/* aria-live so the count is announced after a filter change — the
              visual cross-fade is invisible to a screen reader. */}
          <p aria-live="polite" className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              {results.length} of {jobs.length}
            </strong>{" "}
            {jobs.length === 1 ? "role" : "roles"}
          </p>

          {chips.length > 0 && (
            <div className="mt-3.5">
              <ActiveFilterChips
                filters={chips}
                onRemove={(chip) => setFilters(chip.remove(filters))}
                onClearAll={clearAll}
              />
            </div>
          )}

          <div className="mt-6">
            {results.length === 0 ? (
              <EmptyState
                filters={chips}
                onRemove={(chip) => setFilters(chip.remove(filters))}
                onClearAll={clearAll}
                totalCount={jobs.length}
                subject={{ singular: "role", plural: "roles" }}
                filteredTitle="No open role matches all of these at once."
              />
            ) : (
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {/* Keys are job ids, so a card that survives a filter change is
                    never remounted and does not re-animate. */}
                <AnimatePresence>
                  {results.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      standing={standingForTopics(job.assessesTraitKeys, COVERAGE)}
                      stagger={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
