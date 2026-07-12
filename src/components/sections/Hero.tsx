"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { gsap } from "@/lib/motion/gsap";
import { InterviewDemo } from "./InterviewDemo";

const ease = [0.22, 0.68, 0.31, 1] as const;

/** Giant kinetic words that sweep through during the scrubbed hero scene. */
const CAPTIONS = ["Listen.", "Understand.", "Score the signal."];

export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, delay, ease },
  });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // The pitch copy recedes and blurs as the scene takes over.
        tl.to(copy.current, { yPercent: -14, autoAlpha: 0, filter: "blur(7px)", ease: "power1.in" }, 0);
        // The interview product grows and lifts to centre stage.
        tl.to(visual.current, { scale: 1.16, yPercent: -6, ease: "none" }, 0);

        // Giant kinetic words sweep through in sequence.
        const caps = gsap.utils.toArray<HTMLElement>(".hero-cap");
        caps.forEach((cap, i) => {
          const at = 0.16 + i * 0.24;
          tl.fromTo(
            cap,
            { autoAlpha: 0, scale: 0.82, yPercent: 26 },
            { autoAlpha: 1, scale: 1, yPercent: 0, ease: "power2.out", duration: 0.14 },
            at,
          ).to(cap, { autoAlpha: 0, scale: 1.12, yPercent: -22, ease: "power2.in", duration: 0.12 }, at + 0.14);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative lg:h-[240vh]">
      <div
        ref={stage}
        className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 md:pt-32 lg:sticky lg:top-0 lg:h-screen lg:pt-0"
      >
        {/* Kinetic caption layer */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] hidden items-center justify-center lg:flex">
          {CAPTIONS.map((word) => (
            <span
              key={word}
              className="hero-cap grad-iris absolute px-6 text-center text-[clamp(3.5rem,11vw,10rem)] font-bold leading-none tracking-[-0.03em] opacity-0"
            >
              {word}
            </span>
          ))}
        </div>

        <div className="shell grid w-full items-center gap-12 lg:grid-cols-[1.02fr_1.1fr]">
          <div ref={copy} className="max-w-xl">
            <motion.div {...rise(0.05)}>
              <span className="chip">
                <Sparkles size={14} style={{ color: "var(--iris)" }} />
                You&rsquo;re more than your resume.
              </span>
            </motion.div>

            <motion.h1 {...rise(0.14)} className="mt-6 text-[clamp(2.6rem,1.2rem+5.4vw,4.8rem)]">
              Hire for how people{" "}
              <span className="grad-iris">actually think</span>.
            </motion.h1>

            <motion.p
              {...rise(0.24)}
              className="mt-6 text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-relaxed text-[var(--ink-2)]"
            >
              Anyone can write a good resume. One honest conversation shows how a
              person really thinks and works when things get hard. That&rsquo;s what
              you should hire for.
            </motion.p>

            <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={() => open("employer")}>
                Hire on real skill <ArrowRight size={17} />
              </Button>
              <Button href="/pre-interview" variant="ghost">
                Take an interview
              </Button>
            </motion.div>

            <motion.p {...rise(0.44)} className="mt-6 text-[13px] text-[var(--ink-3)]">
              LL144 &amp; EU AI Act aligned · candidate-contestable traits · zero resume bias
            </motion.p>
          </div>

          <div ref={visual} className="relative z-[1] will-change-transform">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 34, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
              style={{ perspective: 1200 }}
            >
              <InterviewDemo />
            </motion.div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
          <span
            className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-3)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
