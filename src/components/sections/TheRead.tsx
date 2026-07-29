"use client";

import { CapabilityGraph } from "@/components/motion/CapabilityGraph";

/**
 * "The read" — the section where the product explains itself.
 *
 * The capability graph belongs here rather than behind the hero: a full-bleed
 * diagram under centred headline copy reads as debris, not explanation. Given
 * its own space and real labels, the same animation becomes the clearest
 * statement of what PlacedOn does.
 *
 * Stages map 1:1 to the graph's three columns.
 */

const STAGES = [
  {
    k: "01",
    title: "The conversation",
    body: "One adaptive interview. No script to game, no résumé to polish — just how someone actually works through a problem.",
  },
  {
    k: "02",
    title: "Evidence",
    body: "Specific moments get lifted out and held onto. Not impressions — things that were said, with a timestamp.",
  },
  {
    k: "03",
    title: "Capability",
    body: "Evidence accumulates into a signal, with a confidence attached. You see the reasoning, not just the number.",
  },
] as const;

export function TheRead() {
  return (
    <section
      aria-labelledby="the-read-heading"
      className="section-rhythm relative overflow-hidden"
    >
      <div className="shell">
        <p className="eyebrow">How it works</p>

        <h2
          id="the-read-heading"
          className="mt-4 max-w-[20ch] text-[length:var(--text-4xl)]"
        >
          A resume tells you where someone <span className="serif-italic">has been</span>.
        </h2>

        <p className="mt-6 max-w-[54ch] text-[length:var(--text-lg)] leading-[var(--leading-normal)] text-[var(--ink-2)]">
          It cannot tell you how they think. This is what we read instead — and
          every step of it stays traceable back to something the candidate said.
        </p>

        {/* The diagram sits on its own surface. The page ground carries an
            ambient node constellation; without a clean plate the two networks
            read as one noisy field and the diagram stops being legible. */}
        <figure className="relative mt-14 overflow-hidden rounded-[var(--r-card)] border border-[var(--border-primary,var(--mist))] bg-[var(--porcelain-2)] shadow-[var(--shadow-sm)]">
          <div className="h-[clamp(240px,28vw,380px)] w-full px-6 py-8 md:px-10">
            <CapabilityGraph className="h-full w-full" />
          </div>

          {/* column captions, anchored to the three stages */}
          <figcaption className="grid grid-cols-3 border-t border-[var(--mist)] text-center">
            {["Conversation", "Evidence", "Capability"].map((c, i) => (
              <span
                key={c}
                className={
                  "px-3 py-3.5 text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--ink-3)]" +
                  (i < 2 ? " border-r border-[var(--mist)]" : "")
                }
              >
                {c}
              </span>
            ))}
          </figcaption>
        </figure>

        {/* stage legend — aligned under the three columns of the graph */}
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {STAGES.map((s) => (
            <li key={s.k}>
              <div className="flex items-baseline gap-3">
                <span className="font-[var(--font-mono)] text-[length:var(--text-xs)] tracking-[var(--tracking-label)] text-[var(--iris-ink)]">
                  {s.k}
                </span>
                <h3 className="text-[length:var(--text-lg)]">{s.title}</h3>
              </div>
              <p className="mt-2.5 text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--ink-2)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
