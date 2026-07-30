"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Mic,
  BriefcaseBusiness,
  Search,
  FileCheck2,
  Eye,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import type { CandidateSnapshot } from "@/lib/mock/candidate";

const EASE = [0.16, 1, 0.3, 1] as const;

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type Tone = "green" | "amber" | "iris" | "ink";
const TONE: Record<Tone, { fg: string; bg: string }> = {
  green: { fg: "var(--ok)", bg: "rgba(16,185,129,0.12)" },
  amber: { fg: "var(--warn)", bg: "rgba(245,134,11,0.12)" },
  iris: { fg: "var(--iris-ink)", bg: "var(--iris-ghost)" },
  ink: { fg: "var(--ink-2)", bg: "var(--mist)" },
};

/**
 * The warm, personal top of the candidate home — makes the product feel like it's
 * working *for* this person, not a cockpit of charts. Time-aware greeting (mount-
 * resolved so SSR and client agree) and a row of honest signals about their OWN
 * evidence and journey. No follower counts, no feed, no vanity — just where you
 * actually stand today.
 */
export function ConnectedGreeting({ snapshot }: { snapshot: CandidateSnapshot }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const greet = mounted ? greeting(new Date().getHours()) : "Welcome back";

  const s = snapshot;
  const interviewDone = s.interview.status === "complete";

  const signals: { icon: LucideIcon; label: string; tone: Tone }[] = [
    interviewDone
      ? { icon: CheckCircle2, label: "Interview complete", tone: "green" }
      : { icon: Mic, label: "Interview waiting for you", tone: "amber" },
    s.matches.length > 0
      ? { icon: BriefcaseBusiness, label: `${s.matches.length} role${s.matches.length === 1 ? "" : "s"} fit your evidence`, tone: "iris" }
      : { icon: Search, label: "Roles unlock once your profile is live", tone: "ink" },
    s.profile.traitsPending > 0
      ? { icon: FileCheck2, label: `${s.profile.traitsPending} to review`, tone: "amber" }
      : s.profile.employerVisible
        ? { icon: Eye, label: "Visible to employers", tone: "green" }
        : { icon: Lock, label: "Private — you choose when to share", tone: "ink" },
  ];

  return (
    <motion.section
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.25 : 0.5, ease: EASE }}
    >
      <h1 className="text-[clamp(1.6rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight text-[var(--ink)]">
        {greet}, {s.firstName}.
      </h1>
      <p className="mt-1 text-[15px] text-[var(--ink-2)]">Here&rsquo;s where your evidence stands today.</p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {signals.map((sig, i) => {
          const t = TONE[sig.tone];
          const Icon = sig.icon;
          return (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.2 : 0.4, delay: reduce ? 0 : 0.08 * (i + 1), ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold"
              style={{ background: t.bg, color: t.fg }}
            >
              <Icon size={15} aria-hidden /> {sig.label}
            </motion.span>
          );
        })}
      </div>
    </motion.section>
  );
}
