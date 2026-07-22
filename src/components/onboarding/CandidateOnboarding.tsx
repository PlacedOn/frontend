"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Server,
  MonitorSmartphone,
  Layers,
  Database,
  Smartphone,
  PenTool,
  Compass,
  ArrowRight,
  Mic,
  Clock3,
  Pause,
  Lock,
} from "lucide-react";
import { Facet } from "@/components/workshop/Facet";

type RoleFamily = {
  /** The string handed to the interview router as role_family. */
  value: string;
  label: string;
  hint: string;
  icon: typeof Server;
};

// Curated, India-first tech families. The list is deliberately short — Apple's
// simplicity rule: show the common paths, not an exhaustive taxonomy. The
// "not sure" path below is first-class, for a candidate who lacks the vocabulary.
const ROLE_FAMILIES: RoleFamily[] = [
  { value: "Backend Engineer", label: "Backend", hint: "APIs, databases, services", icon: Server },
  { value: "Frontend Engineer", label: "Frontend", hint: "Web UI, interfaces", icon: MonitorSmartphone },
  { value: "Full-stack Engineer", label: "Full-stack", hint: "Front to back", icon: Layers },
  { value: "Data & ML", label: "Data & ML", hint: "Pipelines, models, analysis", icon: Database },
  { value: "Mobile Engineer", label: "Mobile", hint: "iOS, Android, apps", icon: Smartphone },
  { value: "Product Design", label: "Design", hint: "UI / UX, product", icon: PenTool },
];

const NOT_SURE = "__not_sure__";

/** What the interview actually asks of a candidate — set expectations before,
 *  not after. Mirrors the /pre-interview facts and the Workshop empty state. */
const FACTS = [
  { icon: Clock3, label: "25–30 minutes" },
  { icon: Mic, label: "Voice or text" },
  { icon: Pause, label: "Pause anytime" },
  { icon: Lock, label: "Private until you approve" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The front door. The first authenticated screen a new candidate sees — before
 * any dashboard, before any evidence exists. Its only job is to make starting
 * feel safe and obvious: name where you're headed, then begin the conversation
 * that becomes your evidence.
 *
 * The empty Facet is the same object the Workshop is built around, shown empty
 * on purpose. It fills from real proof in the interview — never from a tap here.
 */
export function CandidateOnboarding({ firstName }: { firstName?: string }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [choice, setChoice] = useState<string | null>(null);

  function begin() {
    if (!choice) return;
    // The real consent gate accepts ?role=; "not sure" starts exploratory.
    const href =
      choice === NOT_SURE
        ? "/interview/consent"
        : `/interview/consent?role=${encodeURIComponent(choice)}`;
    router.push(href);
  }

  const reveal = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: EASE } };

  return (
    <div className="mx-auto grid w-full max-w-[var(--max)] items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
      {/* The object they'll build, shown empty. Given depth (glow + a floating
          lens) so it reads as a real object on a stage, not a faint outline.
          Compact hero at the top on mobile, full presence on the left on desktop.
          Breathes gently; never lights from a tap. */}
      <motion.div {...reveal(0)} className="flex flex-col items-center">
        <div className="relative grid scale-[0.68] place-items-center md:scale-100">
          {/* iris glow — the light the object catches */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[320px] w-[320px] rounded-full"
            style={{ background: "radial-gradient(circle, var(--iris-ghost), transparent 66%)", filter: "blur(44px)" }}
          />
          {/* floating lens the ring sits in — material depth, not a flat outline */}
          <div
            aria-hidden
            className="absolute h-[300px] w-[300px] rounded-full"
            style={{
              background: "radial-gradient(circle at 38% 30%, var(--glass-hi), var(--glass) 76%)",
              border: "1px solid var(--glass-line)",
              boxShadow: "var(--shadow-lg)",
              backdropFilter: "blur(var(--blur))",
            }}
          />
          <motion.div
            className="relative"
            animate={reduce ? undefined : { scale: [1, 1.015, 1], y: [0, -4, 0] }}
            transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Facet pct={0} size={244} facets={8} lit={0} showValue={false} />
          </motion.div>
        </div>
        <p className="mt-1 max-w-[26ch] text-center text-[13.5px] leading-relaxed text-[var(--ink-3)] md:mt-8">
          Your ring. <span className="font-semibold text-[var(--ink-2)]">Empty until your work fills it</span> — one
          verified facet at a time.
        </p>
      </motion.div>

      {/* Greeting, the seed, the way in. */}
      <div>
        <motion.p {...reveal(0.05)} className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--iris)]">
          Welcome to Placedon
        </motion.p>
        <motion.h1
          {...reveal(0.1)}
          className="mt-2 text-[clamp(1.7rem,1.3rem+1.8vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--ink)]"
        >
          {firstName ? `${firstName}, let’s start with ` : "Let’s start with "}
          what you&rsquo;ve actually done.
        </motion.h1>
        <motion.p {...reveal(0.15)} className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
          No resume, no forms. One honest conversation about your work becomes evidence only you
          control. First — where should we point it?
        </motion.p>

        {/* Role seed — single-select radiogroup. */}
        <motion.div
          {...reveal(0.2)}
          role="radiogroup"
          aria-label="What kind of work do you do?"
          className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        >
          {ROLE_FAMILIES.map((r) => {
            const selected = choice === r.value;
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setChoice(r.value)}
                className="group relative flex flex-col items-start gap-2 rounded-[16px] border p-3.5 text-left transition-transform duration-100 active:scale-[0.97]"
                style={{
                  background: selected ? "var(--iris-ghost)" : "var(--glass-hi)",
                  borderColor: selected ? "var(--iris)" : "var(--glass-line)",
                  boxShadow: selected ? "0 8px 22px -12px rgba(105,34,245,.5)" : "var(--shadow-sm)",
                }}
              >
                <span
                  className="grid size-9 place-items-center rounded-[11px] transition-colors"
                  style={{
                    background: selected ? "var(--iris)" : "var(--mist)",
                    color: selected ? "#fff" : "var(--iris-ink)",
                  }}
                >
                  <Icon size={17} aria-hidden />
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-[var(--ink)]">{r.label}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-tight text-[var(--ink-3)]">{r.hint}</span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* The empathetic path — first-class, for candidates without the vocabulary. */}
        <motion.button
          {...reveal(0.25)}
          type="button"
          role="radio"
          aria-checked={choice === NOT_SURE}
          onClick={() => setChoice(NOT_SURE)}
          className="mt-2.5 flex w-full items-center gap-3 rounded-[16px] border border-dashed p-3.5 text-left transition-transform duration-100 active:scale-[0.98]"
          style={{
            background: choice === NOT_SURE ? "var(--iris-ghost)" : "transparent",
            borderColor: choice === NOT_SURE ? "var(--iris)" : "var(--glass-line-hi)",
          }}
        >
          <span
            className="grid size-9 shrink-0 place-items-center rounded-[11px]"
            style={{
              background: choice === NOT_SURE ? "var(--iris)" : "var(--mist)",
              color: choice === NOT_SURE ? "#fff" : "var(--iris-ink)",
            }}
          >
            <Compass size={17} aria-hidden />
          </span>
          <span>
            <span className="block text-[14px] font-bold text-[var(--ink)]">Not sure — help me figure it out</span>
            <span className="mt-0.5 block text-[12px] leading-tight text-[var(--ink-3)]">
              We&rsquo;ll explore in the conversation and suggest what fits.
            </span>
          </span>
        </motion.button>

        {/* Expectations before, not after. */}
        <motion.ul {...reveal(0.3)} className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {FACTS.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.label} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink-3)]">
                <Icon size={13} aria-hidden className="text-[var(--iris-ink)]" /> {f.label}
              </li>
            );
          })}
        </motion.ul>

        {/* The way in — materializes once a choice is made (never lit prematurely). */}
        <motion.div
          initial={false}
          animate={{ opacity: choice ? 1 : 0.5, y: reduce ? 0 : choice ? 0 : 6 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={begin}
            disabled={!choice}
            className="inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            Start the conversation <ArrowRight size={16} aria-hidden />
          </button>
          <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">A conversation, not a test. You review everything before anyone sees it.</p>
        </motion.div>
      </div>
    </div>
  );
}
