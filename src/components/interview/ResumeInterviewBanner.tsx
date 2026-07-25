"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, X } from "lucide-react";
import { getInProgressInterview, clearInProgressInterview, type InProgressInterview } from "@/lib/interview/resume";

/**
 * "Pick up where you left off" — shows when the candidate has an interview in
 * progress (marked at consent, cleared on dismiss). Resuming re-opens the saved
 * session; for a live interview the backend resends the current question.
 */
export function ResumeInterviewBanner() {
  const [item, setItem] = useState<InProgressInterview | null>(null);

  useEffect(() => {
    setItem(getInProgressInterview());
  }, []);

  if (!item) return null;
  const roleLabel = item.role ? item.role.replace(/_/g, " ") : "your interview";

  return (
    <div className="glass flex flex-col gap-3 rounded-[20px] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[13px]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          <PlayCircle size={22} strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-[15px] font-bold text-[var(--ink)]">Pick up where you left off</p>
          <p className="text-[13px] text-[var(--ink-2)]">You have an interview in progress for {roleLabel}. Your answers are saved.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/interview?session=${encodeURIComponent(item.sessionId)}`}
          className="inline-flex items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          Resume <PlayCircle size={15} />
        </Link>
        <button
          type="button"
          onClick={() => {
            clearInProgressInterview();
            setItem(null);
          }}
          aria-label="Dismiss — I'll start fresh"
          className="grid size-9 shrink-0 place-items-center rounded-[var(--r-btn)] border text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          style={{ borderColor: "var(--glass-line-hi)" }}
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
