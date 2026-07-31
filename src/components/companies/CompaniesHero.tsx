"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

const ease = [0.22, 0.68, 0.31, 1] as const;

const MATCHES = [
  { name: "Aisha S.", role: "ML Engineer", match: "94%", reason: "structured debugging" },
  { name: "Rahul V.", role: "Backend", match: "91%", reason: "systems ownership" },
  { name: "Meera K.", role: "Platform", match: "88%", reason: "reliability under load" },
];

export function CompaniesHero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="relative flex min-h-[100svh] items-center pt-28 pb-16 md:pt-32">
      <div className="shell grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0 max-w-xl">
          <motion.span {...rise(0.05)} className="chip">
            <span className="livedot" /> For hiring teams
          </motion.span>

          <motion.h1 {...rise(0.14)} className="mt-6 text-[clamp(2.5rem,1.2rem+5vw,4.6rem)]">
            Hire on <span className="grad-iris">evidence</span>, not resumes.
          </motion.h1>

          <motion.p {...rise(0.24)} className="mt-6 text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-relaxed text-[var(--ink-2)]">
            Every candidate has already interviewed. You see clear, approved proof of
            how they actually work. Never a resume pile, never their raw transcript.
          </motion.p>

          <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-3">
            <AnimateIcon animateOnHover>
              <button
                onClick={() => open("employer")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold text-white transition-shadow"
                style={{ background: "linear-gradient(135deg, var(--iris-soft) 0%, var(--iris) 60%, var(--iris-ink) 130%)", boxShadow: "var(--shadow-iris)" }}
              >
                Book a demo
              </button>
            </AnimateIcon>
            <a
              href="/employer"
              className="inline-flex cursor-pointer items-center rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold text-[var(--ink)]"
              style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line-hi)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-sm)" }}
            >
              See the dashboard
            </a>
          </motion.div>

          <motion.p {...rise(0.44)} className="mt-6 flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
            Bias-audited &amp; contestable · LL144 and EU AI Act aligned.
          </motion.p>
        </div>

        {/* Proof strip — sample matched candidates */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="glass min-w-0 rounded-[var(--r-card)] p-5"
        >
          <p className="eyebrow mb-3">Matched to your roles · sample</p>
          <ul className="flex flex-col gap-2.5">
            {MATCHES.map((c) => (
              <li key={c.name} className="flex items-center gap-3 rounded-[1rem] p-3" style={{ background: "rgba(255,255,255,.55)", border: "1px solid var(--glass-line)" }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[var(--ink)]">{c.name} · {c.role}</p>
                  <p className="truncate text-[12.5px] text-[var(--ink-3)]">matched on: {c.reason}</p>
                </div>
                <span className="shrink-0 font-[var(--font-mono)] text-[14px] font-bold" style={{ color: "var(--iris-ink)" }}>
                  {c.match}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
