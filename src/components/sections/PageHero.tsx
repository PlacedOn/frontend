import Link from "next/link";
import type { ReactNode } from "react";
import { HeroField } from "@/components/background/HeroField";

/**
 * Shared inset hero for the audience pages.
 *
 * The homepage hero moved to an inset dark card; /candidates and /companies
 * still opened light and centred, so the site changed character the moment you
 * clicked through. This is the same treatment, factored once rather than
 * pasted twice — the two pages differ only in copy and destination.
 *
 * Deliberately simpler than the homepage hero: no search fork. The visitor has
 * already told us which side they are on by being on this page, so asking again
 * would be a step backwards. One action instead.
 *
 * Server Component; the canvas is the only client code.
 */

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Short reassurance under the actions. Kept to one line. */
  note?: string;
};

export function PageHero({ eyebrow, title, intro, cta, secondary, note }: Props) {
  return (
    <section className="px-3 pt-[84px] md:px-5 md:pt-[92px]">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#0B0A09] md:rounded-[36px]">
        <div aria-hidden className="absolute inset-0 -z-10">
          <HeroField />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(96deg, rgba(11,10,9,0.95) 0%, rgba(11,10,9,0.86) 34%, rgba(11,10,9,0.45) 62%, rgba(11,10,9,0.10) 100%)",
          }}
        />

        <div className="relative flex min-h-[clamp(420px,56vh,560px)] max-w-[54rem] flex-col justify-center px-6 py-16 md:px-14 md:py-20 lg:px-20">
          <p className="text-[12px] uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>

          <h1
            className="mt-4 max-w-[18ch] text-[clamp(2.1rem,1.3rem+3.4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]"
            /* Inline colour: globals.css has an UNLAYERED `h1 { color: var(--ink) }`
               which beats layered Tailwind utilities regardless of specificity,
               so a class here renders near-black on near-black. */
            style={{ color: "#FBFAF9" }}
          >
            {title}
          </h1>

          <p className="mt-5 max-w-[50ch] text-[clamp(1rem,0.95rem+0.35vw,1.15rem)] leading-relaxed text-white/70">
            {intro}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#12100E] transition-colors duration-200 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {cta.label}
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-[15px] font-medium text-white/85 transition-colors duration-200 hover:border-white/50 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {secondary.label}
              </Link>
            )}
          </div>

          {note && <p className="mt-6 text-[13px] text-white/45">{note}</p>}
        </div>
      </div>
    </section>
  );
}
