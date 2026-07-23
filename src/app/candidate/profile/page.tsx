import type { Metadata } from "next";
import { GuidedProfileFlow } from "@/components/candidate/profile/GuidedProfileFlow";
import { TrustPassport } from "@/components/candidate/TrustPassport";

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

      {/* Said vs shown: the flow above is claims; this is verified evidence. */}
      <section id="evidence" aria-labelledby="evidence-heading" className="mx-auto mt-20 max-w-2xl scroll-mt-28">
        <p className="eyebrow">Shown — verified evidence</p>
        <h2 id="evidence-heading" className="mt-3 max-w-2xl text-[clamp(1.8rem,1.2rem+2vw,2.6rem)]">
          What your interview has verified.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--ink-2)]">
          Everything above is what you <em>said</em>. This is what you&rsquo;ve <em>shown</em> — each trait traces
          to your own words in the interview, and you control exactly what employers see.
        </p>
        <div className="mt-8">
          <TrustPassport />
        </div>
      </section>
    </div>
  );
}
