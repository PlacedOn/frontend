"use client";

/**
 * Hiring side of the core assistant. Drives <AiChat/> with the employer engine,
 * grounded in the evidence-backed candidate pool. The fairness firewall runs
 * inside every answer (refuse protected-class asks, strip pedigree), so the
 * surface can't be turned into a filter on identity.
 */

import { useMemo } from "react";
import { AiChat, type ChatConfig } from "./AiChat";
import { answerEmployer, matchEmployerIntent, SUGGESTED_EMPLOYER } from "@/lib/employer/assistant";

export function EmployerAiChat() {
  const config: ChatConfig = useMemo(
    () => ({
      greetingTitle: "Who are you looking for?",
      greetingSubtitle:
        "Describe the work — skills, behaviours, real situations — and I'll surface evidence-backed people from your pool. I rank on evidenced work only: never a résumé, a school, or a person-score.",
      suggestions: SUGGESTED_EMPLOYER.map((s) => s.label),
      respond: (text: string) => answerEmployer(text, matchEmployerIntent(text)),
      footerNote: "Evidence-backed matching behind a fairness firewall — identity and pedigree never filter.",
      badge: "Demo · sample candidate pool",
    }),
    [],
  );

  return <AiChat config={config} />;
}
