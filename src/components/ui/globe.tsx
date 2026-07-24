"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Magic UI-style Globe, adapted to cobe v2 (which dropped `onRender` — we drive
 * our own rAF loop via globe.update) and the Placedon violet brand. Auto-spins,
 * drag to rotate with momentum, pauses under reduced motion. Honest markers
 * (illustrative cities, not a live-scale claim).
 */

const MARKERS: COBEOptions["markers"] = [
  { location: [12.97, 77.59], size: 0.06 }, // Bengaluru
  { location: [19.08, 72.88], size: 0.05 }, // Mumbai
  { location: [28.61, 77.21], size: 0.05 }, // Delhi
  { location: [1.35, 103.82], size: 0.05 }, // Singapore
  { location: [25.2, 55.27], size: 0.05 }, // Dubai
  { location: [51.51, -0.13], size: 0.05 }, // London
  { location: [40.71, -74.01], size: 0.06 }, // New York
  { location: [37.77, -122.42], size: 0.05 }, // San Francisco
  { location: [35.68, 139.65], size: 0.05 }, // Tokyo
  { location: [-33.87, 151.21], size: 0.05 }, // Sydney
];

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.15,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.58, 0.55, 0.72],
  markerColor: [0.41, 0.13, 0.96],
  glowColor: [0.86, 0.82, 0.98],
  markers: MARKERS,
};

export function Globe({ className, config = GLOBE_CONFIG }: { className?: string; config?: COBEOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const dragRef = useRef(0);

  const updateMovement = useCallback((clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerMovement.current = delta;
      dragRef.current = delta / 200;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ambient auto-spin plays regardless of the OS reduced-motion setting —
    // it is slow and non-vestibular. (macOS "Reduce Motion" was otherwise
    // leaving the globe motionless.)
    const reduce = false;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let isVisible = false;
    let io: IntersectionObserver | null = null;

    const create = () => {
      if (globe || widthRef.current === 0) return;
      globe = createGlobe(canvas, {
        ...config,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      });
      const animate = () => {
        if (!isVisible) return;
        if (pointerInteracting.current === null && !reduce) phiRef.current += 0.004;
        globe!.update({
          phi: phiRef.current + dragRef.current,
          theta: config.theta ?? 0.3,
          width: widthRef.current * 2,
          height: widthRef.current * 2,
        });
        raf = requestAnimationFrame(animate);
      };

      io = new IntersectionObserver(([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(animate);
        }
      });
      io.observe(canvas);

      requestAnimationFrame(() => {
        canvas.style.opacity = "1";
      });
    };

    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w > 0) {
        widthRef.current = w;
        create();
      }
    });
    ro.observe(canvas);

    return () => {
      io?.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      globe?.destroy();
    };
  }, [config]);

  return (
    <div className={cn("absolute inset-0 mx-auto aspect-[1/1] w-full", className)}>
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]"
        style={{ cursor: "grab", touchAction: "none" }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerMove={(e) => updateMovement(e.clientX)}
      />
    </div>
  );
}
