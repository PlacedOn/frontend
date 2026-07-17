import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { GrowthReportView } from "@/components/candidate/growth/GrowthReportView";

export const metadata: Metadata = {
  title: "Growth Report — Placedon",
  description:
    "Career guidance built from your interview evidence: where your skills fit best, your edge, growth gaps, and a cited roadmap. Guidance for you — never a hiring verdict.",
};

export default function CandidateGrowthPage() {
  return (
    <>
      <PageHeading
        eyebrow="Growth report"
        title={
          <>
            Career guidance, <span className="grad-iris">built from your evidence</span>.
          </>
        }
        intro="Everything below comes from what you demonstrated in your interview: the roles your evidence fits, the strengths worth leading with, and a concrete plan for what to build next. It guides you — a person always makes hiring decisions."
      />
      <GrowthReportView />
    </>
  );
}
