/**
 * Candidate Network domain types — mirror the public schema created in
 * supabase/migrations/0013_candidate_network.sql. Field names match the wire
 * format so Supabase rows map without translation.
 *
 * Invariant: coverage is PER-ROLE coverage of public role_requirements, never a
 * person-score, hire probability, or cross-candidate rank. See system-design v1.
 */

export type ArtifactKind =
  | "repo"
  | "project"
  | "writeup"
  | "deployment"
  | "credential"
  | "other";

export type ArtifactSource = "manual" | "github";

export type EvidenceStrength = "mentioned" | "demonstrated" | "verified";

export type RequirementSeverity = "critical" | "important" | "nice_to_have";

export interface Artifact {
  id: string;
  candidate_id: string;
  kind: ArtifactKind;
  title: string;
  url: string | null;
  source: ArtifactSource;
  summary: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface ProgressLog {
  id: string;
  candidate_id: string;
  body: string;
  artifact_id: string | null;
  created_at: string;
}

export interface EvidenceLink {
  id: string;
  artifact_id: string;
  skill_id: string;
  strength: EvidenceStrength;
  created_at: string;
}

/** One unmet requirement on the Signal ring — an "open loop". */
export interface CoverageGap {
  skill_id: string;
  severity: RequirementSeverity;
  has_learning: boolean;
}

export interface CoverageSnapshot {
  id: string;
  candidate_id: string;
  role_id: string;
  coverage: number; // 0–100, per-role coverage percent
  gaps: CoverageGap[];
  computed_at: string;
}

export interface Circle {
  id: string;
  name: string;
  role_family: string;
  created_by: string;
  member_cap: number;
  created_at: string;
}

export interface CircleMembership {
  id: string;
  circle_id: string;
  candidate_id: string;
  joined_at: string;
}

export interface Vouch {
  id: string;
  artifact_id: string;
  from_candidate: string;
  note: string | null;
  created_at: string;
}
