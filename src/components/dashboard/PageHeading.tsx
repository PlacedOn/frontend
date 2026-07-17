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
    <header className="mb-8 md:mb-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-2)]">{intro}</p>}
    </header>
  );
}
