import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { IntroInbox } from "@/components/intros/IntroInbox";

export const metadata: Metadata = {
  title: "Introductions — Placedon",
  description: "The only place messages happen — after mutual interest and your consent. Approve to reveal, decline to pass. Nothing before you say so.",
};

// Introductions is reached from the team nav, so it renders in the team shell.
export default function IntrosPage() {
  return (
    <DashboardShell role="employer">
      <PageHeading
        eyebrow="Introductions"
        title={
          <>
            Contact, <span className="grad-iris">only with consent</span>.
          </>
        }
        intro="An introduction reaches you only after a real match and only with your approval. Approve to reveal the company and open a chat; decline to pass. There is no messaging anywhere else."
      />
      <IntroInbox />
    </DashboardShell>
  );
}
