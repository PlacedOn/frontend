"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Inbox, MailX, Clock } from "lucide-react";

type Row = { role: string; company: string; ago: string; status: "rejected" | "silent" };

const ROWS: Row[] = [
  { role: "Backend Engineer", company: "Northwind", ago: "14d ago", status: "rejected" },
  { role: "Full-stack Developer", company: "Kite Labs", ago: "12d ago", status: "silent" },
  { role: "Platform Engineer", company: "Corewave", ago: "11d ago", status: "rejected" },
  { role: "Software Engineer II", company: "Halcyon", ago: "9d ago", status: "silent" },
  { role: "Data Engineer", company: "Brightloom", ago: "6d ago", status: "rejected" },
  { role: "API Engineer", company: "Nimbus", ago: "3d ago", status: "silent" },
];

const TABS = [
  { id: "all", label: "All", count: 148 },
  { id: "rejected", label: "Auto-rejected", count: 92 },
  { id: "silent", label: "No reply", count: 56 },
] as const;

const STATS = [
  { icon: Inbox, value: "148", label: "applications sent" },
  { icon: MailX, value: "92", label: "auto-rejected by ATS" },
  { icon: Clock, value: "0", label: "actually read by a human" },
];

export function ApplicationInbox() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const rows = ROWS.filter((r) => tab === "all" || r.status === tab);

  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-md">
          <span className="eyebrow">The invisible problem</span>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
            You&apos;re not unqualified.
            <br />
            You&apos;re <span className="grad-iris">unread</span>.
          </h2>
          <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
            The average opening draws hundreds of resumes. Software filters most out
            before a person ever looks. Great candidates vanish into a queue — not
            because they can&apos;t do the work, but because no one saw them do it.
          </p>
          <ul className="mt-7 flex flex-col gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.85rem]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  <Icon size={18} />
                </span>
                <p className="text-[var(--ink-2)]">
                  <span className="text-[1.35rem] font-bold text-[var(--ink)]">{value}</span>{" "}
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Inbox mockup */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 0.68, 0.31, 1] }}
          className="glass overflow-hidden rounded-[var(--r-card)]"
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--glass-line)" }}>
            <p className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--ink)]">
              Your application inbox
            </p>
            <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: "rgba(220,38,38,.1)", color: "#b91c1c" }}>
              0 / 148 read
            </span>
          </div>

          <div className="flex gap-1.5 px-4 pt-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={
                  tab === t.id
                    ? { background: "var(--iris)", color: "#fff" }
                    : { background: "rgba(255,255,255,.5)", color: "var(--ink-3)", border: "1px solid var(--glass-line)" }
                }
                aria-pressed={tab === t.id}
              >
                {t.label} {t.count}
              </button>
            ))}
          </div>

          <ul className="flex flex-col p-4">
            {rows.map((r) => (
              <li key={r.role} className="flex items-center gap-3 border-b py-3 last:border-b-0" style={{ borderColor: "var(--glass-line)" }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.7rem] text-[12px] font-bold text-[var(--ink-3)]" style={{ background: "var(--mist)" }}>
                  {r.company.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[var(--ink)]">{r.role}</p>
                  <p className="truncate text-[12.5px] text-[var(--ink-3)]">{r.company} · {r.ago}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                  style={
                    r.status === "rejected"
                      ? { background: "rgba(220,38,38,.1)", color: "#b91c1c" }
                      : { background: "var(--mist)", color: "var(--ink-3)" }
                  }
                >
                  {r.status === "rejected" ? "Auto-rejected" : "No reply"}
                </span>
              </li>
            ))}
            <li className="pt-3 text-center text-[12.5px] text-[var(--ink-3)]">
              + {148 - rows.length} more — into the void
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
