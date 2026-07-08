"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Lock, Quote } from "lucide-react";
import { getProfileData, type ProfileTrait, type TraitConfidence } from "@/lib/mock/profile";

const PILL: Record<TraitConfidence, { bg: string; fg: string; label: string }> = {
  high: { bg: "rgba(16,185,129,0.12)", fg: "#047857", label: "High evidence" },
  medium: { bg: "rgba(245,134,11,0.12)", fg: "#B45309", label: "Medium evidence" },
  low: { bg: "var(--mist)", fg: "var(--ink-3)", label: "Emerging" },
  review: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)", label: "Needs your review" },
};

export function TrustPassport() {
  const [traits, setTraits] = useState<ProfileTrait[] | null>(null);
  const [strength, setStrength] = useState(72);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    getProfileData().then((d) => {
      if (active) {
        setTraits(d.traits);
        setStrength(d.strength);
        setLive(d.live);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const pendingReview = traits?.some((t) => t.confidence === "review") ?? false;

  return (
    <>
      {live && (
        <div className="mb-4 flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      )}

      {/* Strength summary */}
      <div className="glass mb-6 rounded-[var(--r-card)] p-6">
        <div className="mb-2.5 flex items-center justify-between text-[14px] font-semibold text-[var(--ink)]">
          <span>Profile strength</span>
          <span>{strength}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${strength}%`, background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }} />
        </div>
        <p className="mt-3 text-[13.5px] text-[var(--ink-3)]">
          {pendingReview
            ? "One trait still needs your review before this profile can go live to employers."
            : "Every trait is reviewed. Employers see only the evidence you approve."}
        </p>
      </div>

      {/* Traits */}
      <ul className="grid gap-4 md:grid-cols-2">
        {(traits ?? Array.from({ length: 4 })).map((t, i) => {
          if (!t) {
            return <li key={i} className="glass h-44 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />;
          }
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
    </>
  );
}
