"use client";

import Link from "next/link";
import { ShieldCheck, Scale, ArrowRight } from "@/components/ui/icons";

export function FairnessFooter() {
  return (
    <section
      className="rounded-[var(--r-card)] p-6 md:p-7"
      style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)" }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--glass-hi)", color: "var(--iris-ink)" }}>
            <ShieldCheck size={18} animateOnView />
          </span>
          <div>
            <p className="text-[14px] font-bold text-[var(--ink)]">Fair, and easy to defend</p>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--ink-2)]">
              Every finding is an evidence band contestable back to the candidate&rsquo;s own words — there is no person-score, and
              the AI never decides. You see only the evidence they approved, never the raw transcript. Aligned with NYC Local
              Law 144 and the EU AI Act.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/trust/ll144" className="inline-flex items-center gap-1.5 rounded-[var(--r-btn)] bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]" style={{ boxShadow: "var(--shadow-sm)" }}>
            <Scale size={14} animateOnHover /> How we assess
          </Link>
          <Link href="/trust/contest" className="inline-flex items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2.5 text-[13px] font-bold" style={{ color: "var(--iris-ink)" }}>
            Contest a finding <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
