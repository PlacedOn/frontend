"use client";

import type { COBEOptions } from "cobe";
import { Globe as GlobeIcon, Mic, Scale } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/globe";

const POINTS = [
  { icon: GlobeIcon, text: "Runs in the browser, in any timezone — no travel, no scheduling roulette." },
  { icon: Mic, text: "Voice or text, whichever the candidate is comfortable with." },
  { icon: Scale, text: "The same fair, bias-audited scoring wherever they are." },
];

// Dark-tuned globe: on the deep space ground the land needs a deeper violet body,
// brighter iris markers, and a violet atmosphere glow so the sphere reads.
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
    { location: [12.97, 77.59], size: 0.07 }, // Bengaluru
    { location: [19.08, 72.88], size: 0.06 }, // Mumbai
    { location: [28.61, 77.21], size: 0.06 }, // Delhi
    { location: [1.35, 103.82], size: 0.05 }, // Singapore
    { location: [25.2, 55.27], size: 0.05 }, // Dubai
    { location: [51.51, -0.13], size: 0.05 }, // London
    { location: [40.71, -74.01], size: 0.06 }, // New York
    { location: [37.77, -122.42], size: 0.05 }, // San Francisco
    { location: [35.68, 139.65], size: 0.05 }, // Tokyo
    { location: [-33.87, 151.21], size: 0.05 }, // Sydney
  ],
};

/** Remote-first capability, told as a cinematic earth centerpiece — a single
 *  deep-space moment amid the light site. Drag to spin. */
export function GlobalReach() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* deep-space ground — the one dark moment on the site */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, #1a1740 0%, #100c26 42%, #08060f 100%)",
        }}
      />
      {/* violet nebula glow (no star-field cliché) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,84,255,0.30), transparent 62%)", filter: "blur(30px)" }}
      />

      <div className="shell relative z-[1] text-center">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(179,163,255,0.9)" }}>
            Remote-first by design
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(2rem,1.2rem+3vw,3.4rem)] leading-[1.06] tracking-[-0.03em] text-white">
            Interview anyone,{" "}
            <span style={{ background: "linear-gradient(90deg,#b3a3ff,#8b54ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              anywhere
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-white/70">
            One adaptive interview, run entirely in the browser. Bengaluru, London or San Francisco —
            they get the same honest conversation, and you get the same signal back.
          </p>
        </Reveal>
      </div>

      {/* Earth centerpiece */}
      <div className="relative z-[1] mx-auto mt-4 aspect-square w-[min(88vw,560px)]">
        {/* orbital ring */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[104%] w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: "1px solid rgba(179,163,255,0.18)", boxShadow: "inset 0 0 60px rgba(139,84,255,0.12)" }}
        />
        <Globe config={DARK_GLOBE} />
        <p className="absolute inset-x-0 bottom-1 text-center text-[12px] text-white/45">
          Drag to spin · cities shown are illustrative
        </p>
      </div>

      {/* Capability points */}
      <div className="shell relative z-[1] mt-14">
        <ul className="grid gap-5 sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex flex-col gap-3 rounded-[var(--r-card)] p-5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: "rgba(139,84,255,0.16)", color: "#c9bcff" }}
              >
                <Icon size={18} animateOnView animateOnHover />
              </span>
              <span className="text-[14.5px] leading-relaxed text-white/78">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
