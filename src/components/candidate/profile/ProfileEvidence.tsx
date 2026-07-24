"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Quote, ShieldCheck, ArrowRight } from "lucide-react";
import { CANDIDATE_EVIDENCE, BAND_META, type EvidenceTrait } from "@/lib/candidate/evidence";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The private evidence control — the candidate's verified traits, each grounded
 * in a transcript quote, with a per-trait visibility toggle. This is what makes
 * the profile *theirs*: they decide, trait by trait, what employers see. Mirrors
 * the public profile's trait cards so "what I approve here" == "what they see".
 */
export function ProfileEvidence() {
  const reduce = useReducedMotion();
  const [traits, setTraits] = useState<EvidenceTrait[]>(CANDIDATE_EVIDENCE);

  const toggle = (id: string) =>
    setTraits((prev) => prev.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)));

  const visibleCount = traits.filter((t) => t.visible).length;

  return (
    <section id="evidence" aria-labelledby="evidence-heading" className="mt-16 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Shown — verified evidence</p>
          <h2 id="evidence-heading" className="mt-2 max-w-xl text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] font-bold tracking-tight text-[var(--ink)]">
            What your interview verified — you choose what shows.
          </h2>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--ink-2)]">
            Everything in the builder above is what you <em>said</em>. This is what you&rsquo;ve <em>shown</em> — each trait
            traces to your own words. Toggle any trait to control exactly what employers see.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            <Eye size={14} /> {visibleCount} of {traits.length} visible to employers
          </span>
          <Link href="/p/preview" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--iris-ink)] transition-transform hover:translate-x-0.5">
            Preview what employers see <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {traits.map((t, i) => {
          const b = BAND_META[t.band];
          return (
            <motion.article
              key={t.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : (i % 2) * 0.05 }}
              className="glass rounded-[var(--r-card)] p-5 transition-opacity"
              style={{ opacity: t.visible ? 1 : 0.62 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold text-[var(--ink)]">{t.label}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-pressed={t.visible}
                  aria-label={t.visible ? `Hide ${t.label} from employers` : `Show ${t.label} to employers`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors"
                  style={t.visible
                    ? { borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }
                    : { borderColor: "var(--glass-line-hi)", color: "var(--ink-3)" }}
                >
                  {t.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  {t.visible ? "Visible" : "Hidden"}
                </button>
              </div>

              <blockquote className="mt-3 border-l-2 pl-3 text-[13.5px] leading-relaxed italic text-[var(--ink-2)]" style={{ borderColor: "var(--iris)" }}>
                “{t.quote}”
              </blockquote>
              <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--iris-ink)]">
                <span className="livedot" /> Traceable to transcript · {t.at}
              </p>
              {!t.visible && (
                <p className="mt-2 text-[11.5px] font-medium text-[var(--ink-3)]">Hidden — employers won&rsquo;t see this.</p>
              )}
            </motion.article>
          );
        })}
      </div>

      <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--iris)]" />
        You own this. Nothing is shared by default, no trait is a single score, and every one is contestable. What you hide here never reaches an employer.
      </p>
    </section>
  );
}
