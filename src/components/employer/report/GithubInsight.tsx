"use client";

import { Star } from "lucide-react";
import { Check } from "@/components/ui/icons";
import type { GithubInsight as GithubData } from "@/lib/mock/candidateReport";

/** GitHub mark (lucide 1.x dropped brand glyphs, so inline the octocat). */
function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

// GitHub-ish language colours; fall back to brand violet.
const LANG_COLOR: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Scala: "#C22D40",
  HCL: "var(--v-600)",
  Shell: "#89E051",
  Jupyter: "#DA5B0B",
  SQL: "#E38C00",
  Dockerfile: "#384D54",
};
const langColor = (l: string) => LANG_COLOR[l] ?? "var(--iris)";

// 5-step intensity ramp for the contribution grid.
const CELL = ["var(--mist)", "rgba(142, 100, 255,0.30)", "rgba(142, 100, 255,0.52)", "rgba(115, 54, 255,0.72)", "var(--iris-ink)"];

function dayIntensity(weekVal: number, week: number, day: number): number {
  // deterministic per-day variation around the week's base level
  let s = ((week + 1) * 73856093) ^ ((day + 1) * 19349663);
  s = (s >>> 0) % 100;
  if (weekVal === 0) return s < 12 ? 1 : 0;
  const jitter = s < 30 ? -1 : s > 80 ? 1 : 0;
  return Math.max(0, Math.min(4, weekVal + jitter));
}

export function GithubInsight({ github }: { github: GithubData }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          <GithubMark size={16} /> GitHub read
        </h2>
        <span className="text-[11.5px] text-[var(--ink-3)]">{github.handle} · illustrative sample</span>
      </div>

      <div className="glass mt-3 flex flex-col gap-6 rounded-[var(--r-card)] p-6 md:p-7">
        {/* languages */}
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--ink-2)]">Top languages</p>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full">
            {github.topLanguages.map((l) => (
              <span key={l.name} style={{ width: `${l.pct}%`, background: langColor(l.name) }} />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {github.topLanguages.map((l) => (
              <span key={l.name} className="flex items-center gap-1.5 text-[12.5px] text-[var(--ink-2)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(l.name) }} />
                {l.name} <span className="text-[var(--ink-3)]">{l.pct}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* contribution grid */}
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--ink-2)]">Commit activity · last 52 weeks</p>
          <div className="mt-2 overflow-x-auto">
            <div className="grid w-max grid-flow-col gap-[3px]" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
              {github.contributionWeeks.map((wv, w) =>
                Array.from({ length: 7 }, (_, d) => {
                  const lvl = dayIntensity(wv, w, d);
                  return <span key={`${w}-${d}`} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: CELL[lvl] }} aria-hidden />;
                }),
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--ink-3)]">
            Less
            {CELL.map((c, i) => (
              <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
            ))}
            More
          </div>
        </div>

        {/* repos */}
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--ink-2)]">Notable repositories</p>
          <ul className="mt-2 flex flex-col divide-y" style={{ borderColor: "var(--glass-line)" }}>
            {github.repos.map((r) => (
              <li key={r.name} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0" style={{ borderColor: "var(--glass-line)" }}>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>{r.name}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[var(--ink-2)]">{r.description}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(r.language) }} /> {r.language}
                    <span>·</span> updated {r.lastActive}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[var(--ink-2)]">
                  <Star size={13} className="text-[var(--signal)]" /> {r.stars}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* derived signals */}
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--ink-2)]">What the code shows</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {github.signals.map((s) => (
              <li key={s} className="flex items-start gap-2 rounded-[var(--r-btn)] p-2.5 text-[13px] text-[var(--ink-2)]" style={{ background: "var(--porcelain-2)" }}>
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" animateOnView /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
