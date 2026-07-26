"use client";

/**
 * Adaptive interview progress — a calm rail that explains the loop, not just a
 * counter. Completed questions are filled; the current one is live (a gentle
 * pulse on your turn, a scanning sweep while the AI reads your answer for
 * evidence); the rest wait dimmed. The point it makes: this interview adapts —
 * each question is chosen from what the AI still needs to learn.
 */

const VISUAL_TARGET = 8;

export function InterviewProgress({
  questionCount,
  awaiting,
  analyzing,
  reduce,
}: {
  questionCount: number;
  awaiting: boolean;
  analyzing: boolean;
  reduce: boolean;
}) {
  const total = Math.max(VISUAL_TARGET, questionCount);
  const currentIndex = Math.min(questionCount - 1, total - 1);

  const phase = analyzing ? "Reading your answer for evidence…" : awaiting ? "Your turn — take your time" : "Adapting to your answers…";

  return (
    <div className="flex flex-col gap-2" aria-label={`Question ${questionCount}, interview in progress`}>
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="text-[12.5px] font-semibold text-[var(--ink-2)]">
          {phase}
        </span>
        <span className="shrink-0 text-[11.5px] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Q{questionCount} · adaptive
        </span>
      </div>

      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={questionCount}
        aria-valuemin={1}
        aria-label="Interview progress"
      >
        {Array.from({ length: total }).map((_, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          const scanning = current && analyzing && !reduce;
          const pulsing = current && awaiting && !reduce;
          return (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${scanning ? "interview-scan" : ""} ${pulsing ? "animate-pulse" : ""}`}
              style={{
                background: scanning ? undefined : done || current ? "var(--iris)" : "var(--mist)",
                opacity: done ? 0.55 : 1,
              }}
            />
          );
        })}
      </div>

      <p className="text-[11.5px] leading-relaxed text-[var(--ink-3)]">
        Adaptive — the AI picks each question from what it still needs to learn, and stops early once it&rsquo;s confident.
      </p>
    </div>
  );
}
