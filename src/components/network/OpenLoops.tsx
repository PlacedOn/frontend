"use client";

import Link from "next/link";
import { ArrowUpRight, CircleDot, BookOpen } from "lucide-react";
import { SeverityChip } from "@/components/candidate/growth/chips";
import type { RoleGap } from "@/lib/v1";

type Props = {
  loops: RoleGap[];
  roleTitle: string | null;
  live: boolean;
  error: string | null;
};

/**
 * The open loops — the nearest unmet requirements. Framed as invitations, never
 * deficits, with the exact next evidence to build. Each row is actionable: a
 * thin iris border grows on hover instead of a card-lift cliché.
 */
export function OpenLoops({ loops, roleTitle, live, error }: Props) {
  return (
    <section
      aria-labelledby="loops-heading"
      className="glass flex w-full flex-col rounded-[var(--r-card)] p-6 md:p-7"
    >
      <p className="eyebrow flex items-center gap-2">
        <CircleDot size={13} aria-hidden /> Open loops
      </p>
      <h2 id="loops-heading" className="mt-2 text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)] font-extrabold tracking-tight text-[var(--ink)]">
        {loops.length > 0
          ? `${loops.length} ${loops.length === 1 ? "thing stands" : "things stand"} between you and full coverage`
          : "Nothing's open right now"}
      </h2>
      {loops.length > 0 && (
        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          {roleTitle ? <>Close these to strengthen <b className="font-semibold text-[var(--ink)]">{roleTitle}</b>. </> : null}
          Each comes with the exact evidence to build.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2.5">
        {loops.map((gap) => (
          <div
            key={gap.skill_id}
            className="group relative overflow-hidden rounded-[16px] border p-4 transition-colors duration-150"
            style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}
          >
            {/* actionable signal: a thin iris rail grows on hover */}
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-200 ease-out group-hover:scale-y-100"
              style={{ background: "var(--iris)" }}
            />
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14.5px] font-bold tracking-tight text-[var(--ink)]">{gap.skill_label}</p>
              <SeverityChip severity={gap.severity} />
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-2)]">{gap.next_evidence}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ink-3)]">
                <BookOpen size={13} aria-hidden />
                {gap.learning.length > 0
                  ? `${gap.learning.length} cited ${gap.learning.length === 1 ? "step" : "steps"} to close it`
                  : "Ship evidence to close it"}
              </span>
              <Link
                href="/candidate/growth"
                className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[var(--iris-ink)] transition-transform duration-150 active:scale-[0.97] hover:gap-1.5"
              >
                Build this <ArrowUpRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        ))}

        {loops.length === 0 && (
          <p className="rounded-[16px] border p-5 text-[13.5px] leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line)" }}>
            {error
              ? error
              : live
                ? "You've covered every public requirement we can see for this direction. Bring in more work and new loops will appear as you aim higher."
                : "Import your work or take an interview, and the next things to close will show up here."}
          </p>
        )}
      </div>

      {loops.length > 0 && (
        <Link
          href="/candidate/growth"
          className="mt-auto flex items-center justify-center gap-1.5 pt-6 text-[12.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--iris-ink)]"
        >
          See the full roadmap in Growth <ArrowUpRight size={13} aria-hidden />
        </Link>
      )}
    </section>
  );
}
