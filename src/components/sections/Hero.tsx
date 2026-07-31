import { HeroField } from "@/components/background/HeroField";
import { HeroSearch } from "@/components/sections/HeroSearch";

/**
 * Hero — an inset dark card with the product's one question inside it.
 *
 * Structure follows the Upwork pattern: a rounded card held in from the page
 * edges, dark media filling it, copy left-aligned over the media, and a
 * search-led call to action rather than a row of buttons.
 *
 * What it replaced: a centred headline inside nine floating cards with two
 * competing CTAs. That layout never asked the visitor which side of the
 * marketplace they were on, which is the first thing a two-sided product has to
 * resolve. PlacedOn has had both sides built for months; the homepage just
 * never forked.
 *
 * The media is generated, not filmed. Upwork runs licensed footage of a real
 * office; there is no equivalent here and borrowing one is not an option, so
 * HeroField renders an owned ink material instead.
 *
 * Server Component. The only client code is the search control and the canvas.
 */

export function Hero() {
  return (
    <section id="top" className="px-3 pt-[84px] md:px-5 md:pt-[92px]">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#0B0A09] md:rounded-[36px]">
        {/* generated ground */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <HeroField />
        </div>

        {/* Legibility floor. The field is quiet by design, but copy must never
            depend on a shader landing in a particular state. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(96deg, rgba(11,10,9,0.95) 0%, rgba(11,10,9,0.86) 34%, rgba(11,10,9,0.45) 62%, rgba(11,10,9,0.10) 100%)",
          }}
        />

        <div className="relative flex min-h-[clamp(520px,70vh,720px)] max-w-[54rem] flex-col justify-center px-6 py-16 md:px-14 md:py-20 lg:px-20">
          <h1
            className="max-w-[17ch] text-[clamp(2.4rem,1.4rem+4.4vw,4.6rem)] font-semibold leading-[1.05] tracking-[-0.015em]"
            /* Colour inline, not via a utility: globals.css carries an
               UNLAYERED `h1 { color: var(--ink) }`, and unlayered rules beat
               layered Tailwind utilities regardless of specificity — a class
               here renders the headline near-black on near-black. */
            style={{ color: "#FBFAF9" }}
          >
            Hire for how people actually work.
          </h1>

          <p className="mt-6 max-w-[52ch] text-[clamp(1rem,0.95rem+0.4vw,1.2rem)] leading-relaxed text-white/72">
            One honest conversation, then a report you can check line by line —
            every score tied back to something they said.
          </p>

          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  );
}
