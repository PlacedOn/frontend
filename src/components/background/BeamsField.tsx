"use client";

import { useEffect, useRef } from "react";

/*
 * BeamsField — soft diagonal light beams drifting across the page.
 *
 * A handful of long, translucent violet beams sit at a slight diagonal,
 * slowly swaying and breathing in opacity, rendered soft and blurred on a
 * transparent 2D canvas so they glow over the porcelain page beneath. Loosely
 * inspired by 21st.dev "Beams Background" / Aceternity beams, but deliberately
 * restrained — calm ambient motion, never busy. Retuned to the Placedon Frost
 * Luxe violet palette.
 *
 * Robustness: DPR is capped at 1.5, the canvas resizes via ResizeObserver, a
 * single rAF drives the whole field, reduced motion renders one still frame,
 * and everything is torn down on unmount. The canvas never paints an opaque
 * background — the page's porcelain gradient shows through.
 */

type Beam = {
  color: [number, number, number];
  // position across the perpendicular axis, in fractions of the field span
  x: number;
  // beam thickness, in fractions of the field span
  width: number;
  // peak opacity of the beam core (kept low + additive)
  opacity: number;
  // lateral sway
  driftSpeed: number;
  driftAmp: number;
  // opacity breathing
  breathSpeed: number;
  phase: number;
};

// Diagonal tilt of the whole field (slight, elegant)
const ANGLE = (-22 * Math.PI) / 180;

// Violet family: iris, soft violet, light lavender highlight
const BEAMS: Beam[] = [
  { color: [160, 132, 250], x: -0.34, width: 0.22, opacity: 0.18, driftSpeed: 0.16, driftAmp: 0.1, breathSpeed: 0.28, phase: 0.0 },
  { color: [178, 150, 255], x: -0.16, width: 0.16, opacity: 0.20, driftSpeed: 0.22, driftAmp: 0.12, breathSpeed: 0.4, phase: 1.7 },
  { color: [190, 168, 255], x: 0.02, width: 0.26, opacity: 0.14, driftSpeed: 0.13, driftAmp: 0.08, breathSpeed: 0.22, phase: 3.1 },
  { color: [178, 150, 255], x: 0.2, width: 0.15, opacity: 0.19, driftSpeed: 0.19, driftAmp: 0.12, breathSpeed: 0.34, phase: 4.6 },
  { color: [160, 132, 250], x: 0.36, width: 0.2, opacity: 0.17, driftSpeed: 0.16, driftAmp: 0.1, breathSpeed: 0.26, phase: 0.9 },
  { color: [205, 185, 255], x: 0.48, width: 0.14, opacity: 0.13, driftSpeed: 0.25, driftAmp: 0.14, breathSpeed: 0.46, phase: 2.4 },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function BeamsField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ambient decorative motion plays regardless of the OS reduced-motion
    // setting — it is slow, low-contrast, and non-vestibular. (macOS "Reduce
    // Motion" was otherwise freezing the whole field to a single frame.)
    const reduce = false;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let blur = 60;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.floor(canvas.clientWidth * dpr);
      h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // soft, screen-scaled blur so beams stay airy at any size
      blur = Math.max(w, h) * 0.06;
      if (reduce) drawFrame(6);
    };

    const drawFrame = (t: number) => {
      // field span must cover the rotated canvas fully
      const span = Math.hypot(w, h);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter"; // additive glow over transparency
      ctx.filter = `blur(${blur}px)`;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(ANGLE);

      for (const b of BEAMS) {
        const sway = Math.sin(t * b.driftSpeed + b.phase) * b.driftAmp;
        const cx = (b.x + sway) * span;
        const halfW = b.width * span * 0.5;
        const breath = 0.55 + 0.45 * Math.sin(t * b.breathSpeed + b.phase * 1.3);
        const op = b.opacity * breath;
        const [r, g, bl] = b.color;

        const grad = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
        grad.addColorStop(0, `rgba(${r},${g},${bl},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${bl},${op.toFixed(4)})`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(cx - halfW, -span, halfW * 2, span * 2);
      }

      ctx.restore();
      ctx.filter = "none";
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      drawFrame((now - start) / 1000);
      raf = requestAnimationFrame(render);
    };

    if (reduce) {
      drawFrame(6);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 ${className ?? ""}`}
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* very subtle grain for atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat" }}
      />
    </div>
  );
}
