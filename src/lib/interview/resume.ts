/**
 * "Pause & continue" — a lightweight, client-side marker of an interview the
 * candidate has started but not finished. Live interviews already persist their
 * turns server-side, so resuming is just re-opening the session; this marker is
 * what lets the app *offer* to resume (a banner on the home). Stored per device.
 */

export type InProgressInterview = {
  sessionId: string;
  role: string;
  startedAt: number;
};

const KEY = "placedon:interview:inprogress";

export function markInterviewInProgress(sessionId: string, role: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ sessionId, role, startedAt: Date.now() }));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function getInProgressInterview(): InProgressInterview | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<InProgressInterview>;
    if (v && typeof v.sessionId === "string" && v.sessionId) {
      return { sessionId: v.sessionId, role: typeof v.role === "string" ? v.role : "", startedAt: Number(v.startedAt) || Date.now() };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function clearInProgressInterview(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
