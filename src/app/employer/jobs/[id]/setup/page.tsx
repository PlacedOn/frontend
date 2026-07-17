import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { JobSetup } from "@/components/employer/jobs/JobSetup";

export const metadata: Metadata = {
  title: "Role setup — Placedon",
  description: "Set the Role DNA and Job Reality Card, then activate the role for candidate search.",
};

export default async function JobSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PageHeading
        eyebrow="For teams · role setup"
        title={
          <>
            The signals that matter, <span className="grad-iris">and the honest reality</span>.
          </>
        }
        intro="Define the observable success signals a candidate is assessed against, and the true work conditions they'll see. A role can only enter candidate search once both are complete."
      />
      <JobSetup jobId={id} />
    </>
  );
}
