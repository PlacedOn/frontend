"use client";

/**
 * Public profile — the candidate's evidence "product". Reads top-to-bottom as a
 * descent: porcelain "a person talking" (authored) → the Seam → dark
 * "instrument panel" (earned evidence). The vertical scroll IS the narrative.
 *
 * Craft (Emil/Apple): presentation elements animate and lift (hero credential
 * card tilts to the pointer); evidence elements stay calm — reveal on scroll,
 * never hover-lift — because evidence should read as trustworthy, not flashy.
 * All motion is disabled under reduced-motion.
 */

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Quote, ArrowRight, MapPin, Clock3, ShieldCheck } from "lucide-react";
import { FitCheckCard } from "@/components/fit/FitCheckCard";
import { LayerSeam } from "./LayerSeam";
import type { FitCheck } from "@/lib/v1";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Band = "high" | "emerging" | "needs_review";
export type ProfileTrait = { label: string; band: Band; quote: string; at: string };

export type PublicProfileData = {
  displayName: string;
  headline: string;
  summary: string;
  pills: string[];
  highlights: { title: string; body: string }[];
  passport: { name: string; verifiedMinutes: number; traits: ProfileTrait[] };
  fits: { roleName: string; fit: FitCheck }[];
};

const BAND_LIGHT: Record<Band, { label: string; fg: string; bg: string }> = {
  high: { label: "Strong", fg: "#047857", bg: "rgba(16,185,129,0.14)" },
  emerging: { label: "Emerging", fg: "var(--iris-ink)", bg: "var(--iris-ghost)" },
  needs_review: { label: "Needs more", fg: "#B45309", bg: "rgba(245,134,11,0.14)" },
};
const BAND_DARK: Record<Band, { label: string; fg: string; bg: string }> = {
  high: { label: "Strong", fg: "#5eead4", bg: "rgba(16,185,129,0.16)" },
  emerging: { label: "Emerging", fg: "#c4b5ff", bg: "color-mix(in oklab, var(--iris-soft) 22%, transparent)" },
  needs_review: { label: "Needs more", fg: "#fcd34d", bg: "rgba(245,158,11,0.16)" },
};

export function PublicProfileShell({ data, preview = false }: { data: PublicProfileData; preview?: boolean }) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.3 : 0.6, delay, ease: EASE_OUT },
  });

  // 3D tilt for the hero credential card (presentation element — allowed to feel alive)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 18 });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 18 });
  const onTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetTilt = () => { px.set(0); py.set(0); };

  return (
    <div>
      {preview && (
        <div className="shell pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold" style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            Design preview · sample profile — not a real candidate
          </span>
        </div>
      )}

      {/* ── Presentation layer (porcelain) ── */}
      <section className="relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, var(--iris-ghost), transparent 68%)", filter: "blur(20px)" }} />
        <div className="shell relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <motion.p {...rise(0.02)} className="eyebrow">Candidate profile</motion.p>
            <motion.h1 {...rise(0.1)} className="mt-3 max-w-[18ch] text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]">
              {data.displayName}
            </motion.h1>
            <motion.p {...rise(0.18)} className="mt-2 text-[clamp(1.05rem,1rem+.5vw,1.35rem)] text-[var(--iris-ink)]">
              {data.headline}
            </motion.p>

            <motion.div {...rise(0.26)} className="mt-5 flex flex-wrap gap-2">
              {data.pills.map((p, i) => (
                <span key={p} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)]" style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", boxShadow: "var(--shadow-sm)" }}>
                  {i === 0 ? <MapPin size={13} className="text-[var(--ink-3)]" /> : i === 1 ? <Clock3 size={13} className="text-[var(--ink-3)]" /> : null}
                  {p}
                </span>
              ))}
            </motion.div>

            <motion.p {...rise(0.34)} className="mt-6 max-w-[60ch] text-[16.5px] leading-relaxed text-[var(--ink-2)]">
              {data.summary}
            </motion.p>

            <motion.div {...rise(0.42)} className="mt-8">
              <button type="button" className="inline-flex items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                Request intro <ArrowRight size={16} />
              </button>
              <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">A consented intro reveals identity to both sides — never before.</p>
            </motion.div>
          </div>

          {/* 3D credential card — the evidence teaser */}
          <motion.div
            {...rise(0.3)}
            className="relative mx-auto w-full max-w-sm lg:mx-0"
            style={{ perspective: 1100 }}
            onPointerMove={onTilt}
            onPointerLeave={resetTilt}
          >
            <motion.div
              className="rounded-[24px] border p-6"
              style={{
                transformStyle: "preserve-3d",
                rotateX: reduce ? 0 : rotX,
                rotateY: reduce ? 0 : rotY,
                background: "linear-gradient(160deg, #ffffff, #f6f4fe 82%)",
                borderColor: "var(--glass-line-hi)",
                boxShadow: "0 40px 90px -40px rgba(40,26,120,0.5), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <div className="flex items-center gap-2" style={{ transform: "translateZ(24px)" }}>
                <span className="grid size-8 place-items-center rounded-full text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>Verified profile</p>
                  <p className="text-[13px] font-semibold text-[var(--ink)]">One honest conversation · {data.passport.verifiedMinutes} min</p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5" style={{ transform: "translateZ(36px)" }}>
                {data.passport.traits.map((t) => {
                  const b = BAND_LIGHT[t.band];
                  return (
                    <div key={t.label} className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-semibold text-[var(--ink)]">{t.label}</span>
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 border-t pt-3 text-[11.5px] leading-relaxed text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line)", transform: "translateZ(20px)" }}>
                Every trait below traces to a moment they actually said.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      {data.highlights.length > 0 && (
        <section className="shell pb-16 md:pb-20">
          <p className="eyebrow">In their words</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.highlights.map((h, i) => (
              <motion.article key={h.title} className="glass rounded-[var(--r-card)] p-6" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : i * 0.06 }}>
                <Quote size={18} className="text-[var(--iris-ink)]" />
                <h3 className="mt-3 text-[16px] font-bold text-[var(--ink)]">{h.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{h.body}</p>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* ── The Seam ── */}
      <LayerSeam />

      {/* ── Evidence layer (dark) — every trait traces to a transcript moment ── */}
      <section style={{ background: "#13152e" }}>
        <div className="shell py-16 md:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45" style={{ fontFamily: "var(--font-mono)" }}>Earned evidence · verified via one conversation</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(1.5rem,1.1rem+1.6vw,2.3rem)] font-bold leading-tight" style={{ color: "#fff" }}>
            Every strength traces to a moment they said.
          </h2>

          {/* trait evidence — calm, no hover-lift */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.passport.traits.map((t, i) => {
              const b = BAND_DARK[t.band];
              return (
                <motion.article
                  key={t.label}
                  className="rounded-[var(--r-card)] p-5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : (i % 2) * 0.06 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold" style={{ color: "#fff" }}>{t.label}</span>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
                  </div>
                  <blockquote className="mt-3 border-l-2 pl-3 text-[13.5px] leading-relaxed text-white/70" style={{ borderColor: "color-mix(in oklab, var(--iris-soft) 60%, transparent)" }}>
                    “{t.quote}”
                  </blockquote>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "#c4b5ff" }}>
                    <span className="livedot" /> Traceable to transcript · {t.at}
                  </p>
                </motion.article>
              );
            })}
          </div>

          {/* fit for published roles */}
          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45" style={{ fontFamily: "var(--font-mono)" }}>Fit for the roles they published</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {data.fits.map((f) => (
                <FitCheckCard key={f.roleName} fit={f.fit} roleName={f.roleName} tone="dark" />
              ))}
            </div>
          </div>

          {/* consent footer */}
          <div className="mt-12 rounded-[var(--r-card)] p-6 text-white" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-[18px] font-bold" style={{ color: "#fff" }}>Nothing above is shared until they say yes.</h3>
            <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-white/65">
              Evidence is earned in an honest interview, approved by the candidate, and bias-audited. Employers reach out through a consented intro — identity is revealed only when both sides agree.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
