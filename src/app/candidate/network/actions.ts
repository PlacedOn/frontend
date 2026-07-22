"use server";

/**
 * Candidate Network mutations (Phase 1 — "evidence in").
 *
 * Writes go straight to Supabase; RLS (0013_candidate_network.sql) is the
 * authority — every policy is scoped to auth.uid() = candidate_id, so a caller
 * can only ever write their own rows. We still resolve the user here to fail
 * fast with a friendly message instead of surfacing a raw RLS rejection.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  addArtifactSchema,
  logProgressSchema,
  linkEvidenceSchema,
} from "@/lib/network/schema";
import type { Artifact, ProgressLog, EvidenceLink } from "@/lib/network/types";

export type ActionResult<T> = { data?: T; error?: string };

// Both candidate surfaces read these rows, so both must be revalidated — the
// Workshop shelf is built from the same artifacts table as the Network stream.
const AFFECTED_ROUTES = ["/candidate/network", "/candidate/workshop"] as const;

function revalidateCandidateSurfaces(): void {
  for (const route of AFFECTED_ROUTES) revalidatePath(route);
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the details and try again.";
}

/** Resolve the signed-in candidate's id, or a friendly error to bail on. */
async function requireCandidate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in to add to your profile." as const };
  }
  return { supabase, userId: user.id };
}

export async function addArtifact(
  input: unknown,
): Promise<ActionResult<Artifact>> {
  const parsed = addArtifactSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const auth = await requireCandidate();
  if ("error" in auth) return { error: auth.error };
  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("artifacts")
    .insert({
      candidate_id: userId,
      kind: parsed.data.kind,
      title: parsed.data.title,
      url: parsed.data.url ?? null,
      summary: parsed.data.summary ?? null,
      source: "manual",
    })
    .select()
    .single();

  if (error || !data) {
    return { error: "We couldn't save that just now. Please try again in a moment." };
  }

  revalidateCandidateSurfaces();
  return { data: data as Artifact };
}

export async function logProgress(
  input: unknown,
): Promise<ActionResult<ProgressLog>> {
  const parsed = logProgressSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const auth = await requireCandidate();
  if ("error" in auth) return { error: auth.error };
  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("progress_logs")
    .insert({
      candidate_id: userId,
      body: parsed.data.body,
      artifact_id: parsed.data.artifact_id ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: "We couldn't post that update. Please try again in a moment." };
  }

  revalidateCandidateSurfaces();
  return { data: data as ProgressLog };
}

/**
 * Map an artifact to a competency. The RLS with_check calls owns_artifact(), so
 * linking evidence to an artifact you don't own is rejected at the database.
 */
export async function linkEvidence(
  input: unknown,
): Promise<ActionResult<EvidenceLink>> {
  const parsed = linkEvidenceSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const auth = await requireCandidate();
  if ("error" in auth) return { error: auth.error };
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("evidence_links")
    .upsert(
      {
        artifact_id: parsed.data.artifact_id,
        skill_id: parsed.data.skill_id,
        strength: parsed.data.strength,
      },
      { onConflict: "artifact_id,skill_id" },
    )
    .select()
    .single();

  if (error || !data) {
    return { error: "We couldn't link that evidence. Please try again in a moment." };
  }

  revalidateCandidateSurfaces();
  return { data: data as EvidenceLink };
}
