/**
 * Typed client for the PlacedOn FastAPI backend.
 * Mirrors backend/app/{demo_routes,api_routes}.py. Base URL is env-driven
 * so this drops onto the real backend without code changes.
 *
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000   (see .env.example)
 */

import type {
  CandidateProfile,
  CandidateMatch,
  EmployerCandidate,
  InterviewState,
  DemoRequest,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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

/* ── Demo data (GET /demo/*) ─────────────────────────────── */
export const getDemoCandidate = () => getJson<CandidateProfile>("/demo/candidate");
export const getDemoMatches = () => getJson<{ matches: CandidateMatch[] }>("/demo/matches");
export const getDemoEmployer = () => getJson<{ candidates: EmployerCandidate[] }>("/demo/employer");
export const getDemoDashboard = () => getJson<Record<string, unknown>>("/demo/dashboard");
export const getDemoInterviews = () => getJson<{ interviews: InterviewState[] }>("/demo/interviews");
export const getDemoHcv = () => getJson<Record<string, unknown>>("/demo/hcv");

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
