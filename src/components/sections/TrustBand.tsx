import Link from "next/link";
import { Scale, ShieldCheck, FileSearch, ArrowUpRight } from "lucide-react";

/**
 * Defensibility, stated with real substance (Scale/Upwork lead with trust, not
 * decoration). Points at the actual /trust pages the app already ships. Quiet
 * monochrome; hairline-ruled columns rather than colored cards.
 */
const PILLARS = [
  {
    icon: Scale,
    kicker: "NYC Local Law 144",
    title: "Independently bias-audited",
    body: "Every scored dimension is monitored for adverse impact using the EEOC four-fifths rule and significance testing — on the pipeline's behaviour, never on a person.",
    href: "/trust/ll144",
    link: "Read the LL144 summary",
  },
  {
    icon: ShieldCheck,
    kicker: "EU AI Act",
    title: "Aligned to high-risk obligations",
    body: "Human oversight, transparency, and contestability are built in — including nine demographic inputs (caste, college, gender, age, name…) blocked by design.",
    href: "/trust/eu-ai-act",
    link: "See the EU AI Act mapping",
  },
  {
    icon: FileSearch,
    kicker: "Evidence, not a score",
    title: "Every trait traces to a transcript",
    body: "There is no single blended number. Each strength links to a specific moment a candidate said it, and the candidate can add context, dispute, or hide any item.",
    href: "/trust/scoring",
    link: "How scoring works",
  },
];

export function TrustBand() {
  return (
    <section aria-labelledby="trust-heading" className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="max-w-2xl">
        <p className="eyebrow">Trust &amp; compliance</p>
        <h2 id="trust-heading" className="mt-2 text-[clamp(1.8rem,1.3rem+2vw,3rem)] tracking-tight text-[var(--ink)]">
          Built to be defensible.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
          Hiring decisions get challenged. Placedon is designed so yours hold up — every claim evidenced, every model behaviour audited, nothing hidden.
        </p>
      </div>

      <div className="mt-10 grid gap-x-10 gap-y-10 border-t pt-10 md:grid-cols-3" style={{ borderColor: "var(--line-2)" }}>
        {PILLARS.map((p) => (
          <div key={p.kicker} className="flex flex-col">
            <p.icon size={22} strokeWidth={1.6} className="text-[var(--ink)]" aria-hidden />
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{p.kicker}</p>
            <h3 className="mt-1.5 text-[17px] font-bold leading-snug text-[var(--ink)]">{p.title}</h3>
            <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-[var(--ink-2)]">{p.body}</p>
            <Link href={p.href} className="mt-4 inline-flex w-fit items-center gap-1 text-[13.5px] font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
              {p.link} <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
