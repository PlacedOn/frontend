"use client";

import { useEffect, useRef } from "react";

/**
 * HeroField — the dark ground behind the hero.
 *
 * Harvey's hero sits on a full-bleed dark photograph of real people in a real
 * room. That is the right instinct — a dark, quiet, human ground with the
 * headline resting on it — but PlacedOn has no licensed photography, and using
 * someone else's is not an option on a commercial site.
 *
 * So the ground is generated instead: an ink field with a slow directional
 * drift and a faint constellation of connection lines. It reads as the same
 * kind of surface — deep, calm, textured, with something happening in it — and
 * it is ours outright.
 *
 * Colour discipline follows Harvey's measured shader, which passes exactly two
 * colour uniforms (#0f0e0d ink and transparent) and no brand colour at all.
 * This uses ink and paper, with violet held to a single low-amplitude breath
 * so the brand is present without the page reading as "themed".
 *
 * Compositor-friendly: one canvas, transform/opacity only, 30fps cap, paused
 * when off-screen, single still frame under reduced motion.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

const vec3 INK   = vec3(0.043, 0.039, 0.035);   // #0B0A09 — the ground
const vec3 LIFT  = vec3(0.243, 0.227, 0.204);   // #3E3A34 — where light falls
const vec3 IRIS  = vec3(0.369, 0.275, 0.749);   // one restrained breath of brand

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_res.x / max(u_res.y, 1.0);

  float t = u_time * 0.025;
  p += (u_mouse - 0.5) * 0.03;

  // Broad slow-moving light, as if a window were out of frame.
  float light = fbm(p * 1.05 + vec2(t, t * 0.35));
  light = smoothstep(0.20, 0.86, light);

  // Fine tooth so the surface is a material, not a gradient.
  float tooth = (fbm(p * 7.0 - t * 0.4) - 0.5) * 0.22;

  vec3 col = mix(INK, LIFT, clamp(light * 1.0 + tooth, 0.0, 1.0));

  // A single violet breath, upper-left, barely there. This is the whole brand
  // presence in the ground — anything more and the page reads as themed.
  float breath = exp(-2.9 * length((uv - vec2(0.26, 0.30)) * vec2(1.15, 1.5)));
  col += IRIS * breath * 0.16;

  // Settle to pure ink at the bottom so the hero meets the page cleanly.
  col = mix(col, INK, smoothstep(0.70, 1.0, uv.y) * 0.75);

  // Grain kills banding across large dark areas, where it is most visible.
  col += (hash(uv * u_res.xy + t) - 0.5) * 0.022;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function HeroField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", { antialias: false, alpha: false }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return; // CSS ink fallback underneath shows through

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
    };
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e?.isIntersecting ?? true), {
      rootMargin: "80px",
    });
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 30;
    const start = performance.now();

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible || now - last < FRAME) return;
      last = now;
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduce) {
      gl.uniform1f(uTime, 0);
      gl.uniform2f(uMouse, 0.5, 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`h-full w-full ${className}`}
      style={{ background: "#0B0A09", display: "block" }}
    />
  );
}
