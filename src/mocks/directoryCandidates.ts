/**
 * FIXTURES — invented directory rows. Not real candidates, not real readings.
 *
 * See src/mocks/README.md. Measured 2026-08-01: interview_sessions = 0,
 * report_card_items = 0. There is nothing real to browse yet.
 *
 * ══ WHY THESE ARE NOT PEOPLE ══
 * README rule 2 says "no named people", and the reason is sharper on this
 * surface than anywhere else: a browse grid of realistic-looking humans with
 * trait figures beside them is *precisely* the screenshot that ends up in a
 * deck labelled "our candidates". So every row here is handled by an
 * unmistakable fixture reference — `FX-01`, `FX-02` — which is also, not by
 * coincidence, exactly what the real product shows. The fixture constraint and
 * the fairness constraint happen to want the same thing (see the reasoning
 * block at the top of `src/components/directory/CandidateCard.tsx`).
 *
 * The headlines are written the way an engineer would describe their own work,
 * not the way a recruiter would summarise a resume. No employer names, no
 * schools, no seniority titles that encode pay band.
 */

import type { DirectoryCandidate, DirectoryTraitFigure } from "@/types/directory";

/** Required marker for any surface rendering these. Same contract as traitScores. */
export const DIRECTORY_FIXTURE_NOTICE =
  "Sample data — nine invented records. No real candidate has been assessed.";

/**
 * The trait vocabulary these fixtures draw on. Small on purpose: the
 * minimum-figure facet is only usable if the same traits recur across rows.
 */
const TRAITS = {
  handles_ambiguity: "Handles ambiguity",
  gives_direct_feedback: "Gives direct feedback",
  debugs_systematically: "Debugs systematically",
  explains_tradeoffs: "Explains trade-offs",
  mentors_others: "Mentors others",
  scopes_under_pressure: "Scopes under pressure",
} as const;

type TraitKey = keyof typeof TRAITS;

/** Small builder so a fixture row reads as data rather than as boilerplate. */
function figure(
  key: TraitKey,
  point: number,
  bandLow: number,
  bandHigh: number,
  evidenceCount: number,
): DirectoryTraitFigure {
  return {
    traitKey: key,
    traitLabel: TRAITS[key],
    point,
    bandLow,
    bandHigh,
    // Evidence is the gate, not the model's self-report — the same rule
    // `toTraitScore()` enforces at the real boundary. Zero cited moments can
    // never read as anything but `needs_more_evidence`, and a single moment is
    // at best `emerging`.
    confidence:
      evidenceCount === 0 ? "needs_more_evidence" : evidenceCount === 1 ? "emerging" : "supported",
    evidenceCount,
  };
}

export const FIXTURE_DIRECTORY_CANDIDATES: readonly DirectoryCandidate[] = [
  {
    id: "fx-01",
    ref: "FX-01",
    headline: "Builds payment reconciliation services and the boring tooling around them",
    role: "Backend engineer",
    skills: ["Python", "PostgreSQL", "FastAPI", "Redis"],
    location: "Remote (IST)",
    availability: "immediately",
    yearsExperience: 4,
    traits: [
      figure("handles_ambiguity", 74, 69, 79, 3),
      figure("explains_tradeoffs", 68, 61, 75, 2),
      figure("gives_direct_feedback", 61, 48, 74, 1),
    ],
    trust: ["verified", "interview_complete"],
    assessedAt: "2026-07-28T09:12:00.000Z",
  },
  {
    id: "fx-02",
    ref: "FX-02",
    headline: "Front-end work on long-lived internal tools nobody wants to rewrite",
    role: "Frontend engineer",
    skills: ["TypeScript", "React", "Playwright"],
    location: "Bengaluru",
    availability: "within_30_days",
    yearsExperience: 6,
    traits: [
      figure("debugs_systematically", 81, 76, 86, 4),
      figure("mentors_others", 70, 63, 77, 2),
      figure("scopes_under_pressure", 55, 36, 74, 0),
    ],
    trust: ["verified", "interview_complete"],
    assessedAt: "2026-07-26T14:40:00.000Z",
  },
  {
    id: "fx-03",
    ref: "FX-03",
    headline: "Moves batch pipelines onto schedules that survive a bad upstream day",
    role: "Data engineer",
    skills: ["Python", "Airflow", "dbt", "PostgreSQL"],
    location: "Hybrid — Pune",
    availability: "within_90_days",
    yearsExperience: 8,
    traits: [
      figure("explains_tradeoffs", 77, 71, 83, 3),
      figure("handles_ambiguity", 66, 55, 77, 2),
      figure("mentors_others", 52, 33, 71, 0),
    ],
    trust: ["interview_complete"],
    assessedAt: "2026-07-30T11:05:00.000Z",
  },
  {
    id: "fx-04",
    ref: "FX-04",
    headline: "Ships small services in Go and argues for deleting the ones nobody calls",
    role: "Backend engineer",
    skills: ["Go", "Kubernetes", "PostgreSQL", "Redis"],
    location: "Remote (global)",
    availability: "immediately",
    yearsExperience: 3,
    traits: [
      figure("gives_direct_feedback", 79, 73, 85, 4),
      figure("scopes_under_pressure", 64, 52, 76, 2),
      figure("debugs_systematically", 58, 45, 71, 1),
    ],
    trust: ["verified", "interview_complete", "contested"],
    assessedAt: "2026-07-31T08:20:00.000Z",
  },
  {
    id: "fx-05",
    ref: "FX-05",
    headline: "Design systems work — the unglamorous half where tokens stop drifting",
    role: "Product designer",
    skills: ["Figma", "TypeScript"],
    location: "Bengaluru",
    availability: "within_30_days",
    yearsExperience: 5,
    traits: [
      figure("explains_tradeoffs", 72, 66, 78, 3),
      figure("mentors_others", 69, 58, 80, 2),
      figure("handles_ambiguity", 60, 41, 79, 0),
    ],
    trust: ["interview_complete"],
    assessedAt: "2026-07-22T16:15:00.000Z",
  },
  {
    id: "fx-06",
    ref: "FX-06",
    headline: "Test infrastructure and the political work of making people trust it",
    role: "QA engineer",
    skills: ["Playwright", "TypeScript", "Python"],
    location: "Hyderabad",
    availability: "within_90_days",
    yearsExperience: 9,
    traits: [
      figure("debugs_systematically", 86, 82, 90, 5),
      figure("gives_direct_feedback", 73, 66, 80, 3),
      figure("scopes_under_pressure", 67, 56, 78, 2),
    ],
    trust: ["verified", "interview_complete"],
    assessedAt: "2026-07-29T10:02:00.000Z",
  },
  {
    id: "fx-07",
    ref: "FX-07",
    headline: "Two years in; mostly CRUD, currently learning where the interesting parts are",
    role: "Backend engineer",
    skills: ["Python", "FastAPI", "PostgreSQL"],
    location: "Hybrid — Pune",
    availability: "immediately",
    yearsExperience: 2,
    traits: [
      figure("handles_ambiguity", 57, 44, 70, 1),
      figure("scopes_under_pressure", 54, 35, 73, 0),
      figure("mentors_others", 49, 30, 68, 0),
    ],
    trust: ["interview_complete"],
    assessedAt: "2026-08-01T07:44:00.000Z",
  },
  {
    id: "fx-08",
    ref: "FX-08",
    headline: "Runs the on-call rotation and rewrites the runbooks that lie",
    role: "Backend engineer",
    skills: ["Go", "Kubernetes", "Redis"],
    location: "Remote (IST)",
    availability: "not_looking",
    yearsExperience: 11,
    traits: [
      figure("scopes_under_pressure", 84, 79, 89, 5),
      figure("mentors_others", 78, 71, 85, 3),
      figure("explains_tradeoffs", 75, 68, 82, 3),
    ],
    trust: ["verified", "interview_complete"],
    assessedAt: "2026-07-18T13:30:00.000Z",
  },
  {
    id: "fx-09",
    ref: "FX-09",
    headline: "Front-end performance work; will show you the trace before the opinion",
    role: "Frontend engineer",
    skills: ["TypeScript", "React", "Playwright", "Figma"],
    location: "Remote (global)",
    availability: "within_30_days",
    yearsExperience: 7,
    traits: [
      figure("debugs_systematically", 80, 74, 86, 4),
      figure("explains_tradeoffs", 71, 64, 78, 3),
      figure("gives_direct_feedback", 56, 37, 75, 0),
    ],
    trust: ["verified", "interview_complete", "contested"],
    assessedAt: "2026-07-25T09:55:00.000Z",
  },
];
