import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { AccommodationsPanel } from "@/components/candidate/AccommodationsPanel";

export const metadata: Metadata = {
  title: "Accommodations — Placedon",
  description:
    "Set up your interview your way — reduce motion, choose voice or text, take all the time you need. No approval, no note on your profile, no questions asked.",
};

export default function AccommodationsPage() {
  return (
    <RoutePage
      eyebrow="Accommodations · no questions asked"
      title={
        <>
          Interview on <span className="grad-iris">your terms</span>.
        </>
      }
      intro="Comfort settings that stay on your device. Nothing here is shared with an employer, and nothing needs approval — it's just yours."
    >
      <div className="max-w-xl">
        <AccommodationsPanel />
      </div>
    </RoutePage>
  );
}
