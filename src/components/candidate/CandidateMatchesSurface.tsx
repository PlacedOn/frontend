"use client";

import { isLiveBackend } from "@/lib/v1";
import { CandidateMatches } from "./CandidateMatches";
import { LiveCandidateRecs } from "./LiveCandidateRecs";

/**
 * With a real backend, show live evidence-ranked company recommendations;
 * otherwise the illustrative sample matches. Never fake data pretending to be live.
 */
export function CandidateMatchesSurface() {
  return isLiveBackend() ? <LiveCandidateRecs /> : <CandidateMatches />;
}
