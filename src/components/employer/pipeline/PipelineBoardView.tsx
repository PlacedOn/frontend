"use client";

/**
 * Employer candidate pipeline — a per-role hiring board (New → Reviewing → Intro
 * → Hired, + Passed). Cards show the coverage tier + evidence counts (no
 * person-score). Move a candidate between the settable stages (New/Reviewing/
 * Passed) with a click; Intro/Hired are driven by the intro + outcome flows.
 */

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, CircleDot, CircleDashed } from "lucide-react";
import { v1, V1Error, isLiveBackend, type PipelineBoard, type PipelineStage } from "@/lib/v1";

const STAGES: { key: PipelineStage; label: string; fg: string; settable: boolean }[] = [
  { key: "new", label: "New", fg: "var(--ink-3)", settable: true },
  { key: "reviewing", label: "Reviewing", fg: "var(--iris-ink)", settable: true },
  { key: "intro", label: "Intro", fg: "#047857", settable: false },
  { key: "hired", label: "Hired", fg: "#047857", settable: false },
  { key: "passed", label: "Passed", fg: "#B45309", settable: true },
];
const TIER: Record<string, { label: string; fg: string }> = {
  strong: { label: "Strong", fg: "#047857" },
  worth_a_look: { label: "Worth a look", fg: "var(--iris-ink)" },
  gaps: { label: "Gaps", fg: "#B45309" },
};
const SETTABLE: PipelineStage[] = ["new", "reviewing", "passed"];

const SAMPLE: PipelineBoard = {
  columns: {
    new: [{ candidate_id: "cand-2481", stage: "new", tier: "strong", supported: 4, emerging: 1, missing: 0, role_family: "backend" }],
    reviewing: [{ candidate_id: "cand-3390", stage: "reviewing", tier: "worth_a_look", supported: 3, emerging: 1, missing: 1, role_family: "backend" }],
    intro: [{ candidate_id: "cand-5127", stage: "intro", tier: "strong", supported: 4, emerging: 0, missing: 1, role_family: "backend" }],
    hired: [],
    passed: [{ candidate_id: "cand-6644", stage: "passed", tier: "gaps", supported: 1, emerging: 1, missing: 3, role_family: "backend" }],
  },
};

export function PipelineBoardView({ jobId }: { jobId: string }) {
  const live = isLiveBackend();
  const [board, setBoard] = useState<PipelineBoard | null>(live ? null : SAMPLE);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setBoard(await v1.jobPipeline(jobId));
      setError(null);
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Could not load the pipeline.");
    }
  }, [jobId]);

  useEffect(() => {
    if (live) void load();
  }, [live, load]);

  const move = async (candidateId: string, stage: PipelineStage) => {
    setBusy(candidateId);
    try {
      setBoard(await v1.moveCandidate(jobId, candidateId, stage));
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Could not move the candidate.");
    } finally {
      setBusy(null);
    }
  };

  if (!live && !board) return null;
  if (board === null) return <div className="glass h-64 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-[13.5px] font-semibold text-[#b91c1c]">{error}</p>}
      {!live && <p className="text-[12.5px] text-[var(--ink-3)]">Sample board — connect the backend to manage your real pipeline.</p>}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {STAGES.map((col) => {
          const cards = board.columns[col.key] ?? [];
          return (
            <section key={col.key} className="w-[260px] shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: col.fg }}>{col.label}</span>
                <span className="text-[12px] font-semibold text-[var(--ink-3)]">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {cards.map((c) => {
                  const t = TIER[c.tier] ?? TIER.gaps;
                  return (
                    <article key={c.candidate_id} className="glass rounded-[var(--r-card)] p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[12.5px] font-semibold text-[var(--ink-2)]">{c.candidate_id.slice(0, 10)}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "var(--mist)", color: t.fg }}>{t.label}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2.5 text-[11.5px] font-semibold">
                        <span className="inline-flex items-center gap-1" style={{ color: "#047857" }}><CircleCheck size={12} /> {c.supported}</span>
                        <span className="inline-flex items-center gap-1" style={{ color: "var(--iris-ink)" }}><CircleDot size={12} /> {c.emerging}</span>
                        <span className="inline-flex items-center gap-1 text-[var(--ink-3)]"><CircleDashed size={12} /> {c.missing}</span>
                      </div>
                      {col.settable && (
                        <select
                          value={c.stage}
                          disabled={busy === c.candidate_id || !live}
                          onChange={(e) => move(c.candidate_id, e.target.value as PipelineStage)}
                          className="mt-3 w-full cursor-pointer rounded-[var(--r-btn)] border px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-[var(--iris)] disabled:opacity-50"
                          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
                          aria-label="Move candidate"
                        >
                          {SETTABLE.map((s) => (
                            <option key={s} value={s}>Move to {STAGES.find((x) => x.key === s)!.label}</option>
                          ))}
                        </select>
                      )}
                    </article>
                  );
                })}
                {cards.length === 0 && <p className="rounded-[var(--r-card)] px-3 py-4 text-center text-[12px] text-[var(--ink-3)]" style={{ background: "var(--porcelain-2)" }}>—</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
