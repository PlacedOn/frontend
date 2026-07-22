import type { ReportCard } from "@/lib/v1";

/**
 * Preview evidence for the report-card review surface, used only when no live
 * backend is configured (isLiveBackend() === false). It lets the surface be seen
 * and exercised in preview without a session — and it is clearly labelled as
 * sample so it is never mistaken for a real candidate's words.
 *
 * Bands are honest: strong answers are "supported", partial ones "emerging", and
 * a topic that barely came up is "needs_more_evidence" with no quote to invent.
 */
export const MOCK_REPORT_CARD: ReportCard = {
  id: "preview-report",
  session_id: "preview-session",
  candidate_id: "preview-candidate",
  role_family: "Backend Engineer",
  status: "ready_for_review",
  built_at: "2026-07-23T09:00:00.000Z",
  approved_at: null,
  items: [
    {
      id: "it-1",
      signal_id: "sig-debug",
      claim: "Debugs from symptom to root cause without guessing",
      band: "supported",
      quote:
        "I traced the duplicate charges to a missing idempotency key on the retry path, then derived the key from the order id so a retry couldn't double-charge.",
      turn_id: "t-3",
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 1,
    },
    {
      id: "it-2",
      signal_id: "sig-incident",
      claim: "Protects users first during an incident, then investigates",
      band: "supported",
      quote:
        "First I rolled back the deploy to stop the bleeding — you protect users before you go debugging.",
      turn_id: "t-5",
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 2,
    },
    {
      id: "it-3",
      signal_id: "sig-comms",
      claim: "Explains technical work so non-experts can follow",
      band: "supported",
      quote:
        "I lead with the blast radius — who's affected and how badly — before I get into the fix, so anyone in the room can follow.",
      turn_id: "t-6",
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 3,
    },
    {
      id: "it-4",
      signal_id: "sig-api",
      claim: "Designs APIs that hold up under load",
      band: "emerging",
      quote:
        "I added a retry budget and some backpressure, though I haven't load-tested it at real production scale yet.",
      turn_id: "t-8",
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 4,
    },
    {
      id: "it-5",
      signal_id: "sig-data",
      claim: "Owns data-modeling decisions end to end",
      band: "emerging",
      quote:
        "I've normalized schemas for side projects; owning a migration on a large production table is newer for me.",
      turn_id: "t-10",
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 5,
    },
    {
      id: "it-6",
      signal_id: "sig-k8s",
      claim: "Comfortable operating services on Kubernetes",
      band: "needs_more_evidence",
      quote: null,
      turn_id: null,
      candidate_state: "unreviewed",
      candidate_context: null,
      position: 6,
    },
  ],
  // Kept for shape compatibility; the UI derives live counts from items so the
  // header can never drift from what's actually on screen.
  summary: { supported: 3, emerging: 2, needs_more_evidence: 1, reviewed: 0, total: 6 },
};
