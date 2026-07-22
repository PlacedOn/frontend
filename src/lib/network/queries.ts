/**
 * Server-side reads for the Candidate Network dashboard (RSC only — imports the
 * cookie-bound server client). RLS scopes every result to the signed-in
 * candidate, so these return just the caller's own rows with no extra filter.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  Artifact,
  ProgressLog,
  CoverageSnapshot,
} from "@/lib/network/types";

export interface DashboardData {
  artifacts: Artifact[];
  progress: ProgressLog[];
  latestCoverage: CoverageSnapshot | null;
}

/** Everything the dashboard shell needs, fetched in parallel (no waterfall). */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [artifactsRes, progressRes, coverageRes] = await Promise.all([
    supabase.from("artifacts").select("*").order("created_at", { ascending: false }),
    supabase
      .from("progress_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("coverage_snapshots")
      .select("*")
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    artifacts: (artifactsRes.data as Artifact[] | null) ?? [],
    progress: (progressRes.data as ProgressLog[] | null) ?? [],
    latestCoverage: (coverageRes.data as CoverageSnapshot | null) ?? null,
  };
}
