import { Button } from "@/components/ui/Button";

/**
 * Landing hero — one clear promise, two actions, nothing else. No background
 * art, no icon. Typography and whitespace carry it; a visitor should know what
 * we do in a few seconds.
 */
export function PaperHero() {
  return (
    <section className="shell pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="max-w-3xl">
        <p className="eyebrow">Hiring, on the evidence</p>

        <h1 className="mt-5 text-[clamp(2.6rem,1.4rem+4.6vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--ink)]">
          Hiring shouldn&rsquo;t start with a résumé.
        </h1>

        <p className="mt-6 max-w-xl text-[clamp(1.05rem,0.98rem+0.4vw,1.3rem)] leading-relaxed text-[var(--ink-2)]">
          Placedon runs one honest interview, then shows employers what a person can actually do —
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
    </section>
  );
}
