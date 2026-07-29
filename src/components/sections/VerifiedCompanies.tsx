import { Reveal } from "@/components/ui/Reveal";

/**
 * The verification claim.
 *
 * This used to carry two scrolling rows of sector pills. They listed the same
 * five sectors the hero's proof strip lists 200px further up — the same
 * information twice — and each pill wore a violet shield icon, which together
 * made this the most violet surface on the page.
 *
 * Removed: the pill rows, the marquee CSS, the shield icons, and the gradient
 * on "verified". The hero owns the single violet moment on this page; a second
 * one here means neither reads as the accent.
 *
 * What remains is the claim, which is the part that actually builds trust:
 * we check the company is real before a candidate spends an interview on it.
 */
export function VerifiedCompanies() {
  return (
    <section aria-labelledby="verified-heading" className="relative py-20 md:py-28">
      <div className="shell relative z-[1]">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The verification standard</p>
            <h2
              id="verified-heading"
              className="mt-3 text-[clamp(1.8rem,1.2rem+2.4vw,2.9rem)] leading-[1.08]"
            >
              Every company here is verified before a candidate sees the role.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--ink-2)]">
              Identity and domain are checked up front, so no one spends an honest interview on a
              company that isn&rsquo;t real. Confidential roles stay confidential — but they are
              never unverified.
            </p>
            <p className="mt-7 text-[13px] text-[var(--ink-3)]">
              Design-partner marks appear here once they&rsquo;re live, with consent.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
