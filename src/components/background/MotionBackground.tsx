"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

/*
 * MotionBackground — an obviously-alive backdrop (21st.dev / Aceternity style)
 * in the Frost Luxe palette: a fast-flowing aurora, sweeping light beams, and
 * periodic meteors over a pulsing dot grid. Fixed, non-interactive, GPU-only
 * (transform/opacity). Reduced-motion falls back to a calm static gradient.
 */

// Fixed (deterministic — no Math.random) beam + meteor configs.
const BEAMS = [
  { top: "-25%", left: "6%", w: 200, color: "color-mix(in oklab, var(--iris-soft) 40%, transparent)", dur: 5.5, delay: 0 },
  { top: "-25%", left: "34%", w: 160, color: "rgba(120,178,255,0.34)", dur: 6.5, delay: 1.8 },
  { top: "-25%", left: "62%", w: 240, color: "color-mix(in oklab, var(--iris) 38%, transparent)", dur: 6, delay: 3.4 },
];

const METEORS = [
  { top: "4%", left: "18%", dur: 2.2, delay: 0.4, repeatDelay: 4.2 },
  { top: "10%", left: "48%", dur: 2.6, delay: 1.8, repeatDelay: 5.1 },
  { top: "2%", left: "72%", dur: 2.0, delay: 3.1, repeatDelay: 3.8 },
  { top: "16%", left: "88%", dur: 2.8, delay: 2.3, repeatDelay: 6.0 },
];

export function MotionBackground() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Sweeping diagonal light beams cross the viewport, then loop.
        gsap.set(".mb-beam", { rotate: 20, xPercent: -50 });
        gsap.utils.toArray<HTMLElement>(".mb-beam").forEach((beam, i) => {
          const cfg = BEAMS[i];
          gsap.fromTo(
            beam,
            { x: -300, opacity: 0 },
            {
              x: () => window.innerWidth + 300,
              opacity: 1,
              duration: cfg.dur,
              ease: "none",
              repeat: -1,
              delay: cfg.delay,
              keyframes: { opacity: [0, 1, 1, 0] },
            },
          );
        });

        // Meteors streak diagonally, fade, and repeat on their own cadence.
        gsap.utils.toArray<HTMLElement>(".mb-meteor").forEach((m, i) => {
          const cfg = METEORS[i];
          gsap.set(m, { rotate: 218 });
          gsap.fromTo(
            m,
            { x: 0, y: 0, opacity: 0 },
            {
              x: -520,
              y: 520,
              opacity: 1,
              duration: cfg.dur,
              ease: "power1.in",
              repeat: -1,
              delay: cfg.delay,
              repeatDelay: cfg.repeatDelay,
              keyframes: { opacity: [0, 1, 1, 0] },
            },
          );
        });

        // Grid breathes.
        gsap.to(".mb-grid", { opacity: 0.7, duration: 3.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* fast-flowing aurora */}
      <div
        className="mb-aurora absolute inset-[-20%]"
        style={{
          background:
            "linear-gradient(115deg, color-mix(in oklab, var(--iris-soft) 30%, transparent), rgba(120,178,255,0.20) 28%, rgba(255,196,132,0.14) 50%, color-mix(in oklab, var(--iris) 28%, transparent) 72%, color-mix(in oklab, var(--iris-soft) 30%, transparent))",
          backgroundSize: "200% 200%",
          filter: "blur(60px)",
          willChange: "background-position",
        }}
      />

      {/* sweeping light beams */}
      {BEAMS.map((b, i) => (
        <span
          key={i}
          className="mb-beam absolute"
          style={{
            top: b.top,
            left: b.left,
            width: b.w,
            height: "150%",
            background: `linear-gradient(to bottom, transparent, ${b.color}, transparent)`,
            filter: "blur(6px)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* meteors */}
      {METEORS.map((m, i) => (
        <span
          key={i}
          className="mb-meteor absolute h-[2px] w-[180px] rounded-full"
          style={{
            top: m.top,
            left: m.left,
            background: "linear-gradient(90deg, #ffffff, color-mix(in oklab, var(--iris-soft) 90%, transparent) 26%, transparent)",
            boxShadow: "0 0 14px color-mix(in oklab, var(--iris-soft) 85%, transparent)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* pulsing dot grid */}
      <div
        className="mb-grid absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(14,16,32,.16) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 62% at 50% 20%, black 16%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 62% at 50% 20%, black 16%, transparent 78%)",
          opacity: 0.42,
        }}
      />

      <style>{`
        @keyframes mbAuroraShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Aurora flows for everyone (gentle colour drift, low vestibular risk),
           so the page never reads as fully static. */
        .mb-aurora { animation: mbAuroraShift 9s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
