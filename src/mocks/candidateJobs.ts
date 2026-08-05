/**
 * FIXTURES — invented job postings. Not real openings, not real employers.
 *
 * See src/mocks/README.md. These are the one fixture family in this directory
 * that describes ORGANISATIONS rather than people, which changes what the rules
 * protect against but not whether they apply.
 *
 * ══ NO REAL EMPLOYER NAMES ══
 * `companyArchetype` is a description — "a Series-B payments company" — and
 * never a brand. A fixture posting carrying a real company's name is a
 * fabricated job advert with that company's name on it: wrong about them, and
 * exactly the screenshot that gets mistaken for a live partnership. The
 * archetype also happens to match what the real product shows before a consented
 * intro, so this is not a fixture-only compromise.
 *
 * ══ NO SALARY PRECISION WE DO NOT HAVE ══
 * Pay is a band, not a figure. An invented "₹28.5L" reads as sourced.
 */

import type { Job } from "@/types/jobs";

/** Required marker for any surface rendering these. */
export const JOBS_FIXTURE_NOTICE =
  "Sample data — seven invented roles. No employer has posted anything on Placedon.";

export const FIXTURE_JOBS: readonly Job[] = [
  {
    id: "job-01",
    ref: "JOB-01",
    title: "Backend engineer, payments",
    companyArchetype: "A Series-B payments company",
    role: "Backend engineer",
    stage: "series_a_b",
    workMode: "hybrid",
    location: "Bengaluru",
    salaryBand: "20_35",
    skills: ["Python", "PostgreSQL", "Redis"],
    assessesTraitKeys: ["handles_ambiguity", "explains_tradeoffs", "debugs_systematically"],
    postedAt: "2026-07-30T09:00:00.000Z",
  },
  {
    id: "job-02",
    ref: "JOB-02",
    title: "Frontend engineer, internal tools",
    companyArchetype: "A logistics scale-up",
    role: "Frontend engineer",
    stage: "growth",
    workMode: "remote",
    location: "Remote (IST)",
    salaryBand: "12_20",
    skills: ["TypeScript", "React", "Playwright"],
    assessesTraitKeys: ["debugs_systematically", "gives_direct_feedback"],
    postedAt: "2026-07-28T11:30:00.000Z",
  },
  {
    id: "job-03",
    ref: "JOB-03",
    title: "Data engineer, reporting platform",
    companyArchetype: "A health-tech company",
    role: "Data engineer",
    stage: "growth",
    workMode: "hybrid",
    location: "Hyderabad",
    salaryBand: "20_35",
    skills: ["Python", "Airflow", "dbt"],
    assessesTraitKeys: ["explains_tradeoffs", "scopes_under_pressure"],
    postedAt: "2026-07-25T08:15:00.000Z",
  },
  {
    id: "job-04",
    ref: "JOB-04",
    title: "Platform engineer, developer experience",
    companyArchetype: "An early-stage infrastructure startup",
    role: "Backend engineer",
    stage: "seed",
    workMode: "remote",
    location: "Remote (global)",
    salaryBand: "12_20",
    skills: ["Go", "Kubernetes"],
    assessesTraitKeys: ["scopes_under_pressure", "handles_ambiguity", "mentors_others"],
    postedAt: "2026-08-01T07:00:00.000Z",
  },
  {
    id: "job-05",
    ref: "JOB-05",
    title: "Product designer, design systems",
    companyArchetype: "A listed enterprise software company",
    role: "Product designer",
    stage: "listed",
    workMode: "onsite",
    location: "Pune",
    salaryBand: "20_35",
    skills: ["Figma", "TypeScript"],
    assessesTraitKeys: ["explains_tradeoffs", "gives_direct_feedback", "mentors_others"],
    postedAt: "2026-07-21T13:45:00.000Z",
  },
  {
    id: "job-06",
    ref: "JOB-06",
    title: "QA engineer, test infrastructure",
    companyArchetype: "A Series-A developer-tools company",
    role: "QA engineer",
    stage: "series_a_b",
    workMode: "remote",
    location: "Remote (IST)",
    salaryBand: "12_20",
    skills: ["Playwright", "TypeScript", "Python"],
    assessesTraitKeys: ["debugs_systematically", "scopes_under_pressure"],
    postedAt: "2026-07-29T16:20:00.000Z",
  },
  {
    id: "job-07",
    ref: "JOB-07",
    title: "Senior backend engineer, core services",
    companyArchetype: "A listed marketplace company",
    role: "Backend engineer",
    stage: "listed",
    workMode: "onsite",
    location: "Bengaluru",
    salaryBand: "35_plus",
    skills: ["Go", "PostgreSQL", "Kubernetes"],
    assessesTraitKeys: ["mentors_others", "explains_tradeoffs", "handles_ambiguity"],
    postedAt: "2026-07-18T10:10:00.000Z",
  },
];
