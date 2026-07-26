"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * PlacedOn's signature visual — a semantic network, not a Resume. A candidate's
 * evidenced capabilities connect to a role; a confidence signal travels the
 * strongest path. Original SVG, no stock art. Motion explains the product:
 * "understanding beyond the Resume." Static and legible under reduced-motion.
 */

const CAPS = [
  { label: "Debugging", y: 74, accent: false },
  { label: "Communication", y: 147, accent: false },
  { label: "Ownership", y: 220, accent: true },
  { label: "Systems", y: 293, accent: false },
  { label: "Judgment", y: 366, accent: false },
] as const;

const CAND = { x: 80, y: 220 };
const CAPX = 286;
const ROLE = { x: 486, y: 220 };

export function CapabilityGraph() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Cursor parallax — two depths, gently interpolated. Skipped when reduced.
  const bx = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const by = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const fx = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const fy = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    bx.set(nx * 4);
    by.set(ny * 4);
    fx.set(nx * 9);
    fy.set(ny * 9);
  };
  const onLeave = () => {
    bx.set(0); by.set(0); fx.set(0); fy.set(0);
  };

  const ink = "var(--ink-3)";
  const line = "var(--glass-line-hi)";
  const accent = "var(--iris)";

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative w-full select-none"
      aria-hidden
    >
      <svg
        viewBox="0 0 560 440"
        className={`capgraph h-auto w-full ${reduce ? "" : "capgraph--animate"}`}
        fill="none"
        role="img"
      >
        {/* ── back layer: edges + confidence ring ── */}
        <motion.g style={{ x: bx, y: by }}>
          {CAPS.map((c, i) => (
            <g key={`e-${c.label}`}>
              <path
                d={`M${CAND.x} ${CAND.y} L${CAPX} ${c.y}`}
                className="cap-edge"
                pathLength={1}
                stroke={c.accent ? accent : line}
                strokeWidth={c.accent ? 1.6 : 1}
                strokeDasharray={1}
                style={{ animationDelay: `${0.15 + i * 0.09}s` }}
              />
              <path
                d={`M${CAPX} ${c.y} L${ROLE.x} ${ROLE.y}`}
                className="cap-edge"
                pathLength={1}
                stroke={c.accent ? accent : line}
                strokeWidth={c.accent ? 1.6 : 1}
                strokeDasharray={1}
                style={{ animationDelay: `${0.35 + i * 0.09}s` }}
              />
            </g>
          ))}
          {/* confidence ring around the role */}
          <circle className="cap-ring" cx={ROLE.x} cy={ROLE.y} r={40} stroke={accent} strokeWidth={1} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        </motion.g>

        {/* ── front layer: nodes + labels ── */}
        <motion.g style={{ x: fx, y: fy }}>
          {/* candidate */}
          <g data-node style={{ animationDelay: "0.1s" }}>
            <circle cx={CAND.x} cy={CAND.y} r={26} fill="var(--white)" stroke="var(--ink-2)" strokeWidth={1.5} />
            <circle cx={CAND.x} cy={CAND.y} r={9} fill="var(--ink)" />
          </g>
          <text x={CAND.x} y={CAND.y + 46} textAnchor="middle" fontSize={11.5} fill="var(--ink-2)" style={{ fontFamily: "var(--font-mono)" }}>
            Candidate
          </text>

          {/* capabilities */}
          {CAPS.map((c, i) => (
            <g key={`n-${c.label}`}>
              <g data-node style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
                <circle
                  cx={CAPX}
                  cy={c.y}
                  r={c.accent ? 8 : 6.5}
                  fill={c.accent ? accent : "var(--white)"}
                  stroke={c.accent ? accent : ink}
                  strokeWidth={1.4}
                />
              </g>
              <text x={CAPX + 16} y={c.y + 4} fontSize={12} fill={c.accent ? "var(--ink)" : "var(--ink-2)"} fontWeight={c.accent ? 600 : 400} style={{ fontFamily: "var(--font-body)" }}>
                {c.label}
              </text>
            </g>
          ))}

          {/* role */}
          <g data-node style={{ animationDelay: "1s" }}>
            <rect x={ROLE.x - 22} y={ROLE.y - 22} width={44} height={44} rx={12} fill="var(--white)" stroke="var(--ink-2)" strokeWidth={1.5} />
            <path d={`M${ROLE.x - 8} ${ROLE.y} l6 6 l10 -12`} stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x={ROLE.x} y={ROLE.y + 44} textAnchor="middle" fontSize={11.5} fill="var(--ink-2)" style={{ fontFamily: "var(--font-mono)" }}>
            Role fit
          </text>
        </motion.g>

        {/* ── traveling confidence signal (strong path) ── */}
        <circle
          className="cap-signal"
          r={3.5}
          fill={accent}
          style={{ offsetPath: `path('M${CAND.x} ${CAND.y} L${CAPX} 220 L${ROLE.x} ${ROLE.y}')` }}
        />
      </svg>
    </div>
  );
}
