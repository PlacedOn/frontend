import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { ReportCardReview } from "@/components/candidate/ReportCardReview";

export const metadata: Metadata = {
  title: "Your evidence — Placedon",
  description: "Review the evidence from your interview — your own words, quoted. Add context, dispute, or hide anything before you approve. No single score.",
};

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PageHeading
        eyebrow="Your evidence"
        title={
          <>
            Your words, <span className="grad-iris">quoted and yours to review</span>.
          </>
        }
        intro="Every item below comes from your own answers. Mark what's accurate, add context, dispute anything that's off, and hide what you don't want shared. Nothing leaves your account until you approve — and there is no single score."
      />
      <ReportCardReview sessionId={id} />
    </>
  );
}
