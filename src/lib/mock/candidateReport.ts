/**
 * Candidate report adapter — the rich, HR-facing profile behind a feed card.
 * Composes the existing calibrated HCV dimensions (score + confidence +
 * uncertainty + evidence) with headline scores, verified skills, an illustrative
 * GitHub analysis, and interview evidence. All data here is anonymized and
 * illustrative (live: false); wire to the backend later via isLiveBackend().
 */

import type { HcvDimension } from "@/lib/mock/hcv";

export type FeedStatus = "new" | "saved" | "passed" | "intro";

export interface ScoreDial {
  label: "Technical" | "Communication" | "Cultural";
  value: number; // internal evidence-strength signal — NEVER shown as a number
}

/**
 * Evidence bands — the ONLY thing an employer sees. There is no person-score and
 * no blended "hireability" number anywhere in the employer UI. Numeric fields in
 * this sample data are an internal signal, mapped to a band via `bandOf` and
 * never rendered as a number. (Mirrors the backend's banded, no-score report.)
 */
export type EvidenceBand = "supported" | "emerging" | "needs_more_evidence";

export const BAND_META: Record<EvidenceBand, { label: string; fg: string; fill: number }> = {
  supported: { label: "Supported", fg: "#047857", fill: 1.0 },
  emerging: { label: "Emerging", fg: "#B45309", fill: 0.6 },
  needs_more_evidence: { label: "Needs more evidence", fg: "var(--ink-3)", fill: 0.32 },
};

export function bandOf(v: number): EvidenceBand {
  if (v >= 80) return "supported";
  if (v >= 62) return "emerging";
  return "needs_more_evidence";
}

export interface RepoInsight {
  name: string;
  description: string;
  language: string;
  stars: number;
  lastActive: string;
}

export interface GithubInsight {
  connected: boolean;
  handle: string; // anonymized / opt-in
  topLanguages: { name: string; pct: number }[];
  repos: RepoInsight[];
  contributionWeeks: number[]; // 52 weekly intensities, 0–4
  signals: string[]; // derived, e.g. "Consistent weekly commits"
}

export interface QAExchange {
  trait: string;
  question: string;
  answer: string;
}

export interface CandidateReport {
  id: string;
  initials: string;
  targetRole: string;
  about: string; // anonymized one-liner on working style
  location: string;
  experienceLabel: string;
  availableFrom: string;
  freshness: string; // "3 days ago"
  verified: boolean;
  overall: number; // 0–100
  overallConfidence: number; // 0–1
  scores: ScoreDial[]; // Technical / Communication / Cultural
  skills: { name: string; verified: boolean }[];
  dimensions: HcvDimension[];
  github: GithubInsight;
  interview: {
    date: string;
    durationMin: number;
    adaptive: boolean;
    trustScore: number; // 0–100
    anomaly: boolean;
    summary: string;
    exchanges: QAExchange[];
  };
  status: FeedStatus;
}

// Deterministic 52-week contribution intensities so a card is stable across renders.
function weeks(seed: number): number[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: 52 }, () => {
    const r = rnd();
    if (r < 0.22) return 0;
    if (r < 0.5) return 1;
    if (r < 0.74) return 2;
    if (r < 0.9) return 3;
    return 4;
  });
}

const REPORTS: CandidateReport[] = [
  {
    id: "cand-2481",
    initials: "P.R.",
    targetRole: "Applied AI Engineer",
    about: "Builds applied-ML systems that actually ship — reasons from latency and cost budgets to model choices, and measures every change before it reaches users.",
    location: "Bengaluru, India",
    experienceLabel: "6+ years",
    availableFrom: "Immediately",
    freshness: "3 days ago",
    verified: true,
    overall: 89,
    overallConfidence: 0.87,
    scores: [
      { label: "Technical", value: 92 },
      { label: "Communication", value: 88 },
      { label: "Cultural", value: 85 },
    ],
    skills: [
      { name: "PyTorch", verified: true },
      { name: "AWS", verified: true },
      { name: "LLM fine-tuning", verified: true },
      { name: "RAG systems", verified: true },
      { name: "Python", verified: true },
      { name: "Vector DBs", verified: false },
    ],
    dimensions: [
      { id: "technical", label: "Model engineering", score: 92, confidence: 0.9, uncertainty: 0.1, evidence: "Walked through quantizing a 7B model for edge inference — traded 2% accuracy for a 3× latency win, and measured it.", employerVisible: true },
      { id: "problem", label: "Problem decomposition", score: 88, confidence: 0.86, uncertainty: 0.14, evidence: "Broke an ambiguous 'make search better' brief into recall, ranking, and latency sub-problems before writing code.", employerVisible: true },
      { id: "communication", label: "Explaining tradeoffs", score: 88, confidence: 0.89, uncertainty: 0.11, evidence: "Explained why a re-ranker beat a bigger embedding model for their budget, without hand-waving the cost.", employerVisible: true },
      { id: "ownership", label: "Ownership under ambiguity", score: 85, confidence: 0.82, uncertainty: 0.18, evidence: "Set a rollback threshold before shipping a retrieval change so a regression couldn't reach users silently.", employerVisible: true },
      { id: "growth", label: "Learning velocity", score: 83, confidence: 0.78, uncertainty: 0.22, evidence: "Turned a failed eval into a labeled hard-cases set and a weekly regression check.", employerVisible: true },
    ],
    github: {
      connected: true,
      handle: "github.com/•••• (linked)",
      topLanguages: [
        { name: "Python", pct: 68 },
        { name: "Jupyter", pct: 16 },
        { name: "Rust", pct: 9 },
        { name: "TypeScript", pct: 7 },
      ],
      repos: [
        { name: "edge-llm-serve", description: "Quantized 7B inference server with paged KV-cache.", language: "Rust", stars: 214, lastActive: "2 weeks ago" },
        { name: "rag-eval-harness", description: "Reproducible retrieval eval with hard-case mining.", language: "Python", stars: 98, lastActive: "5 days ago" },
        { name: "tiny-finetune", description: "LoRA fine-tuning recipes for small GPUs.", language: "Python", stars: 61, lastActive: "1 month ago" },
      ],
      contributionWeeks: weeks(2481),
      signals: ["Consistent weekly commits (48/52 wks)", "Tests present in 4 of 5 top repos", "3 merged OSS contributions", "Writes descriptive commit messages"],
    },
    interview: {
      date: "Jul 9, 2026",
      durationMin: 31,
      adaptive: true,
      trustScore: 96,
      anomaly: false,
      summary: "Strong applied-ML engineer who reasons from constraints (latency, cost, budget) to model choices, and instruments what they ship. Clear communicator; keeps tradeoffs explicit rather than selling a favourite tool.",
      exchanges: [
        { trait: "Model engineering", question: "How would you cut inference latency without a bigger budget?", answer: "I'd profile first — usually it's the KV-cache or tokenization, not the matmuls. Then quantize to int8, measure the accuracy delta on a held-out set, and only ship if it clears the rollback threshold." },
        { trait: "Explaining tradeoffs", question: "Why a re-ranker over a larger embedding model?", answer: "For their budget the re-ranker gave most of the recall gain at a fraction of the serving cost. A bigger embedder helps, but it taxes every query forever — the re-ranker only fires on the top-k." },
      ],
    },
    status: "new",
  },
  {
    id: "cand-3390",
    initials: "E.L.",
    targetRole: "Forward Deployed Engineer",
    about: "Leads with the customer's real problem, then ships the smallest thing that moves the metric. Exceptional communicator; deep systems work is still growing.",
    location: "Paris, France",
    experienceLabel: "4+ years",
    availableFrom: "In 2 weeks",
    freshness: "17 hours ago",
    verified: true,
    overall: 82,
    overallConfidence: 0.8,
    scores: [
      { label: "Technical", value: 86 },
      { label: "Communication", value: 94 },
      { label: "Cultural", value: 66 },
    ],
    skills: [
      { name: "React", verified: true },
      { name: "Node.js", verified: true },
      { name: "MongoDB", verified: true },
      { name: "Customer discovery", verified: true },
      { name: "TypeScript", verified: true },
      { name: "Kubernetes", verified: false },
    ],
    dimensions: [
      { id: "technical", label: "Full-stack execution", score: 86, confidence: 0.84, uncertainty: 0.16, evidence: "Shipped a customer integration end-to-end in a week, then hardened it once real traffic exposed the edge cases.", employerVisible: true },
      { id: "communication", label: "Stakeholder communication", score: 94, confidence: 0.92, uncertainty: 0.08, evidence: "Reframed a customer's vague ask into three concrete deliverables and got sign-off before building.", employerVisible: true },
      { id: "customer", label: "Customer empathy", score: 90, confidence: 0.88, uncertainty: 0.12, evidence: "Sat with the end users, found the real blocker was onboarding, not the feature they asked for.", employerVisible: true },
      { id: "ownership", label: "Bias to ship", score: 80, confidence: 0.79, uncertainty: 0.21, evidence: "Chose a boring, reliable queue over a clever one so the deploy could go out on the customer's timeline.", employerVisible: true },
      { id: "depth", label: "Systems depth", score: 66, confidence: 0.68, uncertainty: 0.32, evidence: "One example so far on distributed failure modes — worth exploring in the intro.", employerVisible: true },
    ],
    github: {
      connected: true,
      handle: "github.com/•••• (linked)",
      topLanguages: [
        { name: "TypeScript", pct: 54 },
        { name: "JavaScript", pct: 26 },
        { name: "Go", pct: 12 },
        { name: "Shell", pct: 8 },
      ],
      repos: [
        { name: "deploy-kit", description: "One-command customer deploy templates.", language: "TypeScript", stars: 132, lastActive: "3 days ago" },
        { name: "mongo-migrate", description: "Zero-downtime MongoDB schema migrations.", language: "Go", stars: 74, lastActive: "2 weeks ago" },
        { name: "onboarding-flows", description: "Reusable React onboarding components.", language: "TypeScript", stars: 40, lastActive: "1 month ago" },
      ],
      contributionWeeks: weeks(3390),
      signals: ["Consistent weekly commits (41/52 wks)", "Ships customer-facing docs with code", "Fast PR review turnaround", "Fewer tests in infra repos — worth probing"],
    },
    interview: {
      date: "Jul 12, 2026",
      durationMin: 28,
      adaptive: true,
      trustScore: 93,
      anomaly: false,
      summary: "Exceptional communicator who leads with the customer's problem and ships pragmatically. Full-stack execution is solid; deep distributed-systems experience is still light — a fair thing to explore in the intro, not a reason to pass.",
      exchanges: [
        { trait: "Stakeholder communication", question: "A customer asks for a feature you think is wrong. What do you do?", answer: "I ask what outcome they're chasing. Usually the feature is a guess at a fix. I'll show them the data on where users actually drop off, then propose the smallest change that moves that number." },
        { trait: "Systems depth", question: "How do you handle a partial outage mid-deploy?", answer: "Honestly, I've mostly relied on managed queues and health checks rather than building the failover myself — I'd want a teammate strong on that to pair with early." },
      ],
    },
    status: "new",
  },
  {
    id: "cand-5127",
    initials: "D.T.",
    targetRole: "Solutions Engineer / AI",
    about: "A reliable data engineer focused on correctness and operability, not just throughput. Precise and thorough — if a little dense for non-technical rooms.",
    location: "Berlin, Germany",
    experienceLabel: "5+ years",
    availableFrom: "In 1 month",
    freshness: "1 day ago",
    verified: true,
    overall: 79,
    overallConfidence: 0.77,
    scores: [
      { label: "Technical", value: 81 },
      { label: "Communication", value: 72 },
      { label: "Cultural", value: 78 },
    ],
    skills: [
      { name: "Apache Spark", verified: true },
      { name: "MySQL", verified: true },
      { name: "Data pipelines", verified: true },
      { name: "Airflow", verified: false },
    ],
    dimensions: [
      { id: "technical", label: "Data engineering", score: 84, confidence: 0.82, uncertainty: 0.18, evidence: "Rebuilt a nightly batch as an incremental pipeline, cutting runtime from 6h to 40m with backfill safety.", employerVisible: true },
      { id: "problem", label: "Root-cause analysis", score: 82, confidence: 0.8, uncertainty: 0.2, evidence: "Traced a data-quality bug to a timezone cast three joins upstream, then added a contract test.", employerVisible: true },
      { id: "communication", label: "Written clarity", score: 74, confidence: 0.72, uncertainty: 0.28, evidence: "Explanations were correct but dense — needed a prompt to translate for a non-technical stakeholder.", employerVisible: true },
      { id: "ownership", label: "Reliability mindset", score: 80, confidence: 0.78, uncertainty: 0.22, evidence: "Added alerting and a runbook before calling the migration done.", employerVisible: true },
    ],
    github: {
      connected: true,
      handle: "github.com/•••• (linked)",
      topLanguages: [
        { name: "Python", pct: 47 },
        { name: "Scala", pct: 31 },
        { name: "SQL", pct: 15 },
        { name: "Shell", pct: 7 },
      ],
      repos: [
        { name: "spark-incremental", description: "Incremental batch framework on Spark.", language: "Scala", stars: 57, lastActive: "3 weeks ago" },
        { name: "dq-contracts", description: "Lightweight data-quality contract tests.", language: "Python", stars: 33, lastActive: "1 month ago" },
      ],
      contributionWeeks: weeks(5127),
      signals: ["Steady commits (38/52 wks)", "Strong test coverage on data code", "Detailed READMEs", "Little public front-end work"],
    },
    interview: {
      date: "Jul 11, 2026",
      durationMin: 33,
      adaptive: true,
      trustScore: 91,
      anomaly: false,
      summary: "Reliable data engineer who thinks about correctness and operability, not just throughput. Communication is accurate but can be dense for non-technical audiences — coachable with structure.",
      exchanges: [
        { trait: "Data engineering", question: "How did you cut a 6-hour batch job down?", answer: "It was reprocessing everything nightly. I switched to incremental with watermarking, kept a safe backfill path, and validated row counts against the old job for a week before cutting over." },
      ],
    },
    status: "new",
  },
  {
    id: "cand-6644",
    initials: "H.A.",
    targetRole: "Deployment Strategist",
    about: "An early-career team multiplier who documents, facilitates, and lifts the people around them. Infra depth is still building; the trajectory is steep.",
    location: "Singapore",
    experienceLabel: "2+ years",
    availableFrom: "Immediately",
    freshness: "4 days ago",
    verified: true,
    overall: 76,
    overallConfidence: 0.74,
    scores: [
      { label: "Technical", value: 74 },
      { label: "Communication", value: 82 },
      { label: "Cultural", value: 88 },
    ],
    skills: [
      { name: "Linux", verified: true },
      { name: "Python", verified: true },
      { name: "Terraform", verified: true },
      { name: "Docker", verified: false },
    ],
    dimensions: [
      { id: "technical", label: "Infra fundamentals", score: 74, confidence: 0.72, uncertainty: 0.28, evidence: "Codified a staging environment in Terraform after doing it by hand once and hating the drift.", employerVisible: true },
      { id: "communication", label: "Facilitation", score: 82, confidence: 0.8, uncertainty: 0.2, evidence: "Ran a blameless post-incident review and turned it into three concrete follow-ups.", employerVisible: true },
      { id: "culture", label: "Team lift", score: 88, confidence: 0.85, uncertainty: 0.15, evidence: "Documented the deploy runbook so on-call stopped depending on one person.", employerVisible: true },
      { id: "growth", label: "Learning velocity", score: 84, confidence: 0.8, uncertainty: 0.2, evidence: "Went from zero Terraform to shipping modules in a quarter, and taught it back to the team.", employerVisible: true },
    ],
    github: {
      connected: true,
      handle: "github.com/•••• (linked)",
      topLanguages: [
        { name: "HCL", pct: 44 },
        { name: "Python", pct: 33 },
        { name: "Shell", pct: 18 },
        { name: "Dockerfile", pct: 5 },
      ],
      repos: [
        { name: "tf-staging", description: "Reusable Terraform staging modules.", language: "HCL", stars: 29, lastActive: "1 week ago" },
        { name: "deploy-runbooks", description: "Runbooks + scripts for safe releases.", language: "Shell", stars: 18, lastActive: "3 weeks ago" },
      ],
      contributionWeeks: weeks(6644),
      signals: ["Growing commit cadence (early-career)", "Documents everything", "Fewer large projects yet — high trajectory"],
    },
    interview: {
      date: "Jul 8, 2026",
      durationMin: 26,
      adaptive: true,
      trustScore: 94,
      anomaly: false,
      summary: "Early-career but a genuine team multiplier — documents, facilitates, and lifts the people around them. Infra depth is still building; the trajectory and ownership instincts are strong.",
      exchanges: [
        { trait: "Team lift", question: "Tell me about a time you made your team better, not just the code.", answer: "On-call always fell to one senior. I wrote the deploy runbook with them, we did a dry run as a group, and after that three of us could take the pager. It wasn't glamorous but it fixed the bus-factor." },
      ],
    },
    status: "new",
  },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listCandidateReports(): Promise<CandidateReport[]> {
  await wait(350);
  return REPORTS;
}

export async function getCandidateReport(id: string): Promise<CandidateReport | null> {
  await wait(300);
  return REPORTS.find((r) => r.id === id) ?? null;
}
