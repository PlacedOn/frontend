"use client";

import { motion, useReducedMotion } from "motion/react";
import { Quote } from "@/components/ui/icons";
import { BAND_META, bandOf } from "@/lib/mock/candidateReport";
import type { HcvDimension } from "@/lib/mock/hcv";

const ease = [0.22, 0.68, 0.31, 1] as const;

function TraitRow({ dim, delay }: { dim: HcvDimension; delay: number }) {
  const reduce = useReducedMotion();
  const band = bandOf(dim.score);
  const meta = BAND_META[band];
  const forming = band !== "supported";
  return (
    <li className="rounded-[var(--r-card)] p-5" style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15.5px] font-bold text-[var(--ink)]">{dim.label}</h3>
        <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "var(--mist)", color: meta.fg }}>
          {meta.label}
        </span>
      </div>
      <div className="mt-3">
        {/* Banded evidence strength — three tiers, never a number. */}
        <div className="flex gap-1.5" aria-label={`Evidence: ${meta.label}`}>
          {[0, 1, 2].map((tier) => {
            const filled = meta.fill >= (tier + 1) / 3 - 0.01;
            return (
              <motion.div
                key={tier}
                className="h-2 flex-1 rounded-full"
                style={{ background: filled ? meta.fg : "var(--mist)", transformOrigin: "left" }}
                initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: delay + tier * 0.06 }}
              />
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--ink-3)]">
          {forming ? "Still forming — one more example would strengthen this." : "Strong, clear evidence for this trait."}
        </p>
      </div>
      <p className="mt-3 flex gap-2 border-l-2 pl-3 text-[13px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
        <Quote size={13} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
        &ldquo;{dim.evidence}&rdquo;
      </p>
    </li>
  );
}

export function TraitAnalysis({ dimensions }: { dimensions: HcvDimension[] }) {
  const shown = dimensions.filter((d) => d.employerVisible);
  return (
    <section>
      <h2 className="text-[15px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
        Trait analysis
      </h2>
      <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Every band is tied to a moment from the interview — in the candidate&rsquo;s own words.</p>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {shown.map((d, i) => (
          <TraitRow key={d.id} dim={d} delay={i * 0.08} />
        ))}
      </ul>
    </section>
  );
}
