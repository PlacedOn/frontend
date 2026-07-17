"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { BadgeCheck, MapPin, Check, X, Clock } from "@/components/ui/icons";
import { CandidateAvatar } from "@/components/employer/CandidateAvatar";
import type { CandidateReport } from "@/lib/mock/candidateReport";

type Props = {
  report: CandidateReport;
  status: string;
  onSave: () => void;
  onPass: () => void;
  onRequestIntro: () => void;
};

export function ReportHeader({ report, status, onSave, onPass, onRequestIntro }: Props) {
  const introDone = status === "intro";
  return (
    <div>
      <Link
        href="/employer"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} /> Back to candidates
      </Link>

      <div className="glass mt-4 rounded-[var(--r-card)] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* identity */}
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full shadow-sm ring-1 ring-black/5">
              <CandidateAvatar seed={report.id} size={68} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold leading-tight text-[var(--ink)]">
                  {report.targetRole}
                </h1>
                {report.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}>
                    <BadgeCheck size={14} animateOnView /> Verified via interview
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-[var(--ink-2)]">
                <span className="font-semibold text-[var(--ink-3)]">{report.initials}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--ink-3)]" /> {report.location}</span>
                <span>·</span>
                <span>{report.experienceLabel} experience</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-[var(--ink-3)]" /> Available {report.availableFrom.toLowerCase()}</span>
              </p>
            </div>
          </div>

          {/* evidence summary — no universal score; per-signal evidence shown below */}
          <div className="flex items-center gap-4 lg:shrink-0">
            <div className="text-[13px] leading-relaxed text-[var(--ink-2)]">
              <p>
                <span className="text-[26px] font-bold text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {report.dimensions.length}
                </span>{" "}
                role-relevant signals assessed
              </p>
              <p className="mt-1 text-[var(--ink-3)]">Evidence-backed per signal below — no single score.</p>
            </div>
          </div>
        </div>

        {/* about */}
        <p className="mt-5 max-w-3xl border-l-2 pl-4 text-[14.5px] leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>
          {report.about}
        </p>

        {/* actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t pt-5" style={{ borderColor: "var(--glass-line)" }}>
          {!introDone ? (
            <button
              type="button"
              onClick={onRequestIntro}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
            >
              <Send size={15} /> Request intro
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>
              <Check size={15} /> Intro requested
            </span>
          )}
          {status !== "saved" && status !== "intro" && (
            <button type="button" onClick={onSave} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]" style={{ borderColor: "var(--glass-line-hi)" }}>
              <Check size={14} animateOnHover /> Save
            </button>
          )}
          {status === "saved" && (
            <span className="inline-flex items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>Saved</span>
          )}
          <button type="button" onClick={onPass} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border px-4 py-2.5 text-[13px] font-medium text-[var(--ink-3)] transition-colors hover:text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
            <X size={14} animateOnHover /> Pass
          </button>
        </div>
      </div>
    </div>
  );
}
