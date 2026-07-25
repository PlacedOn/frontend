import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { PracticeRoom } from "@/components/interview/PracticeRoom";

export const metadata: Metadata = {
  title: "Practice run — Placedon",
  description:
    "A no-stakes warm-up for your Placedon interview — nothing recorded, scored, or shared. Practice as many times as you like.",
};

export default function PracticePage() {
  return (
    <RoutePage
      eyebrow="Practice · not recorded"
      title={
        <>
          A no-stakes <span className="grad-iris">warm-up</span>.
        </>
      }
      intro="Get a feel for the conversation before the real thing. Nothing here is recorded, scored, or seen by any employer — run it as many times as you like."
    >
      <PracticeRoom />
    </RoutePage>
  );
}
