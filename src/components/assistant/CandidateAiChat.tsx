"use client";

/**
 * Candidate side of the core assistant. Loads the user's own GrowthReport and
 * binds the grounded `answer()` engine into a ChatConfig for <AiChat/>.
 * Deterministic today; the LLM swaps in behind the same `answer()` seam.
 */

import { useEffect, useMemo, useState } from "react";
import { v1, V1Error, isLiveBackend, type GrowthReport } from "@/lib/v1";
import { MOCK_GROWTH_REPORT } from "@/lib/mock/growthReport";
import { answer, matchIntent, SUGGESTED } from "@/lib/candidate/assistant";
import { AiChat, type ChatConfig } from "./AiChat";

export function CandidateAiChat() {
  const live = isLiveBackend();
  const [report, setReport] = useState<GrowthReport | null>(live ? null : MOCK_GROWTH_REPORT);

  useEffect(() => {
    if (!live) return;
    v1.growthReport()
      .then(setReport)
      .catch((e: unknown) => {
        if (!(e instanceof V1Error)) return; // network/backend hiccup → honest empty grounding
      });
  }, [live]);

  const config: ChatConfig = useMemo(
    () => ({
      greetingTitle: "What can I help you figure out?",
      greetingSubtitle: report
        ? `Ask about your fit, your gaps, or your next step. ${report.headline} I answer from your real evidence — grounded, never invented, never a score.`
        : "Ask about your fit, your gaps, or your next step. I answer from your real evidence — grounded, never invented, never a score. Take the interview and there's more for me to work with.",
      suggestions: SUGGESTED.map((s) => s.label),
      respond: (text: string) => answer(matchIntent(text), report),
      footerNote: "Grounded in your approved evidence — never a score, never shared without your say-so.",
      badge: live ? null : "Preview · sample evidence",
    }),
    [report, live],
  );

  return <AiChat config={config} />;
}
