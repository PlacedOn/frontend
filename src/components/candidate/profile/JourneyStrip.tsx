"use client";

import Link from "next/link";
import { ChevronRight, FileText, Gauge, Mic, PenLine, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { MOCK_CANDIDATE_PROFILE, MOCK_OPENING_FITS } from "@/lib/mock/candidateProfile";

type Step = {
  icon: LucideIcon;
  title: string;
  meta: string;
  href: string;
  cta: string;
};

/**
 * Dashboard bridge: profile (claims) → interview (verify) → growth report
 * (shown) → openings you fit (readiness). One glance at the whole journey.
 */
export function JourneyStrip() {
  const claims = MOCK_CANDIDATE_PROFILE.claimed_skills.length;
  const queued = MOCK_CANDIDATE_PROFILE.claimed_skills.filter((s) => s.wants_to_verify).length;
  const openings = MOCK_OPENING_FITS.length;
  const topReadiness = Math.max(...MOCK_OPENING_FITS.map((f) => f.readiness_pct), 0);

  const steps: Step[] = [
    {
      icon: PenLine,
      title: "Say it",
      meta: `${claims} skills claimed · ${queued} flagged to verify`,
      href: "/candidate/profile",
      cta: "Build profile",
    },
    {
      icon: Mic,
      title: "Show it",
      meta: "The interview probes exactly what you flagged",
      href: "/pre-interview",
      cta: "Interview",
    },
    {
      icon: FileText,
      title: "Read it",
      meta: "Growth Report: your edge, gaps, and roadmap",
      href: "/candidate/growth",
      cta: "Growth report",
    },
    {
      icon: Gauge,
      title: "Fit it",
      meta: `${openings} openings · up to ${topReadiness}% readiness`,
      href: "/candidate/matches",
      cta: "Openings",
    },
  ];

  return (
    <Reveal>
      <section aria-label="Your evidence journey" className="glass rounded-[2rem] p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <p className="eyebrow">Your evidence journey</p>
            <h3 className="mt-1 text-[20px] font-bold text-[var(--ink)]">Claims → shown → fit.</h3>
          </div>
          <p className="text-[12px] font-semibold text-[var(--ink-3)]">
            Readiness = requirement coverage, never selection odds.
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative">
                <Link
                  href={step.href}
                  className="group flex h-full flex-col rounded-[1.25rem] border p-4 transition-all hover:-translate-y-0.5 hover:bg-white"
                  style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[var(--iris)]"
                      style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span
                      className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-[var(--ink)]">{step.title}</p>
                  <p className="mt-1 flex-1 text-[12.5px] leading-5 text-[var(--ink-2)]">{step.meta}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-[var(--iris-ink)]">
                    {step.cta}
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </p>
                </Link>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-white text-[var(--ink-3)] lg:grid"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-[12px] leading-5 text-[var(--ink-3)]">
          Reaching a role&rsquo;s owner always goes through a{" "}
          <Link href="/intros" className="font-bold text-[var(--iris-ink)] hover:underline">
            consent-gated intro
          </Link>
          {" "}— company identity stays an archetype until you say yes.
        </p>
      </section>
    </Reveal>
  );
}
