"use client";

/**
 * Fit Check card — role-evidence coverage %, scoped to ONE named role, with the
 * strict four-row contract so it can never read as a person-score. Shared by the
 * employer and candidate sides. `tone="dark"` renders it on the evidence layer's
 * instrument-panel ground.
 *
 * Craft (Emil): the coverage number counts up and the bar fills via scaleX
 * (compositor-only, not width), once when it enters view. Reduced-motion shows
 * the final value immediately.
 */

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import type { FitCheck } from "@/lib/v1";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Tone = "light" | "dark";

const BUCKET_FG: Record<Tone, Record<FitCheck["bucket"], string>> = {
  light: { strong: "#047857", worth_discussing: "var(--iris-ink)", clarify: "#B45309", not_enough: "var(--ink-3)" },
  dark: { strong: "#4FD69C", worth_discussing: "var(--iris-lift)", clarify: "#F0B460", not_enough: "rgba(255,255,255,0.5)" },
};

const WORK_REALITY_LABEL: Record<FitCheck["work_reality"], string> = {
  aligned: "Aligned",
  conflict: "May conflict",
  not_shared: "Not shared",
};

const MUST_HAVE_LABEL: Record<FitCheck["must_have_status"], string> = {
  clear: "Clear",
  clarify: "Clarify",
  unmet: "Unmet",
  not_specified: "Not specified",
};

export function FitCheckCard({ fit, roleName, tone = "light" }: { fit: FitCheck; roleName?: string; tone?: Tone }) {
  const dark = tone === "dark";
  const fg = BUCKET_FG[tone][fit.bucket];
  // Accept a briefly older backend during a rolling deploy without turning the
  // candidate card into an opaque error state.
  const mustHaveStatus = fit.must_have_status ?? "not_specified";
  const mustHaveDetail = fit.must_have_total > 0
    ? `${MUST_HAVE_LABEL[mustHaveStatus]} · ${fit.must_have_clear} of ${fit.must_have_total} clear`
    : MUST_HAVE_LABEL[mustHaveStatus];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [n, setN] = useState(reduce ? fit.coverage_percent : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, fit.coverage_percent, {
      duration: 0.9,
      ease: EASE_OUT,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, fit.coverage_percent]);

  const styles = dark
    ? { bg: "#171a33", border: "1px solid rgba(255,255,255,0.1)", track: "rgba(255,255,255,0.12)", label: "rgba(255,255,255,0.55)", key: "rgba(255,255,255,0.5)", val: "rgba(255,255,255,0.85)", note: "rgba(255,255,255,0.5)" }
    : { bg: "var(--porcelain-2)", border: "1px solid var(--glass-line)", track: "var(--mist)", label: "var(--ink-3)", key: "var(--ink-3)", val: "var(--ink-2)", note: "var(--ink-3)" };

  return (
    <div ref={ref} className="rounded-[var(--r-card)] p-4" style={{ background: styles.bg, border: styles.border }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold" style={{ color: styles.label }}>
          Fit Check{roleName ? ` · ${roleName}` : ""}
        </span>
        <span className="text-[26px] font-extrabold leading-none" style={{ color: fg, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
          {n}%
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: styles.track }}>
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ background: fg }}
          initial={reduce ? { opacity: 1 } : { scaleX: 0 }}
          animate={inView ? { scaleX: fit.coverage_percent / 100 } : undefined}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT }}
        />
      </div>
      <p className="mt-1.5 text-[12px] font-semibold" style={{ color: fg }}>{fit.bucket_label}</p>

      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[12.5px] sm:grid-cols-2">
        <Row k="Evidence signals" v={`${fit.role_requirements_clear} of ${fit.role_requirements_total} clear`} c={styles} />
        <Row k="Must-have check" v={mustHaveDetail} c={styles} />
        <Row k="Work reality" v={WORK_REALITY_LABEL[fit.work_reality]} c={styles} />
        <Row k="Evidence confidence" v={fit.evidence_confidence === "sufficient" ? "Sufficient" : "Limited"} c={styles} />
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: styles.note }}>
        Evidence-only coverage of this role&rsquo;s rubric — not a prediction of performance, an offer, or a judgment of the person.
      </p>
    </div>
  );
}

function Row({ k, v, c }: { k: string; v: string; c: { key: string; val: string } }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt style={{ color: c.key }}>{k}</dt>
      <dd className="font-semibold" style={{ color: c.val }}>{v}</dd>
    </div>
  );
}
