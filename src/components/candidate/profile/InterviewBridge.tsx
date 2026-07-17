"use client";

import Link from "next/link";
import { ArrowRight, FileText, Mic, Quote, Sparkles } from "lucide-react";
import type { CandidateProfile } from "@/lib/v1";
import { verifyTargets } from "./useProfileBuilder";

type Props = {
  profile: CandidateProfile;
};

/**
 * The profile → interview → report bridge. Shows how this page literally
 * builds the interview: flagged claims become probe targets, highlights
 * become the opening questions — then the Growth Report shows what stuck.
 */
export function InterviewBridge({ profile }: Props) {
  const targets = verifyTargets(profile);
  const openers = profile.highlights.filter((h) => h.title.trim());
  const roleFamily = profile.target_roles[0];

  return (
    <section
      aria-label="Your interview, built from this page"
      className="relative overflow-hidden rounded-[2rem] p-6 text-white"
      style={{ background: "#13152e", boxShadow: "0 18px 60px rgba(17,20,33,0.22)" }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{ background: "var(--iris)", opacity: 0.22, filter: "blur(70px)" }}
        aria-hidden
      />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">The bridge</p>
        <h3 className="mt-2 text-[20px] font-bold leading-snug">This page writes your interview.</h3>
        {roleFamily && (
          <p className="mt-1.5 text-[12.5px] font-semibold text-white/55">
            Routed to <span className="text-white/85">{roleFamily}</span>
          </p>
        )}

        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
            <Mic className="h-3.5 w-3.5" aria-hidden /> It will probe
          </p>
          {targets.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {targets.map((t) => (
                <li
                  key={t.label}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5"
                  style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                >
                  <span className="text-[13px] font-semibold leading-snug">{t.label}</span>
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-white/50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    you said → to show
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 rounded-xl px-3.5 py-3 text-[12.5px] leading-5 text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
              Flag a skill with &ldquo;Verify in my interview&rdquo; and it appears here as an interview target.
            </p>
          )}
        </div>

        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
            <Quote className="h-3.5 w-3.5" aria-hidden /> It opens with
          </p>
          {openers.length > 0 ? (
            <ul className="mt-2.5 grid gap-2">
              {openers.map((h) => (
                <li
                  key={h.id}
                  className="rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold leading-snug"
                  style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                >
                  &ldquo;Tell me about — {h.title}&rdquo;
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 rounded-xl px-3.5 py-3 text-[12.5px] leading-5 text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
              Add a highlight and the interview opens with your best story instead of a cold start.
            </p>
          )}
        </div>

        <Link
          href="/pre-interview"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-btn)] px-5 py-3.5 text-[14.5px] font-bold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Start the interview
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/candidate/growth"
          className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-btn)] border px-5 py-3 text-[13.5px] font-bold text-white/85 transition-colors hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,0.16)" }}
        >
          <FileText className="h-4 w-4" aria-hidden />
          Already interviewed? See what you&rsquo;ve shown
        </Link>

        <p className="mt-4 text-[11.5px] leading-5 text-white/50">
          The interview verifies claims — it never scores you as a person, and nothing is shared until you approve it.
        </p>
      </div>
    </section>
  );
}
