"use client";

import { motion, useReducedMotion } from "motion/react";
import { HcvRadar } from "@/components/candidate/hcv/HcvRadar";
import { BAND_META, bandOf, type CandidateReport, type ScoreDial } from "@/lib/mock/candidateReport";

const ease = [0.22, 0.68, 0.31, 1] as const;

function BandCard({ dial, delay }: { dial: ScoreDial; delay: number }) {
  const reduce = useReducedMotion();
  const band = bandOf(dial.value);
  const meta = BAND_META[band];
  return (
    <div className="rounded-[var(--r-card)] p-4" style={{ background: "var(--porcelain-2)", border: "1px solid var(--glass-line)" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">{dial.label}</span>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "var(--mist)", color: meta.fg }}>{meta.label}</span>
      </div>
      {/* Banded strength — three tiers, never a number. */}
      <div className="mt-3 flex gap-1.5" aria-hidden>
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
    </div>
  );
}

export function ScoreBreakdown({ report }: { report: CandidateReport }) {
  return (
    <section>
      <h2 className="text-[15px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
        Evidence at a glance
      </h2>
      <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
        Each area is an evidence band, not a person-score — how well the interview backs this up, tied to the moments below.
      </p>
      <div className="glass mt-3 grid gap-6 rounded-[var(--r-card)] p-6 md:p-7 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-center gap-3">
          {report.scores.map((d, i) => (
            <BandCard key={d.label} dial={d} delay={0.1 + i * 0.1} />
          ))}
        </div>
        <div className="flex flex-col items-center justify-center">
          <HcvRadar dimensions={report.dimensions} quantize />
          <p className="mt-1 text-center text-[11.5px] text-[var(--ink-3)]">
            Evidence fingerprint — each axis snaps to its band, not a precise score
          </p>
        </div>
      </div>
    </section>
  );
}
