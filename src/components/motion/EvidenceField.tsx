"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/cn";

/*
 * EvidenceField — a calm depth composition for "The difference".
 *
 * Three translucent violet "evidence" planes float at different depths behind
 * and beside the copy, ringed by faint orbital signal lines, with the Placedon
 * mark suspended in front. On a fine pointer it tilts a maximum of ~5° with a
 * soft light reflection and a spring return; the planes parallax by depth. One
 * orbital line draws itself once when the section enters view, then stays calm.
 *
 * Pure CSS/SVG/Motion — no canvas, no 3D engine. On touch and under
 * prefers-reduced-motion it renders as a static layered composition (no tilt,
 * no parallax, the orbit drawn in full). Inspired by the polish of premium
 * component galleries; no copied markup or assets.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_TILT = 5; // degrees — stays inside the 4–6° brief
const SPRING = { stiffness: 110, damping: 20, mass: 0.7 } as const;

// Placedon mark artwork (viewBox 133 119 354 400).
const MARK_A =
  "M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z";
const MARK_B =
  "M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z";

type PlaneConfig = {
  /** placement within the stage, in % of stage box */
  left: string;
  top: string;
  width: string;
  rotate: number;
  z: number;
  parallax: number;
  tint: string;
  /** small evidence/citation chip label — extends the product language */
  chip: string;
  index: number;
};

const PLANES: PlaneConfig[] = [
  {
    left: "6%",
    top: "10%",
    width: "58%",
    rotate: -6,
    z: -60,
    parallax: 8,
    tint: "linear-gradient(150deg, rgba(139,84,255,0.14), rgba(183,155,255,0.05))",
    chip: "Cited",
    index: 0,
  },
  {
    left: "24%",
    top: "30%",
    width: "62%",
    rotate: -1,
    z: 10,
    parallax: 16,
    tint: "linear-gradient(150deg, rgba(105,34,245,0.16), rgba(139,84,255,0.06))",
    chip: "Evidence supported",
    index: 1,
  },
  {
    left: "14%",
    top: "54%",
    width: "54%",
    rotate: 4,
    z: 70,
    parallax: 26,
    tint: "linear-gradient(150deg, rgba(183,155,255,0.18), rgba(139,84,255,0.07))",
    chip: "Role-relevant",
    index: 2,
  },
];

/** A single evidence plane: parallax by depth, soft glass, faint content rails. */
function Plane({
  sx,
  sy,
  reduce,
  cfg,
}: {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean;
  cfg: PlaneConfig;
}) {
  const lx = useTransform(sx, [-1, 1], [-cfg.parallax, cfg.parallax]);
  const ly = useTransform(sy, [-1, 1], [-cfg.parallax, cfg.parallax]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: cfg.left,
        top: cfg.top,
        width: cfg.width,
        x: reduce ? 0 : lx,
        y: reduce ? 0 : ly,
        z: cfg.z,
        rotate: cfg.rotate,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 + cfg.index * 0.04 }}
        className="rounded-[20px] p-4 sm:p-5"
        style={{
          background: `${cfg.tint}, rgba(255,255,255,0.5)`,
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow:
            "0 30px 60px -28px rgba(105,34,245,0.32), inset 0 1px 0 rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--iris)" }}
          />
          <span
            className="h-[6px] w-16 rounded-full"
            style={{ background: "rgba(105,34,245,0.28)" }}
          />
        </div>
        <div className="mt-3.5 space-y-2">
          <span
            className="block h-[6px] w-[86%] rounded-full"
            style={{ background: "rgba(14,16,32,0.10)" }}
          />
          <span
            className="block h-[6px] w-[64%] rounded-full"
            style={{ background: "rgba(14,16,32,0.08)" }}
          />
        </div>
        {/* evidence/citation chip — extends the product's evidence language */}
        <span
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{
            background: "var(--iris-ghost)",
            color: "var(--iris-ink)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--iris)" }}
          />
          {cfg.chip}
        </span>
      </motion.div>
    </motion.div>
  );
}

export function EvidenceField({ className }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-1, 1], [MAX_TILT, -MAX_TILT]);
  const rotateX = useTransform(sy, [-1, 1], [-MAX_TILT, MAX_TILT]);

  const gx = useTransform(sx, [-1, 1], [38, 62]);
  const gy = useTransform(sy, [-1, 1], [38, 62]);
  const sheen = useMotionTemplate`radial-gradient(58% 52% at ${gx}% ${gy}%, rgba(255,255,255,0.42), rgba(255,255,255,0) 62%)`;

  const markX = useTransform(sx, [-1, 1], [-30, 30]);
  const markY = useTransform(sy, [-1, 1], [-30, 30]);

  // Pointer tracking: fine pointers only, skipped under reduced motion, and
  // paused while the field is offscreen (no listener work when not visible).
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      px.set(Math.max(-1, Math.min(1, nx)));
      py.set(Math.max(-1, Math.min(1, ny)));
    };

    let attached = false;
    const attach = () => {
      if (attached) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      attached = true;
    };
    const detach = () => {
      if (!attached) return;
      window.removeEventListener("pointermove", onMove);
      attached = false;
      px.set(0);
      py.set(0);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
      { rootMargin: "0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      detach();
    };
  }, [reduce, px, py]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ perspective: 1100 }}
    >
      {/* stage: anchored right, so the field reads beside the copy */}
      <motion.div
        className="absolute top-1/2 right-[-6%] h-[clamp(300px,42vw,540px)] w-[clamp(320px,48vw,640px)] -translate-y-1/2"
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* faint orbital signal lines; the outer ring draws once on enter */}
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          style={{ transform: "translateZ(-40px)", overflow: "visible" }}
          fill="none"
        >
          <ellipse
            cx="200"
            cy="200"
            rx="120"
            ry="150"
            stroke="rgba(154,107,255,0.16)"
            strokeWidth="1"
          />
          <ellipse
            cx="200"
            cy="200"
            rx="178"
            ry="118"
            stroke="rgba(154,107,255,0.12)"
            strokeWidth="1"
            transform="rotate(24 200 200)"
          />
          <motion.ellipse
            cx="200"
            cy="200"
            rx="150"
            ry="188"
            stroke="rgba(105,34,245,0.34)"
            strokeWidth="1.4"
            strokeDasharray="3 10"
            transform="rotate(-16 200 200)"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.7, ease: EASE, delay: 0.2 }}
          />
          {/* two signal nodes riding the orbit */}
          <circle cx="200" cy="12" r="3.5" fill="var(--iris-soft)" opacity="0.7" />
          <circle cx="352" cy="228" r="3" fill="var(--iris)" opacity="0.55" />
        </svg>

        {PLANES.map((cfg) => (
          <Plane key={cfg.index} sx={sx} sy={sy} reduce={reduce} cfg={cfg} />
        ))}

        {/* Placedon mark, suspended in front with a soft glow and gentle float */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ x: reduce ? 0 : markX, y: reduce ? 0 : markY, z: 110 }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="absolute left-1/2 top-1/2 -z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,84,255,0.35), rgba(139,84,255,0) 68%)",
                  filter: "blur(6px)",
                }}
              />
              <svg
                width={64}
                height={72}
                viewBox="133 119 354 400"
                fill="var(--iris)"
                style={{ filter: "drop-shadow(0 14px 24px rgba(105,34,245,0.35))" }}
              >
                <path d={MARK_A} />
                <path d={MARK_B} />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* soft light reflection that tracks the pointer */}
        <motion.div
          className="absolute inset-0"
          style={{ background: sheen, z: 90, mixBlendMode: "soft-light" }}
        />
      </motion.div>
    </div>
  );
}
