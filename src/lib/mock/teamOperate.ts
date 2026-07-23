/**
 * Sample data for the team dashboard "Operate" view. Illustrative only — there is
 * no real hiring data yet, and the UI labels it as sample. Metrics are raw counts;
 * the UI computes rates + Wilson intervals and gates small samples, so the numbers
 * are honest even though the data is made up.
 */

export type ActionKind = "question" | "evidence" | "calibration" | "intro" | "sla";

export type ActionItem = {
  id: string;
  /** Anonymous candidate/role reference — never a name or a score. */
  ref: string;
  kind: ActionKind;
  text: string;
  owner: string;
  due: string;
};

export type RoleState = "search_ready" | "needs_calibration" | "active";
export type RoleHealth = { id: string; role: string; state: RoleState; note: string };

export type ProcessMetrics = {
  /** Candidate updates delivered on time / due. */
  slaMet: number;
  slaDue: number;
  /** Candidates closed with a meaningful status / decided. */
  closed: number;
  decided: number;
  /** Decision↔evidence alignment: shown only once there are enough decided pairs. */
  alignmentPct: number;
  alignmentPairs: number;
  alignmentNote: string;
  /** Re-interview burden — supplemental rounds / active candidates (lower is better). */
  supplementalRounds: number;
  activeCandidates: number;
};

export type TeamOperate = {
  firstName: string;
  promisesDue: number;
  actions: ActionItem[];
  roles: RoleHealth[];
  metrics: ProcessMetrics;
};

export const MOCK_TEAM_OPERATE: TeamOperate = {
  firstName: "Aditi",
  promisesDue: 2,
  actions: [
    { id: "a1", ref: "Candidate 83", kind: "question", text: "asked about on-call expectations", owner: "Aditi", due: "today" },
    { id: "a2", ref: "Backend Engineer", kind: "evidence", text: "3 evidence briefs to review", owner: "Aditi", due: "today" },
    { id: "a3", ref: "Candidate 51", kind: "intro", text: "introduction accepted — propose a time", owner: "Ravi (coordinator)", due: "tomorrow" },
    { id: "a4", ref: "Product Designer", kind: "calibration", text: "Role DNA revision awaiting the hiring manager", owner: "Meera", due: "2 days" },
    { id: "a5", ref: "Candidate 42", kind: "sla", text: "update promised — overdue by 1 day", owner: "Aditi", due: "overdue" },
  ],
  roles: [
    { id: "r1", role: "Backend Engineer", state: "search_ready", note: "4 candidates to review" },
    { id: "r2", role: "Product Designer", state: "needs_calibration", note: "hiring-manager review due" },
    { id: "r3", role: "Customer Support Lead", state: "active", note: "1 candidate update overdue" },
  ],
  metrics: {
    slaMet: 8,
    slaDue: 12,
    closed: 9,
    decided: 11,
    // Deliberately below the 20-pair threshold, to show the gating in action.
    alignmentPct: 80,
    alignmentPairs: 6,
    alignmentNote: "Needs 20 decided pairs before this is trustworthy.",
    supplementalRounds: 1,
    activeCandidates: 9,
  },
};

/** Alignment is only trustworthy with enough comparable decided pairs (doc §6.2). */
export const ALIGNMENT_MIN_PAIRS = 20;
