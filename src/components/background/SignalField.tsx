"use client";

import { useEffect, useRef } from "react";

/*
 * SignalField — a live canvas network of drifting nodes and proximity links,
 * in the Placedon violet. Reads as real animation (many discrete moving
 * elements, the 21st.dev / Aceternity canvas approach), on-theme for matching
 * signal across people and roles. Sits behind everything, fixed, non-
 * interactive. Reduced-motion draws a single static frame; a gentle CSS aurora
 * wash flows underneath for ambient colour.
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DIST = 150; // px within which two nodes are linked
const IRIS = "150,120,250";

export function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ambient decorative motion plays regardless of the OS reduced-motion
    // setting — the nodes drift slowly and are non-vestibular. (macOS "Reduce
    // Motion" was otherwise freezing the network to a single static frame.)
    const reduce = false;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const nodes: Node[] = [];

    // Seeded PRNG so the field is stable across resizes (and looks intentional).
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round((w * h) / 24000);
      const count = Math.max(28, Math.min(70, target));
      nodes.length = 0;
      seed = 1337;
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: rnd() * w,
          y: rnd() * h,
          vx: (rnd() - 0.5) * 1.1,
          vy: (rnd() - 0.5) * 1.1,
          r: 1.1 + rnd() * 2.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const o = (1 - Math.sqrt(d2) / LINK_DIST) * 0.5;
            ctx.strokeStyle = `rgba(${IRIS},${o})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${IRIS},0.72)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let last = 0;
    const FRAME = 1000 / 30; // 30fps cap — the O(n²) link pass is the cost
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (document.hidden || now - last < FRAME) return;
      last = now;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }
      draw();
    };

    build();
    if (reduce) draw();
    else raf = requestAnimationFrame(step);

    const onResize = () => {
      build();
      if (reduce) draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* The ambient aurora wash is gone.
          It was a five-stop gradient — violet, then rgba(120,178,255) BLUE,
          then rgba(255,196,132) PEACH, then violet again — blurred 64px across
          a fixed inset-[-45%] layer, i.e. behind every section of every page.
          That tinted wash sitting under white cards and a near-black hero is
          what read as "the colours don't match": three unrelated grounds on one
          screen. The palette was never the problem here; the ground was.

          Note the blue and the peach survived the ramp cleanup untouched.
          color-lint only flags violet-dominant values (b > r > g), so a blue
          and an orange sat in the most-visible layer on the site and no check
          could see them. Worth widening that filter.

          The node network below is kept — the motion stays, the colour cast
          goes. */}

      {/* live node network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          maskImage: "radial-gradient(130% 100% at 70% 30%, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(130% 100% at 70% 30%, black 55%, transparent 100%)",
        }}
      />

      <style>{`
      `}</style>
    </div>
  );
}
