import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { PipelineBoardView } from "@/components/employer/pipeline/PipelineBoardView";

export const metadata: Metadata = {
  title: "Candidate pipeline — Placedon",
  description: "Your hiring board for this role — New, Reviewing, Intro, Hired, Passed. Cards show the coverage tier and evidence, never a single score.",
};

export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeading
        eyebrow="For teams · pipeline"
        title={
          <>
            Your hiring <span className="grad-iris">pipeline</span>.
          </>
        }
        intro="Move candidates from New to Reviewing to a consented intro. Each card shows how much of the role their evidence covers — the tier and the counts, never a single score."
      />
      <PipelineBoardView jobId={id} />
    </>
  );
}
