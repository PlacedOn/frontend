"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, X, Rocket } from "lucide-react";

const DISMISS_KEY = "placedon:onboarding:dismissed";

/**
 * First-run activation checklist — "get interview-ready" in a few clear steps,
 * each linking to where it's done, with a done/undone state. Goal-gradient nudge;
 * hides itself once every step is done or the candidate dismisses it.
 */
export function OnboardingChecklist({
  interviewDone,
  matchCount,
  visible,
}: {
  interviewDone: boolean;
  matchCount: number;
  visible: boolean;
}) {
  // Start hidden to avoid a flash before we've read the dismiss flag.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const steps = [
    { label: "Complete your interview", href: "/pre-interview", done: interviewDone },
    { label: "Review & approve your evidence", href: "/candidate/passport", done: interviewDone },
    { label: "Turn on employer visibility", href: "/candidate/preferences", done: visible },
    { label: "See the roles you match", href: "/candidate/matches", done: matchCount > 0 },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  if (dismissed || doneCount === steps.length) return null;

  return (
    <div className="glass rounded-[20px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[13px]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            <Rocket size={20} strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="eyebrow">Get interview-ready</p>
            <p className="mt-0.5 text-[15px] font-bold text-[var(--ink)]">{doneCount} of {steps.length} done — you&rsquo;re close.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
          aria-label="Dismiss checklist"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="group flex items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-[13.5px] font-semibold transition-colors hover:bg-white"
              style={{ borderColor: "var(--glass-line-hi)", color: s.done ? "var(--ink-3)" : "var(--ink-2)" }}
            >
              {s.done ? (
                <CheckCircle2 size={16} className="shrink-0 text-[#047857]" aria-hidden />
              ) : (
                <Circle size={15} className="shrink-0 text-[var(--ink-3)]" aria-hidden />
              )}
              <span className={`flex-1 ${s.done ? "line-through" : ""}`}>{s.label}</span>
              {!s.done && <ArrowRight size={14} className="shrink-0 text-[var(--ink-3)] transition-transform group-hover:translate-x-0.5" aria-hidden />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
