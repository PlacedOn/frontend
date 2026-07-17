"use client";

import { motion, useReducedMotion } from "motion/react";
import type { HcvDimension } from "@/lib/mock/hcv";
import { BAND_META, bandOf } from "@/lib/mock/candidateReport";

type Props = {
  dimensions: HcvDimension[];
  size?: number;
  /**
   * Employer view: snap each axis to its evidence band (Supported / Emerging /
   * Needs-more) instead of a continuous score, so the shape reads as banded
   * evidence — never an implied precise per-trait number. Candidate view leaves
   * this off and keeps the calibrated continuous fingerprint.
   */
  quantize?: boolean;
};

const ease = [0.22, 0.68, 0.31, 1] as const;

type Pt = { x: number; y: number };

function polar(cx: number, cy: number, r: number, angleDeg: number): Pt {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const toPath = (pts: Pt[]): string =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

/**
 * The HCV "fingerprint" — the whole calibrated vector as one recognizable shape.
 * Solid polygon = point estimates; faint outer polygon = the uncertainty envelope.
 */
export function HcvRadar({ dimensions, size = 280, quantize = false }: Props) {
  const reduce = useReducedMotion();
  const n = dimensions.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 40; // leave room for labels
  const PAD = 46; // lateral viewBox padding so left/right labels aren't clipped
  const rings = [0.25, 0.5, 0.75, 1];

  // Radar labels must stay short — first word for long labels.
  const short = (s: string) => (s.length <= 13 ? s : s.split(" ")[0].slice(0, 13));

  const angleAt = (i: number) => -90 + (360 / n) * i;

  // Employer (quantize): radius is the band's fill tier — no implied precise
  // per-axis score. Candidate: continuous calibrated estimate + uncertainty halo.
  const frac = (d: HcvDimension) => (quantize ? BAND_META[bandOf(d.score)].fill : d.score / 100);
  const scorePts = dimensions.map((d, i) => polar(cx, cy, R * frac(d), angleAt(i)));
  const envPts = dimensions.map((d, i) =>
    polar(cx, cy, R * (quantize ? frac(d) : Math.min(1, d.score / 100 + d.uncertainty * 0.28)), angleAt(i)),
  );

  return (
    <svg
      viewBox={`${-PAD} 0 ${size + PAD * 2} ${size}`}
      className="mx-auto h-auto w-full max-w-[340px]"
      role="img"
      aria-label="HCV fingerprint radar of assessed dimensions"
    >
      {/* grid rings */}
      {rings.map((f) => (
        <polygon
          key={f}
          points={dimensions
            .map((_, i) => {
              const p = polar(cx, cy, R * f, angleAt(i));
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="var(--glass-line)"
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      {dimensions.map((_, i) => {
        const p = polar(cx, cy, R, angleAt(i));
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--glass-line)" strokeWidth={1} />;
      })}

      {/* uncertainty envelope */}
      <motion.path
        d={toPath(envPts)}
        fill="var(--iris-soft)"
        opacity={0.14}
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.14 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.15 }}
        style={{ transformOrigin: "center" }}
      />
      {/* score polygon */}
      <motion.path
        d={toPath(scorePts)}
        fill="var(--iris)"
        fillOpacity={0.24}
        stroke="var(--iris)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.25 }}
        style={{ transformOrigin: "center" }}
      />
      {/* vertices */}
      {scorePts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="var(--iris)"
          stroke="#fff"
          strokeWidth={1.5}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
        />
      ))}
      {/* labels */}
      {dimensions.map((d, i) => {
        const p = polar(cx, cy, R + 16, angleAt(i));
        const cos = Math.cos((angleAt(i) * Math.PI) / 180);
        const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
        return (
          <text
            key={d.id}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={10.5}
            fontWeight={600}
            fill="var(--ink-2)"
          >
            {short(d.label)}
          </text>
        );
      })}
    </svg>
  );
}
