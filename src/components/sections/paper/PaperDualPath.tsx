import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Two audiences, one honest split. Plain columns — a heading, a few real
 * points, a link. No decorative art; the words do the work.
 */

const CANDIDATE = {
  eyebrow: "For candidates",
  title: "Be seen for what you can do.",
  points: [
    "One interview instead of a dozen screens.",
    "Your evidence, in your words — you approve what employers see.",
    "Where you studied is never used to judge you.",
  ],
  href: "/candidates",
  cta: "How it works for you",
};

const TEAM = {
  eyebrow: "For hiring teams",
  title: "Shortlist on evidence, not guesswork.",
  points: [
    "Every candidate arrives with quoted, role-relevant proof.",
    "Ask in plain language; get people, ranked on the work.",
    "Fair by design, and auditable when you need it to be.",
  ],
  href: "/companies",
  cta: "How it works for teams",
};

function Column({ data }: { data: typeof CANDIDATE }) {
  return (
    <div className="flex flex-col">
      <p className="eyebrow">{data.eyebrow}</p>
      <h3 className="mt-4 text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
        {data.title}
      </h3>
      <ul className="mt-6 flex flex-col gap-3">
        {data.points.map((p) => (
          <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
            <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-[var(--ink-3)]" />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={data.href}
        className="mt-7 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--iris-ink)]"
      >
        {data.cta} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export function PaperDualPath() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <div className="grid gap-x-16 gap-y-14 sm:grid-cols-2">
        <Column data={CANDIDATE} />
        <Column data={TEAM} />
      </div>
    </section>
  );
}
