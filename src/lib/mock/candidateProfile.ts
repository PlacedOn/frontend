import type { CandidateProfile, OpeningFit } from "@/lib/v1";

/**
 * Demo profile (Card A) for building the profile-builder UI before the backend is live.
 * Claims + intent only — never verified evidence, never a talent score. `completeness` is
 * engagement momentum. No college/caste/region collected as assessment inputs (fairness).
 */
export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  display_name: "Aarav",
  headline: "Backend engineer who likes systems that don't fall over",
  summary:
    "Two years building payments and platform services. I want to go deeper on reliability and own more of the stack.",
  target_roles: ["Backend / Platform Engineering", "Site Reliability"],
  seniority: "junior",
  work_types: ["full_time", "contract"],
  availability: "in_1_month",
  work_mode_pref: ["remote", "hybrid"],
  locations_open_to: ["Bengaluru", "Remote (India)"],
  comp_expectation: "₹14–20L",
  claimed_skills: [
    { skill_id: "esco-tsc-2101", label: "Distributed systems debugging", self_rating: "strong", wants_to_verify: true },
    { skill_id: null, label: "Payments / idempotency", self_rating: "working", wants_to_verify: true },
    { skill_id: "esco-tsc-1899", label: "Database schema design", self_rating: "working", wants_to_verify: true },
    { skill_id: "esco-tsc-3040", label: "Kubernetes", self_rating: "learning", wants_to_verify: false },
  ],
  highlights: [
    { id: "h1", title: "Fixed duplicate-charge incident in payments", context: "Traced it to a missing idempotency key on the retry path and shipped a dedupe table.", role_family_hint: "Backend / Platform Engineering" },
    { id: "h2", title: "Migrated an events table under load", context: "Normalised the schema and added a composite index without downtime.", role_family_hint: "Backend / Platform Engineering" },
  ],
  completeness: 72,
  updated_at: "2026-07-16T09:30:00Z",
};

/** Matched openings the candidate fits — readiness is coverage of public requirements, not odds. */
export const MOCK_OPENING_FITS: OpeningFit[] = [
  { job_id: "op-1", role_title: "Backend Engineer", company_label: "A Series-B fintech", work_type: "full_time", readiness_pct: 82, top_gap: "Kubernetes ownership" },
  { job_id: "op-2", role_title: "Platform Engineer (Contract)", company_label: "A platform-tooling startup", work_type: "contract", readiness_pct: 76, top_gap: "IaC (Terraform)" },
  { job_id: "op-3", role_title: "Junior SRE", company_label: "A logistics scale-up", work_type: "full_time", readiness_pct: 61, top_gap: "SLOs / observability" },
];
