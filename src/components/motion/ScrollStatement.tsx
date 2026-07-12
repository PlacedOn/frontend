"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

/** One editorial statement, authored as accent / plain runs. */
const PARTS: { text: string; accent?: boolean }[] = [
  { text: "A resume lists what someone did." },
  { text: "It rarely shows" },
  { text: "how they think,", accent: true },
  { text: "how they hold up", accent: true },
  { text: "when the work gets hard, or" },
  { text: "how they lift the people around them.", accent: true },
  { text: "One honest conversation", accent: true },
  { text: "does. That is what we help you hire for." },
];

/** Flatten runs into individual words so each can illuminate on scroll. */
const WORDS = PARTS.flatMap((part, p) =>
  part.text.split(" ").map((word, w) => ({ word, accent: part.accent, key: `${p}-${w}` })),
);

/**
 * Scroll-scrubbed word reveal (Zajno / Awwwards pattern) in Frost Luxe.
 * Words sit dim and illuminate sequentially as the section scrolls through.
 * Reduced-motion and no-JS readers see the fully lit statement by default.
 */
export function ScrollStatement() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(".ss-word");
      if (!words.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(words, { opacity: 0.14 });
        gsap.to(words, {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "bottom 62%",
            scrub: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section aria-label="Why interviews beat resumes" className="relative py-28 md:py-40">
      <div className="shell" ref={root}>
        <p
          className="mb-8 text-[12px] uppercase tracking-[0.18em] text-[var(--iris-ink)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The difference
        </p>
        <p className="max-w-[18ch] text-[clamp(1.9rem,1rem+4.4vw,4.2rem)] font-semibold leading-[1.12] tracking-[-0.02em] sm:max-w-[26ch]">
          {WORDS.map(({ word, accent, key }) => (
            <span
              key={key}
              className="ss-word me-[0.26em] inline-block"
              style={accent ? { color: "var(--iris-ink)" } : undefined}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
