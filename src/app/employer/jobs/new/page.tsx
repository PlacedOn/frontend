import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { NewJobForm } from "@/components/employer/jobs/NewJobForm";

export const metadata: Metadata = {
  title: "New role — Placedon",
  description: "Create a role, then define its Role DNA and Job Reality Card so candidates are matched on evidence.",
};

export default function NewJobPage() {
  return (
    <>
      <PageHeading
        eyebrow="For teams · new role"
        title={
          <>
            Define the role, <span className="grad-iris">then the evidence</span>.
          </>
        }
        intro="Name the role. Next you'll set the observable signals that matter and the honest work reality candidates see."
      />
      <NewJobForm />
    </>
  );
}
