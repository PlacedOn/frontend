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
            <p className="eyebrow">Hiring, on the evidence</p>

            <h1 className="mt-5 text-[clamp(2.5rem,1.4rem+4.2vw,4.4rem)] font-bold leading-[1.03] tracking-[-0.03em] text-[var(--ink)]">
              Built for Talent.
              <br />
              Powered by Precision.
            </h1>

            <p className="mt-6 max-w-xl text-[clamp(1.05rem,0.98rem+0.4vw,1.3rem)] leading-relaxed text-[var(--ink-2)]">
              PlacedOn runs one honest interview, then shows employers what a person can actually do —
              with the evidence to back it up. No single score. No pedigree filter.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/pre-interview" className="!px-6 !py-3.5">
                Take the interview
              </Button>
              <Button href="/companies" variant="ghost" className="!px-6 !py-3.5">
                For hiring teams
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
