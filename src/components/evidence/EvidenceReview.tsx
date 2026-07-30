"use client";

import { useMemo, useState } from "react";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import {
  type Trait,
  type EvidenceAction,
  transition,
  nextAction,
  isVisibleToEmployers,
} from "@/lib/evidence/state";

/**
 * The evidence review screen — the trust moment in the whole product.
 *
 * A candidate has just spent 22 minutes talking. This is where they find out
 * what was heard and decide what an employer gets to see. If this screen feels
 * like a verdict being handed down, the product has failed regardless of how
 * good the model is.
 *
 * Three decisions worth naming:
 *
 * 1. The sharing count is derived from state, never stored separately. There is
 *    exactly one source of truth for "what is visible", and it is the machine.
 *
 * 2. The next action is computed, not hardcoded. A candidate should never have
 *    to work out what to do next on a screen this consequential.
 *
 * 3. Nothing bulk-approves. There is no "approve all" button, because the point
 *    of the screen is that each claim is looked at. A single button that shares
 *    everything would undo the entire design.
 *
 * State is local. There is no write endpoint for evidence approval yet
 * (POST /v1/candidate/evidence/{id}/state does not exist), and pretending to
 * persist something this consequential would be worse than being clear that it
 * resets. Wiring it is one call per action once the endpoint lands.
 */

const SAMPLE: Trait[] = [
  {
    id: "t1",
    name: "Structured thinking",
    summary: "You broke the problem into smaller parts before committing to an approach.",
    source: {
      quote:
        "I'd start by working out whether it's a read problem or a write problem, because the fix is completely different — then I'd look at what the traffic actually does before touching the schema.",
      moment: "08:12",
    },
    confidence: "strong",
    state: "pending",
  },
  {
    id: "t2",
    name: "Owns the problem",
    summary: "You stayed with the failure until it was understood, rather than handing it on.",
    source: {
      quote:
        "It was technically another team's service, but the customer didn't care whose it was, so I sat with their on-call until we found it.",
      moment: "14:39",
    },
    confidence: "supported",
    state: "pending",
  },
  {
    id: "t3",
    name: "Communicates under pressure",
    summary: "You explained a tradeoff plainly while the incident was still open.",
    source: {
      quote: "I told them we could have it fast or have it right, and that I'd rather explain a delay than an outage.",
      moment: "19:02",
    },
    confidence: null,
    state: "pending",
  },
];

export function EvidenceReview() {
  const [traits, setTraits] = useState<Trait[]>(SAMPLE);

  const apply = (id: string, action: EvidenceAction) =>
    setTraits((prev) => prev.map((t) => (t.id === id ? transition(t, action) : t)));

  // Derived, never stored. One source of truth for what an employer can see.
  const shared = useMemo(() => traits.filter(isVisibleToEmployers).length, [traits]);
  const next = useMemo(() => nextAction(traits), [traits]);

  return (
    <div className="mx-auto w-full max-w-[860px] px-5 py-12 md:px-8 md:py-16">
      <p className="text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
        Your interview
      </p>
      <h1 className="mt-3 text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)] font-semibold tracking-[-0.022em]" style={{ color: "var(--ink)" }}>
        Here&rsquo;s what we heard.
      </h1>
      <p className="mt-4 max-w-[56ch] text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Every trait below points back to something you actually said. Read the
        quote, and tell us if we got it wrong — you decide what an employer sees.
      </p>

      {/* Sharing state, stated plainly and always visible. */}
      <div
        className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-md,12px)] px-4 py-3.5"
        style={{ background: shared === 0 ? "var(--paper-2)" : "var(--accent-weak)", border: "1px solid var(--line)" }}
      >
        <p className="text-[14px]" style={{ color: "var(--ink-2)" }}>
          {shared === 0 ? (
            <>
              <strong style={{ color: "var(--ink)" }}>Nothing is shared yet.</strong> No employer
              can see any of this.
            </>
          ) : (
            <>
              <strong style={{ color: "var(--ink)" }}>
                {shared} of {traits.length} shared.
              </strong>{" "}
              Only what you approved is visible.
            </>
          )}
        </p>
        {next && (
          <span className="text-[13px] font-semibold" style={{ color: "var(--accent-ink)" }}>
            Next: {next.label} ({next.count})
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {traits.map((t) => (
          <EvidenceCard key={t.id} trait={t} onAction={(a) => apply(t.id, a)} />
        ))}
      </div>

      <p className="mt-8 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
        Sample evidence, shown to demonstrate the review flow. Approvals here
        reset on reload — the write endpoint isn&rsquo;t built yet, and we&rsquo;d rather say
        so than imply your choices were saved.
      </p>
    </div>
  );
}
