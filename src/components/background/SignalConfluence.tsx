"use client";

import { useEffect, useRef } from "react";

/*
 * SignalConfluence — the live motion graphic behind "The difference".
 *
 * The argument, animated: scattered resume fragments (tiny tumbling glyph
 * dashes and motes, loosely linked into a drifting constellation) migrate
 * rightward, progressively aligning with the flow until they pour into ONE
 * flowing lavender ribbon that pinches into a breathing focal point — the
 * one honest conversation — ringed by slowly rotating dashed orbits.
 * Fragments that arrive are absorbed with a soft ripple and respawn as new
 * noise on the left. Everything moves, every frame.
 *
 * Always-on ambient motion (project policy: decorative motion plays under
 * prefers-reduced-motion — `reduce` is pinned to false). DPR capped at 1.5,
 * one rAF loop paused via IntersectionObserver when offscreen,
 * ResizeObserver, full cleanup on unmount. Fills its parent.
 */

type MoteKind = "dot" | "glyph";

type Mote = {
  u: number; // 0..1 progress toward the focal point
  lane: number; // 0..1 vertical home while scattered
  drift: number; // wander amplitude as a fraction of height
  wanderFreq: number; // rad / s
  wanderPhase: number;
  speed: number; // base u per second
  size: number; // dot radius or glyph half-length (px)
  kind: MoteKind;
  spin: number; // tumbling angle while scattered
  spinSpeed: number; // rad / s
  tint: number; // palette index
};

type Ripple = { age: number };

const FOCAL_X = 0.8; // focal point, fraction of width
const FOCAL_Y = 0.52; // fraction of height
const PAD = 40; // px overshoot past the left edge
const LINK_DIST = 74; // px — constellation link radius
const LINK_MAX_U = 0.38; // only scattered motes join the constellation
const RIPPLE_LIFE = 0.9; // seconds
const WAVE_FREQ = 0.02; // spatial frequency of the coherent wave
const WAVE_SPEED = 2.1; // rad / s

const LAVENDER: readonly [number, number, number] = [154, 107, 255];
const LILAC: readonly [number, number, number] = [183, 155, 255];
const IRIS_SOFT: readonly [number, number, number] = [139, 84, 255];
const FROST_BLUE: readonly [number, number, number] = [126, 168, 255];
const PALETTE = [LAVENDER, LILAC, IRIS_SOFT, FROST_BLUE] as const;

const smooth = (p: number): number => {
  const c = Math.min(1, Math.max(0, p));
  return c * c * (3 - 2 * c);
};

const makeRnd = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

const spawnMote = (rnd: () => number, atStart: boolean): Mote => ({
  u: atStart ? rnd() * 0.06 : rnd(),
  lane: rnd(),
  drift: 0.02 + rnd() * 0.05,
  wanderFreq: 0.5 + rnd() * 1.1,
  wanderPhase: rnd() * Math.PI * 2,
  speed: 0.035 + rnd() * 0.05,
  size: 2.2 + rnd() * 4.2,
  kind: rnd() > 0.42 ? "glyph" : "dot",
  spin: rnd() * Math.PI * 2,
  spinSpeed: (rnd() - 0.5) * 2.4,
  tint: Math.floor(rnd() * PALETTE.length),
});

export function SignalConfluence({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = false; // project policy: ambient motion always plays
    void reduce;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let motes: Mote[] = [];
    let ripples: Ripple[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rnd = makeRnd(7331);
      const count = Math.max(46, Math.min(84, Math.round(w / 15)));
      motes = Array.from({ length: count }, () => spawnMote(rnd, false));
      ripples = [];
    };

    // Position of a mote at progress `u`, time `t` (seconds). Scattered lanes
    // + wander collapse into one coherent wave that pinches into the focus.
    const posAt = (m: Mote, u: number, t: number): [number, number] => {
      const fx = w * FOCAL_X;
      const fy = h * FOCAL_Y;
      const x = -PAD + u * (fx + PAD);
      const conv = smooth((u - 0.12) / 0.74);
      const spread = 1 - conv;
      const wander =
        Math.sin(t * m.wanderFreq + m.wanderPhase) * m.drift * h * spread +
        Math.cos(t * m.wanderFreq * 0.63 + m.wanderPhase * 2.1) *
          m.drift *
          h *
          0.5 *
          spread;
      const pinch = 1 - smooth((u - 0.86) / 0.14);
      const wave =
        Math.sin(x * WAVE_FREQ - t * WAVE_SPEED) * h * 0.035 * conv * pinch;
      const laneY = (0.08 + 0.84 * m.lane) * h;
      return [x, laneY + (fy - laneY) * conv + wander + wave];
    };

    // Faint links among still-scattered motes: the noisy constellation.
    const drawLinks = (t: number) => {
      const pts: Array<[number, number]> = [];
      for (const m of motes) {
        if (m.u < LINK_MAX_U) pts.push(posAt(m, m.u, t));
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i][0] - pts[j][0];
          const dy = pts[i][1] - pts[j][1];
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const a = 0.13 * (1 - Math.sqrt(d2) / LINK_DIST);
          ctx.strokeStyle = `rgba(${LAVENDER[0]},${LAVENDER[1]},${LAVENDER[2]},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
      }
    };

    // One flowing ribbon: the merged signal, pinching into the focal point.
    const drawRibbon = (t: number) => {
      const fx = w * FOCAL_X;
      const fy = h * FOCAL_Y;
      const x0 = w * 0.42;
      const steps = 40;
      const center = (x: number): number => {
        const env = smooth((x - x0) / (w * 0.1)) * (1 - smooth((x - fx + w * 0.06) / (w * 0.06)));
        return fy + Math.sin(x * WAVE_FREQ - t * WAVE_SPEED) * h * 0.035 * env;
      };
      const halfW = (p: number): number => 2 + 34 * p * (1 - p) * (1 - p);

      const grad = ctx.createLinearGradient(x0, 0, fx, 0);
      grad.addColorStop(0, `rgba(${LILAC[0]},${LILAC[1]},${LILAC[2]},0)`);
      grad.addColorStop(0.55, `rgba(${LILAC[0]},${LILAC[1]},${LILAC[2]},0.2)`);
      grad.addColorStop(1, `rgba(${LAVENDER[0]},${LAVENDER[1]},${LAVENDER[2]},0.34)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const p = k / steps;
        const x = x0 + (fx - x0) * p;
        const y = center(x) - halfW(p);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let k = steps; k >= 0; k--) {
        const p = k / steps;
        const x = x0 + (fx - x0) * p;
        ctx.lineTo(x, center(x) + halfW(p));
      }
      ctx.closePath();
      ctx.fill();

      // bright animated centerline riding the same wave
      ctx.strokeStyle = `rgba(${IRIS_SOFT[0]},${IRIS_SOFT[1]},${IRIS_SOFT[2]},0.4)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let k = 0; k <= steps; k++) {
        const x = x0 + (fx - x0) * (k / steps);
        if (k === 0) ctx.moveTo(x, center(x));
        else ctx.lineTo(x, center(x));
      }
      ctx.stroke();
    };

    const drawMotes = (t: number, dt: number) => {
      for (const m of motes) {
        m.u += m.speed * (0.55 + 1.1 * m.u) * dt; // accelerate toward focus
        m.spin += m.spinSpeed * dt;
        if (m.u >= 1) {
          const fresh = spawnMote(makeRnd((m.wanderPhase * 1e6) >>> 0), true);
          Object.assign(m, fresh);
          ripples = [...ripples.slice(-5), { age: 0 }];
          continue;
        }
        const conv = smooth((m.u - 0.12) / 0.74);
        const [x, y] = posAt(m, m.u, t);
        const [x2, y2] = posAt(m, Math.min(1, m.u + 0.012), t);
        const pathAng = Math.atan2(y2 - y, x2 - x);
        const [r, g, b] = PALETTE[m.tint];
        const alpha = 0.24 + 0.5 * conv;

        if (m.kind === "glyph") {
          // a redacted resume line: tumbles while scattered, aligns with flow
          const ang = m.spin * (1 - conv) + pathAng * conv;
          const len = m.size * (2.4 - 1.1 * conv);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(ang);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.7;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-len, 0);
          ctx.lineTo(len, 0);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, m.size * (0.6 + 0.25 * conv), 0, Math.PI * 2);
          ctx.fill();
        }

        // white-hot streak on final approach
        if (m.u > 0.9) {
          const heat = smooth((m.u - 0.9) / 0.1);
          ctx.globalCompositeOperation = "lighter";
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
          glow.addColorStop(0, `rgba(255,255,255,${(0.7 * heat).toFixed(3)})`);
          glow.addColorStop(1, "rgba(171, 149, 255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }
      }
    };

    const drawRipples = (dt: number) => {
      const fx = w * FOCAL_X;
      const fy = h * FOCAL_Y;
      ripples = ripples
        .map((rp) => ({ age: rp.age + dt }))
        .filter((rp) => rp.age < RIPPLE_LIFE);
      for (const rp of ripples) {
        const f = rp.age / RIPPLE_LIFE;
        ctx.strokeStyle = `rgba(${LILAC[0]},${LILAC[1]},${LILAC[2]},${(0.4 * (1 - f)).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(fx, fy, 8 + f * 34, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawFocus = (t: number) => {
      const fx = w * FOCAL_X;
      const fy = h * FOCAL_Y;
      const breath = 1 + 0.12 * Math.sin(t * 2);

      ctx.globalCompositeOperation = "lighter";
      const glowR = h * 0.18 * breath;
      const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
      glow.addColorStop(0, "rgba(255,255,255,0.6)");
      glow.addColorStop(0.3, `rgba(${LILAC[0]},${LILAC[1]},${LILAC[2]},0.32)`);
      glow.addColorStop(1, "rgba(171, 149, 255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // two counter-rotating dashed orbit rings — always visibly turning
      const orbits: ReadonlyArray<[number, number, number]> = [
        [h * 0.13 * breath, 42, 1], // [radius, dash offset speed, direction]
        [h * 0.2, 26, -1],
      ];
      for (const [radius, speed, dir] of orbits) {
        ctx.strokeStyle = `rgba(${LAVENDER[0]},${LAVENDER[1]},${LAVENDER[2]},0.4)`;
        ctx.lineWidth = 1.1;
        ctx.setLineDash([3, 9]);
        ctx.lineDashOffset = dir * t * speed;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      // slow outward pulse ring
      const f = (t / 3) % 1;
      ctx.strokeStyle = `rgba(${LAVENDER[0]},${LAVENDER[1]},${LAVENDER[2]},${(0.3 * (1 - f)).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(fx, fy, 12 + f * h * 0.26, 0, Math.PI * 2);
      ctx.stroke();

      // solid core
      const core = ctx.createRadialGradient(fx, fy, 0, fx, fy, 7);
      core.addColorStop(0, "rgba(255,255,255,0.98)");
      core.addColorStop(1, `rgba(${IRIS_SOFT[0]},${IRIS_SOFT[1]},${IRIS_SOFT[2]},0.55)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(fx, fy, 7 * breath, 0, Math.PI * 2);
      ctx.fill();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let running = false;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      drawLinks(t);
      drawRibbon(t);
      drawMotes(t, dt);
      drawRipples(dt);
      drawFocus(t);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Animate only while on (or near) screen.
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
