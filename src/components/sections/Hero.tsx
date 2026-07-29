import Link from "next/link";
import { HeroField } from "@/components/background/HeroField";

/**
 * Hero — rebuilt on Harvey's structure, measured from their live page.
 *
 * What their hero actually does, and what this now does too:
 *
 *   left-aligned          their h1 computes text-align:start at left:32px,
 *                         width 912 — not centred
 *   dark full-bleed       a deep ground the headline rests on
 *   serif display         set in a serif against a sans body
 *   ONE call to action    a single white button, nothing competing
 *   no decoration         no chips, no icons, no floating cards
 *   proof directly below   customer logos immediately under the fold line
 *
 * What this replaced: a centred headline inside a field of nine floating
 * cards, two competing CTAs, a chip above the title, and icons throughout.
 * That is a different genre of page — consumer SaaS, not enterprise. Changing
 * the palette was never going to fix it, which is why the last few passes
 * looked like "no change".
 *
 * The ground is generated rather than photographed. Harvey uses real footage
 * of real people; PlacedOn has no licensed equivalent and borrowing one is not
 * an option, so HeroField renders an ink material instead.
 *
 * Server Component — nothing here needs state. The only client code is the
 * canvas.
 */

/** Sectors PlacedOn verifies. Not customer logos: there are no customers yet,
 *  and inventing a wall of them is the fastest way to lose an enterprise buyer
 *  who checks one. */
const SECTORS = [
  "Seed–Series C SaaS",
  "Global Capability Centres",
  "Fintech",
  "Health-tech",
  "Deep-tech & AI",
] as const;

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-[#0B0A09]">
      {/* generated ground */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroField />
      </div>

      {/* Legibility floor. The field is deliberately quiet, but a headline must
          never depend on a shader landing in a particular state. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,10,9,0.92) 0%, rgba(11,10,9,0.72) 46%, rgba(11,10,9,0.30) 100%)",
        }}
      />

      <div className="shell relative flex min-h-[88svh] flex-col justify-end pb-16 pt-40 md:min-h-[92svh] md:pb-20">
        <h1
          className="max-w-[15ch] text-[clamp(2.9rem,1.4rem+6.4vw,6rem)] font-normal leading-[0.98] tracking-[-0.02em]"
          /* colour is set inline, not via a utility: globals.css carries an
             UNLAYERED `h1 { color: var(--ink) }`, and unlayered rules beat
             layered Tailwind utilities regardless of specificity. A class here
             renders the headline near-black on a near-black ground. */
          style={{ fontFamily: "var(--font-serif)", color: "#FBFAF9" }}
        >
          See how people actually work.
        </h1>

        <p className="mt-7 max-w-[46ch] text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-relaxed text-white/70">
          One 22-minute conversation, before you hire. Then a report you can
          check line by line — every score tied back to something they said.
        </p>

        <div className="mt-10">
          <Link
            href="/pre-interview"
            className="inline-flex items-center rounded-[var(--r-btn)] bg-[#FBFAF9] px-7 py-4 text-[15px] font-semibold text-[#100F0D] transition-colors duration-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Start an interview
          </Link>
        </div>
      </div>

      {/* Proof strip, directly under the fold — where Harvey puts its logos. */}
      <div className="relative border-t border-white/10">
        <div className="shell flex flex-wrap items-center gap-x-10 gap-y-3 py-6">
          <span className="text-[11.5px] uppercase tracking-[0.16em] text-white/40">
            Hiring teams we verify
          </span>
          {SECTORS.map((s) => (
            <span key={s} className="text-[13.5px] text-white/55">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
