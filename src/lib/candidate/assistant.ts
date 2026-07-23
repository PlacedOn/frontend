import type { GrowthReport } from "@/lib/v1";

/**
 * The candidate assistant's answer engine. Every reply is built directly from the
 * candidate's own GrowthReport — role coverage, gaps, roadmap, edges — so it can
 * guide without hallucinating. It never invents a fit, never states odds, and
 * says plainly when there's no evidence yet. This is the honest, grounded core;
 * a free-text LLM can be layered on later behind the same intents.
 */

export type Intent = "fit" | "gaps" | "next" | "strengths" | "help";

export type AnswerItem = { label: string; sub?: string; meta?: string };
export type AssistantAnswer = { text: string; items?: AnswerItem[]; note?: string };

export const SUGGESTED: { intent: Intent; label: string }[] = [
  { intent: "fit", label: "Which roles fit my evidence?" },
  { intent: "gaps", label: "What's my top gap?" },
  { intent: "next", label: "What's my next step?" },
  { intent: "strengths", label: "What are my strengths?" },
];

/** Map free text to an intent by keyword — a deterministic stand-in until a real
 *  language model is wired behind these same grounded answers. */
export function matchIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/(gap|improve|weak|missing|close|lack|behind)/.test(t)) return "gaps";
  if (/(next|step|do now|start|first|should i)/.test(t)) return "next";
  if (/(strength|strong|edge|good at|best|advantage)/.test(t)) return "strengths";
  if (/(fit|role|job|match|suit|which|where)/.test(t)) return "fit";
  return "help";
}

const HELP: AssistantAnswer = {
  text:
    "I can help you make sense of your own evidence. Ask me which roles fit you, what your biggest gap is, what to do next, or what you're already strong at.",
};

function noEvidence(): AssistantAnswer {
  return {
    text:
      "You haven't built any evidence yet — so I won't guess. Take the interview (or add work on your Workshop) and I'll show exactly which roles your work covers and what to do next.",
    note: "Nothing here is invented — it's grounded in your real evidence, and there isn't any yet.",
  };
}

export function answer(intent: Intent, report: GrowthReport | null): AssistantAnswer {
  if (intent === "help") return HELP;
  if (!report) return noEvidence();

  switch (intent) {
    case "fit": {
      const fits = report.role_fits.slice(0, 3);
      if (fits.length === 0) return noEvidence();
      return {
        text: `${report.headline} These are ranked by how much of each role's public requirements your evidence covers — not your odds of being hired.`,
        items: fits.map((f) => ({
          label: f.role_title,
          meta: `${f.readiness_pct}% covered`,
          sub: `${f.covered.length} requirement${f.covered.length === 1 ? "" : "s"} evidenced · ${f.gaps.length} to close`,
        })),
        note: "Coverage of role requirements — never a prediction, an offer, or a judgment of you.",
      };
    }
    case "gaps": {
      const gaps = report.gaps.slice(0, 2);
      if (gaps.length === 0)
        return { text: "No clear gaps stand out right now — your evidence covers the roles you're aimed at. Keep adding proof to widen your options." };
      return {
        text: "The clearest things to close next — each is a specific piece of evidence to build, not a mark against you:",
        items: gaps.map((g) => ({
          label: g.skill_label,
          sub: `${g.next_evidence}${g.build_actions[0] ? ` — e.g. ${g.build_actions[0]}` : ""}`,
        })),
        note: "A gap is a next step, never a hidden negative trait.",
      };
    }
    case "next": {
      const phase = [...report.roadmap].sort((a, b) => a.order - b.order)[0];
      if (!phase) return { text: "You're in good shape — the best next move is to put your evidence in front of the roles that fit. Head to Matches." };
      return {
        text: `Your next move — ${phase.horizon}: ${phase.title}.`,
        items: [
          { label: phase.focus, sub: phase.steps[0]?.title ? `Start with: ${phase.steps[0].title}` : undefined },
          ...(phase.targets.length ? [{ label: "Unlocks", sub: phase.targets.join(", ") }] : []),
        ],
      };
    }
    case "strengths": {
      const edges = report.edges.slice(0, 3);
      if (edges.length === 0) return noEvidence();
      return {
        text: "What you've already shown strongly — in your own words:",
        items: edges.map((e) => ({
          label: e.skill_label,
          sub: e.quote ? `"${e.quote}"` : e.note,
        })),
      };
    }
    default:
      return HELP;
  }
}
