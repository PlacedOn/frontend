import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Trust band — the one place we state the fairness posture plainly, with links
 * to the real methodology. Calm, factual, no badges-as-decoration.
 */

const POINTS = [
  {
    title: "Audited for bias",
    body: "Independently tested against NYC Local Law 144 and aligned with the EU AI Act. The methodology is public.",
    href: "/trust/ll144",
  },
  {
    title: "College is never an input",
    body: "Where someone studied is blocked from the matching entirely — it can't help or hurt a candidate.",
    href: "/trust",
  },
  {
    title: "No single score",
    body: "We publish evidence and bands, never one number that ranks a human being. People are more than a percentile.",
    href: "/trust/scoring",
  },
];

export function PaperTrust() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <div className="max-w-2xl">
        <h2 className="text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] font-bold leading-tight tracking-[-0.02em]">
          Built to be fair, and on the record.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
          Fairness isn&rsquo;t a marketing line here — it&rsquo;s the architecture. Here&rsquo;s exactly how it holds up.
        </p>
      </div>

      <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="lift rounded-[var(--r-card)] border-t border-[var(--ink)] bg-[var(--white)] p-5">
            <h3 className="text-[1.1rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">{p.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{p.body}</p>
            <Link
              href={p.href}
              className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--iris-ink)]"
            >
              Read the detail <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
