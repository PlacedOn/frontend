"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useProfileBuilder } from "./useProfileBuilder";
import { ResumeIngest } from "./ResumeIngest";
import { IdentitySection } from "./IdentitySection";
import { IntentSection } from "./IntentSection";
import { SkillsSection } from "./SkillsSection";
import { HighlightsSection } from "./HighlightsSection";
import { MomentumRail } from "./MomentumRail";
import { InterviewBridge } from "./InterviewBridge";
import { OpeningsFeed } from "./OpeningsFeed";

/**
 * The candidate profile builder (Card A): a calm, sectioned, autosaving form
 * for claims + intent, with a live rail showing the momentum meter and the
 * profile → interview → report bridge, then the openings-you-fit feed.
 */
export function ProfileBuilder() {
  const { profile, update, saveState, fromBackend, momentum } = useProfileBuilder();

  return (
    <div className="flex flex-col gap-6">
      {fromBackend && (
        <div className="flex items-center gap-2">
          <span className="livedot" />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Live · autosaving to backend
          </span>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Reveal>
            <ResumeIngest profile={profile} update={update} />
          </Reveal>
          <Reveal delay={0.05}>
            <IdentitySection profile={profile} update={update} />
          </Reveal>
          <Reveal delay={0.05}>
            <IntentSection profile={profile} update={update} />
          </Reveal>
          <Reveal delay={0.05}>
            <SkillsSection profile={profile} update={update} />
          </Reveal>
          <Reveal delay={0.05}>
            <HighlightsSection profile={profile} update={update} />
          </Reveal>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <Reveal delay={0.1}>
            <MomentumRail profile={profile} momentum={momentum} saveState={saveState} fromBackend={fromBackend} />
          </Reveal>
          <Reveal delay={0.16}>
            <InterviewBridge profile={profile} />
          </Reveal>
        </div>
      </div>

      <Reveal>
        <OpeningsFeed />
      </Reveal>
    </div>
  );
}
