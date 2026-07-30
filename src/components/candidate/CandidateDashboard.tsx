"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getCandidateSnapshot,
  loadCandidateDashboard,
  NEXT_ACTION,
  DASHBOARD_MODES,
  type CandidateDashboardMode,
  type IconKey,
} from "@/lib/mock/candidate";
import { JourneyStrip } from "@/components/candidate/profile/JourneyStrip";
import { ConnectedGreeting } from "@/components/candidate/ConnectedGreeting";

const EASE = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<IconKey, LucideIcon> = {
  message: MessageCircle,
  resume: RotateCcw,
  review: FileCheck2,
  matches: BriefcaseBusiness,
  intro: UserCheck,
  check: CheckCircle2,
  lock: Lock,
  eye: Eye,
};

const MODE_LABEL: Record<CandidateDashboardMode, string> = {
  new_candidate: "New",
  interview_in_progress: "Interviewing",
  profile_review_required: "Review",
  profile_live: "Live",
  intro_requested: "Intro",
};

type Tone = "purple" | "green" | "amber" | "ink";
const TONE: Record<Tone, { bg: string; fg: string; border: string }> = {
  purple: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)", border: "var(--iris-line)" },
  green: { bg: "rgba(16,185,129,0.12)", fg: "var(--ok)", border: "rgba(16,185,129,0.22)" },
  amber: { bg: "rgba(245,134,11,0.12)", fg: "var(--warn)", border: "rgba(245,134,11,0.25)" },
  ink: { bg: "var(--mist)", fg: "var(--ink-2)", border: "var(--glass-line-hi)" },
};

function Pill({ label, tone }: { label: string; tone: Tone }) {
  const t = TONE[tone];
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-bold"
      style={{ background: t.bg, color: t.fg, borderColor: t.border }}
    >
      {label}
    </span>
  );
}

export function CandidateDashboard({ mode }: { mode: CandidateDashboardMode }) {
  const reduce = useReducedMotion();
  // Instant mock first render; upgrade to live backend data if configured.
  const [snapshot, setSnapshot] = useState(() => getCandidateSnapshot(mode));
  const [live, setLive] = useState(false);
  useEffect(() => {
    let active = true;
    loadCandidateDashboard(mode).then((r) => {
      if (active) {
        setSnapshot(r.snapshot);
        setLive(r.live);
      }
    });
    return () => {
      active = false;
    };
  }, [mode]);

  const action = NEXT_ACTION[snapshot.mode];
  const NextIcon = ICONS[action.iconKey];

  const statusCards = [
    {
      label: "Interview",
      value:
        snapshot.interview.status === "complete"
          ? "Complete"
          : snapshot.interview.status === "in_progress"
            ? "In progress"
            : "Not started",
      detail: `${snapshot.interview.turnsCompleted}/${snapshot.interview.totalTurns} sections`,
      icon: CheckCircle2,
      tone: (snapshot.interview.status === "complete" ? "green" : "ink") as Tone,
    },
    {
      label: "Profile",
      value:
        snapshot.profile.status === "live"
          ? "Live"
          : snapshot.profile.status === "needs_review"
            ? "Needs review"
            : "Not ready",
      detail:
        snapshot.profile.traitsPending > 0
          ? `${snapshot.profile.traitsPending} traits need your check`
          : "All evidence reviewed",
      icon: FileCheck2,
      tone: (snapshot.profile.status === "live" ? "green" : snapshot.profile.status === "needs_review" ? "amber" : "ink") as Tone,
    },
    {
      label: "Visibility",
      value: snapshot.profile.employerVisible ? "Employer visible" : "Private",
      detail: "You control what companies see",
      icon: snapshot.profile.employerVisible ? Eye : Lock,
      tone: (snapshot.profile.employerVisible ? "green" : "ink") as Tone,
    },
  ];

  const reveal = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay, ease: EASE } };

  return (
    <div className="flex flex-col gap-6">
      {/* Warm, personal top — where your evidence stands today */}
      <ConnectedGreeting snapshot={snapshot} />

      {/* State preview switcher (mock) / live indicator (backend) */}
      {live ? (
        <div className="flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Preview state
          </span>
          {DASHBOARD_MODES.map((m) => (
            <Link
              key={m}
              href={`/candidate?mode=${m}`}
              aria-current={m === snapshot.mode}
              className="cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={
                m === snapshot.mode
                  ? { background: "var(--iris)", color: "#fff" }
                  : { background: "var(--glass)", color: "var(--ink-2)", border: "1px solid var(--glass-line-hi)" }
              }
            >
              {MODE_LABEL[m]}
            </Link>
          ))}
        </div>
      )}

      {/* Hero: next action + trust passport */}
      <motion.section
        {...reveal(0)}
        className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-9"
      >
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full" style={{ background: "var(--iris)", opacity: 0.14, filter: "blur(80px)" }} />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Pill label={action.eyebrow} tone="purple" />
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-3)]">
                <Clock3 className="h-4 w-4" /> Saved {snapshot.lastSaved}
              </span>
            </div>
            <h1 className="max-w-2xl text-[clamp(2rem,1.3rem+3vw,3.3rem)] font-extrabold leading-[1.04] tracking-tight text-[var(--ink)]">
              {action.title}
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-[var(--ink-2)] md:text-[17px]">
              {action.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={action.path}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
              >
                <NextIcon className="h-5 w-5" />
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-white"
                style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
              >
                Preview profile
              </Link>
            </div>
          </div>

          {/* Trust passport (dark) */}
          <div className="rounded-[1.5rem] p-5 text-white" style={{ background: "#13152e", boxShadow: "0 18px 60px rgba(17,20,33,0.22)" }}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">Trust passport</p>
                <h3 className="mt-1 text-[20px] font-bold" style={{ color: "#fff" }}>{snapshot.firstName}&rsquo;s profile</h3>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--iris)" }}>
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
            {/* Profile setup — how far along the profile is, framed as momentum,
                never a rating of the person (completeness = engagement, not score). */}
            <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
              <span>Profile setup</span>
              <span className="tabular-nums">{snapshot.profile.strength}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${snapshot.profile.strength}%` }}
                transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
                className="h-full rounded-full"
                style={{ background: "var(--iris-soft)" }}
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-white/45">How complete your profile is — not a rating of you.</p>

            {/* Real state only. The evidence itself lives in your report card and is
                never invented here — a dashboard must not fabricate a person's traits. */}
            <div className="mt-5 grid gap-2.5">
              <div className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
                <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold">
                  <FileCheck2 className="h-4 w-4 text-white/60" /> Evidence from your interview
                </span>
                <span
                  className="text-[11.5px] font-bold"
                  style={{ color: snapshot.profile.traitsPending > 0 ? "var(--signal-soft)" : "#6ee7b7" }}
                >
                  {snapshot.profile.traitsPending > 0 ? `${snapshot.profile.traitsPending} to review` : "All reviewed"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
                <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold">
                  {snapshot.profile.employerVisible ? <Eye className="h-4 w-4 text-white/60" /> : <Lock className="h-4 w-4 text-white/60" />}{" "}
                  Employer visibility
                </span>
                <span className="text-[11.5px] font-bold text-white/70">
                  {snapshot.profile.employerVisible ? "On" : "Private"}
                </span>
              </div>
            </div>
            <p className="mt-4 rounded-xl px-4 py-3 text-[12.5px] leading-5 text-white/65" style={{ background: "rgba(255,255,255,0.05)" }}>
              Employers cannot see this until you approve the evidence and visibility.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Status trio */}
      <div className="grid gap-4 lg:grid-cols-3">
        {statusCards.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              {...reveal(0.06 * (i + 1))}
              className="glass relative overflow-hidden rounded-[1.5rem] p-5 transition-transform duration-[var(--d-std)] hover:-translate-y-1"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${TONE[item.tone].fg}, transparent)` }} />
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--iris)]" style={{ boxShadow: "var(--shadow-sm)" }}>
                  <Icon className="h-5 w-5" />
                </span>
                <Pill label={item.value} tone={item.tone} />
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]">{item.label}</p>
              <p className="mt-1.5 text-[14.5px] font-semibold text-[var(--ink-2)]">{item.detail}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Profile → interview → report → fit bridge */}
      <JourneyStrip />

      {/* Matches + trust control */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section {...reveal(0.24)} className="glass rounded-[2rem] p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Matching roles</p>
              <h3 className="mt-1 text-[22px] font-bold text-[var(--ink)]">Roles for your review</h3>
            </div>
            <Link href="/candidate/matches" className="hidden cursor-pointer rounded-xl bg-white px-4 py-2 text-[13px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)] sm:inline-flex" style={{ boxShadow: "var(--shadow-sm)" }}>
              View all
            </Link>
          </div>
          {snapshot.matches.length === 0 ? (
            <div className="rounded-[1.25rem] p-6 text-center" style={{ background: "var(--mist)" }}>
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-[var(--iris-ink)]" />
              <p className="text-[14px] text-[var(--ink-2)]">Finish your interview and approve your profile to unlock matches.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {snapshot.matches.map((m) => (
                <Link
                  key={m.id}
                  href="/candidate/matches"
                  className="group rounded-[1.25rem] border p-4 transition-all hover:-translate-y-0.5 hover:bg-white"
                  style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[16px] font-bold text-[var(--ink)]">{m.role}</h4>
                        <Pill label={m.confidence === "high" ? "High signal" : "Medium signal"} tone={m.confidence === "high" ? "green" : "amber"} />
                      </div>
                      <p className="mt-1 text-[13.5px] font-semibold text-[var(--ink-3)]">{m.company}</p>
                      <p className="mt-2.5 text-[14px] leading-6 text-[var(--ink-2)]">{m.reason}</p>
                      {/* how strongly your evidence backs this role — form, not odds */}
                      <div className="mt-3 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
                        <div
                          className="h-full rounded-full"
                          style={
                            m.confidence === "high"
                              ? { width: "100%", background: "linear-gradient(90deg,#10b981,var(--ok))" }
                              : { width: "62%", background: "var(--warn)" }
                          }
                        />
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[var(--ink-3)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--iris)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section {...reveal(0.28)} className="rounded-[2rem] p-6" style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}>
          <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "var(--iris)", boxShadow: "var(--shadow-iris)" }}>
            <BadgeCheck className="h-5 w-5" />
          </span>
          <p className="eyebrow">Trust control</p>
          <h3 className="mt-2 text-[24px] font-bold leading-tight text-[var(--ink)]">Nothing is shared until you say yes.</h3>
          <p className="mt-4 text-[15px] leading-7 text-[var(--ink-2)]">
            Your dashboard keeps the next action visible because the product depends on candidate control: approve evidence, choose visibility, then unlock matches.
          </p>
          <Link
            href="/candidate/profile#evidence"
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-3 text-[14px] font-bold text-white transition-colors"
            style={{ background: "var(--ink)" }}
          >
            Manage visibility <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
