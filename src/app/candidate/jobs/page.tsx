import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { JobBoard } from "@/components/candidate/jobs/JobBoard";

export const metadata: Metadata = {
  title: "Open roles — Placedon",
  description:
    "Browse open roles and apply. Each role's AI interview is built from that team's own requirements — one honest conversation, no generic quiz.",
};

export default function JobsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Open roles"
        title={
          <>
            Find a role, <span className="grad-iris">interview for it</span>.
          </>
        }
        intro="Apply to a specific role and the AI interview is generated from that team's own requirements. Already interviewed? Your evidence is reused — you only cover what's new."
      />
      <JobBoard />
    </>
  );
}
