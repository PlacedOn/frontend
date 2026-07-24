import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { JobDetail } from "@/components/candidate/jobs/JobDetail";
import { getJobListing } from "@/lib/mock/jobs";

export const metadata: Metadata = {
  title: "Role — Placedon",
  description: "See the role, what the AI interview will explore, and apply.",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobListing(id);
  if (!job) notFound();

  return (
    <>
      <PageHeading
        eyebrow="Open role"
        title={
          <>
            {job.title} <span className="grad-iris">· {job.company}</span>
          </>
        }
        intro="Here's the role, the reality behind it, and exactly what the AI interview will explore — the team's own requirements. Apply when you're ready."
      />
      <JobDetail job={job} />
    </>
  );
}
