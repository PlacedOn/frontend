"use client";

/**
 * Social proof, told honestly. PlacedOn is pre-launch, so there is no wall of
 * borrowed customer logos here (see KineticMarquee — same principle). Instead we
 * surface the real thing that makes a company trustworthy on this platform: every
 * hiring org is identity-verified before a candidate ever sees the role. The tiles
 * name the *kinds* of employers the verification standard covers — illustrative,
 * not claimed customers. Swap in real design-partner marks (with consent) via
 * VERIFIED_TILES once they exist.
 */

import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

// Illustrative range of verified employer types — NOT claimed customers.
const VERIFIED_TILES = [
  "Seed–Series C SaaS",
  "Global Capability Centres",
  "IT Services",
  "Fintech",
  "D2C & Commerce",
  "Health-tech",
  "Deep-tech & AI",
  "Design Studios",
  "Staffing Partners",
  "Public-sector Tech",
];

function Tile({ label }: { label: string }) {
  return (
    <span className="verified-tile">
      <ShieldCheck size={15} className="shrink-0 text-[var(--iris)]" aria-hidden />
      <span className="whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em] text-[var(--ink-2)]">
        {label}
      </span>
    </span>
  );
}

function Row({ reverse }: { reverse?: boolean }) {
  return (
    <div
      className="verified-marquee"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className={`verified-track${reverse ? " verified-track--rev" : ""}`}>
        {[...VERIFIED_TILES, ...VERIFIED_TILES].map((label, i) => (
          <Tile key={`${label}-${i}`} label={label} />
        ))}
      </div>
    </div>
  );
}

export function VerifiedCompanies() {
  return (
    <section aria-labelledby="verified-heading" className="relative overflow-hidden py-20 md:py-24">
      <div className="shell relative z-[1]">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The verification standard</p>
            <h2
              id="verified-heading"
              className="mt-3 text-[clamp(1.8rem,1.2rem+2.4vw,2.9rem)] leading-[1.08]"
            >
              Every company here is <span className="grad-iris">verified</span> before a candidate
              sees the role.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--ink-2)]">
              Identity and domain are checked up front, so no one spends an honest interview on a
              company that isn&rsquo;t real. Confidential roles stay confidential — but they are never
              unverified.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <div className="mt-12 flex flex-col gap-4">
          <Row />
          <Row reverse />
        </div>
        <p className="shell mt-8 text-center text-[12.5px] text-[var(--ink-3)]">
          Illustrative of the employers our verification covers · design-partner marks appear here
          once they&rsquo;re live, with consent.
        </p>
      </Reveal>

      {/* Self-contained marquee CSS — compositor-only transform, reduced-motion safe. */}
      <style>{`
        .verified-marquee { overflow: hidden; }
        .verified-track {
          display: flex;
          width: max-content;
          gap: 0.9rem;
          padding-inline: 0.45rem;
          animation: verified-scroll 42s linear infinite;
          will-change: transform;
        }
        .verified-track--rev { animation-direction: reverse; }
        .verified-marquee:hover .verified-track { animation-play-state: paused; }
        .verified-tile {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: var(--r-chip);
          background: var(--glass-hi);
          border: 1px solid var(--glass-line);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(10px);
        }
        @keyframes verified-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .verified-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
