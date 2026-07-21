"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { MessageSquareText, ScanSearch, Share2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

type Step = {
  icon: LucideIcon;
  step: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "Talk once",
    body: "A 30-minute chat that follows how the candidate thinks, not a fixed script. Voice or text, their choice.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "See the real strengths",
    body: "We pull out the strengths behind each answer, and show you the exact moment each one showed up.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Match to any role",
    body: "One profile you can search in plain English, across every role you're hiring for.",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Fair, and easy to defend",
    body: "Every score can be explained, questioned, and holds up under LL144 and the EU AI Act.",
  },
];

/**
 * Scrollytelling "how it works": a sticky rail on the left tracks the active
 * step as the cards advance on the right. Step tracking runs for everyone;
 * the card reveals are gated to no-preference motion.
 */
export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".hiw-card");
      if (!cards.length) return;

      // Active-step tracking (no animation — safe under reduced motion too).
      const triggers = cards.map((card, i) =>
        ScrollTrigger.create({
          trigger: card,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        }),
      );

      // Card reveals — motion only.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 52,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 86%" },
          });
        });
      });

      return () => {
        triggers.forEach((t) => t.kill());
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section id="how" className="relative py-20 md:py-28">
      <div
        ref={root}
        className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16"
      >
        {/* Sticky rail */}
        <div className="lg:sticky lg:top-[16vh] lg:self-start">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)]">
            One honest conversation tells you more than any resume.
          </h2>

          <ol className="relative mt-9 hidden lg:block">
            {STEPS.map((s, i) => {
              const on = i <= active;
              return (
                <li key={s.step} className="relative flex items-center gap-4 py-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-all duration-[var(--d-std)]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: on ? "var(--iris)" : "var(--mist)",
                      color: on ? "#fff" : "var(--ink-3)",
                      boxShadow: i === active ? "var(--shadow-iris)" : "none",
                    }}
                  >
                    {s.step}
                  </span>
                  <span
                    className="text-[15px] font-semibold transition-colors duration-[var(--d-std)]"
                    style={{ color: i === active ? "var(--ink)" : "var(--ink-3)" }}
                  >
                    {s.title}
                  </span>
                </li>
              );
            })}
            {/* progress rail behind the number chips */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-[17px] top-2 -z-10 w-px"
              style={{ height: "calc(100% - 1rem)", background: "var(--mist)" }}
            />
          </ol>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-5 md:gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <TiltCard key={s.step} className="hiw-card rounded-[var(--r-card)]">
                <div className="glass flex flex-col rounded-[var(--r-card)] p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl"
                      style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
                    >
                      <Icon size={19} />
                    </span>
                    <span
                      className="text-[13px] font-semibold text-[var(--ink-3)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[1.5rem]">{s.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">
                    {s.body}
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
