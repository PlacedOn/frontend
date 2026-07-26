import { Reveal } from "@/components/motion/Reveal";
import { HeroPrompt } from "./HeroPrompt";
import { HeroField } from "./HeroField";

/**
 * Landing hero — the promise, then a working product surface. Describe who you
 * want to hire and get evidence-ranked candidates right here (OpenAI/Scale
 * "describe → results" pattern). The product is the hero, not a picture of it.
 */
export function PaperHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 text-center sm:pt-40">
      <HeroField />
      <div className="shell relative">
      <Reveal className="mx-auto max-w-3xl">
        <p className="eyebrow">AI interviews for hiring teams</p>

        <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,1.4rem+4.4vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--ink)]">
          Built for Talent. Powered by Precision.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[clamp(1.15rem,1rem+0.7vw,1.5rem)] font-semibold leading-snug tracking-[-0.01em] text-[var(--ink)]">
          Stop hiring by paper. Start hiring by people.
        </p>

        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--ink-2)]">
          Describe who you&rsquo;re looking for. We&rsquo;ll surface people by what they can actually
          do — evidence, not resumes.
        </p>
      </Reveal>

      <Reveal delay={0.12} className="mt-9">
        <HeroPrompt />
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mx-auto mt-9 max-w-md text-[13px] text-[var(--ink-3)]">
          Bias-audited to NYC Local Law 144 and the EU AI Act. You approve every introduction.
        </p>
      </Reveal>
      </div>
    </section>
  );
}
