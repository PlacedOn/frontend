import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { CandidateAssistant } from "@/components/candidate/assistant/CandidateAssistant";

export const metadata: Metadata = {
  title: "Assistant — Placedon",
  description:
    "Your evidence assistant: ask which roles fit you, your biggest gap, and your next step — grounded in your own evidence, never guessed.",
};

export default function CandidateAssistantPage() {
  return (
    <>
      <PageHeading
        eyebrow="Your assistant"
        title={
          <>
            Ask about <span className="grad-iris">your evidence</span>.
          </>
        }
        intro="Fit, gaps, next step, strengths — answered from your own evidence, never invented. Not a feed, not a score."
      />
      <CandidateAssistant />
    </>
  );
}
