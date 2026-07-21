"use client";

/**
 * Connect accounts — the hinge. Two groups with a firewall grammar you can read
 * from ten feet away:
 *   • Work platforms (GitHub…) → iris border + "becomes evidence" → get verified.
 *   • Social links → neutral ink + "shown on your profile" → just links.
 * Connecting a work platform plays the cross-firewall moment: the ghost button
 * springs into a verified chip with a single iris pulse (never looping).
 * Craft (Emil): :active scale(0.97), spring on connect, transitions not keyframes.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ShieldCheck, Link2, Plus } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function GithubMark({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "LinkedIn", placeholder: "linkedin.com/in/…" },
  { label: "Portfolio", placeholder: "your-portfolio.com" },
  { label: "Personal site", placeholder: "you.dev" },
];

export function ConnectAccounts() {
  const reduce = useReducedMotion();
  const [ghConnected, setGhConnected] = useState(false);

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {/* Work platforms → evidence */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--iris-ink)" }}>
          Work you can prove
        </p>
        <p className="mt-1 text-[13px] text-[var(--ink-3)]">
          Connect what you built. <span className="font-semibold text-[var(--iris-ink)]">&rarr; becomes evidence.</span>
        </p>

        <div className="relative mt-4">
          <AnimatePresence mode="wait" initial={false}>
            {!ghConnected ? (
              <motion.button
                key="connect"
                type="button"
                onClick={() => setGhConnected(true)}
                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-transform duration-150 active:scale-[0.98]"
                style={{ background: "var(--glass)", border: "1px solid var(--iris-line)" }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "#1a1e2e" }}>
                  <GithubMark size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[14.5px] font-bold text-[var(--ink)]">Connect GitHub</span>
                  <span className="block text-[12px] text-[var(--ink-3)]">Your code becomes verifiable evidence</span>
                </span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>Connect</span>
              </motion.button>
            ) : (
              <motion.div
                key="connected"
                className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 22 }}
              >
                {/* single iris pulse — fires once, never loops */}
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 h-9 w-9 -translate-y-1/2 rounded-xl"
                    style={{ border: "2px solid var(--iris)" }}
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                  />
                )}
                <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--iris)" }}>
                  <ShieldCheck size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[14.5px] font-bold text-[var(--ink)]">GitHub connected</span>
                  <span className="block text-[12px]" style={{ color: "var(--iris-ink)" }}>Feeding your evidence below &darr;</span>
                </span>
                <button type="button" onClick={() => setGhConnected(false)} className="text-[12px] text-[var(--ink-3)] underline underline-offset-2">
                  undo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Social links → presentation only */}
      <div className="border-t pt-8 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0" style={{ borderColor: "var(--glass-line)" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Where to find you
        </p>
        <p className="mt-1 text-[13px] text-[var(--ink-3)]">
          Links to your world. <span className="text-[var(--ink-3)]">&rarr; shown on your profile.</span>
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {SOCIALS.map((s) => (
            <label key={s.label} className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5" style={{ background: "var(--glass)", border: "1px solid var(--glass-line-hi)" }}>
              <Link2 size={15} className="text-[var(--ink-3)]" />
              <span className="w-[74px] shrink-0 text-[13px] font-semibold text-[var(--ink-2)]">{s.label}</span>
              <input
                placeholder={s.placeholder}
                className="w-full bg-transparent text-[13.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
              />
            </label>
          ))}
          <button type="button" className="mt-1 inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink-2)]">
            <Plus size={13} /> Add another link
          </button>
        </div>
      </div>
    </div>
  );
}
