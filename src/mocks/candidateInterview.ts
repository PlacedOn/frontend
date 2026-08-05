/**
 * FIXTURES — an invented interview plan for the candidate dashboard.
 *
 * See src/mocks/README.md. Measured 2026-08-01 against the production Supabase
 * project: `interview_sessions = 0`, `report_card_items = 0`. Nobody has been
 * interviewed. Everything here describes a FORMAT, not a session that happened.
 *
 * ══ NO PERSON ══
 * There is no name, handle, photo, email, or id pointing at anyone — the same
 * rule `traitScores.ts` follows, and for the same reason: a plausible-looking
 * candidate dashboard is precisely the screenshot that ends up in a deck
 * labelled "a real user's results".
 *
 * ══ WHY THE PLAN IS SIX TOPICS AND THE READINGS ARE THREE ══
 * The gap is the demonstration. Three planned topics were never reached, and the
 * dashboard has to render them as an absence — no figure, no track, no dash on a
 * 0–100 scale. Fixtures that covered everything would let the uncovered path
 * ship untested, and that path is the one carrying the product's actual claim.
 */

import type { InterviewTopic } from "@/lib/candidate/coverage";
import type { TraitScore } from "@/types/scoring";
import { FIXTURE_TRAIT_SCORES } from "./traitScores";

/** Required marker for any surface rendering these. */
export const CANDIDATE_FIXTURE_NOTICE =
  "Sample data — an invented interview plan. No interview has been run, for you or for anyone.";

/**
 * The topics one interview intended to reach.
 *
 * `why` is written to the candidate, in the second person, and describes what
 * the topic is FOR. It never says what a good answer looks like — a plan that
 * doubles as a study guide stops measuring anything.
 */
export const FIXTURE_INTERVIEW_PLAN: readonly InterviewTopic[] = [
  {
    traitKey: "handles_ambiguity",
    traitLabel: "Handles ambiguity",
    blockId: 3,
    why: "What you do when the requirement genuinely does not say. Most roles hit this in the first week.",
  },
  {
    traitKey: "gives_direct_feedback",
    traitLabel: "Gives direct feedback",
    blockId: 3,
    why: "Whether disagreement reaches the person who can act on it, and how.",
  },
  {
    traitKey: "mentors_others",
    traitLabel: "Mentors others",
    blockId: 4,
    why: "How you hand work to someone who has not done it before.",
  },
  {
    traitKey: "debugs_systematically",
    traitLabel: "Debugs systematically",
    blockId: 2,
    why: "How you narrow a fault you cannot reproduce, and how you know when you are done.",
  },
  {
    traitKey: "explains_tradeoffs",
    traitLabel: "Explains trade-offs",
    blockId: 2,
    why: "Whether the cost of a decision travels with it to the people who inherit it.",
  },
  {
    traitKey: "scopes_under_pressure",
    traitLabel: "Scopes under pressure",
    blockId: 4,
    why: "What comes out of the plan when the date does not move.",
  },
];

/**
 * The readings this fixture interview produced. Three of the six planned topics.
 *
 * Reused verbatim from `traitScores.ts` rather than copied, so the candidate's
 * own view and the component gallery cannot drift into showing different
 * evidence for the same trait key. They demonstrate all three reading states
 * between them: supported with two citations, emerging with one, and a figure
 * with nothing cited at all.
 */
export const FIXTURE_CANDIDATE_READINGS: readonly TraitScore[] = FIXTURE_TRAIT_SCORES;
