import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { CandidateApplications } from "@/components/candidate/CandidateApplications";

export const metadata: Metadata = {
  title: "Applications & intros — PlacedOn",
  description: "Track every role you've engaged and every employer intro — you approve each one before contact.",
};

export default function CandidateApplicationsPage() {
  return (
    <RoutePage
      eyebrow="Applications & intros"
      title={
        <>
          Every intro, <span className="grad-iris">on your terms</span>.
        </>
      }
      intro="Roles you've engaged and employer intros in one pipeline. Nobody reaches you until you say yes."
    >
      <CandidateApplications />
    </RoutePage>
  );
}
