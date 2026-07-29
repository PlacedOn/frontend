"use client";

import type { COBEOptions } from "cobe";
import { motion, useReducedMotion } from "motion/react";
import { Globe as GlobeIcon, Mic, Scale } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/globe";

// Honest, punchy capability facts — float around the globe as composed labels.
const CHIPS = [
  { icon: GlobeIcon, k: "Any timezone", v: "No travel, no scheduling" },
  { icon: Mic, k: "Voice or text", v: "However they’re comfortable" },
  { icon: Scale, k: "One fair standard", v: "Bias-audited, everywhere" },
];

// Desktop float positions around the sphere (over the glow, AR-label style).
const CHIP_POS = [
  "lg:left-[-6%] lg:top-[16%]",
  "lg:right-[-8%] lg:top-[44%]",
  "lg:left-[2%] lg:bottom-[10%]",
];

// Dark-tuned globe: deeper violet body, brighter iris markers, violet atmosphere.
const DARK_GLOBE: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.28,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 5.2,
  baseColor: [0.32, 0.26, 0.5],
  markerColor: [0.62, 0.4, 1],
  glowColor: [0.42, 0.28, 0.72],
  markers: [
    { location: [12.97, 77.59], size: 0.07 },
    { location: [19.08, 72.88], size: 0.06 },
    { location: [28.61, 77.21], size: 0.06 },
    { location: [1.35, 103.82], size: 0.05 },
    { location: [25.2, 55.27], size: 0.05 },
    { location: [51.51, -0.13], size: 0.05 },
    { location: [40.71, -74.01], size: 0.06 },
    { location: [37.77, -122.42], size: 0.05 },
    { location: [35.68, 139.65], size: 0.05 },
    { location: [-33.87, 151.21], size: 0.05 },
  ],
};

function Chip({ icon: Icon, k, v }: { icon: typeof GlobeIcon; k: string; v: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 12px 40px rgba(8,6,15,0.4)" }}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.14)", color: "#c9bcff" }}>
        <Icon size={17} />
      </span>
      <span className="flex flex-col">
        <span className="text-[13.5px] font-bold leading-tight text-white">{k}</span>
        <span className="text-[12px] leading-tight text-white/55">{v}</span>
      </span>
    </div>
  );
}

/** Remote-first, told as a centered cinematic earth centerpiece — the one deep
 *  contrast moment on the light site. Capability labels orbit the globe on
 *  desktop and stack beneath it on mobile. Drag to spin. */
export function GlobalReach() {
  const reduce = useReducedMotion();
  const float = (i: number) =>
    reduce
      ? undefined
      : { animate: { y: [0, -9, 0] }, transition: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* deep-space ground */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 6%, #1a1740 0%, #100c26 44%, #08060f 100%)" }}
      />
      {/* violet nebula */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--iris-soft) 28%, transparent), transparent 62%)", filter: "blur(30px)" }}
      />

      {/* Centered header (flex — bulletproof centering) */}
      <div className="relative z-[1] mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(173,168,237,0.9)" }}>
            Remote-first by design
          </p>
          <h2
            className="mt-4 text-balance text-[clamp(2.2rem,1.2rem+3.4vw,3.8rem)] leading-[1.05] tracking-[-0.03em]"
            style={{ color: "#fff" }}
          >
            Interview anyone,{" "}
            <span style={{ background: "linear-gradient(90deg,#b3a3ff,var(--iris-soft))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              anywhere
            </span>
            .
          </h2>
          <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-white/68">
            One adaptive interview, run entirely in the browser. Bengaluru, London or San Francisco —
            the same honest conversation, the same signal back.
          </p>
        </Reveal>
      </div>

      {/* Earth centerpiece with orbiting capability labels */}
      <div className="relative z-[1] mx-auto mt-6 w-[min(92vw,560px)]">
        <div className="relative aspect-square w-full">
          {/* static orbital halo */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[106%] w-[106%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ border: "1px solid rgba(173,168,237,0.16)", boxShadow: "inset 0 0 70px color-mix(in oklab, var(--iris-soft) 14%, transparent)" }}
          />
          <Globe config={DARK_GLOBE} />

          {/* desktop: floating labels around the globe */}
          {CHIPS.map((c, i) => (
            <motion.div key={c.k} className={`absolute hidden w-max lg:block ${CHIP_POS[i]}`} {...(float(i) ?? {})}>
              <Chip {...c} />
            </motion.div>
          ))}
        </div>
        <p className="mt-2 text-center text-[12px] text-white/40">Drag to spin · cities shown are illustrative</p>
      </div>

      {/* mobile: labels stacked, centered */}
      <div className="relative z-[1] mx-auto mt-10 flex max-w-sm flex-col gap-3 px-6 lg:hidden">
        {CHIPS.map((c) => (
          <Chip key={c.k} {...c} />
        ))}
      </div>
    </section>
  );
}
