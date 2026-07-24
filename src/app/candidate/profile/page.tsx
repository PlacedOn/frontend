import type { Metadata } from "next";
import { GuidedProfileFlow } from "@/components/candidate/profile/GuidedProfileFlow";
import { ProfileEvidence } from "@/components/candidate/profile/ProfileEvidence";

export const metadata: Metadata = {
  title: "Profile builder — Placedon",
  description:
    "Build your profile in your own words: claims, intent, and the stories you want to talk about. Flag what matters and your interview verifies it — nothing here scores you.",
};

export default function CandidateProfilePage() {
  return (
    <div className="lg:pt-2">
      {/* Compact header — the guided flow carries its own progress, so no tall hero. */}
      <p className="eyebrow">Build your profile</p>
      <h1 className="mt-0.5 mb-6 text-[clamp(1.25rem,1.1rem+0.6vw,1.7rem)] font-extrabold tracking-tight text-[var(--ink)]">
        Say it here. <span className="grad-iris">Prove it</span> in your interview.
      </h1>

      <GuidedProfileFlow />

      {/* Said vs shown: the flow above is claims; this is verified evidence you control. */}
      <ProfileEvidence />
    </div>
  );
}
