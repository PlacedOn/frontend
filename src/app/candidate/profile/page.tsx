import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Lock, Quote } from "lucide-react";
import { RoutePage } from "@/components/layout/RoutePage";
import type { Confidence } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your profile — PlacedOn",
  description: "Your evidence-backed Trust Passport. Review every trait and its quote before employers see anything.",
};

type Trait = {
  label: string;
  confidence: Confidence | "review";
  quote: string;
  employerVisible: boolean;
};

const TRAITS: Trait[] = [
  {
    label: "Structured debugging",
    confidence: "high",
    quote: "I reproduced the failure in isolation before touching the API layer, so I could prove the fix.",
    employerVisible: true,
  },
  {
    label: "React architecture",
    confidence: "high",
    quote: "I split shared UI state from feature state so a change didn't rerender the whole checkout flow.",
    employerVisible: true,
  },
  {
    label: "API integration",
    confidence: "medium",
    quote: "I added a typed client so the failure modes were visible at the call site, not swallowed.",
    employerVisible: true,
  },
  {
    label: "Team communication",
    confidence: "review",
    quote: "One example so far — this signal is still light and worth strengthening next time.",
    employerVisible: false,
  },
];

const PILL: Record<Trait["confidence"], { bg: string; fg: string; label: string }> = {
  high: { bg: "rgba(16,185,129,0.12)", fg: "#047857", label: "High evidence" },
  medium: { bg: "rgba(245,134,11,0.12)", fg: "#B45309", label: "Medium evidence" },
  low: { bg: "var(--mist)", fg: "var(--ink-3)", label: "Emerging" },
  review: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)", label: "Needs your review" },
};

const STRENGTH = 72;

export default function CandidateProfilePage() {
  return (
    <RoutePage
      eyebrow="Trust passport"
      title={
        <>
          Your profile, <span className="grad-iris">before</span> employers see it.
        </>
      }
      intro="Every trait traces to your own words. Employers only ever see the evidence you approve — nothing is shared by default."
    >
      {/* Strength summary */}
      <div className="glass mb-6 rounded-[var(--r-card)] p-6">
        <div className="mb-2.5 flex items-center justify-between text-[14px] font-semibold text-[var(--ink)]">
          <span>Profile strength</span>
          <span>{STRENGTH}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <div className="h-full rounded-full" style={{ width: `${STRENGTH}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
        </div>
        <p className="mt-3 text-[13.5px] text-[var(--ink-3)]">
          One trait still needs your review before this profile can go live to employers.
        </p>
      </div>

      {/* Traits */}
      <ul className="grid gap-4 md:grid-cols-2">
        {TRAITS.map((t) => {
          const pill = PILL[t.confidence];
          return (
            <li key={t.label} className="glass flex flex-col rounded-[var(--r-card)] p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-bold text-[var(--ink)]">{t.label}</h3>
                <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: pill.bg, color: pill.fg }}>
                  {pill.label}
                </span>
              </div>
              <p className="mt-3 flex gap-2 border-l-2 pl-3 text-[13.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
                <Quote size={14} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
                &ldquo;{t.quote}&rdquo;
              </p>
              <span
                className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={
                  t.employerVisible
                    ? { background: "rgba(16,185,129,0.10)", color: "#047857" }
                    : { background: "var(--mist)", color: "var(--ink-3)" }
                }
              >
                {t.employerVisible ? <Eye size={12} /> : <Lock size={12} />}
                {t.employerVisible ? "Employer-visible" : "Hidden from employers"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/candidate/matches"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          View matching roles <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/pre-interview"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-white"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        >
          Add more signal
        </Link>
      </div>
    </RoutePage>
  );
}
