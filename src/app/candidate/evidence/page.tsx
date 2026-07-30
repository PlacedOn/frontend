import type { Metadata } from "next";
import { EvidenceReview } from "@/components/evidence/EvidenceReview";

export const metadata: Metadata = {
  title: "Review your evidence — Placedon",
  description:
    "See every trait we found, the moment in your interview it came from, and decide what employers can see. Nothing is shared until you approve it.",
};

export default function EvidencePage() {
  return <EvidenceReview />;
}
