"use client";

import { useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The evidence pipeline — one interview becomes defensible hiring, shown as a
 * live flow (Scale-style "data in motion"): a stream of signals travels the rail
 * through each stage. Explains the product's loop; calm, GPU-only, and static
 * under reduced-motion.
 */

const RAIL_Y = 92;
const STAGES = [
  { x: 120, label: "One interview", sub: "Adaptive AI" },
  { x: 400, label: "Evidence extracted", sub: "Quoted, not assumed" },
  { x: 680, label: "Capability mapped", sub: "What they can do" },
  { x: 900, label: "Shortlist you defend", sub: "Bands, never a score" },
];

const RAIL = `M${STAGES[0].x} ${RAIL_Y} L${STAGES[STAGES.length - 1].x} ${RAIL_Y}`;
const SIGNALS = [0, 0.68, 1.36, 2.04, 2.72]; // staggered delays → a continuous stream

export function EvidenceFlow() {
  const reduce = useReducedMotion();
  return (
    <section className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">The pipeline</p>
        <h2 className="mt-3 text-[clamp(1.8rem,1.2rem+2vw,2.7rem)] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          From conversation to a decision you can defend.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
          One interview turns into quoted evidence, a map of what someone can actually do, and a
          shortlist your team can stand behind.
        </p>
      </Reveal>

      <Reveal delay={0.12} className="mt-12">
        <svg viewBox="0 0 1020 170" className={`h-auto w-full ${reduce ? "" : "eflow--animate"}`} fill="none" role="img" aria-label="Interview to evidence to capability to shortlist">
          {/* rail */}
          <path d={RAIL} stroke="var(--glass-line-hi)" strokeWidth={1.5} />

          {/* flowing signals */}
          {!reduce &&
            SIGNALS.map((d, i) => (
              <circle key={i} className="eflow-signal" r={3.5} fill="var(--iris)" style={{ offsetPath: `path('${RAIL}')`, animationDelay: `${d}s` }} />
            ))}

          {/* stages */}
          {STAGES.map((s, i) => {
            const last = i === STAGES.length - 1;
            const anchor = i === 0 ? "start" : last ? "end" : "middle";
            const tx = i === 0 ? s.x - 24 : last ? s.x + 24 : s.x;
            return (
              <g key={s.label}>
                <g className="eflow-node" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${0.2 + i * 0.12}s` }}>
                  <circle cx={s.x} cy={RAIL_Y} r={last ? 22 : 18} fill="var(--white)" stroke={last ? "var(--iris)" : "var(--ink-2)"} strokeWidth={1.6} />
                  {last ? (
                    <path d={`M${s.x - 8} ${RAIL_Y} l6 6 l11 -13`} stroke="var(--iris-ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <text x={s.x} y={RAIL_Y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)" style={{ fontFamily: "var(--font-mono)" }}>
                      {i + 1}
                    </text>
                  )}
                </g>
                <text x={tx} y={RAIL_Y + 46} textAnchor={anchor} fontSize={14} fontWeight={600} fill="var(--ink)" style={{ fontFamily: "var(--font-body)" }}>
                  {s.label}
                </text>
                <text x={tx} y={RAIL_Y + 66} textAnchor={anchor} fontSize={12} fill="var(--ink-3)" style={{ fontFamily: "var(--font-body)" }}>
                  {s.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </Reveal>
    </section>
  );
}
