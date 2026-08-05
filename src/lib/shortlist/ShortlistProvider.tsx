"use client";

/**
 * The shortlist — one list, shared by the directory and the pipeline.
 *
 * ══ WHY A CONTEXT AND NOT A URL PARAM ══
 * Everything else about the directory's state went into the query string this
 * phase, and this deliberately did not. A shortlist is not a description of a
 * query, it is a record of decisions a particular recruiter made. Putting it in
 * a shareable URL would mean forwarding a link also forwards "these are the
 * ones I like", which is a different act from sharing a search and one nobody
 * asked for. Filters describe the job; the shortlist describes the recruiter.
 *
 * ══ WHY SESSION STORAGE AND NOT LOCAL STORAGE ══
 * There is no backend for this (measured 2026-08-01: zero interview sessions
 * exist, so there is nothing to persist server-side yet). `sessionStorage`
 * survives the reload between /dev/directory and /dev/pipeline, which is the
 * only continuity this needs, and it dies with the tab — so a shared machine
 * does not hand the next person a list of records someone else committed to.
 * When the real pipeline endpoint lands, this provider is the seam: the shape
 * of `useShortlist()` stays, the storage behind it changes.
 *
 * ══ HYDRATION ══
 * The first render is ALWAYS the empty list, on both server and client, and
 * storage is read in an effect afterwards. Reading storage during the initial
 * render would make the client's first tree disagree with the server's and
 * React would either warn or silently discard the difference. The cost is one
 * frame where the pipeline looks empty; the alternative is a class of bug that
 * only appears in production builds.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "placedon.dev.shortlist";

export interface ShortlistValue {
  /** Candidate ids the recruiter has committed to, in the order they added them. */
  ids: readonly string[];
  isShortlisted: (id: string) => boolean;
  /** Add if absent, remove if present. The card's button. */
  toggle: (id: string) => void;
  /** Remove unconditionally. The pipeline's un-shortlist action. */
  remove: (id: string) => void;
  clear: () => void;
  /**
   * False until the effect has read storage. The pipeline uses this to avoid
   * flashing its empty state at someone whose list is about to load.
   */
  hydrated: boolean;
}

const ShortlistContext = createContext<ShortlistValue | null>(null);

function readStored(): readonly string[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Never trust what came out of storage — another tab, an older build, or a
    // hand-edited devtools value all land here, and a non-array would take the
    // whole surface down on the first `.includes`.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    // Private-mode Safari throws on sessionStorage access. An unavailable
    // shortlist is a degraded session, not a broken page.
    return [];
  }
}

function writeStored(ids: readonly string[]): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Same reasoning. The in-memory list still works for this page view.
  }
}

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<readonly string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Do not overwrite storage with the pre-read empty list.
    writeStored(ids);
  }, [ids, hydrated]);

  const toggle = useCallback((id: string) => {
    setIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setIds((current) => current.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<ShortlistValue>(
    () => ({
      ids,
      isShortlisted: (id: string) => ids.includes(id),
      toggle,
      remove,
      clear,
      hydrated,
    }),
    [ids, toggle, remove, clear, hydrated],
  );

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist(): ShortlistValue {
  const value = useContext(ShortlistContext);
  if (!value) {
    // Loud, not a silent empty list. A surface that renders shortlist controls
    // outside the provider would appear to work and then lose every click.
    throw new Error("useShortlist must be used inside <ShortlistProvider>.");
  }
  return value;
}
