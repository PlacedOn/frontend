/**
 * Typed client for the product /v1 API (FastAPI backend, RLS-scoped).
 * Every call attaches the Supabase JWT so the backend enforces org isolation.
 * Mirrors backend/app/jobs.py schemas. Base URL is NEXT_PUBLIC_API_BASE_URL;
 * when it points at localhost/unset, isLiveBackend() is false and callers
 * should show a "connect the backend" state instead of failing silently.
 */

import { createClient } from "@/lib/supabase/client";
import { API_BASE_URL, isLiveBackend } from "@/lib/api";

export type SignalKind = "success_signal" | "must_have" | "nice_to_have";
export type WorkMode = "remote" | "hybrid" | "onsite";
export type JobStatus = "draft" | "active" | "paused" | "closed";

export interface RoleDnaSignal {
  kind: SignalKind;
  signal: string;
  required_evidence?: string | null;
  position?: number;
}
export interface RoleDnaSignalOut extends RoleDnaSignal {
  id: string;
}
export interface RoleDnaIn {
  business_problem?: string | null;
  first_90_day_outcome?: string | null;
  human_follow_up?: string | null;
  signals: RoleDnaSignal[];
}
export interface RealityCard {
  work_mode?: WorkMode | null;
  location?: string | null;
  expected_hours?: string | null;
  compensation_range?: string | null;
  team_context?: string | null;
  work_shape?: string | null;
  learning?: string | null;
  process?: string | null;
  response_sla?: string | null;
  candidate_commitments?: string | null;
}
export interface RealityCardOut extends RealityCard {
  unverified: boolean;
}
export interface JobSummary {
  id: string;
  company_id: string;
  title: string;
  level: string | null;
  status: JobStatus;
  role_dna_version: number;
  is_search_ready: boolean;
}
export interface JobDetail extends JobSummary {
  business_problem: string | null;
  first_90_day_outcome: string | null;
  human_follow_up: string | null;
  signals: RoleDnaSignalOut[];
  reality_card: RealityCardOut | null;
}
export interface JobCreate {
  title: string;
  level?: string | null;
  company_name?: string | null;
}

// ── Slice 2: candidate preferences, interview sessions, consent ──
export type InterviewMode = "text" | "voice";
export type SessionStatus = "created" | "in_progress" | "complete" | "abandoned";
export type ConsentKind = "interview" | "voice";
export type Visibility = "off" | "matched_only" | "searchable";

export interface ConsentIn {
  kind?: ConsentKind;
  stt_provider?: string | null;
  tts_provider?: string | null;
  audio_retention?: string;
}
export interface ConsentOut {
  id: string;
  kind: ConsentKind;
  policy_version: string;
  stt_provider: string | null;
  tts_provider: string | null;
  audio_retention: string;
  consented_at: string | null;
}
export interface SessionCreate {
  role_family: string;
  job_id?: string | null;
  mode_default?: InterviewMode;
  consent?: ConsentIn;
}
export interface InterviewSession {
  id: string;
  candidate_id: string;
  role_family: string;
  job_id: string | null;
  status: SessionStatus;
  mode_default: InterviewMode;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  consents: ConsentOut[];
}
export interface CandidatePreferences {
  role_families: string[];
  locations: string[];
  work_modes: string[];
  salary_min_expectation: string | null;
  feedback_style: string | null;
  visibility: Visibility;
  research_consent: boolean;
}
export interface CandidatePreferencesOut extends CandidatePreferences {
  candidate_id: string;
}

export interface TurnIn {
  question_text: string;
  question_signal_id?: string | null;
  answer_text: string;
  answer_mode?: InterviewMode;
  stt_confidence?: number | null;
}
export interface TurnOut {
  id: string;
  turn_index: number;
  question_text: string;
  question_signal_id: string | null;
  answer_text: string | null;
  answer_mode: InterviewMode | null;
  stt_confidence: number | null;
  asked_at: string | null;
  answered_at: string | null;
}

// ── Slice 4: Evidence Report Card (no universal score, ever) ──
export type Band = "supported" | "emerging" | "needs_more_evidence";
export type CandidateState = "unreviewed" | "accurate" | "context_added" | "disputed" | "hidden";
export type ReportStatus = "building" | "ready_for_review" | "approved" | "superseded";

export interface ReportItem {
  id: string;
  signal_id: string | null;
  claim: string;
  band: Band;
  quote: string | null;
  turn_id: string | null;
  candidate_state: CandidateState;
  candidate_context: string | null;
  position: number;
}
export interface ReportSummary {
  supported: number;
  emerging: number;
  needs_more_evidence: number;
  reviewed: number;
  total: number;
}
export interface ReportCard {
  id: string;
  session_id: string;
  candidate_id: string;
  role_family: string;
  status: ReportStatus;
  built_at: string | null;
  approved_at: string | null;
  items: ReportItem[];
  summary: ReportSummary;
}
export interface ItemReview {
  candidate_state: CandidateState;
  candidate_context?: string | null;
}

// ── Slice 5: explained matching (dimensions + citations, never a score) ──
export type DimensionStatus = "supported" | "emerging" | "missing";
export type SalaryFitStatus = "in_range" | "below_expectation" | "not_disclosed" | "no_expectation";
export type MatchStatus = "suggested" | "saved" | "passed";

export interface DimensionExplanation {
  signal_id: string | null;
  signal: string;
  kind: SignalKind | string;
  status: DimensionStatus;
  claim: string | null;
  quote: string | null;
}
export interface SalaryFit {
  status: SalaryFitStatus;
  job_range: string | null;
  candidate_expectation: string | null;
}
export interface MatchCounts {
  supported: number;
  emerging: number;
  missing: number;
}
export interface Match {
  id: string | null;
  job_id: string;
  candidate_id: string;
  role_family: string | null;
  status: MatchStatus;
  dimensions: DimensionExplanation[];
  salary: SalaryFit;
  counts: MatchCounts;
}

// Employer recommendations — matching, ranked by shared coverage engine.
export type CoverageTier = "strong" | "worth_a_look" | "gaps";

export interface RequirementCoverage {
  kind: "must_have" | "nice_to_have" | "success_signal";
  signal: string;
  status: "supported" | "partial" | "gap";
  band: Band | null;
  citation: string | null;
  needs_clarification: boolean;
}

export interface CoverageVector {
  must_have_coverage: number; // internal — display uses tier, never this number
  nice_to_have_coverage: number;
  must_have_lower_bound: number;
  requirements: RequirementCoverage[];
  gaps: string[]; // unmet must-haves, named
  clarify: string[]; // "one probe away" must-haves
  tier: CoverageTier;
}

export interface JobRecommendation {
  candidate_id: string;
  job_id: string;
  tier: CoverageTier;
  coverage: CoverageVector;
  salary: SalaryFit;
  counts: MatchCounts;
}

// Candidate → company recommendations (mutual fit; employer identity gated).
export type MutualFitTier = "strong_fit" | "worth_a_look" | "stretch";

export interface CandidateOpeningRec {
  job_id: string;
  title: string;
  level: string | null;
  tier: MutualFitTier;
  company_verified: boolean;
  reasons: string[];
  readiness: CoverageVector; // coverage of the role's public must-haves, cited
}

// ── Slice 6: HR Copilot search (policy-gated, citation-backed) ──
export type CopilotOutcome = "allowed" | "rewritten" | "refused";

export interface CitedEvidence {
  claim: string;
  band: Band;
  quote: string | null;
}
export interface CopilotResult {
  candidate_id: string;
  role_family: string | null;
  cited: CitedEvidence[];
  missing: string[];
  follow_up: string;
}
export interface CopilotResponse {
  session_id: string | null;
  outcome: CopilotOutcome;
  refusal_reason: string | null;
  stripped_terms: string[];
  chips: string[];
  results: CopilotResult[];
}

// ── Slice 7: consent-gated introductions (the only chat) ──
export type IntroStatus = "pending" | "approved" | "declined";
export type IntroDecision = "approved" | "declined";

export interface IntroRealitySnapshot {
  work_mode: string | null;
  location: string | null;
  compensation_range: string | null;
  response_sla: string | null;
}
export interface Intro {
  id: string;
  job_id: string;
  candidate_id: string;
  company_id: string;
  message: string;
  status: IntroStatus;
  job_title: string;
  reality: IntroRealitySnapshot | null;
  company_name: string | null; // revealed to the candidate only after approval
  created_at: string | null;
  responded_at: string | null;
}
export interface IntroMessage {
  id: string;
  intro_id: string;
  sender_profile_id: string;
  body: string;
  created_at: string | null;
}

// ── Slice 8: PMF instrumentation + outcome check-ins ──
export type CheckinHorizon = "30d" | "90d";
export type CheckinOutcome = "advanced" | "offer" | "mutual_worth_it" | "not_useful";

export interface OutcomeCheckin {
  id: string;
  intro_id: string;
  horizon: CheckinHorizon;
  outcome: CheckinOutcome;
  note: string | null;
  created_at: string | null;
}

// ── Growth Report (candidate-owned career guidance) ──────────────────────────
// HARD INVARIANTS (must never be violated in code, DB, or UI):
//  • `readiness_pct` = coverage of a role's PUBLIC requirements the candidate has
//    evidenced. It is NEVER a probability of being selected/hired. No selection odds.
//  • This report GUIDES the candidate. The AI never decides, ranks people, or selects.
//  • There is no single blended "hireability" score anywhere.
//  • Every strength/gap traces to verified interview evidence (verify_quote-gated)
//    or a role-requirement fact; every learning step cites its catalog source.
export type FitBand = "strong_fit" | "developing_fit" | "stretch";
export type GapSeverity = "critical" | "important" | "nice_to_have";
export type LearningKind = "course" | "certification" | "exam" | "program" | "college";

/** One demonstrated (or missing) skill, mapped to a standard taxonomy id. */
export interface SkillEvidence {
  skill_id: string; // O*NET / ESCO / WEF taxonomy id
  skill_label: string;
  band: Band; // supported | emerging | needs_more_evidence
  quote: string | null; // verbatim interview evidence, verify_quote-gated
  session_ref: string | null;
  similarity: number | null; // encoder cosine — shown for transparency, never hidden
}

/** A curated, CITED learning step. Never free-generated by an LLM. */
export interface LearningStep {
  kind: LearningKind;
  title: string;
  provider: string;
  url: string | null;
  source: string; // catalog citation id — where this mapping came from
  skill_ids: string[];
  est_effort: string | null;
}

export interface RoleGap {
  skill_id: string;
  skill_label: string;
  severity: GapSeverity;
  why: string; // what the role expects
  next_evidence: string; // the specific evidence to build next
  build_actions: string[]; // concrete project / behaviour suggestions
  learning: LearningStep[]; // cited catalog items that close this gap
}

/** Optional: a specific org whose PUBLIC Role DNA the evidence covers. Guidance only. */
export interface CompanyFit {
  company_name: string;
  readiness_pct: number; // coverage of that role's public requirements — not odds
  note: string;
}

export interface RoleFit {
  role_id: string;
  role_title: string;
  role_family: string;
  readiness_pct: number; // 0–100 coverage of PUBLIC requirements — NOT selection odds
  fit_band: FitBand;
  covered: SkillEvidence[]; // requirements you have evidenced (your edge here)
  gaps: RoleGap[]; // requirements with weak / no evidence
  companies: CompanyFit[]; // orgs whose public requirements this evidence matches
  as_of: string;
}

/** An advantage: a strength worth leading with. */
export interface GrowthEdge {
  skill_label: string;
  band: Band;
  note: string; // why it's a strength (above typical bar / rare in taxonomy)
  quote: string | null;
}

export interface RoadmapPhase {
  order: number;
  title: string;
  horizon: string; // e.g. "0–30 days"
  focus: string;
  steps: LearningStep[];
  targets: string[]; // skills unlocked by finishing this phase
}

export interface GrowthReport {
  candidate_id: string;
  generated_at: string;
  taxonomy_version: string; // reproducibility
  model_version: string; // reproducibility
  headline: string; // guidance framing, e.g. "Your evidence fits Platform roles best"
  role_fits: RoleFit[]; // ranked by readiness — GUIDANCE, not a verdict on the person
  edges: GrowthEdge[]; // advantages
  gaps: RoleGap[]; // top cross-role growth gaps ("disadvantages", framed to grow)
  skills_to_develop: SkillEvidence[]; // taxonomy-adjacent skills that unlock more roles
  roadmap: RoadmapPhase[]; // sequenced courses / exams / programs
  disclaimer: string; // "Guidance for you — not a prediction any employer will select you."
}

// ── Candidate Profile (Card A: stated claims + intent — routes & seeds the interview) ──
// HARD INVARIANTS:
//  • The profile is CLAIMS, not verified evidence, and never a talent score. `completeness`
//    is engagement momentum (0–100), NOT a measure of the person.
//  • It ROUTES the interview (which role) and SEEDS it (what to verify) — it never scores.
//  • `locations_open_to` / `work_mode_pref` are MATCHING preferences only. College, caste,
//    region, mother-tongue, photo are NEVER collected as assessment inputs (fairness firewall).
//  • "Job fit" derived downstream is Readiness (requirement coverage), never selection odds.
export type WorkType = "full_time" | "part_time" | "internship" | "freelance" | "contract";
export type Availability = "immediately" | "in_1_month" | "in_3_months" | "exploring";
export type Seniority = "student" | "junior" | "mid" | "senior" | "lead";
export type SelfRating = "learning" | "working" | "strong"; // self-assessed, never a score

export interface ClaimedSkill {
  skill_id: string | null; // taxonomy id if matched
  label: string; // the candidate's own words
  self_rating: SelfRating;
  wants_to_verify: boolean; // true → becomes a target the interview will probe
}
export interface ExperienceHighlight {
  id: string;
  title: string; // e.g. "Built a payments retry system"
  context: string; // 1–2 lines the candidate wants to talk about
  role_family_hint: string | null;
}
export interface CandidateProfile {
  display_name: string;
  headline: string; // self-written one-liner
  summary: string; // short self-intro
  target_roles: string[]; // role families they want — routes the interview
  seniority: Seniority;
  work_types: WorkType[]; // freelance / internship / full-time / part-time
  availability: Availability;
  work_mode_pref: WorkMode[]; // remote / hybrid / onsite — matching preference
  locations_open_to: string[]; // matching preference only, never an assessment signal
  comp_expectation: string | null;
  claimed_skills: ClaimedSkill[]; // Card A claims the interview will verify
  highlights: ExperienceHighlight[]; // seeds the interview's opening questions
  completeness: number; // 0–100 engagement momentum, NOT a talent score
  updated_at: string | null;
}

/** How much of a matched opening's public requirements the candidate's evidence covers. */
export interface OpeningFit {
  job_id: string;
  role_title: string;
  company_label: string; // role/company archetype — identity gated to consented intros
  work_type: WorkType | null;
  readiness_pct: number; // Readiness = requirement coverage — NEVER selection odds
  top_gap: string | null; // the one thing to close first
}

// ── Resume ingestion → Card A claims (parsed, pedigree-redacted, never believed) ──
// The resume is a CLAIM source, not a score source. Extraction pulls skills/projects; the
// fairness firewall strips college/name/age/gender/location BEFORE anything is surfaced, and
// `redacted` lists exactly what was removed (a trust signal). Claims default to "verify in
// interview" — the resume seeds the interview, it is never trusted as evidence.
export interface ResumeParseRequest {
  text: string; // pasted resume text (or text extracted from an uploaded file)
  filename: string | null;
}
export interface ExtractedClaim {
  label: string; // the skill/claim, in plain words
  self_rating: SelfRating; // default "working" — the candidate adjusts
  source_line: string; // where in the resume it came from (transparency)
  skill_id: string | null; // taxonomy id if matched
}
export interface ResumeParseResult {
  claimed_skills: ExtractedClaim[]; // → Card A, all flagged to verify
  highlights: ExperienceHighlight[]; // extracted projects/roles → interview seeds
  redacted: string[]; // what was STRIPPED (college, name, age, address…) — shown to the candidate
  note: string; // plain-language explanation of what we did and why
}

export class V1Error extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "V1Error";
  }
}

export { isLiveBackend };

export async function accessToken(): Promise<string> {
  const { data } = await createClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new V1Error("Please sign in to continue.", 401);
  return token;
}

async function authFetch<T>(
  path: string,
  init: RequestInit & { method: string } = { method: "GET" },
): Promise<T> {
  const token = await accessToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new V1Error(
      "Could not reach the backend. Set NEXT_PUBLIC_API_BASE_URL to the live API.",
      0,
    );
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? body?.detail ?? message;
    } catch {
      /* keep default */
    }
    throw new V1Error(message, res.status);
  }
  // 204 No Content (e.g. invite revoke) has no body to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Team side (Slice 9) — orgs, members, teammate invites ────
export type MemberRole = "owner" | "recruiter" | "hiring_manager";
export type InviteRole = "recruiter" | "hiring_manager";
export type InviteStatus = "pending" | "accepted" | "revoked";

export interface OrgSummary {
  company_id: string;
  name: string;
  my_role: MemberRole;
  member_count: number;
}

export interface OrgMember {
  profile_id: string;
  role: MemberRole;
  created_at: string | null;
}

export interface OrgInvite {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  token: string;
  created_at: string | null;
}

export const v1 = {
  createJob: (payload: JobCreate) =>
    authFetch<JobSummary>("/v1/jobs", { method: "POST", body: JSON.stringify(payload) }),
  employerDashboard: () => authFetch<JobSummary[]>("/v1/employer/dashboard", { method: "GET" }),
  getJob: (id: string) => authFetch<JobDetail>(`/v1/jobs/${id}`, { method: "GET" }),
  setRoleDna: (id: string, payload: RoleDnaIn) =>
    authFetch<JobDetail>(`/v1/jobs/${id}/role-dna`, { method: "POST", body: JSON.stringify(payload) }),
  setRealityCard: (id: string, payload: RealityCard) =>
    authFetch<JobDetail>(`/v1/jobs/${id}/reality-card`, { method: "POST", body: JSON.stringify(payload) }),
  updateStatus: (id: string, status: JobStatus) =>
    authFetch<JobDetail>(`/v1/jobs/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Slice 2 — candidate preferences + interview sessions
  getPreferences: () =>
    authFetch<CandidatePreferencesOut>("/v1/candidate/preferences", { method: "GET" }),
  putPreferences: (payload: CandidatePreferences) =>
    authFetch<CandidatePreferencesOut>("/v1/candidate/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  createInterview: (payload: SessionCreate) =>
    authFetch<InterviewSession>("/v1/interviews", { method: "POST", body: JSON.stringify(payload) }),
  getInterview: (id: string) =>
    authFetch<InterviewSession>(`/v1/interviews/${id}`, { method: "GET" }),
  addConsent: (id: string, payload: ConsentIn) =>
    authFetch<InterviewSession>(`/v1/interviews/${id}/consent`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addTurn: (id: string, payload: TurnIn) =>
    authFetch<TurnOut>(`/v1/interviews/${id}/turns`, { method: "POST", body: JSON.stringify(payload) }),
  listTurns: (id: string) =>
    authFetch<TurnOut[]>(`/v1/interviews/${id}/turns`, { method: "GET" }),
  updateInterviewStatus: (id: string, status: SessionStatus) =>
    authFetch<InterviewSession>(`/v1/interviews/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Slice 4 — Evidence Report Card
  finalizeInterview: (sessionId: string) =>
    authFetch<ReportCard>(`/v1/interviews/${sessionId}/finalize`, { method: "POST" }),
  getReport: (reportId: string) =>
    authFetch<ReportCard>(`/v1/reports/${reportId}`, { method: "GET" }),
  getReportForSession: (sessionId: string) =>
    authFetch<ReportCard>(`/v1/interviews/${sessionId}/report`, { method: "GET" }),
  reviewItem: (itemId: string, payload: ItemReview) =>
    authFetch<ReportItem>(`/v1/reports/items/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  approveReport: (reportId: string) =>
    authFetch<ReportCard>(`/v1/reports/${reportId}/approve`, { method: "POST" }),

  // Slice 5 — explained matching
  buildMatches: (jobId: string) =>
    authFetch<Match[]>(`/v1/jobs/${jobId}/matches/build`, { method: "POST" }),
  listMatches: (jobId: string) =>
    authFetch<Match[]>(`/v1/jobs/${jobId}/matches`, { method: "GET" }),
  jobRecommendations: (jobId: string) =>
    authFetch<JobRecommendation[]>(`/v1/jobs/${jobId}/recommendations`, { method: "GET" }),
  candidateRecommendations: () =>
    authFetch<CandidateOpeningRec[]>("/v1/candidate/recommendations", { method: "GET" }),

  // Slice 6 — HR Copilot search
  copilotSearch: (prompt: string) =>
    authFetch<CopilotResponse>("/v1/copilot/search", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  // Slice 7 — consent-gated introductions (the only chat)
  requestIntro: (payload: { job_id: string; candidate_id: string; message: string }) =>
    authFetch<Intro>("/v1/intros", { method: "POST", body: JSON.stringify(payload) }),
  listIntros: () => authFetch<Intro[]>("/v1/intros", { method: "GET" }),
  respondIntro: (introId: string, decision: IntroDecision) =>
    authFetch<Intro>(`/v1/intros/${introId}/respond`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    }),
  listIntroMessages: (introId: string) =>
    authFetch<IntroMessage[]>(`/v1/intros/${introId}/messages`, { method: "GET" }),
  sendIntroMessage: (introId: string, body: string) =>
    authFetch<IntroMessage>(`/v1/intros/${introId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  // Slice 8 — outcome check-ins + product events
  addCheckin: (introId: string, payload: { horizon: CheckinHorizon; outcome: CheckinOutcome; note?: string | null }) =>
    authFetch<OutcomeCheckin>(`/v1/intros/${introId}/checkins`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listCheckins: (introId: string) =>
    authFetch<OutcomeCheckin[]>(`/v1/intros/${introId}/checkins`, { method: "GET" }),
  logEvent: (event: string, props?: Record<string, unknown>) =>
    authFetch<{ ok: boolean }>("/v1/events", {
      method: "POST",
      body: JSON.stringify({ event, props: props ?? {} }),
    }),

  // Growth Report — candidate-owned career guidance (readiness, gaps, roadmap)
  growthReport: () => authFetch<GrowthReport>("/v1/candidate/growth", { method: "GET" }),

  // Candidate Profile (Card A) + matched openings (readiness, not odds)
  getProfile: () => authFetch<CandidateProfile>("/v1/candidate/profile", { method: "GET" }),
  putProfile: (payload: CandidateProfile) =>
    authFetch<CandidateProfile>("/v1/candidate/profile", { method: "PUT", body: JSON.stringify(payload) }),
  listOpeningFits: () => authFetch<OpeningFit[]>("/v1/candidate/openings", { method: "GET" }),
  parseResume: (payload: ResumeParseRequest) =>
    authFetch<ResumeParseResult>("/v1/candidate/resume/parse", { method: "POST", body: JSON.stringify(payload) }),

  // Slice 9 — Team side: orgs, members, invites
  getOrg: () => authFetch<OrgSummary | null>("/v1/org", { method: "GET" }),
  createOrg: (name: string) =>
    authFetch<OrgSummary>("/v1/org", { method: "POST", body: JSON.stringify({ name }) }),
  listMembers: () => authFetch<OrgMember[]>("/v1/org/members", { method: "GET" }),
  listInvites: () => authFetch<OrgInvite[]>("/v1/org/invites", { method: "GET" }),
  createInvite: (payload: { email: string; role: InviteRole }) =>
    authFetch<OrgInvite>("/v1/org/invites", { method: "POST", body: JSON.stringify(payload) }),
  revokeInvite: (inviteId: string) =>
    authFetch<void>(`/v1/org/invites/${inviteId}/revoke`, { method: "POST" }),
  acceptInvite: (token: string) =>
    authFetch<OrgSummary>("/v1/org/invites/accept", { method: "POST", body: JSON.stringify({ token }) }),
};

/**
 * Fire-and-forget product telemetry. Deliberately swallows failures: analytics
 * must never break a user flow, and there is nothing actionable to show. No-op
 * without a live backend (no fake events).
 */
export function trackEvent(event: string, props?: Record<string, unknown>): void {
  if (!isLiveBackend()) return;
  void v1.logEvent(event, props).catch(() => undefined);
}
