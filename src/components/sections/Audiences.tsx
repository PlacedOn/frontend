"use client";

import Link from "next/link";
import { AnimateIcon, Check, ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SectionAurora } from "@/components/background/SectionAurora";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

type Panel = {
  id: string;
  eyebrow: string;
  title: string;
  points: string[];
  cta: string;
  action: "demo" | "interview";
};

const PANELS: Panel[] = [
  {
    id: "teams",
    eyebrow: "For teams",
    title: "Search people the way you actually think about them.",
    points: [
      "Just ask in plain English: “someone who stays calm in chaos and still ships.”",
      "Tap any match to see the exact moment that earned it.",
      "Shortlist, compare, and make intros without opening a single resume.",
    ],
    cta: "Book a demo",
    action: "demo",
  },
  {
    id: "candidates",
    eyebrow: "For candidates",
    title: "One conversation that speaks for you everywhere.",
    points: [
      "No timer, no trick questions, no score staring back at you.",
      "See every trait we find, and challenge any of it. You stay in control.",
      "Your dashboard always shows one clear next step, from interview to intro.",
    ],
    cta: "Take an interview",
    action: "interview",
  },
];

export function Audiences() {
  const { open } = useDemoDialog();
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <SectionAurora />
      <div className="shell relative z-[1] grid gap-4 lg:grid-cols-2">
        {PANELS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <article
              id={p.id}
              className="glass flex h-full flex-col rounded-[var(--r-card)] p-8 md:p-10"
            >
              <p className="eyebrow">{p.eyebrow}</p>
              <h3 className="mt-3 text-[clamp(1.55rem,1.1rem+1.6vw,2.2rem)]">{p.title}</h3>
              <ul className="mt-6 flex flex-col gap-3.5">
                {p.points.map((pt, idx) => (
                  <li key={pt} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                      style={{ background: "var(--iris)", color: "#fff" }}
                    >
                      <Check size={13} strokeWidth={3} animateOnView delay={idx * 110} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-[var(--ink-2)]">{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                {p.action === "demo" ? (
                  <>
                    <Button onClick={() => open("employer")} variant="primary">
                      {p.cta}
                    </Button>
                    <AnimateIcon animateOnHover>
                      <Link
                        href="/employer"
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--iris-ink)" }}
                      >
                        See the hiring view <ArrowRight size={15} />
                      </Link>
                    </AnimateIcon>
                  </>
                ) : (
                  <>
                    <Button href="/pre-interview" variant="primary">
                      {p.cta}
                    </Button>
                    <AnimateIcon animateOnHover>
                      <Link
                        href="/candidate"
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--iris-ink)" }}
                      >
                        Open your dashboard <ArrowRight size={15} />
                      </Link>
                    </AnimateIcon>
                  </>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
