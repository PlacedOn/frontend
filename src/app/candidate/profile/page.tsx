import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { CandidateReadiness } from "@/components/candidate/CandidateReadiness";
import { ProfileBuilder } from "@/components/candidate/profile/ProfileBuilder";
import { TrustPassport } from "@/components/candidate/TrustPassport";

export const metadata: Metadata = {
  title: "Profile builder — Placedon",
  description:
    "Build your profile in your own words: claims, intent, and the stories you want to talk about. Flag what matters and your interview verifies it — nothing here scores you.",
};

export default function CandidateProfilePage() {
  return (
    <>
      <PageHeading
        eyebrow="Profile builder"
        title={
          <>
            Say it here. <span className="grad-iris">Prove it</span> in your interview.
          </>
        }
        intro="Your profile is claims + intent — what you say about yourself and what you're looking for. Flag a skill and the interview probes exactly that. It never asks about college, background, or anything that isn't your work."
      />
      <div className="mb-8">
        <CandidateReadiness />
      </div>
      <ProfileBuilder />

      {/* Said vs shown: the builder above is claims; this is verified evidence. */}
      <section id="evidence" aria-labelledby="evidence-heading" className="scroll-mt-28 pt-20">
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
    </>
  );
}
