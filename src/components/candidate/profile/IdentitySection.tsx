"use client";

import { ShieldCheck } from "lucide-react";
import type { CandidateProfile } from "@/lib/v1";
import { FieldLabel, INPUT_CLS, INPUT_STYLE, SectionCard } from "./kit";

type Props = {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
};

/** Step 1 — who you are, in your own words. Claims, never pedigree. */
export function IdentitySection({ profile, update }: Props) {
  return (
    <SectionCard
      id="identity"
      step={1}
      kicker="Identity"
      title="Who you are, in your words"
      note="Just how you'd introduce yourself. This is the voice employers eventually hear — after you approve everything."
    >
      <div className="grid gap-5">
        <label className="block max-w-sm">
          <FieldLabel>Display name</FieldLabel>
          <input
            value={profile.display_name}
            onChange={(e) => update({ display_name: e.target.value })}
            placeholder="What should we call you?"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </label>

        <label className="block">
          <FieldLabel hint="One line — the way you'd say it out loud">Headline</FieldLabel>
          <input
            value={profile.headline}
            onChange={(e) => update({ headline: e.target.value })}
            placeholder="e.g. Backend engineer who likes systems that don't fall over"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </label>

        <label className="block">
          <FieldLabel hint="2–3 sentences on where you are and where you're headed">Short summary</FieldLabel>
          <textarea
            value={profile.summary}
            onChange={(e) => update({ summary: e.target.value })}
            rows={3}
            placeholder="What you've been building, and what you want to go deeper on."
            className={`${INPUT_CLS} resize-y leading-6`}
            style={INPUT_STYLE}
          />
        </label>
      </div>

      <p
        className="mt-6 flex items-start gap-2.5 rounded-[var(--r-btn)] px-4 py-3 text-[12.5px] font-semibold leading-5"
        style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        We never ask for college, age, gender, photo, or background. Your claims and intent are the whole
        profile — the interview is what turns them into evidence.
      </p>
    </SectionCard>
  );
}
