"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { BadgeCheck, MapPin, Check, X } from "@/components/ui/icons";
import { CandidateAvatar } from "./CandidateAvatar";
import { SkillIcon } from "./SkillIcon";
import { BAND_META, bandOf, type CandidateReport } from "@/lib/mock/candidateReport";

// Faint binary-code texture behind the card (the reference's techy watermark).
function BinaryTexture({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rows = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 46 }, (_, c) => ((h >> ((r + c) % 30)) & 1 ? "1" : "0")).join(""),
  );
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        maskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
      }}
    >
      <pre
        className="absolute -right-6 top-2 select-none text-[10px] leading-[15px]"
        style={{ fontFamily: "var(--font-mono)", color: "var(--ink)", opacity: 0.045, letterSpacing: "1px" }}
      >
        {rows.join("\n")}
      </pre>
    </div>
  );
}

type Props = {
  c: CandidateReport;
  status: string;
  busy: boolean;
  onSave: () => void;
  onPass: () => void;
};

export function CandidateSummaryCard({ c, status, busy, onSave, onPass }: Props) {
  const shownSkills = c.skills.slice(0, 3);
  const extra = c.skills.length - shownSkills.length;

  return (
    <article className="glass group relative flex h-full flex-col overflow-hidden rounded-[var(--r-card)] p-6 transition-transform duration-[var(--d-std)] hover:-translate-y-1">
      <BinaryTexture seed={c.id} />

      {/* full-card navigation overlay (accessible clickable card) */}
      <Link
        href={`/employer/candidate/${c.id}`}
        aria-label={`Open full report for ${c.targetRole}, candidate ${c.initials}`}
        className="absolute inset-0 z-[1] rounded-[var(--r-card)]"
      />

      {/* header: avatar + verified/freshness */}
      <div className="relative flex items-start justify-between gap-3">
        <span className="rounded-full shadow-sm ring-1 ring-black/5">
          <CandidateAvatar seed={c.id} size={56} />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {c.verified && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
              style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}
            >
              <BadgeCheck size={14} animateOnView /> Verified via interview
            </span>
          )}
          <span className="text-[11.5px] text-[var(--ink-3)]">{c.freshness}</span>
        </div>
      </div>

      {/* role + id */}
      <h3 className="relative mt-4 text-[19px] font-bold leading-tight text-[var(--ink)]">{c.targetRole}</h3>
      <p className="relative mt-0.5 text-[13px] font-semibold text-[var(--ink-3)]">{c.initials}</p>

      {/* about */}
      <p className="relative mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--ink-2)]">{c.about}</p>

      {/* skills */}
      <div className="relative mt-3.5 flex flex-wrap gap-1.5">
        {shownSkills.map((s) => (
          <span
            key={s.name}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--ink)]"
            style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)" }}
          >
            <SkillIcon name={s.name} /> {s.name}
          </span>
        ))}
        {extra > 0 && (
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: "var(--mist)", color: "var(--ink-3)" }}>
            +{extra}
          </span>
        )}
      </div>

      {/* meta */}
      <div className="relative mt-4 flex flex-col gap-1.5 text-[13.5px] text-[var(--ink-2)]">
        <span className="flex items-center gap-2">
          <Briefcase size={15} className="text-[var(--ink-3)]" /> {c.experienceLabel} of experience
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={15} className="text-[var(--ink-3)]" animateOnView /> {c.location}
        </span>
      </div>

      {/* evidence-band strip — no person-score, just how well each area is backed */}
      <div className="relative mt-auto grid grid-cols-3 gap-2 border-t pt-5" style={{ borderColor: "var(--glass-line)" }}>
        {c.scores.map((s) => {
          const meta = BAND_META[bandOf(s.value)];
          return (
            <div key={s.label} className="text-center">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">{s.label}</p>
              {/* how well this area is backed — form, not a number */}
              <div className="mx-auto mt-1.5 h-1.5 w-10 overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(meta.fill * 100)}%`, background: meta.fg }} />
              </div>
              <p className="mt-1.5 text-[12px] font-bold leading-tight" style={{ color: meta.fg }}>
                {meta.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* quick actions (above the link overlay) */}
      <div className="relative z-[2] mt-5 flex items-center gap-2">
        <Link
          href={`/employer/candidate/${c.id}`}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--r-btn)] py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          View full report
        </Link>
        {status !== "saved" && status !== "intro" ? (
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            aria-label="Save candidate"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[var(--r-btn)] border text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] disabled:opacity-60"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          >
            <Check size={16} animateOnHover />
          </button>
        ) : (
          <span
            className="grid h-10 shrink-0 place-items-center rounded-[var(--r-btn)] px-3 text-[12px] font-semibold"
            style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}
          >
            {status === "intro" ? "Intro sent" : "Saved"}
          </span>
        )}
        <button
          type="button"
          onClick={onPass}
          disabled={busy}
          aria-label="Pass on candidate"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] transition-colors hover:text-[var(--ink-2)] disabled:opacity-60"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
        >
          <X size={16} animateOnHover />
        </button>
      </div>
    </article>
  );
}
