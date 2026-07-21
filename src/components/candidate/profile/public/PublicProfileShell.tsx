"use client";

/**
 * Public profile — the owned candidate page. Reads top-to-bottom as a descent:
 * porcelain "a person talking" (authored) → the Seam → dark "instrument panel"
 * (earned evidence). The vertical scroll IS the narrative, so mobile is the
 * native shape, not a compromise.
 *
 * Craft (Emil): only the hero gets a page-load entrance (staggered, ease-out);
 * everything else reveals on scroll. Presentation elements lift on hover;
 * evidence elements do not (see TrustPassportCard / FitCheckCard).
 */

import { motion, useReducedMotion } from "motion/react";
import { Quote, ArrowRight, MapPin, Clock3 } from "lucide-react";
import { TrustPassportCard, type PassportTrait } from "@/components/candidate/TrustPassportCard";
import { FitCheckCard } from "@/components/fit/FitCheckCard";
import { LayerSeam } from "./LayerSeam";
import { ConnectAccounts } from "./ConnectAccounts";
import type { FitCheck } from "@/lib/v1";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type PublicProfileData = {
  displayName: string;
  headline: string;
  summary: string;
  pills: string[];
  highlights: { title: string; body: string }[];
  passport: { name: string; strength: number; traits: PassportTrait[] };
  fits: { roleName: string; fit: FitCheck }[];
};

export function PublicProfileShell({ data }: { data: PublicProfileData }) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.3 : 0.6, delay, ease: EASE_OUT },
  });

  return (
    <div>
      {/* ── Presentation layer (porcelain) ── */}
      <section className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, var(--iris-ghost), transparent 68%)", filter: "blur(20px)" }}
        />
        <div className="shell relative py-16 md:py-24">
          <motion.p {...rise(0.02)} className="eyebrow">Candidate profile</motion.p>
          <motion.h1 {...rise(0.1)} className="mt-3 max-w-[18ch] text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]">
            {data.displayName}
          </motion.h1>
          <motion.p {...rise(0.18)} className="mt-2 text-[clamp(1.05rem,1rem+.5vw,1.35rem)] text-[var(--iris-ink)]">
            {data.headline}
          </motion.p>

          <motion.div {...rise(0.26)} className="mt-5 flex flex-wrap gap-2">
            {data.pills.map((p, i) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-transform duration-150 hover:-translate-y-0.5"
                style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", boxShadow: "var(--shadow-sm)" }}
              >
                {i === 0 ? <MapPin size={13} className="text-[var(--ink-3)]" /> : i === 1 ? <Clock3 size={13} className="text-[var(--ink-3)]" /> : null}
                {p}
              </span>
            ))}
          </motion.div>

          <motion.p {...rise(0.34)} className="mt-6 max-w-[60ch] text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            {data.summary}
          </motion.p>

          <motion.div {...rise(0.42)} className="mt-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
            >
              Request intro <ArrowRight size={16} />
            </button>
            <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">A consented intro reveals identity to both sides — never before.</p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      {data.highlights.length > 0 && (
        <section className="shell pb-16 md:pb-20">
          <p className="eyebrow">In their words</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.highlights.map((h, i) => (
              <motion.article
                key={h.title}
                className="glass rounded-[var(--r-card)] p-6"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: reduce ? 0 : i * 0.06 }}
              >
                <Quote size={18} className="text-[var(--iris-ink)]" />
                <h3 className="mt-3 text-[16px] font-bold text-[var(--ink)]">{h.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{h.body}</p>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* Connect accounts — the hinge */}
      <section className="shell pb-20">
        <p className="eyebrow">Connect your work</p>
        <div className="mt-5">
          <ConnectAccounts />
        </div>
      </section>

      {/* ── The Seam ── */}
      <LayerSeam />

      {/* ── Evidence layer (dark) ── */}
      <section style={{ background: "#13152e" }}>
        <div className="shell py-16 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
            <TrustPassportCard name={data.passport.name} strength={data.passport.strength} traits={data.passport.traits} />
            <div className="flex flex-col gap-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45" style={{ fontFamily: "var(--font-mono)" }}>
                Fit for the roles they published
              </p>
              {data.fits.map((f) => (
                <FitCheckCard key={f.roleName} fit={f.fit} roleName={f.roleName} tone="dark" />
              ))}
            </div>
          </div>

          {/* consent footer */}
          <div className="mt-12 rounded-[var(--r-card)] p-6 text-white" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-[18px] font-bold">Nothing above is shared until they say yes.</h3>
            <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-white/65">
              Evidence is earned in an honest interview, approved by the candidate, and bias-audited. Employers reach out through
              a consented intro — identity is revealed only when both sides agree.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
