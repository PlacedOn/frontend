import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { EmployerDashboard } from "@/components/employer/EmployerDashboard";
import { SignedInBar } from "@/components/auth/SignedInBar";

export const metadata: Metadata = {
  title: "Hiring dashboard — Placedon",
  description: "Review evidence-backed candidates, post roles, and request intros — you never see a raw transcript, only approved evidence.",
};

export default function EmployerPage() {
  return (
    <RoutePage
      eyebrow="For teams · hiring"
      title={
        <>
          Hire on <span className="grad-iris">evidence</span>, not resumes.
        </>
      }
      intro="Every candidate here has interviewed. You see the signals they approved and the one worth exploring — never the raw transcript."
    >
      <SignedInBar />
      <EmployerDashboard />
    </RoutePage>
  );
}
