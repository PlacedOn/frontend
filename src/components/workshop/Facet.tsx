"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

type Lens = "coverage" | "foundation";

type Props = {
  /** 0–100. Readiness coverage of a role's public requirements — never a person-score. */
  pct: number;
  size?: number;
  /** Number of facets the ring is assembled from — one per real specimen. */
  facets: number;
  /** How many are lit — one per *sealed* specimen. Must be the count the
   *  Instrument register can actually enumerate, or the ring is lying. */
  lit: number;
  lens?: Lens;
  /** Bumps to re-run the materialize (facet-by-facet) assemble animation. */
  assembleKey?: number;
  /** False renders the bare scaffold. A percentage derived from zero evidence
   *  is a claim we cannot support — so before any proof exists, show no number. */
  showValue?: boolean;
};

const GAP_DEG = 2.6;

type FacetPath = { d: string; index: number };

/** Flat-edged annular sectors → a cut-stone, faceted ring (echoes the angular
 *  PlacedOn mark, not a smooth Apple/Duolingo arc). The ring is literally
 *  assembled from discrete facets — one per verified pillar of evidence. */
function buildFacets(size: number, count: number): FacetPath[] {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = (size / 2) * 0.92;
  const rInner = (size / 2) * 0.68;
  const step = 360 / count;
  const pol = (r: number, deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const round = (n: number) => Math.round(n * 100) / 100; // stable server/client serialization

  return Array.from({ length: count }, (_, i) => {
    const a0 = -90 + i * step + GAP_DEG / 2;
    const a1 = -90 + (i + 1) * step - GAP_DEG / 2;
    const [ox0, oy0] = pol(rOuter, a0);
    const [ox1, oy1] = pol(rOuter, a1);
    const [ix1, iy1] = pol(rInner, a1);
    const [ix0, iy0] = pol(rInner, a0);
    const d = `M${round(ox0)} ${round(oy0)}L${round(ox1)} ${round(oy1)}L${round(ix1)} ${round(iy1)}L${round(ix0)} ${round(iy0)}Z`;
    return { d, index: i };
  });
}

/**
 * The Facet — PlacedOn's signature identity object. Not a progress bar: a ring
 * assembled from real, verified proofs, that you can always take apart. Unifies
 * the two legacy readiness dials under one geometry with two lenses.
 */
export function Facet({
  pct,
  size = 300,
  facets,
  lit,
  lens = "coverage",
  assembleKey = 0,
  showValue = true,
}: Props) {
  const reduce = useReducedMotion();
  const gradId = useId();
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  // The ring is never derived from the percentage — it is drawn from the
  // specimens themselves, so "take it apart" can always account for every wedge.
  const count = Math.max(1, facets);
  const litCount = Math.max(0, Math.min(count, lit));
  const paths = useMemo(() => buildFacets(size, count), [size, count]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          showValue
            ? `${clamped}% readiness, assembled from ${litCount} verified ${litCount === 1 ? "facet" : "facets"} of ${count}`
            : "An empty ring — no verified evidence yet"
        }
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--iris-soft)" />
            <stop offset="1" stopColor="var(--iris-ink)" />
          </linearGradient>
        </defs>

        {/* every facet as a faint outline — the ring's empty scaffold */}
        {paths.map((f) => (
          <path key={`o-${f.index}`} d={f.d} fill="transparent" stroke="var(--iris)" strokeOpacity={0.16} strokeWidth={1} />
        ))}

        {/* lit facets materialize in, one per verified pillar */}
        {paths.slice(0, litCount).map((f) => (
          <motion.path
            key={`l-${f.index}-${assembleKey}`}
            d={f.d}
            fill={`url(#${gradId})`}
            stroke="#fff"
            strokeOpacity={0.5}
            strokeWidth={0.6}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.15 + f.index * 0.09, ease: [0.22, 0.68, 0.31, 1] }}
          />
        ))}
      </svg>

      {showValue && (
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <div className="font-extrabold leading-none tracking-tight text-[var(--ink)]" style={{ fontSize: size * 0.19, fontVariantNumeric: "tabular-nums" }}>
            {clamped}
            <span className="text-[0.42em] text-[var(--ink-3)]">%</span>
          </div>
          <div className="mt-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--iris-ink)]">
            {lens === "coverage" ? "readiness" : "foundation"}
          </div>
        </div>
      )}
    </div>
  );
}
