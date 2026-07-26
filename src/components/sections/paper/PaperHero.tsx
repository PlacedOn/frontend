import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { CapabilityGraph } from "./CapabilityGraph";

/**
 * Landing hero — one clear promise beside the signature capability graph.
 * Typography leads; the graph shows, rather than tells, what we do.
 */
export function PaperHero() {
  return (
    <section className="shell pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <Reveal>
          <div className="max-w-xl">
            <p className="eyebrow">AI interviews for hiring teams</p>

            <h1 className="mt-5 text-[clamp(2.5rem,1.4rem+4.2vw,4.4rem)] font-bold leading-[1.03] tracking-[-0.03em] text-[var(--ink)]">
              Built for Talent.
              <br />
              Powered by Precision.
            </h1>

            <p className="mt-5 max-w-xl text-[clamp(1.2rem,1rem+0.8vw,1.6rem)] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)]">
              Stop hiring by paper. Start hiring by people.
            </p>

            <p className="mt-4 max-w-xl text-[clamp(1rem,0.96rem+0.3vw,1.15rem)] leading-relaxed text-[var(--ink-2)]">
              PlacedOn interviews every candidate with adaptive AI, then shows you what they can
              actually do — backed by the evidence behind it. No single score. No pedigree filter.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/companies" className="!px-6 !py-3.5">
                Book a demo
              </Button>
              <Button href="/pre-interview" variant="ghost" className="!px-6 !py-3.5">
                Try the interview
              </Button>
            </div>

            <p className="mt-8 text-[13.5px] text-[var(--ink-3)]">
              Bias-audited to NYC Local Law 144 and the EU AI Act. You approve every introduction.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:pl-6">
          <CapabilityGraph />
        </Reveal>
      </div>
    </section>
  );
}
