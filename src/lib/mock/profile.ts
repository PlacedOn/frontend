/**
 * Data adapter for the candidate Trust Passport. Prefers the real backend
 * (GET /demo/hcv — SBERT dimensions with evidence snippets) when configured,
 * else rich mock data. Components import only getProfileData().
 */

import type { Confidence } from "@/lib/types";
import { isLiveBackend, getDemoHcv } from "@/lib/api";

export type TraitConfidence = Confidence | "review";

export interface ProfileTrait {
  label: string;
  confidence: TraitConfidence;
  quote: string;
  employerVisible: boolean;
}

export interface ProfileData {
  traits: ProfileTrait[];
  strength: number;
  live: boolean;
}

const MOCK_TRAITS: ProfileTrait[] = [
  {
    label: "Structured debugging",
    confidence: "high",
    quote: "I reproduced the failure in isolation before touching the API layer, so I could prove the fix.",
    employerVisible: true,
  },
  {
    label: "React architecture",
    confidence: "high",
    quote: "I split shared UI state from feature state so a change didn't rerender the whole checkout flow.",
    employerVisible: true,
  },
  {
    label: "API integration",
    confidence: "medium",
    quote: "I added a typed client so the failure modes were visible at the call site, not swallowed.",
    employerVisible: true,
  },
  {
    label: "Team communication",
    confidence: "review",
    quote: "One example so far — this signal is still light and worth strengthening next time.",
    employerVisible: false,
  },
];

const MOCK_STRENGTH = 72;

const scoreToConfidence = (score: number): TraitConfidence =>
  score >= 85 ? "high" : score >= 70 ? "medium" : "low";

export async function getProfileData(): Promise<ProfileData> {
  if (isLiveBackend()) {
    try {
      const hcv = await getDemoHcv();
      if (hcv.dimensions?.length) {
        const traits: ProfileTrait[] = hcv.dimensions.map((d) => ({
          label: d.label,
          confidence: scoreToConfidence(d.score),
          quote: d.evidence_snippets[0] ?? "",
          employerVisible: true,
        }));
        const strength = Math.round(
          hcv.dimensions.reduce((sum, d) => sum + d.score, 0) / hcv.dimensions.length,
        );
        return { traits, strength, live: true };
      }
    } catch {
      // fall through to mock
    }
  }
  return { traits: MOCK_TRAITS, strength: MOCK_STRENGTH, live: false };
}
