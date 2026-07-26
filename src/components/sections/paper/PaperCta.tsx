import { Button } from "@/components/ui/Button";

/**
 * Closing call to action — one line, one primary step. The calmest, most
 * confident moment on the page.
 */
export function PaperCta() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-24 sm:py-32">
      <div className="max-w-2xl">
        <h2 className="text-[clamp(2rem,1.3rem+2.6vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Meet people for what they can do.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-2)]">
          Take the interview once, and let your work speak for itself.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/pre-interview" className="!px-6 !py-3.5">
            Take the interview
          </Button>
          <Button href="/companies" variant="ghost" className="!px-6 !py-3.5">
            For hiring teams
          </Button>
        </div>
      </div>
    </section>
  );
}
