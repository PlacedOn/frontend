import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { TrustPassport } from "@/components/candidate/TrustPassport";

export const metadata: Metadata = {
  title: "Your profile — Placedon",
  description: "Your evidence-backed Trust Passport. Review every trait and its quote before employers see anything.",
};

export default function CandidateProfilePage() {
  return (
    <RoutePage
      eyebrow="Trust passport"
      title={
        <>
          Your profile, <span className="grad-iris">before</span> employers see it.
        </>
      }
      intro="Every trait traces to your own words. Employers only ever see the evidence you approve — nothing is shared by default."
    >
      <TrustPassport />
    </RoutePage>
  );
}
