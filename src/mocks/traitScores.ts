/**
 * FIXTURES — invented sample data. Not real interview output.
 *
 * See src/mocks/README.md. Measured 2026-08-01: interview_sessions = 0,
 * report_card_items = 0. There is nothing real to show yet.
 *
 * Deliberately contains NO person: no name, no photo, no identifier. These are
 * trait readings and quotes standing alone. Anything that made this look like a
 * specific candidate would eventually be screenshotted and mistaken for a real
 * assessment.
 */

import type { TraitScore } from "@/types/scoring";

/** Marks any surface rendering fixtures. Components must display this. */
export const FIXTURE_NOTICE = "Sample data — illustrates the format, not a real assessment.";

/**
 * One trait per confidence band, so all three states are always visible
 * together. The intervals widen as confidence drops — that relationship is the
 * whole point of the component and the fixtures have to demonstrate it.
 */
export const FIXTURE_TRAIT_SCORES: readonly TraitScore[] = [
  {
    id: "fixture-trait-1",
    blockId: 3,
    traitKey: "handles_ambiguity",
    traitLabel: "Handles ambiguity",
    point: 74,
    bandLow: 69,
    bandHigh: 79,
    confidence: "supported",
    interviewId: null,
    createdAt: "2026-08-01T09:12:00.000Z",
    evidence: [
      {
        id: "fixture-span-1",
        transcriptId: "fixture-transcript-1",
        quote:
          "The spec never actually said what should happen on a partial failure, so I wrote down the three readings I could defend, picked the one that failed safe, and flagged the other two in the PR rather than guessing quietly.",
        startMs: 412_000,
        endMs: 431_000,
      },
      {
        id: "fixture-span-2",
        transcriptId: "fixture-transcript-1",
        quote:
          "I'd rather ship the narrow version I understand than the broad version I'm assuming my way through.",
        startMs: 688_000,
        endMs: 697_000,
      },
    ],
  },
  {
    id: "fixture-trait-2",
    blockId: 3,
    traitKey: "gives_direct_feedback",
    traitLabel: "Gives direct feedback",
    point: 61,
    bandLow: 48,
    bandHigh: 74,
    confidence: "emerging",
    interviewId: null,
    createdAt: "2026-08-01T09:12:00.000Z",
    evidence: [
      {
        id: "fixture-span-3",
        transcriptId: "fixture-transcript-1",
        quote:
          "I told him the approach wouldn't hold at ten times the traffic. He disagreed, so we load-tested it — turned out we were both wrong about where it broke.",
        startMs: 1_204_000,
        endMs: 1_219_000,
      },
    ],
  },
  {
    id: "fixture-trait-3",
    blockId: 4,
    traitKey: "mentors_others",
    traitLabel: "Mentors others",
    point: 52,
    bandLow: 33,
    bandHigh: 71,
    confidence: "needs_more_evidence",
    interviewId: null,
    createdAt: "2026-08-01T09:12:00.000Z",
    evidence: [],
  },
];
