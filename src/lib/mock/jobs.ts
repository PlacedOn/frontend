/**
 * Data adapter for the candidate-facing job board. Illustrative pool today;
 * swaps to the live backend (v1 jobs / openings) when NEXT_PUBLIC_API_BASE_URL
 * is configured. The UI imports only these functions, so wiring the backend
 * changes nothing in the components.
 *
 * A JobListing is richer than the legacy OpenRole: it carries the employer's
 * Role-DNA success signals (what the AI interview will explore) and a Reality
 * Card, so "apply → role-tailored interview" can render the whole story.
 *
 * `readiness`/`coveredSignals` is requirement COVERAGE from a candidate's prior
 * evidence — never selection odds, never a score.
 */

import type { SignalKind, WorkMode, WorkType } from "@/lib/v1";
import { v1, type OpenJob } from "@/lib/v1";
import { isLiveBackend } from "@/lib/api";

export interface JobSignal {
  kind: SignalKind;
  signal: string;
  evidence: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string; // archetype until a consented intro — never real identity up front
  roleFamily: string; // seeds v1.createInterview({ role_family })
  workType: WorkType;
  workMode: WorkMode;
  level: string;
  location: string;
  compRange: string;
  skills: string[];
  summary: string; // the business problem — "what you'll actually do"
  outcome: string; // first-90-day outcome
  signals: JobSignal[]; // Role-DNA success signals → interview probes
  reality: { teamContext: string; process: string; responseSla: string };
  /** Coverage of THIS role from the candidate's existing interview evidence. */
  coveredSignals: number;
  fresh?: boolean;
}

const LISTINGS: readonly JobListing[] = [
  {
    id: "op-1",
    title: "Backend Engineer",
    company: "A Series-B fintech",
    roleFamily: "backend_engineer",
    workType: "full_time",
    workMode: "hybrid",
    level: "Mid–Senior",
    location: "Bengaluru · Hybrid",
    compRange: "₹28–42 LPA",
    skills: ["Backend systems", "API design", "Production debugging"],
    summary:
      "Payments ledger is buckling under reconciliation load. You'll own the services that keep money movement correct and observable at 10× volume.",
    outcome: "Ship a reconciliation path that survives a 10× spike without manual intervention.",
    signals: [
      { kind: "success_signal", signal: "Debugs production failures from first principles", evidence: "Walks through an incident they isolated and fixed" },
      { kind: "success_signal", signal: "Designs APIs that hold up under change", evidence: "Explains a versioning / contract decision they made" },
      { kind: "must_have", signal: "Owns correctness under concurrency", evidence: "Describes a race / consistency bug they reasoned through" },
      { kind: "nice_to_have", signal: "Operates what they build", evidence: "Has run something they shipped in prod" },
    ],
    reality: { teamContext: "6-eng platform pod, no on-call for first 3 months", process: "Interview → evidence review → one human conversation", responseSla: "Replies within 3 business days" },
    coveredSignals: 3,
    fresh: true,
  },
  {
    id: "op-2",
    title: "Platform Engineer",
    company: "A platform-tooling startup",
    roleFamily: "platform_engineer",
    workType: "contract",
    workMode: "remote",
    level: "Senior",
    location: "Remote · India",
    compRange: "₹18–24 k / day",
    skills: ["System design", "IaC / Terraform", "Observability"],
    summary:
      "Internal developer platform is a pile of scripts. You'll turn it into paved roads other engineers actually want to use.",
    outcome: "A self-serve environment provisioning flow teams adopt without hand-holding.",
    signals: [
      { kind: "success_signal", signal: "Designs for the engineers who'll use it", evidence: "Describes a tool they built that others adopted" },
      { kind: "success_signal", signal: "Reasons about failure modes up front", evidence: "Talks through what they made observable and why" },
      { kind: "must_have", signal: "Infrastructure as code depth", evidence: "A non-trivial Terraform / IaC decision" },
    ],
    reality: { teamContext: "Embedded with 3 product teams", process: "Interview → evidence review → paid trial task", responseSla: "Replies within 2 business days" },
    coveredSignals: 2,
  },
  {
    id: "op-4",
    title: "Frontend Engineer",
    company: "A D2C commerce brand",
    roleFamily: "frontend_engineer",
    workType: "full_time",
    workMode: "remote",
    level: "Mid",
    location: "Remote · India",
    compRange: "₹18–28 LPA",
    skills: ["Frontend execution", "React", "Product sense"],
    summary:
      "Storefront conversion dies on slow, janky pages. You'll own the experience layer where performance is revenue.",
    outcome: "Cut largest-contentful-paint below 2s on the top three revenue pages.",
    signals: [
      { kind: "success_signal", signal: "Ships with a performance budget in mind", evidence: "A concrete perf trade-off they made" },
      { kind: "success_signal", signal: "Has real product sense", evidence: "A time they changed the spec because of the user" },
      { kind: "nice_to_have", signal: "Cares about the empty / error states", evidence: "An edge case they caught before users did" },
    ],
    reality: { teamContext: "Small product+design+eng trio", process: "Interview → evidence review → portfolio chat", responseSla: "Replies within 3 business days" },
    coveredSignals: 1,
  },
  {
    id: "op-5",
    title: "Data Engineer",
    company: "A health-tech company",
    roleFamily: "data_engineer",
    workType: "full_time",
    workMode: "hybrid",
    level: "Mid–Senior",
    location: "Hyderabad · Hybrid",
    compRange: "₹24–36 LPA",
    skills: ["Data pipelines", "SQL", "Airflow"],
    summary:
      "Clinical data arrives late and dirty. You'll build the pipelines the whole analytics org depends on.",
    outcome: "A trusted daily pipeline analysts stop working around.",
    signals: [
      { kind: "success_signal", signal: "Builds pipelines that stay trustworthy", evidence: "How they handle late / malformed data" },
      { kind: "success_signal", signal: "Models data for the questions asked of it", evidence: "A schema decision they'd defend" },
      { kind: "must_have", signal: "SQL fluency under real constraints", evidence: "A query they had to make correct AND fast" },
      { kind: "nice_to_have", signal: "Streaming exposure", evidence: "Any Kafka / streaming context" },
    ],
    reality: { teamContext: "Data platform team of 5", process: "Interview → evidence review → team conversation", responseSla: "Replies within 4 business days" },
    coveredSignals: 2,
    fresh: true,
  },
  {
    id: "op-6",
    title: "Full-stack Engineer",
    company: "An early-stage AI startup",
    roleFamily: "fullstack_engineer",
    workType: "full_time",
    workMode: "remote",
    level: "Mid–Senior",
    location: "Remote",
    compRange: "₹22–34 LPA + equity",
    skills: ["Backend systems", "Frontend execution", "API design"],
    summary:
      "Zero-to-one product surface. You'll own features end to end, from schema to pixel, and change your mind fast.",
    outcome: "Own and ship a whole feature that a design partner uses in week one.",
    signals: [
      { kind: "success_signal", signal: "Ships end to end without hand-offs", evidence: "A feature they carried from idea to prod" },
      { kind: "success_signal", signal: "Makes good calls under ambiguity", evidence: "A decision made with half the information" },
      { kind: "must_have", signal: "Comfort across the stack", evidence: "Both a backend and a frontend decision" },
    ],
    reality: { teamContext: "4-person founding eng team", process: "Interview → evidence review → founder chat", responseSla: "Replies within 2 business days" },
    coveredSignals: 3,
  },
  {
    id: "op-7",
    title: "Applied AI Engineer",
    company: "A global capability centre",
    roleFamily: "applied_ai_engineer",
    workType: "full_time",
    workMode: "hybrid",
    level: "Mid",
    location: "Bengaluru · Hybrid",
    compRange: "₹26–40 LPA",
    skills: ["Python", "Evaluation", "ML foundations"],
    summary:
      "Models look great in notebooks and fall over in prod. You'll own the eval + serving path that makes them dependable.",
    outcome: "An evaluation harness the team trusts before anything ships.",
    signals: [
      { kind: "success_signal", signal: "Evaluates before believing", evidence: "How they'd measure a model actually works" },
      { kind: "success_signal", signal: "Bridges research and production", evidence: "A time they made a model reliable in prod" },
      { kind: "must_have", signal: "Python fluency", evidence: "A non-trivial thing they built in Python" },
    ],
    reality: { teamContext: "Applied ML pod inside a larger org", process: "Interview → evidence review → technical conversation", responseSla: "Replies within 5 business days" },
    coveredSignals: 1,
  },
];

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Map a backend OpenJob to the richer UI JobListing. Company identity stays an
 *  archetype (hidden until a consented intro); work_type isn't modeled server
 *  side, so it defaults to full_time. */
function mapOpenJob(j: OpenJob): JobListing {
  const roleFamily =
    j.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "general";
  return {
    id: j.id,
    title: j.title,
    company: "A hiring team",
    roleFamily,
    workType: "full_time",
    workMode: (j.work_mode ?? "remote") as WorkMode,
    level: j.level ?? "—",
    location: j.location ?? "Remote",
    compRange: j.compensation_range ?? "—",
    skills: j.signals.slice(0, 3),
    summary: j.business_problem ?? "",
    outcome: j.first_90_day_outcome ?? "",
    signals: j.signals.map((s) => ({ kind: "success_signal" as SignalKind, signal: s, evidence: "" })),
    reality: { teamContext: j.team_context ?? "", process: "", responseSla: j.response_sla ?? "" },
    coveredSignals: 0,
  };
}

/** Returns the browsable job board (live backend or illustrative pool). */
export async function getJobListings(): Promise<JobListing[]> {
  if (isLiveBackend()) {
    try {
      const rows = await v1.listOpenJobs();
      if (rows.length) return rows.map(mapOpenJob);
    } catch {
      // fall through to the illustrative pool so the board is never empty
    }
  }
  await delay(320);
  return LISTINGS.map((l) => ({ ...l }));
}

/** Returns one listing by id, or null. Candidates can't read a single job via
 *  RLS, so live detail is resolved from the open-jobs feed. */
export async function getJobListing(id: string): Promise<JobListing | null> {
  if (isLiveBackend()) {
    try {
      const rows = await v1.listOpenJobs();
      const hit = rows.find((r) => r.id === id);
      if (hit) return mapOpenJob(hit);
    } catch {
      // fall through to the illustrative pool
    }
  }
  await delay(220);
  const found = LISTINGS.find((l) => l.id === id);
  return found ? { ...found } : null;
}
