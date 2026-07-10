"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/*
 * Structure + motion adapted from 21st.dev "Testimonials" by
 * @santiago_f2e051f5 (editorial 3-up, stagger-on-view, hover-lift),
 * restyled to the Placedon Frost Luxe glass + iris token system.
 */

type Testimonial = {
  quote: string;
  author: string;
  context?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We stopped shortlisting on keywords and started reading how people actually reason. Our first two Placedon hires were people we'd have filtered out on paper.",
    author: "Dana Okafor",
    context: "Head of Talent · Meridian",
  },
  {
    quote:
      "The trait scores link straight to the moment in the interview. When a hiring manager pushes back, I show them the exact answer. No more black box.",
    author: "Ravi Menon",
    context: "Talent Partner · Cortex",
  },
  {
    quote:
      "No timer, no trick questions, and I could see every trait it pulled — and contest one. First interview in years that felt like it was actually listening.",
    author: "Sofia Lindqvist",
    context: "Candidate · placed at Lumen",
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function Testimonials({ className }: { className?: string }) {
  return (
    <section aria-label="Testimonials" className={cn("relative py-20 md:py-28", className)}>
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="eyebrow">Voices from hiring teams</p>
          <h2 className="mt-3 max-w-2xl text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)]">
            Signal people can <span className="grad-iris">stand behind</span>.
          </h2>
        </motion.div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.li
              key={`${t.author}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.62, delay: i * 0.08, ease }}
              whileHover={{ y: -6 }}
              className="glass relative flex h-full flex-col rounded-[var(--r-card)] p-7"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-2 left-3 select-none text-[5rem] leading-none"
                style={{ fontFamily: "var(--font-display)", color: "var(--iris-ghost)" }}
              >
                &ldquo;
              </span>
              <p className="relative flex-1 text-[15.5px] leading-relaxed text-[var(--ink)]">
                {t.quote}
              </p>
              <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--glass-line)" }}>
                <p className="text-[14px] font-semibold text-[var(--ink)]">{t.author}</p>
                {t.context && (
                  <p
                    className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-3)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {t.context}
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
