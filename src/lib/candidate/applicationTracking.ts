"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Application, AppStageId } from "@/lib/mock/applications";

/**
 * Personal stage tracking for the applications pipeline — a lightweight,
 * per-device overlay (localStorage). The base list comes from the backend/mock
 * adapter; this lets a candidate move a card between stages (Saved → Applied →
 * Interview → Offer) and have that stick across reloads, without a backend.
 *
 * Deliberately an *overlay*, not a copy: we store only the moved stage keyed by
 * application id, then merge it over the base data at read time. Counts are
 * derived from the merged list, so the columns can never disagree with the cards.
 */
const KEY = "placedon:appstages";

/** The pipeline, in order. Moving forward/back walks this list. */
export const STAGE_ORDER: AppStageId[] = ["saved", "applied", "interview", "offer"];

export const STAGE_LABEL: Record<AppStageId, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
};

type Overrides = Record<string, AppStageId>;

function read(): Overrides {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    if (!v || typeof v !== "object") return {};
    // Keep only entries that map to a known stage — defends against stale/garbage data.
    return Object.fromEntries(
      Object.entries(v).filter(
        ([, stage]) => typeof stage === "string" && STAGE_ORDER.includes(stage as AppStageId),
      ),
    ) as Overrides;
  } catch {
    return {};
  }
}

function write(overrides: Overrides): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(overrides));
  } catch {
    /* storage may be unavailable (private mode, quota) — tracking is best-effort */
  }
}

/** Apply the overlay to the base list, immutably. */
function mergeStages(base: Application[], overrides: Overrides): Application[] {
  return base.map((a) => {
    const override = overrides[a.id];
    return override && override !== a.stage ? { ...a, stage: override } : a;
  });
}

/** Derive per-stage counts from the merged list — the single source of truth. */
export function countByStage(apps: Application[]): Record<AppStageId, number> {
  const counts: Record<AppStageId, number> = { saved: 0, applied: 0, interview: 0, offer: 0 };
  for (const a of apps) counts[a.stage] += 1;
  return counts;
}

export function stageIndex(stage: AppStageId): number {
  return STAGE_ORDER.indexOf(stage);
}

/**
 * Hook: merge the base applications with the candidate's personal stage overlay
 * and expose a `moveTo` that persists. Base data stays authoritative for
 * everything except which column a card sits in.
 */
export function useApplicationStages(base: Application[]) {
  const [overrides, setOverrides] = useState<Overrides>({});

  // Hydrate after mount so SSR and first client render match.
  useEffect(() => {
    setOverrides(read());
  }, []);

  const applications = useMemo(() => mergeStages(base, overrides), [base, overrides]);
  const counts = useMemo(() => countByStage(applications), [applications]);

  const moveTo = useCallback((id: string, stage: AppStageId) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: stage };
      write(next);
      return next;
    });
  }, []);

  return { applications, counts, moveTo };
}
