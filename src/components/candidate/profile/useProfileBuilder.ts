"use client";

/*
 * State + autosave for the profile builder (Card A: claims + intent).
 * Live backend → v1.getProfile / debounced v1.putProfile.
 * Mock mode → MOCK_CANDIDATE_PROFILE, edits kept in local state only.
 * All updates are immutable; `completeness` is recomputed on save as
 * engagement momentum — never a score of the person.
 */

import { useCallback, useEffect, useState } from "react";
import { isLiveBackend, v1, type CandidateProfile, type ClaimedSkill } from "@/lib/v1";
import { MOCK_CANDIDATE_PROFILE } from "@/lib/mock/candidateProfile";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1100;

/**
 * Momentum = how much material the interview has to work with (0–100).
 * Deliberately framed as "evidence you can build", never a talent score.
 */
export function deriveMomentum(p: CandidateProfile): number {
  let pts = 0;
  if (p.display_name.trim()) pts += 6;
  if (p.headline.trim()) pts += 7;
  if (p.summary.trim()) pts += 7;
  if (p.target_roles.length > 0) pts += 10;
  if (p.work_types.length > 0) pts += 8;
  if (p.work_mode_pref.length > 0) pts += 4;
  if (p.locations_open_to.length > 0) pts += 4;
  if (p.comp_expectation?.trim()) pts += 4;
  pts += Math.min(p.claimed_skills.length, 4) * 5; // claims: up to 20
  pts += Math.min(p.claimed_skills.filter((s) => s.wants_to_verify).length, 3) * 4; // targets: up to 12
  pts += Math.min(p.highlights.length, 2) * 9; // interview seeds: up to 18
  return Math.min(100, pts);
}

export function verifyTargets(p: CandidateProfile): ClaimedSkill[] {
  return p.claimed_skills.filter((s) => s.wants_to_verify);
}

export function useProfileBuilder() {
  const live = isLiveBackend();
  const [profile, setProfile] = useState<CandidateProfile>(MOCK_CANDIDATE_PROFILE);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [fromBackend, setFromBackend] = useState(false);

  // Instant mock first render; upgrade to live backend data when configured.
  useEffect(() => {
    if (!live) return;
    let active = true;
    v1.getProfile()
      .then((p) => {
        if (active) {
          setProfile(p);
          setFromBackend(true);
        }
      })
      .catch(() => {
        /* backend unreachable — keep the mock so the builder still works */
      });
    return () => {
      active = false;
    };
  }, [live]);

  const update = useCallback((patch: Partial<CandidateProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    setSaveState("dirty");
  }, []);

  // Debounced autosave: every edit resets the timer; only "dirty" schedules one.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(async () => {
      const payload: CandidateProfile = { ...profile, completeness: deriveMomentum(profile) };
      if (!live || !fromBackend) {
        setProfile(payload);
        setSaveState("saved"); // mock mode: local state is the store
        return;
      }
      setSaveState("saving");
      try {
        const saved = await v1.putProfile(payload);
        setProfile(saved);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [profile, saveState, live, fromBackend]);

  return {
    profile,
    update,
    saveState,
    /** true once real backend data replaced the mock */
    fromBackend,
    momentum: deriveMomentum(profile),
    targets: verifyTargets(profile),
  };
}
