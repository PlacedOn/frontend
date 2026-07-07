/**
 * Domain types mirroring the PlacedOn backend data contracts
 * (PlacedOn/frontend/src/imports/data-contracts.md + backend/app/models.py).
 * Field names match the wire format so responses map without translation.
 */

export type Visibility = "anonymous" | "limited" | "public";
export type SeniorityLevel = "intern" | "junior" | "mid" | "senior";
export type WorkMode = "remote" | "hybrid" | "onsite";

export interface CandidateProfile {
  name: string;
  experience_years: number;
  skills: string[];
  projects: string[];
  education: string[];
  targetRole: string;
  visibility: Visibility;
}

export interface JobProfile {
  role: string;
  company: string;
  level: SeniorityLevel;
  required_skills: string[];
  preferred_skills: string[];
  location: string;
  workMode: WorkMode;
}

export interface InterviewState {
  interview_id: string;
  turn: number;
  turn_count: number;
  last_question: string;
  last_answer: string;
  skill_scores: Record<string, number>;
  skill_coverage: Record<string, number>;
  avg_confidence: number;
  current_skill: string;
  current_difficulty: string;
  latest_trust_score: number;
  anomaly_flag: boolean;
  candidate_snapshot: Partial<CandidateProfile>;
}

export interface CandidateMatch {
  id: string;
  company: string;
  role: string;
  matchPercent: number;
  location: string;
  workMode: WorkMode;
  status: string;
  whyMatched: string;
  evidence: string[];
}

export interface EmployerCandidate {
  id: string;
  displayName: string;
  roleFitPercent: number;
  targetRole: string;
  experienceLabel: string;
  topTraits: string[];
  verifiedSkills: string[];
  interviewFreshness: string;
  visibility: Visibility;
}

/** Payload for the marketing "Book a demo" lead form. */
export interface DemoRequest {
  name: string;
  workEmail: string;
  company: string;
  audience: "employer" | "candidate";
  message?: string;
}
