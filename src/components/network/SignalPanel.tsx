"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ReadinessGauge } from "@/components/candidate/growth/ReadinessGauge";
import { FitBandChip, READINESS_NOTE } from "@/components/candidate/growth/chips";
import { useMounted } from "@/hooks/useMounted";
import type { FitBand } from "@/lib/v1";

type Props = {
  coverage: number;
  roleTitle: string | null;
  fitBand: FitBand | null;
  hasWork: boolean;
  /** Bumps once per GitHub import so the ring gives a single confirming pulse. */
  pulseKey: number;
  /** In-voice line shown beside the ring the moment coverage moves. */
  flash: string | null;
  /** True when the backend isn't live and the ring shows sample data. */
  preview?: boolean;
  loading: boolean;
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still at it";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * The hero. The ring is an instrument, not a badge — it reuses the exact
 * ReadinessGauge geometry (so there's one dial in the codebase) and re-animates
 * whenever coverage changes. Quiet glass card, a single ambient iris glow, and
 * one confirming pulse on import. No idle animation — a live "measurement" that
 * breathes at rest reads as fake.
 */
export function SignalPanel({ coverage, roleTitle, fitBand, hasWork, pulseKey, flash, preview, loading }: Props) {
  const reduce = useReducedMotion();
  const mounted = useMounted(); // greeting is time-of-day → client-only, avoids hydration mismatch
  const empty = coverage === 0 && !hasWork;

  return (
    <section
      aria-labelledby="signal-heading"
      className="glass relative flex w-full flex-col items-center overflow-hidden rounded-[var(--r-card)] p-7 text-center md:p-9"
    >
      {/* ambient iris glow — atmosphere, not motion */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, var(--iris-ghost), transparent 70%)" }}
      />

      {preview && (
        <span
          className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: "var(--mist)", color: "var(--ink-3)" }}
        >
          Preview · sample
        </span>
      )}
      <p className="eyebrow relative">{mounted ? greeting() : "Welcome back"}</p>
      <h1
        id="signal-heading"
        className="relative mt-1.5 text-[clamp(1.15rem,1rem+0.7vw,1.5rem)] font-extrabold tracking-tight text-[var(--ink)]"
      >
        Here's where your evidence stands.
      </h1>

      {/* the dial + its one permitted flourish */}
      <div className="relative my-5 grid place-items-center">
        <AnimatePresence>
          {pulseKey > 0 && !reduce && (
            <motion.span
              key={pulseKey}
              aria-hidden
              className="absolute rounded-full"
              style={{ width: 280, height: 280, border: "2px solid var(--iris)" }}
              initial={{ opacity: 0.5, scale: 0.92 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <ReadinessGauge pct={coverage} size={280} variant="hero" />
      </div>

      {/* in-voice moment: the number just moved */}
      <AnimatePresence mode="wait">
        {flash && (
          <motion.p
            key={flash}
            className="relative mb-3 max-w-[34ch] rounded-[14px] px-4 py-2.5 text-[13px] font-semibold leading-snug text-[var(--iris-ink)]"
            style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.68, 0.31, 1] }}
          >
            {flash}
          </motion.p>
        )}
      </AnimatePresence>

      {empty ? (
        <div className="relative max-w-[32ch]">
          <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            Your ring starts empty because nothing's been verified yet — not because you haven't done
            anything.
          </p>
          <a
            href="#import"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-transform duration-150 active:scale-[0.97]"
            style={{ background: "var(--iris)" }}
          >
            Bring in what you've already built
            <ArrowRight size={15} aria-hidden />
          </a>
        </div>
      ) : (
        <div className="relative">
          {roleTitle && <p className="text-[15px] font-extrabold tracking-tight text-[var(--ink)]">{roleTitle}</p>}
          {fitBand && (
            <div className="mt-2 flex justify-center">
              <FitBandChip band={fitBand} />
            </div>
          )}
          <p
            className="mx-auto mt-4 max-w-[30ch] border-t pt-3.5 text-[12px] leading-relaxed text-[var(--ink-3)]"
            style={{ borderColor: "var(--glass-line)" }}
          >
            {loading ? "Reading your evidence…" : READINESS_NOTE}
          </p>
        </div>
      )}
    </section>
  );
}
