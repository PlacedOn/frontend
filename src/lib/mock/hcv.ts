/**
 * Rich HCV report adapter — preserves the backend's per-dimension
 * score + confidence + uncertainty + evidence (the calibrated signal the old
 * categorical adapter threw away). Prefers GET /demo/hcv when live, else mock.
 * Components import only getHcvReport().
 */

import { isLiveBackend, getDemoHcv } from "@/lib/api";

export interface HcvDimension {
  id: string;
  label: string;
  score: number; // 0–100
  confidence: number; // 0–1 (calibrated)
  uncertainty: number; // 0–1
  evidence: string; // candidate's own words
  employerVisible: boolean;
}

export interface HcvReport {
  candidateName: string;
  roleContext: string;
  summary: string;
  overall: number; // 0–100
  overallConfidence: number; // 0–1
  dimensions: HcvDimension[];
  live: boolean;
}

const MOCK_DIMENSIONS: HcvDimension[] = [
  {
    id: "technical",
    label: "Frontend execution",
    score: 86,
    confidence: 0.86,
    uncertainty: 0.14,
    evidence:
      "Explained tradeoffs between optimistic UI, cache invalidation, and loading states in a real product flow.",
    employerVisible: true,
  },
  {
    id: "behavioral",
    label: "Ownership under ambiguity",
    score: 82,
    confidence: 0.81,
    uncertainty: 0.19,
    evidence: "Repeatedly clarified user impact before choosing implementation shortcuts.",
    employerVisible: true,
  },
  {
    id: "communication",
    label: "Collaborative clarity",
    score: 88,
    confidence: 0.89,
    uncertainty: 0.11,
    evidence: "Translated technical constraints into design options without hiding tradeoffs.",
    employerVisible: true,
  },
  {
    id: "growth",
    label: "Learning velocity",
    score: 79,
    confidence: 0.76,
    uncertainty: 0.24,
    evidence: "Turned interview feedback into a focused accessibility and testing practice plan.",
    employerVisible: false,
  },
];

const MOCK: HcvReport = {
  candidateName: "Aisha Sharma",
  roleContext: "Frontend Engineer",
  summary: "Strong evidence-backed frontend and collaboration profile.",
  overall: 84,
  overallConfidence: 0.83,
  dimensions: MOCK_DIMENSIONS,
  live: false,
};

const avg = (nums: number[]): number =>
  nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;

export async function getHcvReport(): Promise<HcvReport> {
  if (isLiveBackend()) {
    try {
      const hcv = await getDemoHcv();
      if (hcv.dimensions?.length) {
        const dimensions: HcvDimension[] = hcv.dimensions.map((d) => ({
          id: d.id || d.label,
          label: d.label || d.dimension,
          score: d.score,
          confidence: d.confidence,
          uncertainty: d.uncertainty,
          evidence: d.evidence_snippets?.[0] ?? "",
          employerVisible: true,
        }));
        return {
          candidateName: hcv.candidate_name,
          roleContext: hcv.role_context,
          summary: typeof hcv.summary === "string" ? hcv.summary : "",
          overall: Math.round(avg(dimensions.map((d) => d.score))),
          overallConfidence: avg(dimensions.map((d) => d.confidence)),
          dimensions,
          live: true,
        };
      }
    } catch {
      // fall through to mock
    }
  }
  return MOCK;
}
