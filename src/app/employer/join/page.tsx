import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { JoinTeam } from "@/components/employer/team/JoinTeam";

export const metadata: Metadata = {
  title: "Join a team — Placedon",
  description: "Accept your invite to join a hiring team on Placedon.",
};

export default function JoinPage() {
  return (
    <>
      <PageHeading
        eyebrow="For teams · invite"
        title={
          <>
            Join your <span className="grad-iris">team</span>.
          </>
        }
        intro="Accept your invite to start reviewing evidence-backed candidates together."
      />
      <Suspense
        fallback={<div className="glass h-24 max-w-xl animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />}
      >
        <JoinTeam />
      </Suspense>
    </>
  );
}
