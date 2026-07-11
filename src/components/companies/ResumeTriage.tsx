"use client";

import { motion, useReducedMotion } from "motion/react";
import { FileText, Timer, Dices } from "lucide-react";

type Pile = { title: string; sub: string; fate: "reject" | "maybe" | "buried" };

const PILE: Pile[] = [
  { title: "312 applications", sub: "one open role", fate: "buried" },
  { title: "~20 seconds", sub: "average resume scan", fate: "maybe" },
  { title: "Keyword-first", sub: "filters before humans", fate: "reject" },
  { title: "Great people", sub: "screened out on format", fate: "reject" },
  { title: "The one you want", sub: "somewhere in the pile", fate: "buried" },
];

const STATS = [
  { icon: FileText, value: "300+", label: "resumes per role" },
  { icon: Timer, value: "20s", label: "each gets, at best" },
  { icon: Dices, value: "1", label: "hire — mostly on a guess" },
];

const FATE: Record<Pile["fate"], { bg: string; color: string; label: string }> = {
  reject: { bg: "rgba(220,38,38,.1)", color: "#b91c1c", label: "Filtered" },
  maybe: { bg: "var(--mist)", color: "var(--ink-3)", label: "Skimmed" },
  buried: { bg: "var(--iris-ghost)", color: "var(--iris-ink)", label: "Buried" },
};

export function ResumeTriage() {
  const reduce = useReducedMotion();

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-md">
          <span className="eyebrow">The triage problem</span>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
            You&apos;re hiring from a <span className="grad-iris">guess</span>.
          </h2>
          <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
            A resume only tells you what someone claims, in a format a filter can reject
            before anyone reads it. So the person you hire is often the one who wrote the
            best document, not the one who does the best work.
          </p>
          <ul className="mt-7 flex flex-col gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.85rem]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  <Icon size={18} />
                </span>
                <p className="text-[var(--ink-2)]">
                  <span className="text-[1.35rem] font-bold text-[var(--ink)]">{value}</span> {label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Resume pile mockup */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 0.68, 0.31, 1] }}
          className="glass overflow-hidden rounded-[var(--r-card)]"
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--glass-line)" }}>
            <p className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--ink)]">Your resume pile</p>
            <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "rgba(220,38,38,.1)", color: "#b91c1c" }}>
              312 · unread
            </span>
          </div>
          <ul className="flex flex-col p-4">
            {PILE.map((r) => {
              const f = FATE[r.fate];
              return (
                <li key={r.title} className="flex items-center gap-3 border-b py-3 last:border-b-0" style={{ borderColor: "var(--glass-line)" }}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.7rem]" style={{ background: "var(--mist)", color: "var(--ink-3)" }}>
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[var(--ink)]">{r.title}</p>
                    <p className="truncate text-[12.5px] text-[var(--ink-3)]">{r.sub}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: f.bg, color: f.color }}>
                    {f.label}
                  </span>
                </li>
              );
            })}
            <li className="pt-3 text-center text-[12.5px] text-[var(--ink-3)]">
              + 307 more you&apos;ll never open
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
