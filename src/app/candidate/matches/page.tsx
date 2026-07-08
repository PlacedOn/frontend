import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { CandidateMatches } from "@/components/candidate/CandidateMatches";

export const metadata: Metadata = {
  title: "Your matches — PlacedOn",
  description: "Roles matched to your evidence — with the exact quotes behind every fit, and full control over your interest.",
};

export default function CandidateMatchesPage() {
  return (
    <RoutePage
      eyebrow="Your matches"
      title={
        <>
          Roles that fit <span className="grad-iris">your evidence</span>.
        </>
      }
      intro="Each match traces to your own words. Open the evidence, then decide — your interest is never shared without you."
    >
      <CandidateMatches />
    </RoutePage>
  );
}
