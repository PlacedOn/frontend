/**
 * Zod input schemas for Candidate Network mutations. Validated at the server
 * boundary before any write; messages are candidate-facing and specific.
 * Bounds mirror the CHECK constraints in 0013_candidate_network.sql so the DB
 * and the UI reject the same inputs with the same shape.
 */

import { z } from "zod";

export const ARTIFACT_KINDS = [
  "repo",
  "project",
  "writeup",
  "deployment",
  "credential",
  "other",
] as const;

/** Candidate-facing names for the kinds above — the raw enum values are storage
 *  vocabulary and must never be shown as-is. */
export const ARTIFACT_KIND_LABEL: Record<(typeof ARTIFACT_KINDS)[number], string> = {
  repo: "Repository",
  project: "Project",
  writeup: "Write-up",
  deployment: "Deployment",
  credential: "Credential",
  other: "Something else",
};

export const EVIDENCE_STRENGTHS = ["mentioned", "demonstrated", "verified"] as const;

const optionalUrl = z
  .string()
  .trim()
  .url("That doesn't look like a full link — include https://")
  .max(2000)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const addArtifactSchema = z.object({
  kind: z.enum(ARTIFACT_KINDS, { error: "Pick what kind of work this is." }),
  title: z
    .string()
    .trim()
    .min(1, "Give this a short title.")
    .max(200, "Titles top out at 200 characters."),
  url: optionalUrl,
  summary: z
    .string()
    .trim()
    .max(2000, "Keep the summary under 2000 characters.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type AddArtifactInput = z.infer<typeof addArtifactSchema>;

export const logProgressSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Say what you moved forward.")
    .max(2000, "Progress notes top out at 2000 characters."),
  artifact_id: z.string().uuid("That artifact reference isn't valid.").optional(),
});
export type LogProgressInput = z.infer<typeof logProgressSchema>;

export const linkEvidenceSchema = z.object({
  artifact_id: z.string().uuid("That artifact reference isn't valid."),
  skill_id: z.string().uuid("That skill reference isn't valid."),
  strength: z.enum(EVIDENCE_STRENGTHS).default("demonstrated"),
});
export type LinkEvidenceInput = z.infer<typeof linkEvidenceSchema>;
