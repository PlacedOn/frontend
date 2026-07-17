"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import type { SkillEvidence } from "@/lib/v1";
import { BandDot } from "./chips";

type Props = {
  /** Skills with interview evidence — rendered lit. */
  evidenced: SkillEvidence[];
  /** Taxonomy-adjacent skills to develop — rendered dim, waiting to light up. */
  toDevelop: SkillEvidence[];
};

type Node = {
  label: string;
  lit: boolean;
  emerging: boolean;
  h1: number; // deterministic jitter seeds from skill_id
  h2: number;
  x: number; // 0..1 — set by layout()
  y: number; // 0..1 — set by layout()
  z: number; // 0.55..1 pseudo-depth: scales size, drift and parallax
  phase: number;
  speed: number;
};

const IRIS = "#6922F5";
const IRIS_SOFT = "#8B54FF";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function buildNodes(evidenced: SkillEvidence[], toDevelop: SkillEvidence[]): Node[] {
  const all = [
    ...evidenced.map((s) => ({ s, lit: true })),
    ...toDevelop.map((s) => ({ s, lit: false })),
  ];
  return all.map(({ s, lit }) => {
    const h1 = hash(s.skill_id);
    const h2 = hash(s.skill_id + ":y");
    return {
      label: s.skill_label,
      lit,
      emerging: s.band === "emerging",
      h1,
      h2,
      x: 0.5,
      y: 0.5,
      z: 0.55 + 0.45 * hash(s.skill_id + ":z"),
      phase: h1 * Math.PI * 2,
      speed: 0.35 + h2 * 0.4,
    };
  });
}

/**
 * Wide canvases spread nodes across staggered columns; narrow ones fall back
 * to a two-column vertical ladder so labels never collide on phones.
 */
function layoutNodes(nodes: Node[], width: number): void {
  const n = nodes.length;
  const narrow = width < 520;
  nodes.forEach((node, i) => {
    if (narrow) {
      node.x = (i % 2 === 0 ? 0.32 : 0.68) + (node.h1 - 0.5) * 0.1;
      node.y = 0.08 + 0.78 * ((i + 0.5) / n);
    } else {
      const col = (i + 0.5) / n;
      node.x = 0.08 + 0.84 * (col + ((node.h1 - 0.5) * 0.35) / n);
      node.y = (i % 2 === 0 ? 0.3 : 0.62) + (node.h2 - 0.5) * 0.18;
    }
  });
}

/**
 * Canvas constellation of the candidate's skill map: evidenced skills glow
 * iris; skills to develop sit dim until evidence lights them. Nodes drift on
 * a depth axis and parallax with the pointer. Static render under
 * prefers-reduced-motion.
 */
export function SkillConstellation({ evidenced, toDevelop }: Props) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, { amount: 0.15 });
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = buildNodes(evidenced, toDevelop);
    const fontFamily = getComputedStyle(wrap).fontFamily || "system-ui";
    let width = 0;
    let height = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutNodes(nodes, width);
    };

    const positionOf = (node: Node, t: number) => {
      const driftX = reduce ? 0 : Math.sin(t * node.speed + node.phase) * 7 * node.z;
      const driftY = reduce ? 0 : Math.cos(t * node.speed * 0.8 + node.phase) * 5 * node.z;
      const parX = (mouse.current.x - 0.5) * 16 * node.z;
      const parY = (mouse.current.y - 0.5) * 10 * node.z;
      return { x: node.x * width + driftX + parX, y: node.y * height + driftY + parY };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const pts = nodes.map((node) => positionOf(node, t));

      // links: each dim node reaches toward its nearest lit node (growth path)
      ctx.lineWidth = 1;
      nodes.forEach((a, i) => {
        if (a.lit) return;
        let best = -1;
        let bestD = Infinity;
        nodes.forEach((b, j) => {
          if (!b.lit) return;
          const d = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = j;
          }
        });
        if (best < 0) return;
        ctx.strokeStyle = "rgba(105,34,245,0.14)";
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[best].x, pts[best].y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      // lit-to-lit web
      nodes.forEach((a, i) => {
        if (!a.lit) return;
        nodes.forEach((b, j) => {
          if (j <= i || !b.lit) return;
          ctx.strokeStyle = "rgba(105,34,245,0.20)";
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        });
      });

      nodes.forEach((node, i) => {
        const { x, y } = pts[i];
        const r = 3 + 3.5 * node.z;
        if (node.lit) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
          glow.addColorStop(0, "rgba(139,84,255,0.35)");
          glow.addColorStop(1, "rgba(139,84,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, r * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = node.emerging ? IRIS_SOFT : IRIS;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(123,130,153,0.9)";
          ctx.setLineDash([2.5, 3]);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineWidth = 1;
        }
        ctx.font = `${node.lit ? 700 : 500} ${10 + 2 * node.z}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.fillStyle = node.lit ? "#0E1020" : "#7B8299";
        ctx.fillText(node.label, x, y + r + 16);
      });
    };

    const loop = (now: number) => {
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    ro.observe(wrap);

    if (reduce || !inView) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [evidenced, toDevelop, reduce, inView]);

  const handleMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  return (
    <div className="glass overflow-hidden rounded-[var(--r-card)]">
      <div
        ref={wrapRef}
        onMouseMove={handleMove}
        className="relative h-[420px] w-full sm:h-[340px]"
        role="img"
        aria-label={`Skill map: ${evidenced.map((s) => s.skill_label).join(", ")} are evidenced; ${toDevelop
          .map((s) => s.skill_label)
          .join(", ")} are next to develop.`}
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />
      </div>
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-6 py-3.5 text-[12px] font-semibold text-[var(--ink-2)]"
        style={{ borderColor: "var(--glass-line)" }}
      >
        <span className="inline-flex items-center gap-2"><BandDot band="supported" /> Evidenced in your interview</span>
        <span className="inline-flex items-center gap-2"><BandDot band="emerging" /> Emerging</span>
        <span className="inline-flex items-center gap-2"><BandDot band="needs_more_evidence" /> Lights up when you build evidence</span>
      </div>
    </div>
  );
}
