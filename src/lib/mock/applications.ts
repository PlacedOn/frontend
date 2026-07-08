/**
 * Data adapter for the candidate applications / intro pipeline.
 * Prefers GET /demo/applications when the backend is configured, else mock.
 */

import { isLiveBackend, getDemoApplications } from "@/lib/api";

export interface AppStage {
  id: string;
  label: string;
  count: number;
}

export type AppStageId = "saved" | "applied" | "interview" | "offer";

export interface Application {
  id: string;
  company: string;
  role: string;
  stage: AppStageId;
  statusLabel: string;
  nextStep: string;
  evidence: string[];
}

export interface ApplicationsData {
  stages: AppStage[];
  applications: Application[];
  live: boolean;
}

const MOCK_STAGES: AppStage[] = [
  { id: "saved", label: "Saved", count: 1 },
  { id: "applied", label: "Applied", count: 1 },
  { id: "interview", label: "Interview", count: 1 },
  { id: "offer", label: "Offer", count: 0 },
];

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-meridian",
    company: "Meridian Labs",
    role: "Product Engineer",
    stage: "interview",
    statusLabel: "Intro accepted · interview scheduled",
    nextStep: "Review your two strongest evidence snippets before the screen.",
    evidence: ["Structured debugging", "Ambiguity tolerance"],
  },
  {
    id: "app-cortex",
    company: "Cortex Systems",
    role: "Frontend Platform Engineer",
    stage: "applied",
    statusLabel: "Interest sent · awaiting employer",
    nextStep: "Nothing needed — you'll be notified if they request an intro.",
    evidence: ["API integration", "Decision velocity"],
  },
  {
    id: "app-riverpay",
    company: "RiverPay",
    role: "Design Systems Engineer",
    stage: "saved",
    statusLabel: "Saved for later",
    nextStep: "Add one systems-ownership example to strengthen this fit.",
    evidence: ["Engineering rigor"],
  },
];

const STAGE_IDS: AppStageId[] = ["saved", "applied", "interview", "offer"];
const toStageId = (s: string): AppStageId =>
  (STAGE_IDS.includes(s as AppStageId) ? s : "applied") as AppStageId;

export async function getApplicationsData(): Promise<ApplicationsData> {
  if (isLiveBackend()) {
    try {
      const resp = await getDemoApplications();
      return {
        stages: resp.stages.map((s) => ({ id: s.id, label: s.label ?? s.stage, count: s.count })),
        applications: resp.applications.map((a) => ({
          id: a.id,
          company: a.company,
          role: a.role,
          stage: toStageId(a.stage),
          statusLabel: a.status_label,
          nextStep: a.next_step,
          evidence: a.evidence_used ?? [],
        })),
        live: true,
      };
    } catch {
      // fall through to mock
    }
  }
  await new Promise((r) => setTimeout(r, 450));
  return { stages: MOCK_STAGES, applications: MOCK_APPLICATIONS, live: false };
}
