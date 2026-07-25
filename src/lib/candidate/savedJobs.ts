"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Saved / bookmarked jobs — a lightweight, per-device store (localStorage). No
 * backend: a candidate can bookmark roles to come back to, and filter the board
 * to just those. Owned by one component (JobBoard) and passed down, so a single
 * source of truth keeps the bookmark buttons and the "Saved" filter in sync.
 */
const KEY = "placedon:savedjobs";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage may be unavailable */
  }
}

export function useSavedJobs() {
  const [saved, setSaved] = useState<string[]>([]);

  // Hydrate after mount so SSR and first client render match (no mismatch).
  useEffect(() => {
    setSaved(read());
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}
