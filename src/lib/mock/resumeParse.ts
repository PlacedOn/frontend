import type { ResumeParseResult } from "@/lib/v1";

/**
 * Demo resume-parse result for building/reviewing the attach-resume UI before the backend
 * is live. The parser turns a resume into CLAIMS to verify and strips pedigree/PII first —
 * `redacted` is what was removed, shown to the candidate as a trust signal.
 */
export const MOCK_RESUME_PARSE: ResumeParseResult = {
  note: "We read your resume and turned it into claims your interview will verify. We removed anything that could bias an evaluator — your college, name, age, and address are never used to judge you.",
  redacted: [
    "College / university name",
    "Full name & photo",
    "Date of birth / age",
    "Home address & city",
    "Graduation year",
  ],
  claimed_skills: [
    { label: "Distributed systems debugging", self_rating: "strong", source_line: "Resolved recurring production incidents across payment services", skill_id: "esco-tsc-2101" },
    { label: "Payments / idempotency", self_rating: "working", source_line: "Built idempotent retry handling for the charge pipeline", skill_id: null },
    { label: "PostgreSQL schema design", self_rating: "working", source_line: "Designed and indexed the events datastore", skill_id: "esco-tsc-1899" },
    { label: "Python / FastAPI", self_rating: "strong", source_line: "Backend services in Python (FastAPI), 2 yrs", skill_id: null },
    { label: "Kubernetes", self_rating: "learning", source_line: "Familiar with containerised deploys", skill_id: "esco-tsc-3040" },
  ],
  highlights: [
    { id: "rh1", title: "Fixed a duplicate-charge production incident", context: "Traced it to a missing idempotency key on the retry path and shipped a dedupe table.", role_family_hint: "Backend / Platform Engineering" },
    { id: "rh2", title: "Migrated a high-traffic events table", context: "Normalised the schema and added a composite index with no downtime.", role_family_hint: "Backend / Platform Engineering" },
  ],
};
