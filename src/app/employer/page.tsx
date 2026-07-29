import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { EmployerStats } from "@/components/employer/EmployerStats";
import { EmployerDashboard } from "@/components/employer/EmployerDashboard";

export const metadata: Metadata = {
  title: "Hiring dashboard — Placedon",
  description: "Review evidence-backed candidates, post roles, and request intros — you never see a raw transcript, only approved evidence.",
};

export default function EmployerPage() {
  return (
    <>
      {/* No sales pitch here. This page is behind a login — the reader has
          already bought the premise, and "Hire on evidence, not resumes" is a
          landing-page line. What they need on arrival is orientation: whose
          desk this is, and what is waiting. The specific, personal call to
          action lives in TeamOperate below and is now the strongest thing on
          the page rather than the second-loudest. */}
      <PageHeading
        eyebrow="Hiring"
        title="Overview"
        intro="Everyone here has already interviewed. You see what they approved you to see — never the raw transcript."
      />
      <EmployerStats />
      <EmployerDashboard />
    </>
  );
}
