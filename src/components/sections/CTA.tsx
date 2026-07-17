"use client";

import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Globe } from "@/components/ui/globe";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

/*
 * Closing CTA. Appealing medium-violet card (no deep storm), with a slowly
 * rotating globe drifting behind the copy on the right as the motion graphic,
 * and the shared glass buttons for the actions.
 */
export function CTA() {
  const { open } = useDemoDialog();

  return (
    <section id="trust" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[calc(var(--r-card)+12px)] px-8 py-14 md:px-16 md:py-20"
            style={{
              background:
                "linear-gradient(118deg, #8f61f7 0%, #7c48f1 46%, #6b38e6 108%)",
              boxShadow: "0 34px 80px -34px rgba(110,60,230,0.55)",
            }}
          >
            {/* rotating globe motion graphic, behind the copy on the right */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[-10%] top-1/2 hidden aspect-square w-[520px] -translate-y-1/2 md:block"
              style={{
                opacity: 0.55,
                maskImage: "radial-gradient(circle at 50% 50%, #000 46%, transparent 72%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 46%, transparent 72%)",
              }}
            >
              <div className="relative h-full w-full">
                <Globe config={GLOBE_CTA} />
              </div>
            </div>

            {/* top-left gloss */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(680px circle at 16% -12%, rgba(255,255,255,0.30), transparent 55%)",
              }}
            />

            <div className="relative max-w-[620px] text-center md:text-left">
              <p
                className="text-[12px] uppercase tracking-[0.16em]"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.72)" }}
              >
                Stop guessing from resumes
              </p>
              <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)]" style={{ color: "#fff" }}>
                See the skill, not the resume.
              </h2>
              <p
                className="mt-5 max-w-xl text-[16.5px] leading-relaxed md:mx-0"
                style={{ color: "rgba(255,255,255,.85)" }}
              >
                Give one team one week on Placedon. Watch how fast &ldquo;who should we
                talk to?&rdquo; gets an honest answer.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Button onClick={() => open("employer")} className="!px-7 !py-3.5 text-[15px]">
                  Book a demo <ArrowRight size={17} />
                </Button>
                <Button href="/pre-interview" variant="ghost" className="!px-6 !py-3.5 text-[15px]">
                  Take an interview
                </Button>
              </div>

              <p className="mt-6 text-[13px]" style={{ color: "rgba(255,255,255,.62)" }}>
                No setup fee · cancel anytime · every score is bias-audited
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Lighter, luminous globe tuned to read on the violet CTA card.
const GLOBE_CTA = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.85, 0.82, 0.98] as [number, number, number],
  markerColor: [1, 1, 1] as [number, number, number],
  glowColor: [0.78, 0.7, 1] as [number, number, number],
  markers: [
    { location: [12.97, 77.59] as [number, number], size: 0.05 },
    { location: [19.08, 72.88] as [number, number], size: 0.05 },
    { location: [40.71, -74.01] as [number, number], size: 0.06 },
    { location: [51.51, -0.13] as [number, number], size: 0.05 },
    { location: [1.35, 103.82] as [number, number], size: 0.05 },
    { location: [35.68, 139.65] as [number, number], size: 0.05 },
  ],
};
