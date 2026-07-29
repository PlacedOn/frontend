"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

/*
 * CalmField — the breathing centerpiece of the pre-interview page.
 *
 * A single canvas renders concentric rings of soft lavender dots that expand
 * and contract on a slow 8s breath cycle (inhale → hold → exhale → rest).
 * Each ring lags the previous one slightly, so the breath visibly ripples
 * outward, while a thin progress arc fills and empties in time with the
 * lungs. A mono "Breathe in / Hold / Breathe out" cue crossfades at the
 * center, driven by the same clock.
 *
 * Performance: one rAF loop, DPR capped at 1.5, canvas-only drawing,
 * everything cancelled/disconnected on unmount.
 */

const BREATH_MS = 8000;
const MAX_DPR = 1.5;

type Phase = "in" | "hold" | "out" | "rest";

const PHASE_LABEL: Record<Phase, string> = {
  in: "Breathe in",
  hold: "Hold",
  out: "Breathe out",
  rest: "Rest",
};

/** Cycle split: inhale 40% → hold 10% → exhale 44% → rest 6%. */
const INHALE_END = 0.4;
const HOLD_END = 0.5;
const EXHALE_END = 0.94;

type Ring = {
  readonly radius: number; // fraction of outer radius
  readonly count: number;
  readonly size: number; // base dot radius in px
  readonly speed: number; // rotation, radians per second
  readonly tone: number; // 0 = deep lavender, 1 = pale lavender
};

const RINGS: readonly Ring[] = [
  { radius: 0.28, count: 10, size: 1.8, speed: 0.055, tone: 0 },
  { radius: 0.38, count: 16, size: 1.7, speed: -0.042, tone: 0.14 },
  { radius: 0.48, count: 22, size: 1.6, speed: 0.034, tone: 0.3 },
  { radius: 0.58, count: 28, size: 1.5, speed: -0.028, tone: 0.46 },
  { radius: 0.68, count: 34, size: 1.4, speed: 0.022, tone: 0.62 },
  { radius: 0.78, count: 40, size: 1.3, speed: -0.017, tone: 0.78 },
  { radius: 0.88, count: 46, size: 1.2, speed: 0.013, tone: 0.92 },
];

const TONE_DEEP = [139, 84, 255] as const; // #7462D5
const TONE_PALE = [183, 155, 255] as const; // #ADA8ED

const RING_RGB: readonly string[] = RINGS.map((ring) => {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * ring.tone);
  return `${mix(TONE_DEEP[0], TONE_PALE[0])},${mix(TONE_DEEP[1], TONE_PALE[1])},${mix(
    TONE_DEEP[2],
    TONE_PALE[2],
  )}`;
});

const easeInOutSine = (t: number): number => 0.5 - 0.5 * Math.cos(Math.PI * t);

function phaseAt(p: number): Phase {
  if (p < INHALE_END) return "in";
  if (p < HOLD_END) return "hold";
  if (p < EXHALE_END) return "out";
  return "rest";
}

/** 0 → 1 → 0 over one cycle, with a hold at the top and a rest at the bottom. */
function breathAt(p: number): number {
  const t = ((p % 1) + 1) % 1;
  if (t < INHALE_END) return easeInOutSine(t / INHALE_END);
  if (t < HOLD_END) return 1;
  if (t < EXHALE_END) return 1 - easeInOutSine((t - HOLD_END) / (EXHALE_END - HOLD_END));
  return 0;
}

export function CalmField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>("in");
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      const t = elapsed / 1000;
      const p = (elapsed % BREATH_MS) / BREATH_MS;
      const b = breathAt(p);

      const next = phaseAt(p);
      if (next !== phaseRef.current) {
        phaseRef.current = next;
        setPhase(next);
      }

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.5 * 0.94;

      // Soft breathing core glow.
      const glowR = R * (0.42 + 0.1 * b);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grad.addColorStop(0, `rgba(141,132,224,${(0.2 + 0.13 * b).toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(141,132,224,${(0.1 + 0.08 * b).toFixed(3)})`);
      grad.addColorStop(1, "rgba(141,132,224,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Concentric dot rings — the breath ripples outward ring by ring.
      RINGS.forEach((ring, i) => {
        const rb = breathAt(p - i * 0.032);
        const r = R * ring.radius * (0.94 + 0.085 * rb);
        const rot = t * ring.speed;
        const rgb = RING_RGB[i];
        for (let j = 0; j < ring.count; j += 1) {
          const a = rot + (j / ring.count) * Math.PI * 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const shimmer = 0.5 + 0.5 * Math.sin(t * 0.6 + j * 1.7 + i * 0.9);
          const alpha = (0.2 + 0.42 * rb) * (0.65 + 0.35 * shimmer);
          const size = ring.size * (0.82 + 0.36 * rb);
          ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Breath track + progress arc (fills on inhale, empties on exhale).
      const arcR = R * 0.985;
      ctx.lineCap = "round";
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = "rgba(116,98,213,0.14)";
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
      ctx.stroke();
      if (b > 0.004) {
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = "rgba(116,98,213,0.55)";
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={cn("relative aspect-square w-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center" style={{ fontFamily: "var(--font-mono)" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-[12.5px] uppercase tracking-[0.3em] text-[var(--iris-ink)]"
            >
              {PHASE_LABEL[phase]}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 text-[10.5px] uppercase tracking-[0.22em] text-[var(--ink-2)] opacity-70">
            no timer · no score
          </p>
        </div>
      </div>
    </div>
  );
}
