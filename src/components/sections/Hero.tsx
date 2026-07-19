"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AnimateIcon, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { HeroAurora } from "@/components/background/HeroAurora";

// Code-split so three.js stays out of the critical bundle.
const HeroObject3D = dynamic(() => import("@/components/background/HeroObject3D"), { ssr: false });

const ease = [0.22, 0.68, 0.31, 1] as const;

/*
 * Cinematic, motion-graphic-led hero. A generative WebGL aurora fills the
 * frame; the copy sits centred and editorial over it. No product mockup, no
 * human face — the atmosphere carries the mood, the words carry the message.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useDemoDialog();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax: copy and atmosphere drift at different rates for real z-depth.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 96]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -56]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <motion.div aria-hidden className="absolute inset-0" style={reduce ? undefined : { y: bgY }}>
        <HeroAurora />
        <HeroObject3D />
      </motion.div>

      {/* soft legibility scrim behind the copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 44% at 50% 46%, rgba(247,249,254,0.72) 0%, rgba(247,249,254,0) 70%)",
        }}
      />

      <motion.div
        className="shell relative z-[1] flex flex-col items-center pt-32 pb-24 text-center md:pt-36"
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <motion.a
          {...rise(0.05)}
          href="/trust"
          className="chip transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <span className="livedot" />
          LL144 &amp; EU AI Act aligned
        </motion.a>

        <motion.h1
          {...rise(0.14)}
          className="mt-7 max-w-[15ch] text-balance text-[clamp(2.8rem,1.1rem+6.4vw,6.2rem)] leading-[1.02] tracking-[-0.035em]"
          style={{ fontWeight: 300 }}
        >
          Defining the future with{" "}
          <span className="grad-iris-shimmer" style={{ fontWeight: 500 }}>
            smart hiring
          </span>
          .
        </motion.h1>

        <motion.p
          {...rise(0.26)}
          className="mt-7 max-w-[52ch] text-[clamp(1.05rem,1rem+0.45vw,1.3rem)] leading-relaxed text-[var(--ink-2)]"
        >
          A resume tells you what someone did. One honest, adaptive conversation
          shows how they think, decide and hold up when the work gets hard.
        </motion.p>

        <motion.div {...rise(0.38)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <AnimateIcon animateOnHover>
            <Button onClick={() => open("employer")} className="!px-7 !py-3.5 text-[15px]">
              Book a demo <ArrowRight size={17} />
            </Button>
          </AnimateIcon>
          <Button href="/pre-interview" variant="ghost" className="!px-6 !py-3.5 text-[15px]">
            Take an interview
          </Button>
        </motion.div>

        <motion.p {...rise(0.5)} className="mt-7 text-[13px] text-[var(--ink-3)]">
          Candidate-contestable traits · every score tied to a transcript moment · zero resume bias
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2"
      >
        <span
          className="text-[11px] uppercase tracking-[0.2em] text-[var(--ink-3)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scroll
        </span>
        <motion.span
          aria-hidden
          className="block h-6 w-px"
          style={{ background: "linear-gradient(var(--ink-3), transparent)" }}
          animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
