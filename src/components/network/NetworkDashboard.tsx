"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import {
  v1,
  V1Error,
  isLiveBackend,
  type GrowthReport,
  type RoleGap,
  type ImportGithubSummary,
} from "@/lib/v1";
import type { DashboardData } from "@/lib/network/queries";
import type { Artifact, ProgressLog } from "@/lib/network/types";
import { MOCK_GROWTH_REPORT } from "@/lib/mock/growthReport";
import { SignalPanel } from "./SignalPanel";
import { OpenLoops } from "./OpenLoops";
import { ImportGithub } from "./ImportGithub";
import { ProofStream } from "./ProofStream";
import { CircleTeaser, MomentumTeaser } from "./Teasers";

/**
 * The candidate's proof-of-work home. Opens on state: the Signal ring (readiness
 * coverage, reused from the growth engine), the open loops still to close, the
 * work they've shipped, and the way in — importing real work from GitHub. The
 * composition is the product; the coverage math is reused, never re-invented.
 *
 * The one motion peak lives here: an import lands repos in the stream, then the
 * ring reacts (§ Fable plan) — we capture coverage before the import so we can
 * say, in-voice, exactly how far it moved.
 */
// Preview data so the screen is legible before the backend is wired — mirrors
// GrowthReportView's MOCK fallback. Never shown when the live backend answers.
const SAMPLE_ARTIFACTS: Artifact[] = [
  { id: "s1", candidate_id: "preview", kind: "repo", title: "idempotency-keys", url: "https://github.com", source: "github", summary: "Dedupe layer that killed duplicate charges on the payment retry path.", verified_at: "2026-07-20T10:00:00Z", created_at: "2026-07-20T10:00:00Z" },
  { id: "s2", candidate_id: "preview", kind: "repo", title: "events-schema", url: "https://github.com", source: "github", summary: "Normalised the events table with a composite (org_id, created_at) index.", verified_at: "2026-07-18T10:00:00Z", created_at: "2026-07-18T10:00:00Z" },
];
const SAMPLE_PROGRESS: ProgressLog[] = [
  { id: "p1", candidate_id: "preview", body: "Drafted the first SLO doc for the payments service — error-budget policy is next.", artifact_id: null, created_at: "2026-07-21T09:00:00Z" },
];

export function NetworkDashboard({ initial }: { initial: DashboardData }) {
  const live = isLiveBackend();
  const router = useRouter();
  const [report, setReport] = useState<GrowthReport | null>(live ? null : MOCK_GROWTH_REPORT);
  const [reportError, setReportError] = useState<string | null>(null);
  const [ringPulse, setRingPulse] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const pending = useRef<{ count: number; from: number } | null>(null);

  const loadReport = useCallback(() => {
    if (!live) return;
    v1.growthReport()
      .then((r) => {
        setReport(r);
        setReportError(null);
      })
      .catch((e: unknown) =>
        setReportError(e instanceof V1Error ? e.message : "Couldn't load your readiness."),
      );
  }, [live]);

  useEffect(loadReport, [loadReport]);

  const topFit = report?.role_fits[0] ?? null;
  const coverage = topFit?.readiness_pct ?? Math.round(initial.latestCoverage?.coverage ?? 0);

  // Open loops = the nearest unmet requirements, most severe first. Prefer the
  // cross-role top gaps (richer) and fall back to the top role's own gaps.
  const openLoops: RoleGap[] = useMemo(() => {
    const gaps = report?.gaps?.length ? report.gaps : (topFit?.gaps ?? []);
    const order = { critical: 0, important: 1, nice_to_have: 2 } as const;
    return [...gaps].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 3);
  }, [report, topFit]);

  // In preview (no live backend), seed the stream so the timeline is legible.
  const preview = !live;
  const artifacts = preview && initial.artifacts.length === 0 ? SAMPLE_ARTIFACTS : initial.artifacts;
  const progress = preview && initial.progress.length === 0 ? SAMPLE_PROGRESS : initial.progress;

  // When coverage changes after an import, say — in a human voice — how far it moved.
  useEffect(() => {
    const p = pending.current;
    if (p && coverage !== p.from) {
      const repos = `${p.count} ${p.count === 1 ? "repo" : "repos"}`;
      setFlash(`${repos} just became evidence. Your coverage moved from ${p.from}% to ${coverage}%.`);
      pending.current = null;
    }
  }, [coverage]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 8000);
    return () => clearTimeout(t);
  }, [flash]);

  const onImported = useCallback(
    (summary: ImportGithubSummary) => {
      if (summary.imported > 0) pending.current = { count: summary.imported, from: coverage };
      router.refresh(); // reload the candidate's shipped work (RSC)
      loadReport(); // recompute the ring
      setRingPulse((n) => n + 1);
    },
    [coverage, router, loadReport],
  );

  const hasWork = artifacts.length > 0 || progress.length > 0;

  return (
    <div className="space-y-6 md:space-y-7">
      {/* ── Ring + the loops that explain it — one row, causally linked ──── */}
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-stretch">
        <Reveal className="flex">
          <SignalPanel
            coverage={coverage}
            roleTitle={topFit?.role_title ?? null}
            fitBand={topFit?.fit_band ?? null}
            hasWork={hasWork}
            pulseKey={ringPulse}
            flash={flash}
            preview={preview}
            loading={live && !report && !reportError}
          />
        </Reveal>
        <Reveal delay={0.08} className="flex">
          <OpenLoops loops={openLoops} roleTitle={topFit?.role_title ?? null} live={live} error={reportError} />
        </Reveal>
      </div>

      {/* ── The way in: bring real work across ──────────────────────────── */}
      <Reveal delay={0.04}>
        <ImportGithub live={live} onImported={onImported} />
      </Reveal>

      {/* ── Proof stream: the work itself, newest first ─────────────────── */}
      <Reveal delay={0.05}>
        <ProofStream
          artifacts={artifacts}
          progress={progress}
          hasWork={hasWork}
          onPosted={() => router.refresh()}
        />
      </Reveal>

      {/* ── The people layer + the parting high-note (peak-end, last) ───── */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal delay={0.04} className="flex">
          <CircleTeaser roleFamily={topFit?.role_family ?? null} />
        </Reveal>
        <Reveal delay={0.08} className="flex">
          <MomentumTeaser artifactCount={artifacts.length} coverage={coverage} />
        </Reveal>
      </div>
    </div>
  );
}
