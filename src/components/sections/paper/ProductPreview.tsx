import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

/**
 * Product-preview imagery — an original, in-brand rendering of the evidence
 * report a hiring team actually sees. Not a stock photo, not a mockup image:
 * real product UI as the hero visual (the Harvey/Scale/Stripe approach), with
 * 3D tilt depth and floating trust chips. Everything is our own design system.
 */

const TRAITS = [
  {
    trait: "Structured debugging",
    band: "Supported",
    pct: 92,
    quote: "I reproduced the failure in isolation before touching the API layer, so I could prove the fix.",
  },
  {
    trait: "Ownership under pressure",
    band: "Supported",
    pct: 88,
    quote: "During the outage I froze deploys first, then bisected — restoring service beat root cause.",
  },
  {
    trait: "Communication",
    band: "Emerging",
    pct: 64,
    quote: "I wrote the failing test first so the bug would prove itself gone before I changed anything.",
  },
];

export function ProductPreview() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* copy */}
        <Reveal>
          <div className="max-w-md">
            <p className="eyebrow">What your team sees</p>
            <h2 className="mt-3 text-[clamp(1.9rem,1.3rem+2.2vw,2.9rem)] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
              The evidence, not the resume.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
              Every trait links back to the candidate&rsquo;s own words from the interview. You see
              what they can do and the proof behind it — bands and quotes, never a single score.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {["Each strength is quoted, not asserted", "Gaps are honest and specific", "The candidate approves what's shared"].map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-[var(--ink-3)]" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/companies" className="mt-7 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--ink)] transition-colors hover:text-[var(--iris-ink)]">
              See how hiring teams use it <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        {/* the product preview */}
        <Reveal delay={0.12}>
          <TiltCard max={5} className="relative">
            <div className="glass overflow-hidden rounded-[var(--r-card)]" style={{ boxShadow: "var(--shadow-lg)" }}>
              {/* window bar */}
              <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--glass-line)", background: "var(--mist)" }}>
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--glass-line-hi)" }} />
                </span>
                <span className="ml-2 text-[11.5px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                  Evidence report · Backend Engineer
                </span>
              </div>

              {/* body */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full text-[13px] font-bold text-[var(--white)]" style={{ background: "var(--ink)" }}>
                      AK
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--ink)]">Candidate</p>
                      <p className="text-[12px] text-[var(--ink-3)]">Interviewed · 8 signals covered</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-[var(--iris-ink)]" style={{ background: "var(--iris-ghost)" }}>
                    Strong evidence
                  </span>
                </div>

                <ul className="mt-5 flex flex-col gap-4">
                  {TRAITS.map((t) => (
                    <li key={t.trait}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13.5px] font-semibold text-[var(--ink)]">{t.trait}</span>
                        <span className="shrink-0 text-[11.5px] font-semibold text-[var(--ink-3)]">{t.band}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                        <span className="block h-full rounded-full" style={{ width: `${t.pct}%`, background: t.band === "Supported" ? "var(--iris)" : "var(--ink-3)" }} />
                      </div>
                      <p className="mt-2 border-l-2 pl-3 text-[12.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t pt-4 text-[12px] text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line)" }}>
                  Bands and quotes only — never a single score. Shared with your approval.
                </p>
              </div>
            </div>

            {/* floating trust chips at depth (pop on tilt) */}
            <div className="pointer-events-none absolute -left-4 top-16 hidden sm:block" style={{ transform: "translateZ(46px)" }}>
              <span className="glass rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-[var(--ink-2)]" style={{ boxShadow: "var(--shadow-md)" }}>
                Bias-audited
              </span>
            </div>
            <div className="pointer-events-none absolute -right-3 bottom-16 hidden sm:block" style={{ transform: "translateZ(32px)" }}>
              <span className="glass rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-[var(--ink-2)]" style={{ boxShadow: "var(--shadow-md)" }}>
                Evidence-linked
              </span>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}
