"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { InterviewDemo } from "./InterviewDemo";

const ease = [0.22, 0.68, 0.31, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, delay, ease },
  });

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center pt-28 pb-16 md:pt-32">
      <div className="shell grid w-full items-center gap-12 lg:grid-cols-[1.02fr_1.1fr]">
        <div className="max-w-xl">
          <motion.div {...rise(0.05)}>
            <span className="chip">
              <Sparkles size={14} style={{ color: "var(--iris)" }} />
              One interview. The whole signal.
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.14)}
            className="mt-6 text-[clamp(2.6rem,1.2rem+5.4vw,4.8rem)]"
          >
            Hire for how people{" "}
            <span className="grad-iris">actually think</span>.
          </motion.h1>

          <motion.p
            {...rise(0.24)}
            className="mt-6 text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-relaxed text-[var(--ink-2)]"
          >
            One real conversation shows what a résumé can&rsquo;t — how someone
            reasons, makes calls, and handles the messy parts of the job. That&rsquo;s
            the skill you&rsquo;re actually hiring for.
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
            LL144 &amp; EU AI Act aligned · candidate-contestable traits · zero résumé bias
          </motion.p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          style={{ perspective: 1200 }}
        >
          <InterviewDemo />
        </motion.div>
      </div>
    </section>
  );
}
