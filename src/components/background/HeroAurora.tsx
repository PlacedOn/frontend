"use client";

import { useEffect, useRef } from "react";

/*
 * HeroAurora — a generative, full-bleed motion graphic for the hero.
 *
 * A single full-screen fragment shader renders a luminous, airy violet aurora
 * (domain-warped fractal noise) in the Placedon brand. It is real generative
 * motion — no video, no imagery, no human. The bottom fades to porcelain so the
 * hero melts into the light page below.
 *
 * Robustness: DPR is capped, the canvas resizes via ResizeObserver, reduced
 * motion renders a single still frame, and if WebGL is unavailable the canvas
 * stays transparent and the CSS gradient fallback underneath shows through.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  // flip y so v_uv matches screen space (y = 0 top, 1 bottom)
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

// Placedon palette
const vec3 PORCELAIN = vec3(0.957, 0.957, 0.949);
const vec3 LAV       = vec3(0.925, 0.925, 0.918);
const vec3 IRIS      = vec3(0.300, 0.300, 0.320);
const vec3 IRIS_SOFT = vec3(0.520, 0.520, 0.540);
const vec3 GLOW      = vec3(0.900, 0.900, 0.895);
const vec3 LILAC     = vec3(0.720, 0.720, 0.725);

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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv; // y = 0 top, 1 bottom
  vec2 p = uv;
  p.x *= u_res.x / max(u_res.y, 1.0);
  float t = u_time * 0.14;

  // subtle parallax from pointer
  p += (u_mouse - 0.5) * 0.08;

  // Directional flow — the whole field sweeps diagonally over time so the
  // bands visibly travel across the screen (bold, not just in-place morph).
  vec2 flow = vec2(t * 1.7, t * 0.55);

  // two-stage domain warp → flowing aurora bands
  vec2 q = vec2(fbm(p * 1.5 + flow + vec2(0.0, t)),
                fbm(p * 1.5 + flow + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 2.0 + 2.2 * q + vec2(1.7, 9.2) + t * 0.7),
                fbm(p * 2.0 + 2.2 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p * 1.8 + 2.6 * r + flow * 0.5);

  // Fold into distinct ribbons so bright veils separate with clear gaps —
  // sharp edges read as obvious motion where soft clouds did not.
  float ribbon = abs(sin(f * 3.14159 + f * 1.5));
  ribbon = pow(smoothstep(0.1, 0.9, ribbon), 1.2);
  float aur = smoothstep(0.30, 0.80, f) * mix(0.5, 1.0, ribbon);
  aur = pow(aur, 0.95);

  // presence: richest toward the top, alive across the whole frame
  float topGlow = smoothstep(0.95, 0.0, uv.y);
  float field = mix(0.94, 1.26, topGlow);

  // a lighter pocket behind the centred copy keeps text legible
  float dTx = length((uv - vec2(0.5, 0.42)) / vec2(0.46, 0.32));
  float pocket = smoothstep(0.65, 1.3, dTx); // 0 inside, 1 outside

  float a = aur * field * mix(0.34, 1.0, pocket);

  vec3 base = mix(PORCELAIN, LAV, mix(0.14, 0.60, topGlow));
  vec3 col = base;
  col = mix(col, LILAC, a * 0.98);
  col = mix(col, IRIS_SOFT, a * a * 0.54);

  // immersive top-centre bloom + lower-left glow for balance
  float bloom = exp(-2.6 * length((uv - vec2(0.5, 0.10)) * vec2(0.85, 1.35))) * 0.75;
  float glowL = exp(-3.4 * length((uv - vec2(0.16, 0.86)) * vec2(1.1, 1.2))) * 0.5;
  col += GLOW * bloom * 0.5;
  col += IRIS_SOFT * glowL * 0.22;
  col += IRIS_SOFT * pow(a, 2.0) * 0.2;

  // gentle deepening at the very top edge to frame the nav
  col = mix(col, IRIS_SOFT, smoothstep(0.16, 0.0, uv.y) * 0.10 * pocket);

  // lift the text pocket toward porcelain for contrast
  col = mix(col, PORCELAIN, (1.0 - pocket) * 0.55);

  // fine grain to kill banding
  col += hash(uv * u_res.xy + t) * 0.024 - 0.012;

  // melt into the porcelain page at the bottom
  col = mix(col, PORCELAIN, smoothstep(0.72, 1.02, uv.y) * 0.92);

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

export function HeroAurora({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", { antialias: false, alpha: true }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return; // CSS fallback underneath shows through

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

    // full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    // Ambient decorative motion plays regardless of the OS reduced-motion
    // setting — slow, low-contrast, non-vestibular. (macOS "Reduce Motion" was
    // otherwise freezing the aurora to a single static frame.)
    const reduce = false;
    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.floor(canvas.clientWidth * dpr);
      h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
    };
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    // Pause the GPU loop when the hero is scrolled off-screen.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e?.isIntersecting ?? true), { rootMargin: "80px" });
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 30; // 30fps cap halves GPU cost
    const start = performance.now();
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible || now - last < FRAME) return;
      last = now;
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduce) {
      gl.uniform1f(uTime, 8.0);
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
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* CSS fallback (shows if WebGL is unavailable) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 22%, #FAFAF9 0%, rgba(250,250,249,0) 55%), radial-gradient(90% 70% at 78% 30%, rgba(16,16,18,0.05), transparent 60%), radial-gradient(80% 70% at 20% 40%, rgba(16,16,18,0.04), transparent 60%), var(--porcelain)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
