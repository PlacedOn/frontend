"use client";

/**
 * Slice 5 — explained matches for one role. Each match is per-dimension bands
 * (supported / emerging / missing) with the candidate's own quoted words as the
 * citation, plus a disclosed-salary fit — never an overall score. Data comes
 * from GET/POST /v1/jobs/{id}/matches under the employer's JWT; the backend
 * reads candidate evidence only through the visibility-scoped views.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Quote, RefreshCw, ShieldCheck, CircleCheck, CircleDot, CircleDashed } from "lucide-react";
import {
  v1,
  V1Error,
  isLiveBackend,
  type Match,
  type DimensionStatus,
  type SalaryFitStatus,
  type JobRecommendation,
  type CoverageTier,
} from "@/lib/v1";
import { RequestIntroButton } from "@/components/intros/RequestIntroButton";

const DIM_STYLE: Record<DimensionStatus, { label: string; bg: string; fg: string; icon: typeof CircleCheck }> = {
  supported: { label: "Supported", bg: "rgba(5,150,105,0.12)", fg: "#047857", icon: CircleCheck },
  emerging: { label: "Emerging", bg: "var(--iris-ghost)", fg: "var(--iris-ink)", icon: CircleDot },
  missing: { label: "Missing", bg: "rgba(180,120,10,0.12)", fg: "#B45309", icon: CircleDashed },
};

// Coverage tier — qualitative, never a number. Ranking + gaps come from the
// shared coverage engine via GET /v1/jobs/{id}/recommendations.
const TIER_STYLE: Record<CoverageTier, { label: string; bg: string; fg: string }> = {
  strong: { label: "Strong coverage", bg: "rgba(5,150,105,0.12)", fg: "#047857" },
  worth_a_look: { label: "Worth a look", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  gaps: { label: "Has gaps", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
};

const SALARY_COPY: Record<SalaryFitStatus, string> = {
  in_range: "Disclosed range meets the candidate's expectation",
  below_expectation: "Disclosed range is below the candidate's expectation",
  not_disclosed: "No parseable salary disclosed on the Reality Card",
  no_expectation: "Candidate hasn't stated a salary expectation",
};

export function MatchList({ jobId }: { jobId: string }) {
  const live = isLiveBackend();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [recs, setRecs] = useState<Record<string, JobRecommendation>>({});
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order matches by the coverage ranking (uncertainty parity: emerging never
  // buried below a gap); fall back to the given order if recommendations fail.
  const rankAndSet = useCallback((rows: Match[], ranked: JobRecommendation[]) => {
    const recMap: Record<string, JobRecommendation> = {};
    ranked.forEach((r) => (recMap[r.candidate_id] = r));
    const order = new Map(ranked.map((r, i) => [r.candidate_id, i]));
    const sorted = [...rows].sort(
      (a, b) => (order.get(a.candidate_id) ?? 1e9) - (order.get(b.candidate_id) ?? 1e9),
    );
    setRecs(recMap);
    setMatches(sorted);
  }, []);

  const load = useCallback(async () => {
    try {
      const [job, rows, ranked] = await Promise.all([
        v1.getJob(jobId),
        v1.listMatches(jobId),
        v1.jobRecommendations(jobId).catch(() => [] as JobRecommendation[]),
      ]);
      setJobTitle(job.title);
      rankAndSet(rows, ranked);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof V1Error ? e.message : "Could not load matches.");
      setMatches([]);
    }
  }, [jobId, rankAndSet]);

  useEffect(() => {
    if (!live) return;
    load();
  }, [live, load]);

  const build = async () => {
    setBuilding(true);
    setError(null);
    try {
      const rows = await v1.buildMatches(jobId);
      const ranked = await v1.jobRecommendations(jobId).catch(() => [] as JobRecommendation[]);
      rankAndSet(rows, ranked);
    } catch (e: unknown) {
      setError(e instanceof V1Error ? e.message : "Could not build matches.");
    } finally {
      setBuilding(false);
    }
  };

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6" style={{ color: "var(--iris-ink)" }}>
        Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to see explained matches.
      </div>
    );
  }
  if (matches === null) return <p className="text-[14px] text-[var(--ink-3)]">Loading matches…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {jobTitle && <p className="eyebrow">{jobTitle}</p>}
          <p className="mt-1 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
            Every match is explained per signal with the candidate&rsquo;s own approved words — there is no
            overall score, and identity stays hidden until they accept an intro.
          </p>
        </div>
        <button
          type="button"
          onClick={build}
          disabled={building}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          <RefreshCw size={15} className={building ? "animate-spin" : undefined} />
          {building ? "Matching…" : "Find matches"}
        </button>
      </div>

      {error && <p className="text-[13.5px] font-semibold text-[#b91c1c]">{error}</p>}

      {matches.length === 0 && !error && (
        <div className="glass rounded-[var(--r-card)] p-10 text-center">
          <p className="text-[15px] font-semibold text-[var(--ink)]">No matches yet.</p>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">
            Run <em>Find matches</em> to line this role&rsquo;s signals up against candidates with approved,
            visible evidence. Candidates with nothing relevant are never listed.
          </p>
          <Link
            href={`/employer/jobs/${jobId}/setup`}
            className="mt-3 inline-block text-[13px] font-semibold"
            style={{ color: "var(--iris-ink)" }}
          >
            Review Role DNA &amp; Reality Card
          </Link>
        </div>
      )}

      {matches.map((m) => (
        <MatchCard key={m.candidate_id} match={m} jobId={jobId} rec={recs[m.candidate_id]} />
      ))}
    </div>
  );
}

function MatchCard({ match, jobId, rec }: { match: Match; jobId: string; rec?: JobRecommendation }) {
  const shortId = match.candidate_id.slice(0, 8);
  const tierStyle = rec ? TIER_STYLE[rec.tier] : null;
  const gaps = rec?.coverage.gaps ?? [];
  const clarify = rec?.coverage.clarify ?? [];
  return (
    <article className="glass rounded-[var(--r-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-bold text-[var(--ink)]">Candidate {shortId}</h3>
            {tierStyle && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold"
                style={{ background: tierStyle.bg, color: tierStyle.fg }}
              >
                {tierStyle.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            {match.role_family ? `${match.role_family} · ` : ""}identity revealed only after an accepted intro
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountChip n={match.counts.supported} style={DIM_STYLE.supported} />
          <CountChip n={match.counts.emerging} style={DIM_STYLE.emerging} />
          <CountChip n={match.counts.missing} style={DIM_STYLE.missing} />
        </div>
      </div>

      {(gaps.length > 0 || clarify.length > 0) && (
        <div className="mt-3 flex flex-col gap-1.5 rounded-[var(--r-btn)] px-3.5 py-2.5" style={{ background: "var(--glass)" }}>
          {gaps.length > 0 && (
            <p className="text-[12.5px] text-[var(--ink-2)]">
              <span className="font-semibold" style={{ color: "#B45309" }}>Gaps to explore:</span> {gaps.join(", ")}
            </p>
          )}
          {clarify.length > 0 && (
            <p className="text-[12.5px] text-[var(--ink-2)]">
              <span className="font-semibold" style={{ color: "var(--iris-ink)" }}>One question away:</span> {clarify.join(", ")}
            </p>
          )}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {match.dimensions.map((d, i) => {
          const s = DIM_STYLE[d.status];
          const Icon = s.icon;
          return (
            <li key={d.signal_id ?? `${d.signal}-${i}`} className="rounded-[var(--r-btn)] border p-3.5" style={{ borderColor: "var(--glass-line-hi)" }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] font-semibold text-[var(--ink)]">{d.signal}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: s.bg, color: s.fg }}>
                  <Icon size={12} /> {s.label}
                </span>
              </div>
              {d.claim && <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">{d.claim}</p>}
              {d.quote && (
                <blockquote className="mt-2 flex gap-2 rounded-[var(--r-btn)] border-l-2 px-3 py-2 text-[12.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris)", background: "var(--glass)" }}>
                  <Quote size={12} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
                  <span>{d.quote}</span>
                </blockquote>
              )}
              {d.status === "missing" && (
                <p className="mt-1.5 text-[12.5px] text-[var(--ink-3)]">
                  No approved evidence for this signal yet — worth exploring in a human conversation.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-btn)] px-3.5 py-2.5" style={{ background: "var(--glass)" }}>
        <p className="text-[13px] text-[var(--ink-2)]">
          <span className="font-semibold text-[var(--ink)]">Salary:</span> {SALARY_COPY[match.salary.status]}
          {match.salary.job_range ? ` · role discloses ${match.salary.job_range}` : ""}
        </p>
        <RequestIntroButton jobId={jobId} candidateId={match.candidate_id} />
      </div>
    </article>
  );
}

function CountChip({ n, style }: { n: number; style: { label: string; bg: string; fg: string } }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full px-2.5 py-1" style={{ background: style.bg, color: style.fg }}>
      <span className="text-[13px] font-bold">{n}</span>
      <span className="text-[11px] font-semibold">{style.label.toLowerCase()}</span>
    </span>
  );
}
