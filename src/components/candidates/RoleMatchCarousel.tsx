"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type Match = {
  role: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  match: number;
  reason: string;
};

const MATCHES: Match[] = [
  {
    role: "Senior Backend Engineer",
    company: "Corewave",
    location: "Remote · EU",
    salary: "€85k–110k",
    tags: ["Go", "Distributed systems"],
    match: 94,
    reason: "structured debugging, ownership under ambiguity",
  },
  {
    role: "Platform Engineer",
    company: "Northwind",
    location: "Remote · Global",
    salary: "$120k–150k",
    tags: ["Kubernetes", "Reliability"],
    match: 91,
    reason: "systems thinking, incident ownership",
  },
  {
    role: "Full-stack Engineer",
    company: "Brightloom",
    location: "Hybrid · Berlin",
    salary: "€70k–95k",
    tags: ["TypeScript", "React"],
    match: 88,
    reason: "clear communication, handling ambiguity",
  },
];

const ease = [0.22, 0.68, 0.31, 1] as const;

export function RoleMatchCarousel() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    setDir(n);
    setI((prev) => (prev + n + MATCHES.length) % MATCHES.length);
  };

  const m = MATCHES[i];

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Roles that fit your evidence</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Matched on proof, not keywords.</h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          Every match tells you <em>why</em> — the exact traits that make it fit. Sample roles shown.
        </p>
      </div>

      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[var(--iris-ghost)]"
          style={{ border: "1px solid var(--glass-line)", color: "var(--ink-2)" }}
          aria-label="Previous role"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative min-h-[290px] min-w-0 flex-1 sm:min-h-[250px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease }}
              className="glass rounded-[var(--r-card)] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="chip mb-3"><span className="livedot" /> Live sample</span>
                  <h3 className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--ink)]">{m.role}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-[var(--ink-3)]">
                    {m.company} <span aria-hidden>·</span> <MapPin size={13} /> {m.location}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[var(--font-mono)] text-[26px] font-bold leading-none" style={{ color: "var(--iris-ink)" }}>{m.match}%</p>
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">match</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-[var(--ink)]" style={{ background: "var(--mist)" }}>{m.salary}</span>
                {m.tags.map((t) => (
                  <span key={t} className="rounded-full px-3 py-1 text-[12.5px] font-medium text-[var(--ink-2)]" style={{ border: "1px solid var(--glass-line)" }}>{t}</span>
                ))}
              </div>

              <div className="mt-4 rounded-[0.9rem] p-3.5" style={{ background: "var(--iris-ghost)" }}>
                <p className="text-[13px] text-[var(--iris-ink)]">
                  <span className="font-semibold">Matched on:</span> {m.reason}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[var(--iris-ghost)]"
          style={{ border: "1px solid var(--glass-line)", color: "var(--ink-2)" }}
          aria-label="Next role"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {MATCHES.map((_, n) => (
          <button
            key={n}
            onClick={() => { setDir(n > i ? 1 : -1); setI(n); }}
            className="h-2 cursor-pointer rounded-full transition-all"
            style={{ width: n === i ? 24 : 8, background: n === i ? "var(--iris)" : "var(--glass-line)" }}
            aria-label={`Go to role ${n + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
