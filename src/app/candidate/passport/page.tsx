import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { PassportView } from "@/components/candidate/PassportView";

export const metadata: Metadata = {
  title: "Evidence Passport — Placedon",
  description: "A portable, tamper-evident proof of the evidence you approved — share it anywhere; anyone can verify it's authentic without seeing your private interview.",
};

export default function CandidatePassportPage() {
  return (
    <>
      <PageHeading
        eyebrow="Evidence passport"
        title={
          <>
            Your evidence, <span className="grad-iris">yours to carry</span>.
          </>
        }
        intro="Mint a signed snapshot of the evidence you approved and take it anywhere — an application, a profile, a DM. Anyone can verify it's authentic and unaltered, and it never exposes your raw interview. It's not a resume line; it's proof."
      />
      <PassportView />
    </>
  );
}
