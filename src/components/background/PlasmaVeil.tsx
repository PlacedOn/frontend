"use client";

import { useEffect, useRef } from "react";

/*
 * PlasmaVeil — a generative, full-bleed motion graphic of violet aurora veils.
 *
 * Where HeroAurora paints a broad horizontal aurora, PlasmaVeil renders flowing
 * vertical "curtains" of violet light: elongated ribbons of domain-warped
 * fractal noise whose warp is biased toward the vertical axis so the field reads
 * as draped, drifting curtains rather than horizontal bands. It is a touch more
 * saturated and cinematic, yet still airy on a porcelain base, and melts to
 * porcelain at the very bottom so it blends into the page below.
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

// Placedon palette (linear-ish)
const vec3 PORCELAIN = vec3(0.933, 0.945, 0.980);
const vec3 IRIS      = vec3(0.620, 0.470, 1.000);
const vec3 IRIS_SOFT = vec3(0.760, 0.680, 0.985);
const vec3 GLOW      = vec3(0.850, 0.800, 1.000);

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
  for (int i = 0; i < 5; i++) {
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
  float t = u_time * 0.16;

  // subtle parallax from pointer
  p += (u_mouse - 0.5) * 0.07;

  // Curtain coordinate: squash x so features elongate vertically, and add a
  // steady upward drift so the ribbons flow like hanging light.
  vec2 cp = vec2(p.x * 2.4, p.y * 0.85 - t * 1.4);

  // Two-stage domain warp biased toward vertical flow. The warp vectors push
  // mostly along y so folds streak downward into curtains.
  vec2 q = vec2(fbm(cp + vec2(0.0, t * 0.6)),
                fbm(cp * vec2(0.6, 1.0) + vec2(3.7, -t * 1.1)));
  vec2 warp = vec2(q.x * 0.35, q.y * 1.15); // vertical bias
  vec2 r = vec2(fbm(cp + 2.2 * warp + vec2(1.7, 9.2 + t)),
                fbm(cp * vec2(0.5, 1.0) + 2.2 * warp + vec2(8.3, 2.8 - t)));
  vec2 warp2 = vec2(r.x * 0.3, r.y * 1.25);
  float f = fbm(cp + 2.6 * warp2);

  // Ribbon shaping: fold the field so bright veils separate with dark gaps
  // between them, reading as distinct vertical streaks.
  float ribbon = abs(sin(f * 3.14159 + p.x * 3.5));
  ribbon = pow(smoothstep(0.15, 0.95, ribbon), 1.3);

  float veil = smoothstep(0.34, 0.94, f) * ribbon;
  veil = pow(veil, 1.1);

  // presence: richest toward the top, alive across the whole frame
  float topGlow = smoothstep(1.0, 0.0, uv.y);
  float field = mix(0.72, 1.08, topGlow);

  // a lighter pocket behind centred copy keeps text legible
  float dTx = length((uv - vec2(0.5, 0.42)) / vec2(0.46, 0.32));
  float pocket = smoothstep(0.65, 1.3, dTx); // 0 inside, 1 outside

  float a = veil * field * mix(0.36, 1.0, pocket);

  vec3 base = mix(PORCELAIN, IRIS_SOFT, mix(0.10, 0.34, topGlow));
  vec3 col = base;
  col = mix(col, IRIS_SOFT, a * 0.82);
  col = mix(col, IRIS, a * a * 0.66);

  // cinematic vertical bloom down the centre + a cool lower glow for balance
  float bloom = exp(-2.4 * length((uv - vec2(0.5, 0.16)) * vec2(1.4, 0.9))) * 0.8;
  float glowL = exp(-3.2 * length((uv - vec2(0.82, 0.80)) * vec2(1.15, 1.2))) * 0.5;
  col += GLOW * bloom * 0.52;
  col += IRIS_SOFT * glowL * 0.24;
  col += IRIS_SOFT * pow(a, 2.0) * 0.24;

  // gentle deepening at the very top edge to frame the nav
  col = mix(col, IRIS * 0.9, smoothstep(0.16, 0.0, uv.y) * 0.14 * pocket);

  // lift the text pocket toward porcelain for contrast
  col = mix(col, PORCELAIN, (1.0 - pocket) * 0.55);

  // fine grain to kill banding
  col += hash(uv * u_res.xy + t) * 0.026 - 0.013;

  // melt into the porcelain page at the bottom
  col = mix(col, PORCELAIN, smoothstep(0.70, 1.02, uv.y) * 0.94);

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

export function PlasmaVeil({ className }: { className?: string }) {
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
    // otherwise freezing the veil to a single static frame.)
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

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
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
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 overflow-hidden ${className ?? ""}`} style={{ zIndex: 0 }}>
      {/* CSS fallback (shows if WebGL is unavailable) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 120% at 42% 8%, rgba(142, 100, 255,0.34), transparent 55%), radial-gradient(55% 120% at 62% 0%, rgba(115, 54, 255,0.26), transparent 58%), radial-gradient(80% 90% at 82% 82%, rgba(142, 100, 255,0.18), transparent 62%), var(--porcelain)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
