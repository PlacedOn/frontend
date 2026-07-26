/**
 * Hiring-side assistant engine. Turns a recruiter's free-text question into a
 * grounded answer over the evidence-backed candidate pool — reusing
 * localCopilotSearch, so the fairness firewall (refuse protected-class asks,
 * strip pedigree/prestige) runs on every question for free.
 *
 * Same contract as the candidate engine: (text) → AssistantAnswer. Deterministic
 * today; swaps to a grounded LLM behind this seam. Never invents a candidate,
 * never emits a person-score — only evidenced signals, quotes, and fit %.
 */

import type { AssistantAnswer, AnswerItem } from "@/lib/candidate/assistant";
import { localCopilotSearch, type HrMatch } from "@/lib/employer/copilotLocal";

export type EmployerIntent = "find" | "shortlist" | "gaps" | "help";

export const SUGGESTED_EMPLOYER: { intent: EmployerIntent; label: string }[] = [
  { intent: "find", label: "Find backend engineers who've owned incidents" },
  { intent: "shortlist", label: "Who's ready to intro this week?" },
  { intent: "gaps", label: "What signals are my matches missing?" },
  { intent: "find", label: "Can I filter for IIT grads?" },
];

export function matchEmployerIntent(text: string): EmployerIntent {
  const t = text.toLowerCase();
  if (/\b(intro|ready|shortlist|worth|this week|reach out)\b/.test(t)) return "shortlist";
  if (/\b(missing|gap|gaps|lacking|weak|thin|short on)\b/.test(t)) return "gaps";
  if (/\b(help|what can (i|you)|how do i|can you)\b/.test(t) && !/\bfind|filter|search\b/.test(t))
    return "help";
  return "find";
}

const HELP: AssistantAnswer = {
  text: "Ask me to find people by the work they've evidenced — skills, behaviours, real situations. I rank on evidence only, so I'll never surface a résumé, a school, or a person-score. Try one of the prompts, or describe the role in your own words.",
  items: [
    { label: "Find", sub: "“Backend engineers who've owned incidents and can start soon.”" },
    { label: "Shortlist", sub: "“Who's intro-ready with strong, supported evidence?”" },
    { label: "Gaps", sub: "“What signals are thin across my strongest matches?”" },
  ],
  note: "I match on evidenced work, never on identity or pedigree — that firewall is always on.",
};

/** Compact one candidate match into a chat evidence item. */
function toItem(m: HrMatch): AnswerItem {
  const { candidate } = m;
  const bandWord =
    candidate.band === "supported" ? "Supported" : candidate.band === "emerging" ? "Emerging" : "Light";
  const covered = m.matched.length ? `Evidences ${m.matched.slice(0, 3).join(", ")}.` : "";
  return {
    label: `${candidate.role} · ${candidate.location}`,
    meta: `${m.score}%`,
    sub: `${bandWord} evidence · ${candidate.availableFrom}. ${covered} “${candidate.quote}”`.trim(),
  };
}

/** Note lines shared across answers — surfaces what the firewall stripped. */
function firewallNote(stripped: string[]): string {
  if (stripped.length > 0) {
    return `I ignored ${stripped.map((s) => `“${s}”`).join(", ")} — Placedon matches on evidenced work, never pedigree.`;
  }
  return "Ranked on evidenced work only — no résumés, no pedigree, no person-score.";
}

export function answerEmployer(text: string, intent: EmployerIntent): AssistantAnswer {
  if (intent === "help") return HELP;

  const res = localCopilotSearch(text, []);

  // Fairness firewall tripped — surface the refusal, don't search.
  if (res.refused) {
    return {
      text: res.refused,
      note: "Ask about evidenced work instead — the skills, behaviours, and situations the role needs.",
    };
  }

  const ranked = res.matches;
  if (ranked.length === 0) {
    return {
      text: "I couldn't find anyone in the pool whose evidence matches that yet. Try describing the work in terms of skills or real situations — for example, “debugged a production incident” rather than a title.",
      note: firewallNote(res.stripped),
    };
  }

  if (intent === "shortlist") {
    const introReady = ranked.filter((m) => m.candidate.band === "supported").slice(0, 3);
    const picks = introReady.length ? introReady : ranked.slice(0, 2);
    return {
      text: introReady.length
        ? `${picks.length} ${picks.length === 1 ? "person is" : "people are"} intro-ready — strong, supported evidence against that ask. You'd reach out; they consent before anything is shared.`
        : "No one clears the intro-ready bar (supported evidence) for that ask yet, but these are the closest — worth a look before you reach out.",
      items: picks.map(toItem),
      note: firewallNote(res.stripped),
    };
  }

  if (intent === "gaps") {
    // Aggregate the signals the strongest matches don't yet evidence.
    const top = ranked.slice(0, 4);
    const counts = new Map<string, number>();
    for (const m of top) for (const sig of m.missing) counts.set(sig, (counts.get(sig) ?? 0) + 1);
    const gaps = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (gaps.length === 0) {
      return {
        text: "Your strongest matches already evidence everything that ask asked for — no meaningful gaps. If you widen the criteria I'll re-check.",
        note: firewallNote(res.stripped),
      };
    }
    return {
      text: "Across your strongest matches, these are the signals that show up thin — worth probing directly in the interview rather than assuming:",
      items: gaps.map(([sig, n]) => ({
        label: sig,
        meta: `${n}/${top.length}`,
        sub: `${n} of the top ${top.length} matches don't yet evidence this.`,
      })),
      note: firewallNote(res.stripped),
    };
  }

  // find (default)
  const picks = ranked.slice(0, 3);
  return {
    text: `Here ${picks.length === 1 ? "is the" : `are the ${picks.length}`} strongest evidence-backed ${picks.length === 1 ? "match" : "matches"} for that. Each fit % is coverage of what you asked for — not a rating of the person.`,
    items: picks.map(toItem),
    note: firewallNote(res.stripped),
  };
}
