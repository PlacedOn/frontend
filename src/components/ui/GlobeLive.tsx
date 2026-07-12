"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

type Marker = { location: [number, number]; size?: number };

type Props = {
  markers?: Marker[];
  className?: string;
  speed?: number;
};

/*
 * Honest, on-brand adaptation of a cobe globe. Illustrates that the interview
 * runs anywhere (a product capability) — not a claim of live scale, so the
 * original component's fabricated "N watching" counters are intentionally
 * dropped. Frost Luxe palette: violet landmasses + markers on a soft globe,
 * drag to spin, auto-rotation paused under reduced motion.
 */
const DEFAULT_MARKERS: Marker[] = [
  { location: [12.97, 77.59] }, // Bengaluru
  { location: [19.08, 72.88] }, // Mumbai
  { location: [28.61, 77.21] }, // Delhi
  { location: [1.35, 103.82] }, // Singapore
  { location: [25.2, 55.27] }, // Dubai
  { location: [51.51, -0.13] }, // London
  { location: [40.71, -74.01] }, // New York
  { location: [37.77, -122.42] }, // San Francisco
  { location: [35.68, 139.65] }, // Tokyo
  { location: [-33.87, 151.21] }, // Sydney
];

export function GlobeLive({ markers = DEFAULT_MARKERS, className = "", speed = 0.004 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const dragRotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let width = 0;
    let phi = 0;

    const create = () => {
      if (globe || width === 0) return;
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.25,
        dark: 0,
        diffuse: 1.15,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.58, 0.55, 0.72],
        markerColor: [0.41, 0.13, 0.96],
        glowColor: [0.86, 0.82, 0.98],
        markers: markers.map((m) => ({ location: m.location, size: m.size ?? 0.05 })),
      });
      const animate = () => {
        if (pointerInteracting.current === null && !reduce) phi += speed;
        globe!.update({
          phi: phi + dragRotation.current,
          theta: 0.25,
          width: width * 2,
          height: width * 2,
        });
        raf = requestAnimationFrame(animate);
      };
      animate();
      requestAnimationFrame(() => {
        if (canvas) canvas.style.opacity = "1";
      });
    };

    // ResizeObserver gives a reliable width after layout and on resize.
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w > 0) {
        width = w;
        create();
      }
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      globe?.destroy();
    };
  }, [markers, speed]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };
  const onPointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerMovement.current = delta;
      dragRotation.current = delta / 200;
    }
  };

  return (
    <div className={`relative aspect-square w-full select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
        onPointerMove={onPointerMove}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1s ease",
          touchAction: "none",
        }}
      />
    </div>
  );
}
