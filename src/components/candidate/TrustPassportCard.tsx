"use client";

/**
 * Trust Passport — the evidence layer, promoted from a dashboard widget to a
 * shared, reusable card (used by the dashboard and the public profile page).
 * Dark "instrument-panel" ground: mono numerals, glass gauges, measured motion.
 *
 * Craft (Emil): bars fill via transform:scaleX (compositor-only, not width);
 * rows stagger in once with a strong ease-out; evidence rows get NO hover-lift
 * (instrument panels respond precisely, they don't bounce). Reduced-motion safe.
 */

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const; // Emil's strong ease-out

export type TraitBand = "high" | "emerging" | "needs_review";

export type PassportTrait = { label: string; band: TraitBand };

const BAND: Record<TraitBand, { text: string; fill: number; fg: string }> = {
  high: { text: "High evidence", fill: 1, fg: "var(--ink)" },
  emerging: { text: "Emerging", fill: 0.62, fg: "#B79BFF" },
  needs_review: { text: "Needs review", fill: 0.34, fg: "rgba(255,255,255,0.5)" },
};

export function TrustPassportCard({
  name,
  traits,
}: {
  name: string;
  traits: PassportTrait[];
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className="rounded-[1.75rem] p-6 text-white md:p-7"
      style={{ background: "#13152e", boxShadow: "0 24px 70px -28px rgba(17,20,33,0.55)" }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">Trust passport</p>
          {/* inline colour: the unlayered h1–h4 rule in globals.css beats text-white */}
          <h3 className="mt-1 text-[20px] font-bold" style={{ color: "#fff" }}>{name}&rsquo;s evidence</h3>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris)" }}>
          <ShieldCheck className="h-5 w-5" />
        </span>
      </div>

      {/* No single score on the public face. Completeness/"strength" is the
          candidate's own setup metric and is meaningless — and misleading — to an
          employer. The evidence is the traits below, each tied to a real moment. */}
      <p className="text-[12.5px] font-medium text-white/55">Evidence from an interview — no single score.</p>

      {/* trait rows — staggered once, no hover lift */}
      <div className="mt-5 grid gap-2.5">
        {traits.map((t, i) => {
          const b = BAND[t.band];
          return (
            <motion.div
              key={t.label}
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: reduce ? 0.25 : 0.32, ease: EASE_OUT, delay: reduce ? 0 : i * 0.06 }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold">{t.label}</span>
                <span className="text-[11.5px] font-bold" style={{ color: b.fg }}>{b.text}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}>
                <motion.div
                  className="h-full origin-left rounded-full"
                  style={{ background: b.fg }}
                  initial={reduce ? { opacity: 1 } : { scaleX: 0 }}
                  whileInView={{ scaleX: b.fill }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT, delay: reduce ? 0 : 0.1 + i * 0.06 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl px-4 py-3 text-[12.5px] leading-5 text-white/65" style={{ background: "rgba(255,255,255,0.05)" }}>
        Every band ties to a moment in an honest interview. Employers see this only after you approve it.
      </p>
    </div>
  );
}
