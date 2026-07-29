"use client";

/**
 * CapabilityGraph — PlacedOn's signature hero visual.
 *
 * Visualises the product's actual claim, left to right:
 *
 *   utterance  →  evidence  →  capability
 *   (what they   (what was     (what it
 *    said)        extracted)    means)
 *
 * A slow sweep travels the width, lighting each stage in turn, so the
 * animation *explains the product* rather than decorating around it. That
 * is the whole brief: motion with a job.
 *
 * Implementation notes:
 * - Pure SVG + CSS keyframes. No animation library, no canvas, no rAF loop.
 *   Harvey and Scale both ship zero motion libraries; this matches that and
 *   costs nothing in bundle size.
 * - Only `opacity`, `transform`, and `stroke-dashoffset` are animated — all
 *   compositor-friendly. Nothing triggers layout.
 * - Every colour and duration comes from the token layer, so it follows the
 *   theme and collapses correctly under prefers-reduced-motion.
 * - Decorative, so aria-hidden. The surrounding copy carries the meaning.
 */

type Props = {
  className?: string;
  /** Slows the whole sequence. 1 = default (~14s loop). */
  tempo?: number;
};

/** Evidence nodes — position (%), when they light within the loop, radius. */
const EVIDENCE = [
  { x: 68, y: 22, delay: 0.10, r: 3.5 },
  { x: 62, y: 44, delay: 0.16, r: 5.0 },
  { x: 72, y: 62, delay: 0.22, r: 3.0 },
  { x: 65, y: 78, delay: 0.28, r: 4.2 },
] as const;

/** Capability arcs — the right-hand column, with the confidence each reaches. */
const CAPABILITY = [
  { y: 26, confidence: 0.82, delay: 0.42, label: "systems thinking" },
  { y: 44, confidence: 0.64, delay: 0.50, label: "ownership" },
  { y: 62, confidence: 0.91, delay: 0.58, label: "communication" },
  { y: 80, confidence: 0.55, delay: 0.66, label: "resilience" },
] as const;

/** Utterance ticks on the left — the raw conversation. */
const UTTERANCE = Array.from({ length: 14 }, (_, i) => ({
  y: 14 + i * 5.6,
  w: 7 + ((i * 7) % 18),
  delay: 0.02 + i * 0.012,
}));

export function CapabilityGraph({ className, tempo = 1 }: Props) {
  const dur = 14 * tempo;

  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid meet"
        className="cg-root h-full w-full"
        style={{ ["--cg-dur" as string]: `${dur}s` }}
      >
        <defs>
          {/* Sweep gradient — the "reading head" travelling the width. */}
          <linearGradient id="cg-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--iris)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--iris)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--iris)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="cg-thread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--iris)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--iris)" stopOpacity="0.45" />
          </linearGradient>

          <radialGradient id="cg-node">
            <stop offset="0%" stopColor="var(--iris)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--iris)" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* ── stage 1: utterance — the raw conversation ───────────── */}
        <g className="cg-utterance">
          {UTTERANCE.map((u, i) => (
            <rect
              key={i}
              x={8}
              y={u.y}
              width={u.w}
              height={1.1}
              rx={0.55}
              fill="var(--ink-3)"
              opacity={0.5}
              style={{ ["--d" as string]: `${u.delay}` }}
            />
          ))}
        </g>

        {/* ── threads: utterance → evidence ───────────────────────── */}
        <g fill="none" stroke="url(#cg-thread)" strokeWidth={0.4}>
          {EVIDENCE.map((e, i) => (
            <path
              key={i}
              className="cg-thread"
              d={`M 30 ${28 + i * 16} C 46 ${28 + i * 16}, 50 ${e.y}, ${e.x - 3} ${e.y}`}
              style={{ ["--d" as string]: `${e.delay}` }}
            />
          ))}
        </g>

        {/* ── stage 2: evidence — what was extracted ──────────────── */}
        <g className="cg-evidence">
          {EVIDENCE.map((e, i) => (
            <g key={i} style={{ ["--d" as string]: `${e.delay}` }}>
              <circle cx={e.x} cy={e.y} r={e.r * 2.4} fill="var(--iris)" className="cg-halo" />
              <circle cx={e.x} cy={e.y} r={e.r} fill="url(#cg-node)" className="cg-core" />
            </g>
          ))}
        </g>

        {/* ── threads: evidence → capability ──────────────────────── */}
        <g fill="none" stroke="url(#cg-thread)" strokeWidth={0.4}>
          {CAPABILITY.map((c, i) => (
            <path
              key={i}
              className="cg-thread"
              d={`M ${EVIDENCE[i].x + 4} ${EVIDENCE[i].y} C 92 ${EVIDENCE[i].y}, 96 ${c.y}, 108 ${c.y}`}
              style={{ ["--d" as string]: `${c.delay}` }}
            />
          ))}
        </g>

        {/* ── stage 3: capability — confidence bars ───────────────── */}
        <g className="cg-capability">
          {CAPABILITY.map((c, i) => (
            <g key={i} style={{ ["--d" as string]: `${c.delay}` }}>
              {/* track */}
              <rect x={108} y={c.y - 0.9} width={44} height={1.8} rx={0.9} fill="var(--ink-3)" opacity={0.16} />
              {/* confidence fill — width is static; scaleX is animated (no layout) */}
              <rect
                className="cg-fill"
                x={108}
                y={c.y - 0.9}
                width={44 * c.confidence}
                height={1.8}
                rx={0.9}
                fill="var(--iris)"
              />
              <circle className="cg-cap-dot" cx={108 + 44 * c.confidence} cy={c.y} r={1.1} fill="var(--iris)" />
            </g>
          ))}
        </g>

        {/* ── the reading head ────────────────────────────────────── */}
        <rect className="cg-sweep" x={-18} y={2} width={18} height={96} fill="url(#cg-sweep)" />
      </svg>

      <style>{`
        /* One shared clock. Every stage offsets into it via --d (0–1), so the
           sweep and the reveals stay locked no matter how tempo changes. */
        .cg-root { overflow: visible; }

        .cg-utterance rect,
        .cg-thread,
        .cg-evidence g,
        .cg-capability g {
          animation: cgIn var(--cg-dur) var(--ease-soft) infinite;
          animation-delay: calc(var(--d) * var(--cg-dur) * -1 + var(--cg-dur));
        }

        .cg-utterance rect { transform-origin: 8% center; }

        @keyframes cgIn {
          0%,  3%   { opacity: 0; }
          9%,  90%  { opacity: 1; }
          97%, 100% { opacity: 0; }
        }

        .cg-thread {
          /* generous dash length — threads span ~50 units in the widened
             160x100 space, so a short dash would finish drawing early */
          stroke-dasharray: 130;
          stroke-dashoffset: 130;
          animation: cgDraw var(--cg-dur) var(--ease-out) infinite,
                     cgIn   var(--cg-dur) var(--ease-soft) infinite;
          animation-delay: calc(var(--d) * var(--cg-dur) * -1 + var(--cg-dur));
        }
        @keyframes cgDraw {
          0%, 6%    { stroke-dashoffset: 130; }
          24%, 92%  { stroke-dashoffset: 0; }
          100%      { stroke-dashoffset: 0; }
        }

        .cg-halo { opacity: 0.12; transform-box: fill-box; transform-origin: center;
                   animation: cgPulse calc(var(--cg-dur) / 3.5) var(--ease-soft) infinite; }
        @keyframes cgPulse {
          0%, 100% { transform: scale(0.72); opacity: 0.14; }
          50%      { transform: scale(1);    opacity: 0.05; }
        }

        .cg-fill { transform-box: fill-box; transform-origin: left center;
                   animation: cgFill var(--cg-dur) var(--ease-out) infinite;
                   animation-delay: inherit; }
        @keyframes cgFill {
          0%, 30%   { transform: scaleX(0); }
          50%, 92%  { transform: scaleX(1); }
          100%      { transform: scaleX(1); }
        }

        .cg-cap-dot { transform-box: fill-box; transform-origin: center;
                      animation: cgDot var(--cg-dur) var(--ease-out) infinite;
                      animation-delay: inherit; }
        @keyframes cgDot {
          0%, 46%  { opacity: 0; transform: scale(0.4); }
          56%, 92% { opacity: 1; transform: scale(1); }
          100%     { opacity: 0; }
        }

        .cg-sweep { animation: cgSweep var(--cg-dur) linear infinite; }
        @keyframes cgSweep {
          0%   { transform: translateX(0); }
          100% { transform: translateX(180px); }
        }

        /* Reduced motion: hold the finished state. The graph still reads —
           it just stops moving. Nothing is hidden from the user. */
        @media (prefers-reduced-motion: reduce) {
          .cg-root * { animation: none !important; }
          .cg-thread { stroke-dashoffset: 0; }
          .cg-fill   { transform: scaleX(1); }
          .cg-sweep  { display: none; }
          .cg-halo   { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
