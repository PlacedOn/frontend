"use client";

import { ShieldCheck } from "lucide-react";
import { InterviewRoom } from "./InterviewRoom";

/**
 * Practice / mock interview — a no-stakes warm-up. Reuses the interview room in
 * demo mode (scripted, no persistence), wrapped in a persistent reassurance that
 * nothing is recorded, scored, or shared. Lowers anxiety before the real thing.
 */
export function PracticeRoom() {
  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-2 rounded-[var(--r-card)] border px-4 py-3 text-[13px] font-semibold"
        style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
      >
        <ShieldCheck size={15} aria-hidden />
        Practice mode — nothing here is recorded, scored, or shared. Refresh to start over.
      </div>
      <InterviewRoom />
    </div>
  );
}
