"use client";

import { useState } from "react";
import {
  type Trait,
  CONTEST_REASONS,
  type ContestReason,
  STATE_META,
  displaySummary,
  can,
} from "@/lib/evidence/state";

/**
 * One trait, as a reviewable claim rather than a verdict.
 *
 * The distinction matters: a verdict is something done to you, a claim is
 * something you can examine and answer. Everything here follows from that —
 * the evidence quote is always visible next to the trait so the claim can be
 * judged in context, the contest form opens in place rather than navigating
 * away, and the original wording survives a revision.
 *
 * Actions are gated on `can()` from the state machine, so an illegal move
 * cannot be rendered, let alone taken. The machine is the authority; this is
 * just its surface.
 */

const TONE: Record<string, { fg: string; bg: string }> = {
  neutral: { fg: "var(--ink-3)", bg: "var(--paper-2)" },
  warn: { fg: "#8A5A00", bg: "rgba(245,158,11,0.10)" },
  info: { fg: "var(--accent-ink)", bg: "var(--accent-weak)" },
  good: { fg: "#1B6B3A", bg: "rgba(27,107,58,0.09)" },
  live: { fg: "#fff", bg: "var(--accent)" },
};

const CONFIDENCE_LABEL = {
  emerging: "Emerging",
  supported: "Supported",
  strong: "Strong",
} as const;

export function EvidenceCard({
  trait,
  onAction,
}: {
  trait: Trait;
  onAction: (
    a:
      | { type: "review" }
      | { type: "approve" }
      | { type: "keepPrivate" }
      | { type: "contest"; reason: ContestReason; note?: string }
      | { type: "revise"; summary: string }
      | { type: "share" }
      | { type: "unshare" },
  ) => void;
}) {
  const [contesting, setContesting] = useState(false);
  const [reason, setReason] = useState<ContestReason | null>(null);
  const [note, setNote] = useState("");
  const [revising, setRevising] = useState(false);
  const [revision, setRevision] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);

  const meta = STATE_META[trait.state];
  const tone = TONE[meta.tone];

  return (
    <article
      className="rounded-[var(--r-card,20px)] bg-[var(--paper)] p-5"
      style={{ border: "1px solid var(--line)" }}
    >
      {/* header — trait, confidence, state */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>
            {trait.name}
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {displaySummary(trait)}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {meta.label}
        </span>
      </div>

      {/* what this state means for sharing — said plainly, every time */}
      <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
        {meta.meaning}
      </p>

      {/* the evidence. Always visible — a claim you cannot inspect is a verdict. */}
      <figure
        className="mt-4 rounded-[var(--r-md,12px)] px-4 py-3.5"
        style={{ background: "var(--paper-2)", borderLeft: "2px solid var(--accent)" }}
      >
        <blockquote className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          &ldquo;{trait.source.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-2 text-[12px]" style={{ color: "var(--ink-3)" }}>
          From your answer at {trait.source.moment}
          {trait.confidence && ` · ${CONFIDENCE_LABEL[trait.confidence]} signal`}
          {!trait.confidence && " · Not enough data to rate confidence yet"}
        </figcaption>
      </figure>

      {/* a revision keeps its original reachable, not overwritten */}
      {trait.previous && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="cursor-pointer text-[12.5px] underline decoration-dotted underline-offset-2"
            style={{ color: "var(--ink-3)" }}
            aria-expanded={showOriginal}
          >
            {showOriginal ? "Hide" : "Show"} what we originally said
          </button>
          {showOriginal && (
            <p
              className="mt-2 rounded-[var(--r-sm,8px)] px-3 py-2 text-[13px] leading-relaxed"
              style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}
            >
              {trait.previous.summary}
            </p>
          )}
        </div>
      )}

      {/* contest form — opens in place, evidence stays on screen */}
      {contesting && (
        <div className="mt-4 rounded-[var(--r-md,12px)] p-4" style={{ background: "var(--paper-2)" }}>
          <p className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
            What&rsquo;s wrong with this?
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {CONTEST_REASONS.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                <input
                  type="radio"
                  name={`reason-${trait.id}`}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="accent-[var(--accent)]"
                />
                <span style={{ color: "var(--ink-2)" }}>{r.label}</span>
              </label>
            ))}
          </div>

          <label htmlFor={`note-${trait.id}`} className="mt-3.5 block text-[12.5px]" style={{ color: "var(--ink-3)" }}>
            Anything you want to add? (optional)
          </label>
          <textarea
            id={`note-${trait.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-[var(--r-sm,8px)] px-3 py-2 text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2"
            style={{ border: "1px solid var(--line-2)", color: "var(--ink)", outlineColor: "var(--accent)" }}
          />

          <p className="mt-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
            This stays private while you sort it out. Nothing goes to an employer.
          </p>

          <div className="mt-3.5 flex gap-2">
            <button
              type="button"
              disabled={!reason}
              onClick={() => {
                if (!reason) return;
                onAction({ type: "contest", reason, note: note.trim() || undefined });
                setContesting(false);
              }}
              className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setContesting(false)}
              className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-medium"
              style={{ color: "var(--ink-2)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* revise — the candidate's own wording */}
      {revising && (
        <div className="mt-4 rounded-[var(--r-md,12px)] p-4" style={{ background: "var(--paper-2)" }}>
          <label htmlFor={`rev-${trait.id}`} className="block text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
            How would you put it?
          </label>
          <textarea
            id={`rev-${trait.id}`}
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            rows={2}
            placeholder="In your words…"
            className="mt-2 w-full rounded-[var(--r-sm,8px)] px-3 py-2 text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2"
            style={{ border: "1px solid var(--line-2)", color: "var(--ink)", outlineColor: "var(--accent)" }}
          />
          <p className="mt-2.5 text-[12px]" style={{ color: "var(--ink-3)" }}>
            We keep the original too, so the change is on the record.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={!revision.trim()}
              onClick={() => {
                onAction({ type: "revise", summary: revision.trim() });
                setRevising(false);
              }}
              className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Save my wording
            </button>
            <button
              type="button"
              onClick={() => setRevising(false)}
              className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-medium"
              style={{ color: "var(--ink-2)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* actions — rendered only if the machine permits them */}
      {!contesting && !revising && (
        <div className="mt-4 flex flex-wrap gap-2">
          {can(trait, "review") && (
            <Action primary onClick={() => onAction({ type: "review" })}>
              Review this
            </Action>
          )}
          {can(trait, "approve") && (
            <Action primary onClick={() => onAction({ type: "approve" })}>
              Looks right
            </Action>
          )}
          {can(trait, "contest") && <Action onClick={() => setContesting(true)}>Contest</Action>}
          {can(trait, "revise") && <Action onClick={() => setRevising(true)}>Reword it</Action>}
          {can(trait, "keepPrivate") && (
            <Action onClick={() => onAction({ type: "keepPrivate" })}>Keep private</Action>
          )}
          {can(trait, "unshare") && (
            <Action onClick={() => onAction({ type: "unshare" })}>Stop sharing</Action>
          )}
        </div>
      )}
    </article>
  );
}

function Action({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors duration-[var(--dur-fast,150ms)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={
        primary
          ? { background: "var(--accent)", color: "#fff", outlineColor: "var(--accent)" }
          : {
              background: "transparent",
              color: "var(--ink-2)",
              border: "1px solid var(--line-2)",
              outlineColor: "var(--accent)",
            }
      }
    >
      {children}
    </button>
  );
}
