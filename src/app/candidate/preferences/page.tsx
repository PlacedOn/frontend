import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { CandidatePreferences } from "@/components/candidate/CandidatePreferences";

export const metadata: Metadata = {
  title: "Your preferences — Placedon",
  description: "Set what you're looking for and exactly how visible you are to employers. You control it all — visibility is off by default.",
};

export default function CandidatePreferencesPage() {
  return (
    <>
      <PageHeading
        eyebrow="Candidate preferences"
        title={
          <>
            What you want, <span className="grad-iris">and who can see you</span>.
          </>
        }
        intro="Tell us the roles, places, and terms that fit. You decide how visible you are — nothing is searchable unless you say so."
      />
      <CandidatePreferences />
    </>
  );
}
