"use client";

/**
 * Live employer dashboard — real roles from GET /v1/employer/dashboard under
 * the signed-in employer's JWT (RLS-scoped to their company). Rendered only
 * when isLiveBackend() is true; the mock preview board handles the rest.
 * No fake candidates here: matching arrives per-role via /employer/jobs/[id]/matches.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Wand2, CircleCheck, CircleDashed } from "lucide-react";
import { v1, V1Error, type JobSummary } from "@/lib/v1";

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  active: { bg: "rgba(16,185,129,0.12)", fg: "#047857" },
  draft: { bg: "var(--mist)", fg: "var(--ink-3)" },
  paused: { bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
  closed: { bg: "var(--mist)", fg: "var(--ink-3)" },
};

export function LiveEmployerBoard() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);

  useEffect(() => {
    let active = true;
    v1.employerDashboard()
      .then((rows) => {
        if (active) setJobs(rows);
      })
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof V1Error) setError({ message: e.message, status: e.status });
        else setError({ message: "Could not load your roles.", status: 0 });
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">
          {error.status === 401 ? "Sign in to see your roles." : "Could not load your roles."}
        </p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">{error.message}</p>
        {error.status === 401 && (
          <Link
            href="/login"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            Sign in <ArrowRight size={15} />
          </Link>
        )}
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        <div className="glass h-48 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        <div className="glass h-48 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        <div className="glass h-48 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <span className="livedot" />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Live · your roles from the backend
        </span>
      </div>

      <section>
        <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="eyebrow">Your roles</p>
            <h2 className="mt-1 text-[22px] font-bold text-[var(--ink)]">Open roles</h2>
            <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">
              A role enters matching only once its Role DNA and Reality Card are complete.
            </p>
          </div>
          <Link
            href="/employer/jobs/new"
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            <Plus size={16} /> Add role
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="glass rounded-[var(--r-card)] p-10 text-center">
            <p className="text-[15px] font-semibold text-[var(--ink)]">No roles yet.</p>
            <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">
              Create your first role, define the signals that matter, and matching starts from there.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const badge = STATUS_STYLE[job.status] ?? STATUS_STYLE.draft;
              return (
                <li
                  key={job.id}
                  className="glass relative flex flex-col overflow-hidden rounded-[var(--r-card)] p-5 transition-transform duration-[var(--d-std)] hover:-translate-y-1"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${badge.fg}, transparent)` }} />
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold capitalize"
                      style={{ background: badge.bg, color: badge.fg }}
                    >
                      {job.status}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                      style={{ color: job.is_search_ready ? "#047857" : "var(--ink-3)" }}
                    >
                      {job.is_search_ready ? <CircleCheck size={14} /> : <CircleDashed size={14} />}
                      {job.is_search_ready ? "Search-ready" : "Setup incomplete"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold text-[var(--ink)]">{job.title}</h3>
                  {job.level && <p className="mt-0.5 text-[13px] text-[var(--ink-3)]">{job.level}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/employer/jobs/${job.id}/setup`}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "var(--iris-ink)" }}
                    >
                      <Wand2 size={14} /> Role DNA &amp; reality
                    </Link>
                    {job.is_search_ready && (
                      <>
                        <Link
                          href={`/employer/jobs/${job.id}/matches`}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: "var(--iris-ink)" }}
                        >
                          Explained matches <ArrowRight size={14} />
                        </Link>
                        <Link
                          href={`/employer/jobs/${job.id}/pipeline`}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: "var(--iris-ink)" }}
                        >
                          Pipeline <ArrowRight size={14} />
                        </Link>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
