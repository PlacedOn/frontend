"use client";

import { MessageSquareText, ScanSearch, Share2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

type Cell = {
  icon: LucideIcon;
  step: string;
  title: string;
  body: string;
  className: string;
};

const CELLS: Cell[] = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "Talk once",
    body: "A 30-minute adaptive interview that follows the candidate's reasoning instead of a fixed script. Voice or text.",
    className: "md:col-span-3 md:row-span-2",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "Signal extracted",
    body: "We surface the traits behind the answers — each one anchored to the exact moment it appeared.",
    className: "md:col-span-3",
  },
  {
    icon: Share2,
    step: "03",
    title: "Matched everywhere",
    body: "One profile, searchable in plain language across every role you're hiring for.",
    className: "md:col-span-3",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Auditable by design",
    body: "Every trait is explainable, contestable, and compliant with LL144 and the EU AI Act.",
    className: "md:col-span-6",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-2xl text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)]">
            One conversation shows more than a resume ever could.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {CELLS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 0.06} className={c.className}>
                <TiltCard className="h-full rounded-[var(--r-card)]">
                  <div className="glass flex h-full flex-col rounded-[var(--r-card)] p-6">
                    <div className="flex items-center justify-between">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl"
                        style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
                      >
                        <Icon size={20} />
                      </span>
                      <span
                        className="text-[13px] font-semibold text-[var(--ink-3)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {c.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[1.35rem]">{c.title}</h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                      {c.body}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
