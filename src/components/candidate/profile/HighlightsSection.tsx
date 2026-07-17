"use client";

import { Plus, Quote, Trash2 } from "lucide-react";
import type { CandidateProfile, ExperienceHighlight } from "@/lib/v1";
import { FieldLabel, INPUT_CLS, INPUT_STYLE, SectionCard } from "./kit";

type Props = {
  profile: CandidateProfile;
  update: (patch: Partial<CandidateProfile>) => void;
};

const MAX_HIGHLIGHTS = 2;

/** Step 4 — 1–2 pieces of work the candidate wants to talk about. Seeds the interview's opening questions. */
export function HighlightsSection({ profile, update }: Props) {
  const highlights = profile.highlights;

  const setHighlight = (index: number, patch: Partial<ExperienceHighlight>) =>
    update({ highlights: highlights.map((h, i) => (i === index ? { ...h, ...patch } : h)) });
  const removeHighlight = (id: string) => update({ highlights: highlights.filter((h) => h.id !== id) });
  const addHighlight = () =>
    update({
      highlights: [
        ...highlights,
        {
          id: `h-${Date.now()}`,
          title: "",
          context: "",
          role_family_hint: profile.target_roles[0] ?? null,
        },
      ],
    });

  return (
    <SectionCard
      id="highlights"
      step={4}
      kicker="Highlights"
      title="Two stories worth telling"
      note="Pick work you can talk about for five minutes. Your interview opens with these — so choose the stories that show you at your best."
      aside={
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
          style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
        >
          <Quote className="h-3.5 w-3.5" aria-hidden />
          {highlights.length}/{MAX_HIGHLIGHTS} interview openers
        </span>
      }
    >
      <div className="grid gap-4">
        {highlights.map((h, i) => (
          <div
            key={h.id}
            className="relative rounded-[1.25rem] border p-5"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--iris-ink)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Opener {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeHighlight(h.id)}
                aria-label={`Remove highlight ${i + 1}`}
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <label className="block">
              <FieldLabel>What you did</FieldLabel>
              <input
                value={h.title}
                onChange={(e) => setHighlight(i, { title: e.target.value })}
                placeholder="e.g. Fixed a duplicate-charge incident in payments"
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </label>
            <label className="mt-4 block">
              <FieldLabel hint="1–2 lines — the interview digs into the rest">Why it mattered</FieldLabel>
              <textarea
                value={h.context}
                onChange={(e) => setHighlight(i, { context: e.target.value })}
                rows={2}
                placeholder="The tricky part, the decision you made, what changed."
                className={`${INPUT_CLS} resize-y leading-6`}
                style={INPUT_STYLE}
              />
            </label>
          </div>
        ))}

        {highlights.length < MAX_HIGHLIGHTS && (
          <button
            type="button"
            onClick={addHighlight}
            className="group flex cursor-pointer items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-5 py-5 text-[14px] font-bold text-[var(--ink-2)] transition-colors hover:border-solid hover:bg-white hover:text-[var(--iris-ink)]"
            style={{ borderColor: "var(--glass-line-hi)" }}
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden />
            {highlights.length === 0 ? "Add your first story" : "Add a second story"}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
