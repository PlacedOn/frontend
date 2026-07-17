"use client";

/*
 * Shared primitives + option labels for the profile builder.
 * The builder collects CLAIMS + INTENT only (fairness firewall: no college,
 * caste, religion, region, mother-tongue, gender, age, or photo — ever).
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Availability, SelfRating, Seniority, WorkMode, WorkType } from "@/lib/v1";

/* ── option lists + labels (mirror the v1 contract) ─────────────── */

export const WORK_TYPES: WorkType[] = ["full_time", "part_time", "internship", "freelance", "contract"];
export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  freelance: "Freelance",
  contract: "Contract",
};

export const SENIORITIES: Seniority[] = ["student", "junior", "mid", "senior", "lead"];
export const SENIORITY_LABEL: Record<Seniority, string> = {
  student: "Student",
  junior: "Early career",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
};

export const AVAILABILITIES: Availability[] = ["immediately", "in_1_month", "in_3_months", "exploring"];
export const AVAILABILITY_LABEL: Record<Availability, string> = {
  immediately: "Immediately",
  in_1_month: "In 1 month",
  in_3_months: "In 3 months",
  exploring: "Just exploring",
};

export const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const RATINGS: SelfRating[] = ["learning", "working", "strong"];
export const RATING_META: Record<SelfRating, { label: string; hint: string }> = {
  learning: { label: "Learning", hint: "picking it up" },
  working: { label: "Working", hint: "use it regularly" },
  strong: { label: "Strong", hint: "could teach it" },
};

export const ROLE_SUGGESTIONS = [
  "Backend / Platform Engineering",
  "Frontend Engineering",
  "Site Reliability",
  "Data Engineering",
  "Product Engineering",
  "Mobile Engineering",
];

/* ── input styling (matches the dashboard's glass language) ─────── */

export const INPUT_CLS =
  "w-full rounded-[var(--r-btn)] border px-4 py-3 text-[14.5px] font-medium text-[var(--ink)] outline-none transition-[border-color,background,box-shadow] duration-[var(--d-micro)] placeholder:font-normal placeholder:text-[var(--ink-3)] focus:border-[var(--iris)] focus:bg-white focus:shadow-[0_0_0_4px_var(--iris-ghost)]";
export const INPUT_STYLE = { borderColor: "var(--glass-line-hi)", background: "var(--glass)" } as const;

/* ── small building blocks ──────────────────────────────────────── */

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">{children}</span>
      {hint && <span className="text-[11.5px] font-medium text-[var(--ink-3)]">{hint}</span>}
    </span>
  );
}

/** Tiny badge stamped on every preference-only field (fairness legibility). */
export function PrefBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ borderColor: "var(--iris-line)", color: "var(--iris-ink)", background: "var(--iris-ghost)" }}
      title="Used only to match openings to you — never to assess or judge you."
    >
      matching pref
    </span>
  );
}

export function ToggleChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-[transform,background,color,box-shadow] duration-[var(--d-micro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--iris)]",
        active ? "-translate-y-px text-white" : "text-[var(--ink-2)] hover:-translate-y-px hover:bg-white",
        className,
      )}
      style={
        active
          ? { background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", borderColor: "transparent", boxShadow: "var(--shadow-iris)" }
          : { background: "var(--glass)", borderColor: "var(--glass-line-hi)" }
      }
    >
      {children}
    </button>
  );
}

/** Numbered glass section shell used by every builder step. */
export function SectionCard({
  id,
  step,
  kicker,
  title,
  note,
  aside,
  children,
}: {
  id: string;
  step: number;
  kicker: string;
  title: string;
  note?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="glass scroll-mt-28 rounded-[2rem] p-6 md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-2.5">
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold"
              style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
            >
              {step}
            </span>
            {kicker}
          </p>
          <h2 id={`${id}-heading`} className="mt-2.5 text-[21px] font-bold tracking-tight text-[var(--ink)]">
            {title}
          </h2>
          {note && <p className="mt-1.5 max-w-lg text-[13.5px] leading-6 text-[var(--ink-3)]">{note}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Free-text tags with quick-add suggestions (target roles, locations). */
export function TagInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
  addLabel = "Add",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const t = raw.trim();
    if (!t || values.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onChange([...values, t]);
    setDraft("");
  };
  const remove = (tag: string) => onChange(values.filter((v) => v !== tag));
  const remaining = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      {values.length > 0 && (
        <ul className="mb-2.5 flex flex-wrap gap-2">
          {values.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border py-1.5 pl-3.5 pr-1.5 text-[13px] font-semibold text-[var(--ink)]"
              style={{ background: "var(--white)", borderColor: "var(--glass-line-hi)", boxShadow: "var(--shadow-sm)" }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="grid h-5 w-5 cursor-pointer place-items-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          disabled={!draft.trim()}
          className="shrink-0 cursor-pointer rounded-[var(--r-btn)] px-4 text-[13px] font-bold text-white transition-opacity disabled:cursor-default disabled:opacity-40"
          style={{ background: "var(--ink)" }}
        >
          {addLabel}
        </button>
      </div>
      {remaining.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Quick add</span>
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="cursor-pointer rounded-full border border-dashed px-3 py-1 text-[12px] font-semibold text-[var(--ink-2)] transition-colors hover:border-solid hover:bg-white hover:text-[var(--iris-ink)]"
              style={{ borderColor: "var(--glass-line-hi)" }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
