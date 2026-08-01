"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {  } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/*
 * VoiceTextMorph — the living centerpiece of the "Voice or text" card.
 *
 * One canvas loops between two states of the same answer:
 *   1. Speaking — a mirrored waveform whose energy follows a speech-like
 *      envelope (bursts, pauses, a wandering formant), so it reads as a
 *      real voice rather than a metronome.
 *   2. Typing — the bars collapse onto the baseline and the same line
 *      re-types itself as rounded word blocks behind a blinking caret,
 *      with the untyped remainder ghosted ahead of it.
 * The morph between states is eased both ways, and a soft violet glow
 * tracks whichever element is "live" (the formant, then the caret).
 *
 * Performance: one rAF loop, DPR capped at 1.5, canvas-only drawing,
 * everything cancelled/disconnected on unmount. Always-on ambient motion.
 */

const CYCLE_MS = 12000;
const MAX_DPR = 1.5;

/** Cycle split: speaking 42% → morph 8% → typing 42% → morph 8%. */
const VOICE_END = 0.42;
const MORPH_IN_END = 0.5;
const TEXT_END = 0.92;

type Mode = "voice" | "text";

const BAR_COUNT = 56;
const TONE_DEEP = [124, 72, 241] as const; // #7C48F1
const TONE_PALE = [183, 155, 255] as const; // #B79BFF

/** Per-bar colour, deep violet at the edges melting to pale in the middle. */
const BAR_RGB: readonly string[] = Array.from({ length: BAR_COUNT }, (_, i) => {
  const fx = i / (BAR_COUNT - 1);
  const tone = Math.abs(fx - 0.5) * 2; // 0 centre → 1 edges
  const mix = (a: number, b: number) => Math.round(b + (a - b) * tone);
  return `${mix(TONE_DEEP[0], TONE_PALE[0])},${mix(TONE_DEEP[1], TONE_PALE[1])},${mix(
    TONE_DEEP[2],
    TONE_PALE[2],
  )}`;
});

/** Word widths in layout units — reads like a short typed sentence. */
const WORDS = [5, 3, 7, 2, 6, 4, 3, 6] as const;
const WORD_GAP = 1.7;
const TOTAL_UNITS = WORDS.reduce<number>((sum, w) => sum + w + WORD_GAP, 0) - WORD_GAP;
const WORD_ALPHA = [0.66, 0.5, 0.58, 0.46, 0.62, 0.5, 0.56, 0.6] as const;

const mono = { fontFamily: "var(--font-mono)" } as const;

const easeInOutSine = (t: number): number => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** 0 = fully voice, 1 = fully text, eased through both morphs. */
function modeMixAt(p: number): number {
  if (p < VOICE_END) return 0;
  if (p < MORPH_IN_END) return easeInOutSine((p - VOICE_END) / (MORPH_IN_END - VOICE_END));
  if (p < TEXT_END) return 1;
  return 1 - easeInOutSine((p - TEXT_END) / (1 - TEXT_END));
}

/** Speech-like loudness: overlapping slow sines give bursts and real pauses. */
function speechEnvAt(t: number): number {
  const raw =
    Math.sin(t * 1.7) * 0.55 + Math.sin(t * 0.61 + 1.3) * 0.45 + Math.sin(t * 2.9 + 4.1) * 0.3;
  return Math.min(1, Math.max(0, raw * 0.85 + 0.42));
}

/** Typing progress 0→1 across the text window (finishes early, then holds). */
function typedFractionAt(p: number): number {
  if (p < MORPH_IN_END) return 0;
  if (p >= TEXT_END) return 1;
  return Math.min(1, (p - MORPH_IN_END) / ((TEXT_END - MORPH_IN_END) * 0.82));
}

/** Where the caret sits (in layout units) for a given typed-unit count. */
function caretUnitsAt(typedUnits: number): number {
  let cursor = 0;
  let end = 0;
  for (const w of WORDS) {
    const visible = Math.min(w, Math.max(0, typedUnits - cursor));
    if (visible > 0) end = cursor + visible;
    cursor += w + WORD_GAP;
  }
  return end;
}

/** Footer strip of the focal card — typed caret + mode hint, on a light violet wash. */
export function VoiceTextCaption() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-7 py-3.5 md:px-8"
      style={{
        background: "rgba(154,107,255,0.06)",
        borderTop: "1px solid rgba(154,107,255,0.16)",
      }}
    >
      <p className="flex items-center text-[13px] text-[var(--iris-ink)]" style={mono}>
        or type it out
        <motion.span
          aria-hidden
          className="ml-1 inline-block h-[14px] w-[1.5px]"
          style={{ background: "var(--iris)" }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </p>
      <span
        className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-2)] opacity-70"
        style={mono}
      >
        switch anytime
      </span>
    </div>
  );
}

export function VoiceTextMorph({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<Mode>("voice");
  const [mode, setMode] = useState<Mode>("voice");

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
      const p = (elapsed % CYCLE_MS) / CYCLE_MS;
      const m = modeMixAt(p);

      const next: Mode = m > 0.5 ? "text" : "voice";
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);
      }

      ctx.clearRect(0, 0, width, height);
      const cy = height * 0.52;
      const x0 = width * 0.07;
      const span = width * 0.86;
      const unit = span / TOTAL_UNITS;

      const env = speechEnvAt(t);
      const focus = 0.5 + 0.3 * Math.sin(t * 0.47) + 0.13 * Math.sin(t * 1.31 + 2.1);
      const typedUnits = typedFractionAt(p) * TOTAL_UNITS;
      const caretX = x0 + caretUnitsAt(typedUnits) * unit + (typedUnits > 0 ? 4 : 0);

      // Soft glow that tracks the live element: formant while speaking, caret while typing.
      const glowX = (x0 + focus * span) * (1 - m) + caretX * m;
      const glowAlpha = (0.08 + 0.1 * env) * (1 - m) + 0.09 * m;
      const glowR = height * 0.62;
      const grad = ctx.createRadialGradient(glowX, cy, 0, glowX, cy, glowR);
      grad.addColorStop(0, `rgba(154,107,255,${glowAlpha.toFixed(3)})`);
      grad.addColorStop(1, "rgba(154,107,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(glowX - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Baseline — the shared spine both states live on.
      ctx.strokeStyle = "rgba(139,84,255,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, cy);
      ctx.lineTo(x0 + span, cy);
      ctx.stroke();

      // Speaking — mirrored bars with a wandering formant and speech bursts.
      const barScale = 1 - m;
      if (barScale > 0.01) {
        const maxAmp = height * 0.34;
        const barW = Math.min(3.2, (span / BAR_COUNT) * 0.42);
        for (let i = 0; i < BAR_COUNT; i += 1) {
          const fx = i / (BAR_COUNT - 1);
          const x = x0 + fx * span;
          const d = fx - focus;
          const formant = Math.exp(-d * d * 9);
          const detail =
            0.5 + 0.5 * Math.sin(i * 0.83 + t * 6.4) * Math.sin(i * 0.37 - t * 3.9);
          const amp =
            maxAmp * barScale * (0.05 + env * (0.14 + 0.8 * formant) * (0.3 + 0.7 * detail));
          const alpha = (0.3 + 0.55 * (amp / (maxAmp || 1))) * (0.35 + 0.65 * barScale);
          ctx.fillStyle = `rgba(${BAR_RGB[i]},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.roundRect(x - barW / 2, cy - amp, barW, Math.max(amp * 2, 2), barW / 2);
          ctx.fill();
        }
      }

      // Typing — word blocks type on left to right; the rest is ghosted ahead.
      if (m > 0.01) {
        const blockH = Math.min(11, height * 0.09);
        let cursor = 0;
        WORDS.forEach((w, wi) => {
          const bx = x0 + cursor * unit;
          const visible = Math.min(w, Math.max(0, typedUnits - cursor));
          const ghost = w - visible;
          if (visible > 0.05) {
            ctx.fillStyle = `rgba(124,72,241,${(WORD_ALPHA[wi] * m).toFixed(3)})`;
            ctx.beginPath();
            ctx.roundRect(bx, cy - blockH / 2, visible * unit, blockH, blockH / 2);
            ctx.fill();
          }
          if (ghost > 0.05) {
            ctx.fillStyle = `rgba(124,72,241,${(0.09 * m).toFixed(3)})`;
            ctx.beginPath();
            ctx.roundRect(bx + visible * unit, cy - blockH / 2, ghost * unit, blockH, blockH / 2);
            ctx.fill();
          }
          cursor += w + WORD_GAP;
        });

        // Caret — solid while typing, blinking once the line is complete.
        const done = typedUnits >= TOTAL_UNITS - 0.01;
        const blink = done ? (Math.sin(t * Math.PI * 1.9) > 0 ? 1 : 0.12) : 1;
        ctx.fillStyle = `rgba(105,34,245,${(0.85 * m * blink).toFixed(3)})`;
        ctx.beginPath();
        ctx.roundRect(caretX, cy - height * 0.105, 2, height * 0.21, 1);
        ctx.fill();
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
    <div ref={wrapRef} aria-hidden className={cn("relative h-full w-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute left-5 top-4 md:left-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={mode}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(139,84,255,0.18)",
              boxShadow: "0 8px 20px -12px rgba(60,35,140,0.4)",
              color: "var(--iris-ink)",
              fontFamily: "var(--font-mono)",
            }}
          >
            
            {mode === "voice" ? "Speaking" : "Typing"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
