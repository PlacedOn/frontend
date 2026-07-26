"use client";

import { isLiveBackend } from "@/lib/v1";
import { CandidateMatches } from "./CandidateMatches";
import { LiveCandidateRecs } from "./LiveCandidateRecs";
import { MatchSpotlight } from "./MatchSpotlight";

/**
 * With a real backend, show live evidence-ranked company recommendations;
 * otherwise the illustrative sample matches, opened by the 3D fit spotlight.
 * Never fake data pretending to be live.
 */
export function CandidateMatchesSurface() {
  if (isLiveBackend()) return <LiveCandidateRecs />;
  return (
    <>
      <MatchSpotlight />
      <CandidateMatches />
    </>
  );
}
