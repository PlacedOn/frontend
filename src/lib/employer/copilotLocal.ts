import type { Band } from "@/lib/v1";

/**
 * Local HR-Copilot ranking. Real, functional search over an evidence-backed
 * candidate pool so the surface works today; when the backend is live the
 * component calls v1.copilotSearch instead and this becomes the offline path.
 *
 * The fairness firewall runs here too: protected-class asks are refused, and
 * pedigree/prestige terms are stripped before anything is matched — the same
 * posture as the server-side firewall, enforced client-side so a disconnected
 * demo can never quietly filter on identity.
 */

export interface HrCandidate {
  id: string;
  role: string;
  location: string;
  availableFrom: string;
  band: Band; // overall evidence strength
  signals: string[]; // skills/behaviours they have evidenced
  quote: string; // one transcript-grounded line
}

export interface HrMatch {
  candidate: HrCandidate;
  score: number; // 0–100 fit vs requested skills + prompt
  matched: string[]; // requested skills this candidate evidences
  missing: string[]; // requested skills they don't yet evidence
}

export interface HrSearchResult {
  refused: string | null; // fairness refusal reason, if any
  stripped: string[]; // pedigree/prestige terms removed from the ask
  matches: HrMatch[];
}

// Suggested skills for the tag-selector — the vocabulary HR actually reaches for.
export const SUGGESTED_SKILLS: readonly string[] = [
  "Backend systems",
  "Frontend execution",
  "Production debugging",
  "System design",
  "Data pipelines",
  "API design",
  "Incident response",
  "Stakeholder communication",
  "Product sense",
  "Code review depth",
  "Mentoring",
  "Ownership under pressure",
];

// Protected-class asks → refuse the whole search (never silently filter).
const PROTECTED = [
  "male", "female", "man", "woman", "gender",
  "caste", "religion", "hindu", "muslim", "christian",
  "young", "old", "age", "married", "unmarried", "pregnant",
  "race", "ethnic", "nationality", "disabled",
];

// Pedigree/prestige → strip the term, keep searching on the real work.
const PEDIGREE = [
  "iit", "iim", "nit", "bits", "stanford", "mit", "ivy",
  "tier-1", "tier 1", "top college", "top university", "elite", "prestigious",
  "faang", "big tech", "brand name",
];

const CANDIDATE_POOL: readonly HrCandidate[] = [
  {
    id: "cand-2481",
    role: "Backend engineer",
    location: "Bengaluru · Hybrid",
    availableFrom: "Immediately",
    band: "supported",
    signals: ["Backend systems", "Production debugging", "System design", "Incident response", "Code review depth"],
    quote: "I'd cache the read path and measure before touching the write side — a rollback I can't reason about is worse than the bug.",
  },
  {
    id: "cand-3390",
    role: "Frontend engineer",
    location: "Pune · Remote",
    availableFrom: "In 2 weeks",
    band: "emerging",
    signals: ["Frontend execution", "API design", "Product sense", "Ownership under pressure"],
    quote: "I shipped the flag behind a kill-switch first, watched the error rate for a day, then ramped it — no hero deploys.",
  },
  {
    id: "cand-5127",
    role: "Data engineer",
    location: "Hyderabad · Hybrid",
    availableFrom: "In 30 days",
    band: "supported",
    signals: ["Data pipelines", "Backend systems", "System design", "Incident response"],
    quote: "The pipeline was silently dropping rows on retry — I added idempotency keys and a dead-letter queue before adding features.",
  },
  {
    id: "cand-6604",
    role: "Full-stack engineer",
    location: "Remote · India",
    availableFrom: "Immediately",
    band: "emerging",
    signals: ["Frontend execution", "Backend systems", "API design", "Mentoring", "Stakeholder communication"],
    quote: "I paired with the newer dev instead of just fixing it — we both understood the race condition by the end.",
  },
  {
    id: "cand-7712",
    role: "Platform / DevOps engineer",
    location: "Bengaluru · On-site",
    availableFrom: "In 3 weeks",
    band: "supported",
    signals: ["Incident response", "System design", "Production debugging", "Ownership under pressure"],
    quote: "During the outage I froze deploys first, then bisected — restoring service beat finding root cause in that moment.",
  },
  {
    id: "cand-8890",
    role: "Product-minded engineer",
    location: "Delhi NCR · Hybrid",
    availableFrom: "In 2 weeks",
    band: "emerging",
    signals: ["Product sense", "Frontend execution", "Stakeholder communication", "API design"],
    quote: "I pushed back on the ticket — the real problem was the empty state, not the button, so we fixed that instead.",
  },
];

const norm = (s: string) => s.toLowerCase().trim();

/** Split a free-text prompt into meaningful keywords (drop stopwords + short tokens). */
function keywords(prompt: string): string[] {
  const stop = new Set(["the", "and", "for", "who", "can", "with", "that", "are", "was", "has", "our", "you", "need", "someone", "a", "an", "to", "in", "of", "on"]);
  return norm(prompt)
    .replace(/[^a-z0-9\s+-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

/** How well a candidate's signals cover a requested skill (fuzzy substring both ways). */
function covers(signals: string[], skill: string): boolean {
  const s = norm(skill);
  return signals.some((sig) => {
    const n = norm(sig);
    return n === s || n.includes(s) || s.includes(n);
  });
}

export function localCopilotSearch(prompt: string, tags: string[]): HrSearchResult {
  const hay = norm(prompt);

  // Fairness firewall — refuse protected-class asks outright.
  const hitProtected = PROTECTED.find((p) => new RegExp(`\\b${p}\\b`).test(hay) || tags.some((t) => norm(t).includes(p)));
  if (hitProtected) {
    return {
      refused: `PlacedOn won't filter on “${hitProtected}.” We match on evidenced work, never on identity or protected characteristics.`,
      stripped: [],
      matches: [],
    };
  }

  // Strip pedigree/prestige terms from the ask (keep them visible as removed).
  const stripped = PEDIGREE.filter((p) => hay.includes(p) || tags.some((t) => norm(t).includes(p)));

  // Requested skills = explicit tags + prompt keywords that look like our
  // vocabulary. Word-boundary match so "production" never counts as "product".
  const promptSkills = SUGGESTED_SKILLS.filter((sk) => {
    const words = norm(sk).split(/\s+/).filter((w) => w.length > 3);
    return words.some((w) => new RegExp(`\\b${w}\\b`).test(hay));
  });
  const requested = Array.from(new Set([...tags, ...promptSkills].map((t) => t.trim()).filter(Boolean)));
  const kws = keywords(prompt).filter((k) => !stripped.includes(k));

  const matches: HrMatch[] = CANDIDATE_POOL.map((candidate) => {
    const matched = requested.filter((r) => covers(candidate.signals, r));
    const missing = requested.filter((r) => !covers(candidate.signals, r));

    // Base: fraction of requested skills covered. Bonus: prompt keywords that
    // appear in the candidate's signals or role. Evidence band nudges ties.
    const coverage = requested.length ? matched.length / requested.length : 0;
    const kwHits = kws.filter((k) => covers([...candidate.signals, candidate.role], k)).length;
    const kwBonus = kws.length ? (kwHits / kws.length) * 0.35 : 0;
    const bandBonus = candidate.band === "supported" ? 0.12 : candidate.band === "emerging" ? 0.04 : 0;

    const raw = requested.length || kws.length ? coverage * 0.6 + kwBonus + bandBonus : 0.4 + bandBonus;
    return { candidate, matched, missing, score: Math.round(Math.min(1, raw) * 100) };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  return { refused: null, stripped, matches };
}
