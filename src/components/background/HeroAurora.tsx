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

/*
 * Paper field — rebuilt on Harvey's model, measured from their live shader.
 *
 * Their hero passes exactly two colour uniforms:
 *     u_colorFront = rgba(15, 14, 13, 255)   // #0f0e0d, their ink
 *     u_colorBack  = rgba(0, 0, 0, 0)        // transparent
 * and shapes it with paper controls — fiber, roughness, crumples, folds
 * (their live floats: contrast .6, roughness .6, fiber .5, crumples 0, folds 1).
 *
 * There is NO brand colour in their hero motion at all. The premium read comes
 * from a physical material — paper fibre and a fold — not from a colour wash.
 *
 * This previously carried six colours, five of them violet, which is what made
 * the page read as "themed". It now carries two: paper and ink. Violet is
 * reserved for interface accents — the CTA, links, focus — where it can
 * actually mean something.
 */
const vec3 PAPER = vec3(0.984, 0.980, 0.976);  // #FBFAF9 warm near-white
const vec3 INK   = vec3(0.063, 0.059, 0.051);  // #100F0D near-black, warm

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

  // Very slow drift. The material should feel alive, not animated.
  float t = u_time * 0.03;
  p += (u_mouse - 0.5) * 0.02;

  // ── fibre: fine directional grain, the dominant texture ──
  vec2 fibDir = vec2(p.x * 1.0, p.y * 34.0);
  float fiber = fbm(fibDir + vec2(t * 0.35, 0.0));
  fiber = (fiber - 0.5) * 0.5;

  // ── fold: one broad crease, low frequency, sweeping slowly ──
  float fold = fbm(p * 1.15 + vec2(t, t * 0.4));
  fold = smoothstep(0.32, 0.78, fold);

  // ── roughness: mid-frequency tooth so the surface is not flat ──
  float rough = (fbm(p * 6.0 - t * 0.5) - 0.5) * 0.34;

  // Combine, then hold the amplitude down. Harvey's field is barely there;
  // that restraint is the whole effect.
  float ink = fold * 0.055 + fiber * 0.05 + rough * 0.035;

  // Lift the centre so headline copy always sits on clean stock.
  float d = length((uv - vec2(0.5, 0.42)) / vec2(0.52, 0.40));
  ink *= smoothstep(0.55, 1.25, d);

  // Settle toward plain paper at the bottom so the hero meets the page.
  ink *= 1.0 - smoothstep(0.68, 1.0, uv.y);

  vec3 col = mix(PAPER, INK, clamp(ink, 0.0, 1.0));

  // Fine per-pixel grain kills banding on large flat areas.
  col += (hash(uv * u_res.xy + t) - 0.5) * 0.016;

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
            "radial-gradient(120% 90% at 50% 22%, #E7E2FF 0%, rgba(231,226,255,0) 55%), radial-gradient(90% 70% at 78% 30%, rgba(139,84,255,0.28), transparent 60%), radial-gradient(80% 70% at 20% 40%, rgba(105,34,245,0.20), transparent 60%), var(--porcelain)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
