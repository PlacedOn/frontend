import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { PassportVerify } from "@/components/passport/PassportVerify";

export const metadata: Metadata = {
  title: "Verify an Evidence Passport — Placedon",
  description: "Paste a shared Placedon Evidence Passport to confirm it's authentic and unaltered. No account needed; no private candidate data is exposed.",
};

export default function PassportVerifyPage() {
  return (
    <RoutePage
      eyebrow="Verify a passport"
      title={
        <>
          Real evidence, <span className="grad-iris">provably unaltered</span>.
        </>
      }
      intro="A Placedon Evidence Passport is signed. Paste one here to confirm it's authentic and hasn't been edited — a single changed band or quote fails the check. You don't need an account, and you never see the candidate's raw interview."
    >
      <PassportVerify />
    </RoutePage>
  );
}
