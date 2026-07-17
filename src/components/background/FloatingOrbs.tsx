"use client";

import { useEffect, useRef } from "react";

/*
 * FloatingOrbs — a soft field of luminous violet/white bokeh orbs that drift
 * slowly upward with a gentle sway, rendered additively on a transparent
 * canvas. Ported from the 21st.dev "Aurora Background (lavender)" / bokeh
 * direction, retuned to Placedon. Adds premium depth over the hero aurora
 * without stealing focus from the copy. Fixed nowhere — it fills its parent.
 */

type Orb = {
  x: number; // 0..1 across width
  y: number; // 0..1 across height (drifts down→up as it rises)
  r: number; // radius in px at base scale
  hue: [number, number, number];
  speed: number; // vertical rise, fraction of height per second
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
};

const VIOLET: [number, number, number] = [150, 110, 250];
const LAV: [number, number, number] = [190, 165, 255];
const WHITE: [number, number, number] = [235, 228, 255];

function build(count: number): Orb[] {
  let seed = 9137;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const palette = [VIOLET, LAV, WHITE];
  return Array.from({ length: count }, () => ({
    x: rnd(),
    y: rnd(),
    r: 14 + rnd() * 46,
    hue: palette[Math.floor(rnd() * palette.length)],
    speed: 0.012 + rnd() * 0.03,
    swayAmp: 0.01 + rnd() * 0.03,
    swaySpeed: 0.15 + rnd() * 0.35,
    phase: rnd() * Math.PI * 2,
    alpha: 0.05 + rnd() * 0.12,
  }));
}

export function FloatingOrbs({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const orbs = build(16);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const o of orbs) {
        const rise = (o.y - ((t * o.speed) % 1) + 1) % 1; // continuous upward loop
        const cx = (o.x + Math.sin(t * o.swaySpeed + o.phase) * o.swayAmp) * w;
        const cy = rise * h;
        // fade near top & bottom edges so orbs appear/vanish softly
        const edge = Math.min(1, rise / 0.12, (1 - rise) / 0.12);
        const a = o.alpha * Math.max(0, edge);
        const [r, g, b] = o.hue;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a.toFixed(4)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let running = false;
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Pause the orbs when the hero is scrolled off-screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}
