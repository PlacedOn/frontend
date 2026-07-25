import Link from "next/link";
import { ArrowRight, Building2, UserRound, Check } from "lucide-react";

/**
 * The two doors, stated plainly near the top of the page — the way Upwork
 * splits clients vs talent. Editorial, monochrome; one card inverts to ink for
 * a deliberate asymmetry (Scale-style) rather than two identical tiles.
 */
const TEAM_POINTS = [
  "Define the role in plain language — the AI builds the interview from it",
  "Get an evidence-ranked shortlist, every trait quoted from a transcript",
  "Bias-audited by design: nine demographic inputs are blocked",
];
const CANDIDATE_POINTS = [
  "One 25–30 min conversation — no résumé, no timer, no trick questions",
  "Your evidence is matched to every role you fit; interview once",
  "Nothing is shared with any employer until you approve it",
];

export function DualPath() {
  return (
    <section aria-labelledby="dualpath-heading" className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <p className="eyebrow">Two sides, one honest signal</p>
      <h2 id="dualpath-heading" className="mt-2 max-w-2xl text-[clamp(1.8rem,1.3rem+2vw,3rem)] tracking-tight text-[var(--ink)]">
        Whether you&apos;re hiring or being hired.
      </h2>

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {/* For teams — inverted ink card */}
        <div className="flex flex-col rounded-[var(--r-card)] p-8" style={{ background: "var(--instrument)", color: "var(--instrument-ink)" }}>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[12px] border" style={{ borderColor: "var(--instrument-line)", background: "var(--vitrine)" }}>
              <Building2 size={20} strokeWidth={1.75} className="text-white" aria-hidden />
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--instrument-ink-2)" }}>For hiring teams</span>
          </div>
          <h3 className="mt-5 text-[22px] font-bold leading-snug text-white">Hire for how people actually think.</h3>
          <ul className="mt-5 flex-1 space-y-3">
            {TEAM_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed">
                <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-white" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Link href="/companies" className="mt-7 inline-flex w-fit items-center gap-2 rounded-[var(--r-btn)] bg-white px-5 py-3 text-[14px] font-bold text-[var(--ink)] transition-transform active:scale-[0.98]">
            For teams <ArrowRight size={15} />
          </Link>
        </div>

        {/* For candidates — paper card */}
        <div className="glass flex flex-col rounded-[var(--r-card)] p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[12px] border" style={{ borderColor: "var(--line-2)", background: "var(--paper-3)" }}>
              <UserRound size={20} strokeWidth={1.75} className="text-[var(--ink)]" aria-hidden />
            </span>
            <span className="eyebrow">For candidates</span>
          </div>
          <h3 className="mt-5 text-[22px] font-bold leading-snug text-[var(--ink)]">You&apos;re more than your résumé.</h3>
          <ul className="mt-5 flex-1 space-y-3">
            {CANDIDATE_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--ink-2)]">
                <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--ink)]" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Link href="/candidates" className="mt-7 inline-flex w-fit items-center gap-2 rounded-[var(--r-btn)] border px-5 py-3 text-[14px] font-bold text-[var(--ink)] transition-transform active:scale-[0.98]" style={{ borderColor: "var(--line-2)", background: "var(--paper)" }}>
            For candidates <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
