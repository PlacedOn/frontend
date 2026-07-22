"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Network } from "lucide-react";
import { v1, V1Error, isLiveBackend, type GrowthReport } from "@/lib/v1";
import { MOCK_GROWTH_REPORT } from "@/lib/mock/growthReport";
import type { DashboardData } from "@/lib/network/queries";
import { Facet } from "./Facet";
import { SpecimenCard, type Specimen } from "./SpecimenCard";
import { InstrumentRegister } from "./InstrumentRegister";
import { OnboardingPeak, type Trait } from "./OnboardingPeak";

type Lens = "coverage" | "foundation";

const SAMPLE_SPECIMENS: Specimen[] = [
  { exNo: "EX-001", title: "Systematic problem-solving", kind: <>From your interview · <b className="font-semibold text-[var(--iris-ink)]">2 citations</b></>, sealed: true, respect: 14 },
  { exNo: "EX-002", title: "idempotency-keys", kind: <>Go · <b className="font-semibold text-[var(--iris-ink)]">verified from GitHub</b></>, sealed: true, respect: 41, graft: "Priya added a benchmark" },
  { exNo: "EX-003", title: "Calm incident response", kind: <>From your interview · rollback-first</>, sealed: true, respect: 22 },
  { exNo: "EX-004", title: "events-schema", kind: <>Postgres · <b className="font-semibold text-[var(--iris-ink)]">verified</b> · p99 900→40ms</>, sealed: true, respect: 31 },
  { exNo: "EX-005", title: "Database schema design", kind: <>Emerging · one more example confirms it</>, sealed: false, respect: 5 },
  { exNo: "EX-006", title: "retry-budget", kind: <>Go · <b className="font-semibold text-[var(--iris-ink)]">verified</b></>, sealed: true, respect: 12 },
];

/** Traits quoted back from the trial interview. Sample until the backend
 *  exposes extracted traits — same honesty rule as the specimen shelf. */
const SAMPLE_TRAITS: Trait[] = [
  { label: "Systematic problem-solving", said: "I narrow the blast radius first, then find root cause." },
  { label: "Calm incident response", said: "Rollback before investigate — protect users, then debug." },
  { label: "Reliability instinct", said: "99.9% is a promise you defend, not a number you print." },
];

/** Matches the Facet's per-facet assemble cadence, so the ember caption lands
 *  the instant the last facet seats — not before, and never on idle load. */
const FACET_STAGGER_MS = 90;
const FACET_SETTLE_MS = 650;

/**
 * The Workshop — the candidate's home in the "your work speaks" world. The
 * Facet (assembled from real proofs) is the hero; the specimen shelf is the
 * work itself. Reuses the growth engine for readiness; falls back to sample data
 * in preview so the surface is legible before the backend is wired.
 */
export function WorkshopHome({ initial }: { initial: DashboardData }) {
  const live = isLiveBackend();
  const reduce = useReducedMotion();
  const [report, setReport] = useState<GrowthReport | null>(live ? null : MOCK_GROWTH_REPORT);
  const [lens, setLens] = useState<Lens>("coverage");
  const [assembleKey, setAssembleKey] = useState(0);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isPeakOpen, setPeakOpen] = useState(false);
  const [emberCaption, setEmberCaption] = useState<string | null>(null);
  const emberTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(emberTimer.current), []);

  useEffect(() => {
    if (!live) return;
    v1.growthReport().then(setReport).catch((e: unknown) => {
      if (!(e instanceof V1Error)) return;
    });
  }, [live]);

  const topFit = report?.role_fits[0] ?? null;
  const pct = topFit?.readiness_pct ?? Math.round(initial.latestCoverage?.coverage ?? 0);

  // Specimens: the candidate's real artifacts if any, else the sample shelf.
  const specimens: Specimen[] = useMemo(() => {
    if (initial.artifacts.length === 0) return SAMPLE_SPECIMENS;
    return initial.artifacts.map((a, i) => ({
      exNo: `EX-${String(i + 1).padStart(3, "0")}`,
      title: a.title,
      kind: a.source === "github" || a.verified_at ? <>verified from GitHub</> : <>{a.kind}</>,
      sealed: a.source === "github" || a.verified_at != null,
      respect: 0,
    }));
  }, [initial.artifacts]);

  const sealed = specimens.filter((s) => s.sealed).length;

  /** Accepting the peak is the one moment proof actually lands — so it is the
   *  one moment the ember is allowed to appear. Re-assemble, then say it once. */
  const handleAcceptTraits = useCallback(() => {
    setPeakOpen(false);
    setEmberCaption(null);
    setAssembleKey((k) => k + 1);

    const settleMs = reduce ? 0 : sealed * FACET_STAGGER_MS + FACET_SETTLE_MS;
    window.clearTimeout(emberTimer.current);
    emberTimer.current = window.setTimeout(
      () => setEmberCaption(`${pct}% — built from ${sealed} verified facets, not a guess.`),
      settleMs,
    );
  }, [pct, sealed, reduce]);

  return (
    <div>
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris)]">
        Your workshop
      </p>
      <h1 className="mt-1.5 text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)] font-extrabold tracking-tight text-[var(--ink)]">
        What you've built speaks for you.
      </h1>
      <p className="mt-1 text-[15px] text-[var(--ink-2)]">
        Backend engineer · <b className="font-semibold text-[var(--ink)]">building payment reliability in public</b>
      </p>

      {/* Facet hero */}
      <section
        className="mt-5 grid items-center gap-8 rounded-[26px] border p-7 md:grid-cols-[auto_1fr] md:p-8"
        style={{ background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 74%)", borderColor: "var(--glass-line)", boxShadow: "var(--shadow-sm)" }}
      >
        {/* The ring is the door into the evidence world — clicking it anywhere
            takes it apart, so the number is never a dead end. */}
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          aria-label="Take the ring apart — see every facet it's built from"
          className="justify-self-center rounded-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          <Facet
            pct={pct}
            size={300}
            facets={specimens.length}
            lit={sealed}
            lens={lens}
            assembleKey={assembleKey}
          />
        </button>
        <div className="max-w-[42ch]">
          <div className="mb-3.5 inline-flex gap-1 rounded-full border p-1" style={{ background: "var(--mist)", borderColor: "var(--glass-line)" }}>
            {(["coverage", "foundation"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLens(l)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold capitalize transition-colors ${lens === l ? "bg-white text-[var(--iris-ink)] shadow-sm" : "text-[var(--ink-3)]"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">
            Your ring isn't a progress bar — it's <b className="font-semibold text-[var(--ink)]">assembled from your real proofs</b>. Every facet is one verified thing. Take it apart any time to see exactly what it's made of.
          </p>
          {/* The ember: the product's one warm colour, spent only when new proof
              seats on the ring. If it is ever on screen at rest, it is a bug. */}
          <p
            className="mt-3.5 min-h-[18px] font-mono text-[12.5px] font-semibold transition-opacity duration-500"
            style={{ color: "var(--signal)", opacity: emberCaption ? 1 : 0 }}
            aria-live="polite"
          >
            {emberCaption}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="inline-flex items-center gap-2 rounded-[13px] border px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition-transform active:scale-[0.97]"
              style={{ background: "var(--mist)", borderColor: "var(--glass-line)" }}
            >
              <Network size={16} aria-hidden /> Take it apart
            </button>
            <button
              type="button"
              onClick={() => setPeakOpen(true)}
              className="inline-flex items-center gap-2 rounded-[13px] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97]"
              style={{ background: "var(--iris)", boxShadow: "0 8px 22px -8px rgba(105,34,245,.6)" }}
            >
              <Play size={15} aria-hidden /> Replay the moment
            </button>
          </div>
        </div>
      </section>

      {/* Specimen shelf */}
      <div className="mt-8 mb-3.5 flex items-baseline gap-3">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris)]">Proof of work</span>
        <h2 className="text-[1.35rem] font-extrabold tracking-tight text-[var(--ink)]">The specimens</h2>
        <span className="font-mono text-[12px] text-[var(--ink-3)]">{sealed} sealed · {specimens.length - sealed} emerging</span>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {specimens.map((s) => (
          <SpecimenCard key={s.exNo} {...s} />
        ))}
      </div>

      <InstrumentRegister
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        pct={pct}
        specimens={specimens}
      />
      <OnboardingPeak
        isOpen={isPeakOpen}
        onClose={() => setPeakOpen(false)}
        onAccept={handleAcceptTraits}
        traits={SAMPLE_TRAITS}
      />
    </div>
  );
}
