import type { ReactNode } from "react";

/**
 * Sub-route hero inside the dashboard shell — the eyebrow/title/intro block that
 * RoutePage used to provide, minus the page chrome (the shell supplies the
 * background, nav, max-width, and padding).
 */
export function PageHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
}) {
  return (
    // A dashboard page title is a label, not a headline. At the old
    // clamp(...,3rem) it outweighed the actual work on the page — the reader
    // arrived and the loudest thing was the word "Overview" rather than what
    // needed doing. Marketing pages set their own headline sizes; this is
    // deliberately quiet so content leads.
    <header className="mb-7 md:mb-9">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 max-w-3xl text-[clamp(1.375rem,1.15rem+0.8vw,1.75rem)] tracking-[-0.02em]">
        {title}
      </h1>
      {intro && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-2)]">{intro}</p>
      )}
    </header>
  );
}
