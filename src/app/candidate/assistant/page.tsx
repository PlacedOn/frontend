import type { Metadata } from "next";
import { CandidateAssistant } from "@/components/candidate/assistant/CandidateAssistant";

export const metadata: Metadata = {
  title: "Assistant — Placedon",
  description:
    "Your evidence assistant: ask which roles fit you, your biggest gap, and your next step — grounded in your own evidence, never guessed.",
};

export default function CandidateAssistantPage() {
  // Compact header (not the tall PageHeading) so the fixed-height chat fits above
  // the mobile bottom tab bar. The assistant's own opening message does the rest.
  return (
    <div className="lg:pt-2">
      <p className="eyebrow">Your assistant</p>
      <h1 className="mt-0.5 mb-3 text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] font-extrabold tracking-tight text-[var(--ink)]">
        Ask about <span className="grad-iris">your evidence</span>.
      </h1>
      <CandidateAssistant />
    </div>
  );
}
