/**
 * Data adapter for the employer dashboard. Prefers GET /demo/employer when
 * the backend is configured, else rich mock data. Components import only
 * getEmployerData().
 */

import { isLiveBackend, getDemoEmployer } from "@/lib/api";

export interface EmployerJob {
  id: string;
  title: string;
  location: string;
  status: string;
  candidateCount: number;
}

export type FeedStatus = "new" | "saved" | "passed" | "intro";

export interface FeedCandidate {
  id: string;
  name: string;
  roleFit: string;
  location: string;
  matchScore: number;
  evidenceStrength: string;
  keySignals: string[];
  missingSignal: string;
  availableFrom: string;
  status: FeedStatus;
}

export interface EmployerData {
  company: string;
  viewer: string;
  jobs: EmployerJob[];
  candidates: FeedCandidate[];
  live: boolean;
}

const MOCK_JOBS: EmployerJob[] = [
  { id: "job-fe", title: "Frontend Engineer", location: "Bengaluru · Hybrid", status: "Active", candidateCount: 12 },
  { id: "job-platform", title: "UI Platform Engineer", location: "Remote · India", status: "Draft", candidateCount: 5 },
];

const MOCK_CANDIDATES: FeedCandidate[] = [
  {
    id: "cand-2481",
    name: "Candidate #2481",
    roleFit: "Frontend Engineer",
    location: "Bengaluru, India",
    matchScore: 91,
    evidenceStrength: "Strong evidence",
    keySignals: ["Structured debugging", "Collaboration clarity", "Frontend execution"],
    missingSignal: "Stakeholder communication",
    availableFrom: "Immediately",
    status: "new",
  },
  {
    id: "cand-3390",
    name: "Candidate #3390",
    roleFit: "Frontend Engineer",
    location: "Pune, India",
    matchScore: 78,
    evidenceStrength: "Emerging evidence",
    keySignals: ["Implementation pace", "Learning velocity"],
    missingSignal: "Stakeholder communication",
    availableFrom: "In 2 weeks",
    status: "new",
  },
];

const scoreToStrength = (s: number): string =>
  s >= 85 ? "Strong evidence" : s >= 70 ? "Solid evidence" : "Emerging evidence";

export async function getEmployerData(): Promise<EmployerData> {
  if (isLiveBackend()) {
    try {
      const r = await getDemoEmployer();
      return {
        company: r.employer.company,
        viewer: r.employer.viewer_name,
        jobs: r.jobs.map((j) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          status: j.status,
          candidateCount: j.candidate_matches ?? j.applicants_count ?? 0,
        })),
        candidates: r.discovery_feed.map((c) => ({
          id: c.id,
          name: c.name?.startsWith("Candidate") ? c.name : `Candidate · ${c.target_role}`,
          roleFit: c.target_role,
          location: c.location,
          matchScore: c.match_score,
          evidenceStrength: c.evidence_strength || scoreToStrength(c.match_score),
          keySignals: c.key_signals ?? [],
          missingSignal: "Stakeholder communication",
          availableFrom: c.available_from,
          status: "new",
        })),
        live: true,
      };
    } catch {
      // fall through to mock
    }
  }
  await new Promise((r) => setTimeout(r, 450));
  return { company: "GrowthCart", viewer: "Maya Rao", jobs: MOCK_JOBS, candidates: MOCK_CANDIDATES, live: false };
}
