/**
 * Mock adapter for the candidate dashboard state machine (plan §15.17).
 * The dashboard renders one clear next action per mode; swap these bodies
 * for GET /api/candidate/{profile,interviews,matches} later and the UI
 * does not change.
 */

export type CandidateDashboardMode =
  | "new_candidate"
  | "interview_in_progress"
  | "profile_review_required"
  | "profile_live"
  | "intro_requested";

export const DASHBOARD_MODES: CandidateDashboardMode[] = [
  "new_candidate",
  "interview_in_progress",
  "profile_review_required",
  "profile_live",
  "intro_requested",
];

export type IconKey =
  | "message"
  | "resume"
  | "review"
  | "matches"
  | "intro"
  | "check"
  | "lock"
  | "eye";

export interface DashboardMatchPreview {
  id: string;
  company: string;
  role: string;
  reason: string;
  confidence: "high" | "medium";
}

export interface CandidateSnapshot {
  firstName: string;
  mode: CandidateDashboardMode;
  lastSaved: string;
  interview: {
    status: "not_started" | "in_progress" | "complete";
    role: string;
    turnsCompleted: number;
    totalTurns: number;
  };
  profile: {
    status: "not_ready" | "needs_review" | "live";
    strength: number;
    traitsPending: number;
    employerVisible: boolean;
  };
  matches: DashboardMatchPreview[];
  introRequests: { id: string; company: string; role: string; expiresIn: string }[];
}

export interface NextAction {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  path: string;
  iconKey: IconKey;
}

export const NEXT_ACTION: Record<CandidateDashboardMode, NextAction> = {
  new_candidate: {
    eyebrow: "First step",
    title: "Start your PlacedOn interview.",
    description:
      "One calm conversation creates the evidence-backed profile employers can review — after you approve it.",
    label: "Start interview",
    path: "/pre-interview",
    iconKey: "message",
  },
  interview_in_progress: {
    eyebrow: "Resume",
    title: "Continue where you left off.",
    description: "Your interview state is saved. Reconnect and keep going without starting over.",
    label: "Resume interview",
    path: "/interview",
    iconKey: "resume",
  },
  profile_review_required: {
    eyebrow: "Action needed",
    title: "Review your generated profile.",
    description:
      "Employers cannot see this profile until you approve the evidence, add context, or hide anything that needs review.",
    label: "Review profile",
    path: "/candidate/profile",
    iconKey: "review",
  },
  profile_live: {
    eyebrow: "Profile live",
    title: "See roles that match your signal.",
    description:
      "Your approved profile is ready. Review roles where your evidence-backed strengths are relevant.",
    label: "View matches",
    path: "/candidate/matches",
    iconKey: "matches",
  },
  intro_requested: {
    eyebrow: "Employer interest",
    title: "A company requested an intro.",
    description: "You stay in control. Review the request and accept only if you want the conversation.",
    label: "Review intro",
    path: "/candidate/matches",
    iconKey: "intro",
  },
};

const PREVIEW_MATCHES: DashboardMatchPreview[] = [
  {
    id: "match-1",
    company: "Meridian Labs",
    role: "Product Engineer",
    reason: "Strong evidence for structured debugging and React architecture.",
    confidence: "high",
  },
  {
    id: "match-2",
    company: "Cortex Systems",
    role: "Frontend Platform Engineer",
    reason: "Good signal for API integration; needs more collaboration evidence.",
    confidence: "medium",
  },
];

export function getCandidateSnapshot(
  mode: CandidateDashboardMode = "profile_review_required",
): CandidateSnapshot {
  const base: CandidateSnapshot = {
    firstName: "Alex",
    mode,
    lastSaved: "2 minutes ago",
    interview: { status: "complete", role: "Frontend Engineer", turnsCompleted: 6, totalTurns: 6 },
    profile: { status: "needs_review", strength: 72, traitsPending: 3, employerVisible: false },
    matches: PREVIEW_MATCHES,
    introRequests: [],
  };

  switch (mode) {
    case "new_candidate":
      return {
        ...base,
        interview: { ...base.interview, status: "not_started", turnsCompleted: 0 },
        profile: { status: "not_ready", strength: 0, traitsPending: 0, employerVisible: false },
        matches: [],
      };
    case "interview_in_progress":
      return {
        ...base,
        lastSaved: "just now",
        interview: { ...base.interview, status: "in_progress", turnsCompleted: 3 },
        profile: { status: "not_ready", strength: 34, traitsPending: 0, employerVisible: false },
        matches: [],
      };
    case "profile_live":
      return {
        ...base,
        profile: { status: "live", strength: 88, traitsPending: 0, employerVisible: true },
      };
    case "intro_requested":
      return {
        ...base,
        profile: { status: "live", strength: 88, traitsPending: 0, employerVisible: true },
        introRequests: [{ id: "intro-1", company: "Meridian Labs", role: "Product Engineer", expiresIn: "5 days" }],
      };
    case "profile_review_required":
    default:
      return base;
  }
}
