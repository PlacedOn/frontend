"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import type { CandidateProfile } from "@/lib/v1";
import type { SaveState } from "./useProfileBuilder";

type Props = {
  profile: CandidateProfile;
  momentum: number;
  saveState: SaveState;
  fromBackend: boolean;
};

function SaveChip({ saveState, fromBackend }: { saveState: SaveState; fromBackend: boolean }) {
  if (saveState === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Saving…
      </span>
    );
  }
  if (saveState === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
        <CloudOff className="h-3 w-3" aria-hidden /> Couldn&rsquo;t save — retrying on next edit
      </span>
    );
  }
  if (saveState === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: "var(--ok)", fontFamily: "var(--font-mono)" }}>
        <Check className="h-3 w-3" aria-hidden /> {fromBackend ? "Saved" : "Saved on this device"}
      </span>
    );
  }
  return (
    <span className="text-[11.5px] font-bold text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
      {saveState === "dirty" ? "Autosaving…" : "Autosaves as you type"}
    </span>
  );
}

/**
 * "Evidence you can build" — engagement momentum, deliberately not a score.
 * Measures how much material the interview has to work with.
 */
export function MomentumRail({ profile, momentum, saveState, fromBackend }: Props) {
  const reduce = useReducedMotion();

  const checklist: { id: string; label: string; done: boolean; detail: string }[] = [
    {
      id: "identity",
      label: "Say who you are",
      done: Boolean(profile.display_name.trim() && profile.headline.trim() && profile.summary.trim()),
      detail: "name, headline, summary",
    },
    {
      id: "intent",
      label: "Point the interview",
      done: profile.target_roles.length > 0 && profile.work_types.length > 0,
      detail: "roles + work types",
    },
    {
      id: "skills",
      label: "Stake your claims",
      done: profile.claimed_skills.length >= 3,
      detail: `${profile.claimed_skills.length} skill${profile.claimed_skills.length === 1 ? "" : "s"} claimed`,
    },
    {
      id: "highlights",
      label: "Seed the openers",
      done: profile.highlights.length >= 1,
      detail: `${profile.highlights.length}/2 stories`,
    },
  ];

  return (
    <section aria-label="Profile momentum" className="glass rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">Evidence you can build</p>
        <SaveChip saveState={saveState} fromBackend={fromBackend} />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <p className="text-[44px] font-extrabold leading-none tracking-tight text-[var(--ink)]">
          <CountUp to={momentum} duration={900} />
          <span className="text-[0.45em] font-bold text-[var(--ink-3)]">%</span>
        </p>
        <p className="pb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--iris-ink)]">momentum</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,var(--iris),var(--iris-soft))" }}
          initial={false}
          animate={{ width: `${momentum}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 0.68, 0.31, 1] }}
        />
      </div>

      <p className="mt-3 text-[12.5px] leading-5 text-[var(--ink-3)]">
        This measures how much your interview has to work with — engagement, never a score of you.
      </p>

      <ul className="mt-5 grid gap-2">
        {checklist.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors hover:bg-white"
              style={{ borderColor: "var(--glass-line-hi)", background: item.done ? "transparent" : "var(--glass)" }}
            >
              <span
                aria-hidden
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors"
                style={
                  item.done
                    ? { background: "var(--iris)", color: "#fff" }
                    : { border: "1.5px dashed var(--ink-3)", color: "transparent" }
                }
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-[var(--ink)]">{item.label}</span>
                <span className="block text-[11.5px] font-medium text-[var(--ink-3)]">{item.detail}</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-3)] opacity-0 transition-opacity group-hover:opacity-100">
                {item.done ? "Edit" : "Go"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
