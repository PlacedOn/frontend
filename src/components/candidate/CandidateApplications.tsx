"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import { getApplicationsData, type Application, type AppStageId } from "@/lib/mock/applications";
import {
  STAGE_ORDER,
  STAGE_LABEL,
  stageIndex,
  useApplicationStages,
} from "@/lib/candidate/applicationTracking";

const EASE = [0.16, 1, 0.3, 1] as const;

// Stable empty base so the merge hook's memo doesn't churn before data loads.
const EMPTY: Application[] = [];

const STAGE_TONE: Record<AppStageId, { bg: string; fg: string }> = {
  saved: { bg: "var(--mist)", fg: "var(--ink-3)" },
  applied: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  interview: { bg: "rgba(16,185,129,0.12)", fg: "#047857" },
  offer: { bg: "rgba(245,134,11,0.12)", fg: "#B45309" },
};

export function CandidateApplications() {
  const reduce = useReducedMotion();
  const [base, setBase] = useState<Application[] | null>(null);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState<AppStageId | null>(null);

  useEffect(() => {
    let active = true;
    getApplicationsData().then((d) => {
      if (!active) return;
      setBase(d.applications);
      setLive(d.live);
    });
    return () => {
      active = false;
    };
  }, []);

  const { applications, counts, moveTo } = useApplicationStages(base ?? EMPTY);

  const visible = useMemo(
    () => (filter ? applications.filter((a) => a.stage === filter) : applications),
    [applications, filter],
  );

  if (base === null) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-20 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass h-28 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="glass rounded-[var(--r-card)] p-10 text-center">
        <IconTile icon={Sparkles} tone="iris" size="lg" className="mx-auto mb-4" />
        <h2 className="text-[1.3rem]">No applications yet.</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Show interest in a matched role and it will appear here — you stay in control of every intro.
        </p>
        <Link href="/candidate/matches" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
          Browse matches <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {live && (
        <div className="flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      )}

      {/* Pipeline — interactive columns. Counts derive from the cards, so they
          always agree. Tapping a stage filters; tapping the active one clears. */}
      <div className="glass grid grid-cols-2 gap-2.5 rounded-[var(--r-card)] p-4 sm:grid-cols-4" role="tablist" aria-label="Filter by stage">
        {STAGE_ORDER.map((id) => {
          const tone = STAGE_TONE[id];
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(active ? null : id)}
              className="cursor-pointer rounded-[1rem] p-4 text-left transition-[transform,box-shadow] duration-[var(--d-micro)] hover:-translate-y-px active:scale-[0.99]"
              style={{
                background: tone.bg,
                boxShadow: active ? `0 0 0 2px ${tone.fg} inset` : "none",
              }}
            >
              <p className="text-[26px] font-extrabold leading-none tabular-nums" style={{ color: tone.fg }}>
                {counts[id]}
              </p>
              <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--ink-2)]">{STAGE_LABEL[id]}</p>
            </button>
          );
        })}
      </div>

      {filter && (
        <div className="-mt-2 flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
          <span>
            Showing <span className="font-semibold text-[var(--ink)]">{STAGE_LABEL[filter]}</span> ·{" "}
            {visible.length} {visible.length === 1 ? "role" : "roles"}
          </span>
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="cursor-pointer font-semibold hover:underline"
            style={{ color: "var(--iris-ink)" }}
          >
            Show all
          </button>
        </div>
      )}

      {/* Applications */}
      {visible.length === 0 ? (
        <div className="glass rounded-[var(--r-card)] p-8 text-center">
          <p className="text-[14.5px] text-[var(--ink-2)]">
            Nothing in <span className="font-semibold text-[var(--ink)]">{filter ? STAGE_LABEL[filter] : "this stage"}</span> yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((a, i) => (
            <ApplicationCard key={a.id} app={a} index={i} reduce={!!reduce} onMove={moveTo} />
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/candidate/matches" className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
          Find more roles <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/candidate" className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-white" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function ApplicationCard({
  app,
  index,
  reduce,
  onMove,
}: {
  app: Application;
  index: number;
  reduce: boolean;
  onMove: (id: string, stage: AppStageId) => void;
}) {
  const tone = STAGE_TONE[app.stage];
  const idx = stageIndex(app.stage);
  const prev = idx > 0 ? STAGE_ORDER[idx - 1] : null;
  const next = idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: reduce ? 0 : index * 0.05, ease: EASE }}
      className="glass rounded-[var(--r-card)] p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[16.5px] font-bold text-[var(--ink)]">{app.role}</h3>
            <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: tone.bg, color: tone.fg }}>
              {STAGE_LABEL[app.stage]}
            </span>
          </div>
          <p className="mt-1 text-[13.5px] font-semibold text-[var(--ink-3)]">{app.company}</p>
        </div>
        <span className="text-[13px] font-medium text-[var(--ink-2)]">{app.statusLabel}</span>
      </div>

      <p className="mt-4 rounded-[0.9rem] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--ink-2)]" style={{ background: "var(--mist)" }}>
        <span className="font-semibold text-[var(--ink)]">Next: </span>
        {app.nextStep}
      </p>

      {app.evidence.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {app.evidence.map((e) => (
            <span key={e} className="rounded-full px-2.5 py-1 text-[11.5px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Move between stages — the candidate's own tracking, saved to this device. */}
      <div className="mt-4 flex items-center gap-2 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
        <span className="mr-auto text-[12px] font-medium text-[var(--ink-3)]">Move stage</span>
        <StageButton
          direction="back"
          label={prev ? STAGE_LABEL[prev] : null}
          onClick={() => prev && onMove(app.id, prev)}
        />
        <StageButton
          direction="forward"
          label={next ? STAGE_LABEL[next] : null}
          onClick={() => next && onMove(app.id, next)}
        />
      </div>
    </motion.li>
  );
}

function StageButton({
  direction,
  label,
  onClick,
}: {
  direction: "back" | "forward";
  label: string | null;
  onClick: () => void;
}) {
  const disabled = label === null;
  const Icon = direction === "back" ? ChevronLeft : ChevronRight;
  const aria = disabled
    ? `No stage ${direction === "back" ? "before" : "after"} this one`
    : `Move to ${label}`;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      title={disabled ? undefined : `Move to ${label}`}
      className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-35"
      style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
    >
      {direction === "back" && <Icon size={14} />}
      {label ?? (direction === "back" ? "Start" : "Final")}
      {direction === "forward" && <Icon size={14} />}
    </button>
  );
}
