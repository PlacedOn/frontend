"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Asterisk } from "lucide-react";
import { gsap } from "@/lib/motion/gsap";

/** Our own principles — not fabricated customer logos. */
const ITEMS = [
  "Hire for how people think",
  "Real skill over resumes",
  "Every trait is contestable",
  "Bias-audited by design",
  "You control what is shared",
  "One honest interview",
];

/**
 * Seamless GSAP type-marquee. The track holds two copies of the list and
 * translates by exactly one copy width, so the loop never seams. Pauses on
 * hover; holds still under reduced motion.
 */
export function KineticMarquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tween.current = gsap.to(track.current, {
          xPercent: -50,
          duration: 26,
          ease: "none",
          repeat: -1,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const pause = () => tween.current?.pause();
  const resume = () => tween.current?.resume();

  return (
    <section
      ref={root}
      aria-label="What Placedon stands for"
      className="relative overflow-hidden py-14 md:py-20"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div ref={track} className="flex w-max items-center">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12">
            <span className="text-[clamp(1.5rem,0.8rem+2.6vw,3rem)] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {item}
            </span>
            <Asterisk
              className="shrink-0 text-[var(--iris)]"
              style={{ width: "clamp(1.1rem,0.6rem+1.4vw,1.9rem)", height: "auto" }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
