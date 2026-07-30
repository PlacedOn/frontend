"use client";

/**
 * Hero 3D object — a slowly-rotating iris particle sphere (three.js / R3F) that
 * sits behind the hero copy for real depth. Deliberately restrained: violet
 * points on the light ground, faded at the centre by the hero scrim so the
 * headline stays legible. Code-split (dynamic, ssr:false) so it stays out of the
 * critical bundle; frameloop pauses when the hero scrolls off; static under
 * reduced motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type { Points } from "three";

const COUNT = 1600;
const RADIUS = 1.32;

function useSpherePoints() {
  return useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pos[i * 3] = Math.cos(theta) * r * RADIUS;
      pos[i * 3 + 1] = y * RADIUS;
      pos[i * 3 + 2] = Math.sin(theta) * r * RADIUS;
    }
    return pos;
  }, []);
}

function ParticleSphere({ reduce }: { reduce: boolean }) {
  const ref = useRef<Points>(null);
  const positions = useSpherePoints();

  useFrame((_, delta) => {
    if (!ref.current || reduce) return;
    ref.current.rotation.y += delta * 0.06;
    ref.current.rotation.x += delta * 0.014;
  });

  return (
    <points ref={ref} rotation={[0.35, 0, 0.08]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#7336FF"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroObject3D() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pause the render loop when the hero is scrolled off-screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e?.isIntersecting ?? true), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0.9 }}>
      <Canvas
        camera={{ position: [0, 0, 3.1], fov: 45 }}
        dpr={[1, 1.3]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={visible ? "always" : "never"}
      >
        <ParticleSphere reduce={!!reduce} />
      </Canvas>
    </div>
  );
}
