"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import type { RoleMatch } from "@/lib/types";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

/**
 * Match visualization — how a candidate's evidenced capabilities converge onto a
 * role. Evidenced traits (left) draw connecting lines to the role node (right);
 * gaps the role still wants sit dimmed below. A confidence signal travels the
 * strongest line, and the fit % counts up. Rendered in 3D depth (CSS perspective,
 * cursor tilt) to match the hero graph. Original SVG, reduced-motion safe.
 */

const VB = { w: 560, h: 400 };
const ROLE = { x: 486, y: 200 };
const TRAITX = 96;

const CONF_WEIGHT: Record<string, number> = { high: 1, medium: 0.7, low: 0.45 };

/** A transparent, evidence-grounded fit read: mean confidence of matched traits,
 *  lightly penalised by how many signals the role still wants. Coverage, not a
 *  person-score. */
function fitPercent(m: RoleMatch): number {
  const ev = m.evidence;
  if (ev.length === 0) return 0;
  const mean = ev.reduce((s, e) => s + (CONF_WEIGHT[e.confidence] ?? 0.6), 0) / ev.length;
  const coverage = ev.length / (ev.length + m.missing_signals.length);
  return Math.round(mean * (0.7 + 0.3 * coverage) * 100);
}

export function MatchVisual({ match }: { match: RoleMatch }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    rotY.set(nx * 6);
    rotX.set(-ny * 6);
  };
  const onLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  const traits = match.evidence.slice(0, 5);
  const step = traits.length > 1 ? 200 / (traits.length - 1) : 0;
  const traitY = (i: number) => (traits.length === 1 ? 200 : 100 + i * step);
  const strongestIdx = traits.reduce(
    (best, e, i) => ((CONF_WEIGHT[e.confidence] ?? 0) > (CONF_WEIGHT[traits[best]!.confidence] ?? 0) ? i : best),
    0,
  );
  const fit = fitPercent(match);
  const accent = "var(--iris)";
  const line = "var(--glass-line-hi)";

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative w-full select-none"
      style={{ perspective: "1100px" }}
    >
      <motion.div
        style={{ rotateX: reduce ? 0 : rotX, rotateY: reduce ? 0 : rotY, transformStyle: "preserve-3d" }}
      >
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className={`capgraph h-auto w-full ${reduce ? "" : "capgraph--animate"}`} fill="none" role="img" aria-label={`Your fit for ${match.title} at ${match.company}`}>
          {/* connecting lines: evidenced traits → role */}
          {traits.map((e, i) => {
            const strong = i === strongestIdx;
            return (
              <path
                key={`l-${e.trait}`}
                d={`M${TRAITX + 8} ${traitY(i)} C 250 ${traitY(i)}, 330 ${ROLE.y}, ${ROLE.x - 24} ${ROLE.y}`}
                className="cap-edge"
                pathLength={1}
                stroke={strong ? accent : line}
                strokeWidth={strong ? 1.8 : 1}
                strokeDasharray={1}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              />
            );
          })}

          {/* trait nodes + labels */}
          {traits.map((e, i) => (
            <g key={`t-${e.trait}`}>
              <g data-node style={{ animationDelay: `${0.3 + i * 0.09}s` }}>
                <circle cx={TRAITX} cy={traitY(i)} r={i === strongestIdx ? 7 : 5.5} fill={i === strongestIdx ? accent : "var(--white)"} stroke={i === strongestIdx ? accent : "var(--ink-3)"} strokeWidth={1.4} />
              </g>
              <text x={TRAITX - 14} y={traitY(i) + 4} textAnchor="end" fontSize={12.5} fill="var(--ink)" fontWeight={i === strongestIdx ? 600 : 400} style={{ fontFamily: "var(--font-body)" }}>
                {e.trait}
              </text>
            </g>
          ))}

          {/* role node + confidence ring + fit gauge */}
          <circle className="cap-ring" cx={ROLE.x} cy={ROLE.y} r={44} stroke={accent} strokeWidth={1} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <g data-node style={{ animationDelay: "0.9s" }}>
            <circle cx={ROLE.x} cy={ROLE.y} r={30} fill="var(--white)" stroke="var(--ink-2)" strokeWidth={1.5} />
            <path d={`M${ROLE.x - 10} ${ROLE.y} l7 7 l13 -15`} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x={ROLE.x} y={ROLE.y + 52} textAnchor="middle" fontSize={11.5} fill="var(--ink-2)" style={{ fontFamily: "var(--font-mono)" }}>
            {match.company}
          </text>

          {/* traveling confidence signal along the strongest line */}
          <circle className="cap-signal" r={3.5} fill={accent} style={{ offsetPath: `path('M${TRAITX + 8} ${traitY(strongestIdx)} C 250 ${traitY(strongestIdx)}, 330 ${ROLE.y}, ${ROLE.x - 24} ${ROLE.y}')` }} />
        </svg>

        {/* floating fit gauge chip, above the plane */}
        <div className="pointer-events-none absolute" style={{ top: "4%", left: "56%", transform: `translateZ(${reduce ? 0 : 56}px)` }}>
          <div className="cap-float glass rounded-full px-3.5 py-1.5 text-[12px] font-bold text-[var(--ink)]" style={{ boxShadow: "var(--shadow-md)" }}>
            <AnimatedNumber value={fit} />% fit
          </div>
        </div>
      </motion.div>
    </div>
  );
}
