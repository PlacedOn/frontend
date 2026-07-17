import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { TeamPanel } from "@/components/employer/team/TeamPanel";

export const metadata: Metadata = {
  title: "Your team — Placedon",
  description: "Manage your company, invite teammates, and set their roles.",
};

export default function TeamPage() {
  return (
    <>
      <PageHeading
        eyebrow="For teams · people"
        title={
          <>
            Your <span className="grad-iris">team</span>.
          </>
        }
        intro="Create your company, invite teammates as recruiters or hiring managers, and manage who can do what."
      />
      <TeamPanel />
    </>
  );
}
