/**
 * Typed client for the PlacedOn FastAPI backend.
 * Mirrors backend/app/{demo_routes,api_routes}.py. Base URL is env-driven
 * so this drops onto the real backend without code changes.
 *
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000   (see .env.example)
 */

import type { CandidateProfile, InterviewState, DemoRequest } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

/**
 * WebSocket base for the live interview. Falls back to the HTTP base with the
 * scheme swapped (http→ws, https→wss) when NEXT_PUBLIC_WS_BASE_URL is unset.
 */
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? API_BASE_URL.replace(/^http/, "ws");

/** WebSocket URL for a given interview id — matches backend `WS /ws/{interview_id}`. */
export function interviewSocketUrl(interviewId: string): string {
  return `${WS_BASE_URL}/ws/${encodeURIComponent(interviewId)}`;
}

/**
 * True only when a real, non-local FastAPI backend is configured. In
 * production (no env var) this is false, so features fall back to mock
 * adapters. Set NEXT_PUBLIC_API_BASE_URL to the deployed Render URL to
 * flip everything to live data with no UI change.
 */
export function isLiveBackend(): boolean {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  return Boolean(url) && !url!.includes("127.0.0.1") && !url!.includes("localhost");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function messageFromUnknown(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function getJson<T>(endpoint: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Accept: "application/json" },
    });
  } catch (error: unknown) {
    throw new ApiError(
      `Network error reaching ${endpoint}: ${messageFromUnknown(error)}`,
      0,
      endpoint,
    );
  }
  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status, endpoint);
  }
  return (await response.json()) as T;
}

async function postJson<TBody, TResult>(endpoint: string, body: TBody): Promise<TResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error: unknown) {
    throw new ApiError(
      `Network error reaching ${endpoint}: ${messageFromUnknown(error)}`,
      0,
      endpoint,
    );
  }
  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status, endpoint);
  }
  return (await response.json()) as TResult;
}

/* ── Demo data (GET /demo/*) ──────────────────────────────
 * Shapes mirror backend/app/demo_routes.py exactly so responses map
 * without translation. Keep these in sync with that file. */

export interface DemoNextBestAction {
  type: string;
  title: string;
  label: string;
  description: string;
  cta: string;
  cta_label: string;
  cta_route: string;
  priority: string;
}

export interface DemoProfileSnapshot {
  headline: string;
  status: string;
  visibility: string;
  selected_role: string;
  location: string;
  completion: number;
  evidence_strength: string;
  skills_count: number;
  interviews_completed: number;
}

export interface DemoDashboardResponse {
  candidate_id: string;
  candidate_name: string;
  next_best_action: DemoNextBestAction;
  profile_snapshot: DemoProfileSnapshot;
  matches_summary: { total: number; new_count: number; strong_fits: number; top_match: string };
  pipeline_summary: { upcoming_interviews: number; pending_responses: number };
  growth_activity: { recent_improvements: string[]; next_milestones: string[] };
}

export interface DemoMatch {
  id: string;
  company: string;
  role: string;
  location: string;
  match_label: string;
  match_score: number;
  evidence_reason: string;
  action_type: string;
}

export interface DemoMatchesResponse {
  candidate_id: string;
  candidate_name: string;
  matches: DemoMatch[];
}

export interface DemoHcvDimension {
  id: string;
  dimension: string;
  score: number;
  confidence: number;
  uncertainty: number;
  label: string;
  evidence_snippets: string[];
}

export interface DemoHcvResponse {
  candidate_id: string;
  candidate_name: string;
  role_context: string;
  summary: string;
  dimensions: DemoHcvDimension[];
  embedding_metadata?: { model: string; dimension_count: number; last_updated: string };
}

export interface DemoApplicationStage {
  id: string;
  stage: string;
  label: string;
  count: number;
}

export interface DemoApplication {
  id: string;
  company: string;
  role: string;
  stage: string;
  status_label: string;
  last_updated: string;
  next_step: string;
  evidence_used: string[];
}

export interface DemoApplicationsResponse {
  candidate_id: string;
  candidate_name: string;
  stages: DemoApplicationStage[];
  applications: DemoApplication[];
}

export interface DemoEmployerJob {
  id: string;
  title: string;
  location: string;
  status: string;
  candidate_matches: number;
  applicants_count: number;
}

export interface DemoDiscoveryCandidate {
  id: string;
  name: string;
  target_role: string;
  location: string;
  match_score: number;
  evidence_strength: string;
  key_signals: string[];
  available_from: string;
}

export interface DemoEmployerResponse {
  employer: { id: string; company: string; viewer_name: string; active_role: string };
  jobs: DemoEmployerJob[];
  discovery_feed: DemoDiscoveryCandidate[];
  shortlist: { id: string; name: string; role: string; match_score: number; status: string }[];
  intro_requests: { candidate_id: string; status: string }[];
}

export const getDemoDashboard = () => getJson<DemoDashboardResponse>("/demo/dashboard");
export const getDemoMatches = () => getJson<DemoMatchesResponse>("/demo/matches");
export const getDemoHcv = () => getJson<DemoHcvResponse>("/demo/hcv");
export const getDemoApplications = () => getJson<DemoApplicationsResponse>("/demo/applications");
export const getDemoEmployer = () => getJson<DemoEmployerResponse>("/demo/employer");
export const getDemoCandidate = () => getJson<CandidateProfile>("/demo/candidate");
export const getDemoInterviews = () => getJson<{ interviews: InterviewState[] }>("/demo/interviews");

/* ── Actions (POST) ──────────────────────────────────────── */
export const submitRating = (payload: { interview_id: string; rating: number; comment?: string }) =>
  postJson<typeof payload, { ok: boolean }>("/rating", payload);

/**
 * Submit a marketing demo request. Posts to our own Next.js API route,
 * which validates and persists the lead to Supabase server-side (keys
 * never reach the browser).
 */
export async function requestDemo(
  payload: DemoRequest,
  honeypot?: string,
): Promise<{ ok: true }> {
  const res = await fetch("/api/demo-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, hp: honeypot ?? "" }),
  });
  if (!res.ok) {
    let detail = "Could not submit demo request.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // keep default message
    }
    throw new ApiError(detail, res.status, "/api/demo-requests");
  }
  return { ok: true };
}

export { API_BASE_URL };
