import type { GrowthReport } from "@/lib/v1";

/**
 * Demo Growth Report for building/reviewing the UI before the backend is live.
 * Shape is identical to what `v1.growthReport()` returns. Every number here is a
 * READINESS/coverage value (how much of a role's public requirements the evidence
 * covers) — never a probability of being selected. Guidance for the candidate.
 */
export const MOCK_GROWTH_REPORT: GrowthReport = {
  candidate_id: "demo-candidate",
  generated_at: "2026-07-16T09:00:00Z",
  taxonomy_version: "onet-28.3 + esco-1.2 + wef-2025",
  model_version: "growth-pipeline-0.1.0",
  headline: "Your evidence fits Backend / Platform Engineering roles best.",
  disclaimer:
    "This is guidance for you, built from what you demonstrated in your interview. It is not a prediction that any employer will select you — a person always makes that decision.",
  role_fits: [
    {
      role_id: "onet-15-1252",
      role_title: "Backend / Platform Engineer",
      role_family: "Software & Platform",
      readiness_pct: 82,
      fit_band: "strong_fit",
      as_of: "2026-07-16",
      covered: [
        { skill_id: "esco-tsc-2101", skill_label: "Distributed systems debugging", band: "supported", quote: "I traced the duplicate charges to a missing idempotency key on the retry path and added a dedupe table keyed on the request id.", session_ref: "turn-14", similarity: 0.89 },
        { skill_id: "onet-2.B.3.e", skill_label: "Incident response", band: "supported", quote: "First I rolled back the deploy, then checked the idempotency keys before re-enabling writes.", session_ref: "turn-9", similarity: 0.84 },
        { skill_id: "esco-tsc-1899", skill_label: "Database schema design", band: "emerging", quote: "I normalised the events table and added a composite index on (org_id, created_at).", session_ref: "turn-21", similarity: 0.77 },
      ],
      gaps: [
        { skill_id: "esco-tsc-3040", skill_label: "Kubernetes operations", severity: "important", why: "Platform roles here expect owning service deploys on k8s.", next_evidence: "Ship and operate one service on a k8s cluster end-to-end.", build_actions: ["Deploy a small service with a Helm chart", "Set up a liveness/readiness probe and an HPA"], learning: [{ kind: "course", title: "Kubernetes for Developers", provider: "Linux Foundation (edX)", url: null, source: "catalog:lf-k8s-dev", skill_ids: ["esco-tsc-3040"], est_effort: "~25h" }, { kind: "certification", title: "CKAD", provider: "CNCF", url: null, source: "catalog:cncf-ckad", skill_ids: ["esco-tsc-3040"], est_effort: "exam" }] },
      ],
      companies: [
        { company_name: "A Series-B fintech", readiness_pct: 84, note: "Strong on the idempotency/reliability signals they weight most." },
        { company_name: "A platform-tooling startup", readiness_pct: 79, note: "Close; k8s ownership is the one gap to close first." },
      ],
    },
    {
      role_id: "onet-15-1299",
      role_title: "Site Reliability Engineer",
      role_family: "Software & Platform",
      readiness_pct: 64,
      fit_band: "developing_fit",
      as_of: "2026-07-16",
      covered: [
        { skill_id: "onet-2.B.3.e", skill_label: "Incident response", band: "supported", quote: "First I rolled back the deploy, then checked the idempotency keys before re-enabling writes.", session_ref: "turn-9", similarity: 0.84 },
      ],
      gaps: [
        { skill_id: "esco-tsc-2777", skill_label: "Observability / SLOs", severity: "critical", why: "SRE roles expect defining and defending SLOs.", next_evidence: "Define an SLO for one service and wire the error budget.", build_actions: ["Instrument a service with metrics + traces", "Write one SLO doc with an error budget policy"], learning: [{ kind: "course", title: "SRE: Measuring & Managing Reliability", provider: "Google Cloud (Coursera)", url: null, source: "catalog:gcp-sre", skill_ids: ["esco-tsc-2777"], est_effort: "~15h" }] },
      ],
      companies: [],
    },
  ],
  edges: [
    { skill_label: "Distributed systems debugging", band: "supported", note: "Above the typical bar for your level — you reasoned from symptom to root cause unaided.", quote: "I traced the duplicate charges to a missing idempotency key on the retry path…" },
    { skill_label: "Calm incident response", band: "supported", note: "Sequenced rollback-before-investigate correctly under pressure.", quote: "First I rolled back the deploy, then checked the idempotency keys…" },
  ],
  gaps: [
    { skill_id: "esco-tsc-3040", skill_label: "Kubernetes operations", severity: "important", why: "Appears in most platform roles you fit.", next_evidence: "Own one service deploy on k8s end-to-end.", build_actions: ["Deploy with a Helm chart", "Add an HPA + probes"], learning: [{ kind: "course", title: "Kubernetes for Developers", provider: "Linux Foundation (edX)", url: null, source: "catalog:lf-k8s-dev", skill_ids: ["esco-tsc-3040"], est_effort: "~25h" }] },
    { skill_id: "esco-tsc-2777", skill_label: "Observability / SLOs", severity: "critical", why: "Blocks the SRE track entirely.", next_evidence: "Define and defend one SLO.", build_actions: ["Instrument metrics + traces", "Write an error-budget policy"], learning: [{ kind: "course", title: "SRE: Measuring & Managing Reliability", provider: "Google Cloud (Coursera)", url: null, source: "catalog:gcp-sre", skill_ids: ["esco-tsc-2777"], est_effort: "~15h" }] },
  ],
  skills_to_develop: [
    { skill_id: "esco-tsc-3040", skill_label: "Kubernetes operations", band: "needs_more_evidence", quote: null, session_ref: null, similarity: null },
    { skill_id: "esco-tsc-2777", skill_label: "Observability / SLOs", band: "needs_more_evidence", quote: null, session_ref: null, similarity: null },
    { skill_id: "esco-tsc-1560", skill_label: "Infrastructure as Code (Terraform)", band: "needs_more_evidence", quote: null, session_ref: null, similarity: null },
  ],
  roadmap: [
    { order: 1, title: "Close the platform gap", horizon: "0–30 days", focus: "Own one service on Kubernetes end-to-end.", targets: ["Kubernetes operations"], steps: [{ kind: "course", title: "Kubernetes for Developers", provider: "Linux Foundation (edX)", url: null, source: "catalog:lf-k8s-dev", skill_ids: ["esco-tsc-3040"], est_effort: "~25h" }] },
    { order: 2, title: "Prove reliability ownership", horizon: "30–60 days", focus: "Define an SLO and defend an error budget.", targets: ["Observability / SLOs"], steps: [{ kind: "course", title: "SRE: Measuring & Managing Reliability", provider: "Google Cloud (Coursera)", url: null, source: "catalog:gcp-sre", skill_ids: ["esco-tsc-2777"], est_effort: "~15h" }] },
    { order: 3, title: "Certify + widen", horizon: "60–90 days", focus: "Validate the platform track and add IaC.", targets: ["Kubernetes operations", "Infrastructure as Code"], steps: [{ kind: "certification", title: "CKAD", provider: "CNCF", url: null, source: "catalog:cncf-ckad", skill_ids: ["esco-tsc-3040"], est_effort: "exam" }, { kind: "course", title: "Terraform Fundamentals", provider: "HashiCorp Learn", url: null, source: "catalog:hashicorp-tf", skill_ids: ["esco-tsc-1560"], est_effort: "~10h" }] },
  ],
};
