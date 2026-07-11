"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

export function CTA() {
  const { open } = useDemoDialog();
  const reduce = useReducedMotion();

  return (
    <section id="trust" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[calc(var(--r-card)+10px)] px-8 py-14 md:px-16 md:py-16"
            style={{
              background:
                "linear-gradient(120deg, var(--iris-soft) 0%, var(--iris) 46%, var(--iris-ink) 108%)",
              boxShadow: "0 40px 90px -30px rgba(58,20,150,.6)",
            }}
          >
            {/* gloss highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(700px circle at 18% -10%, rgba(255,255,255,.28), transparent 55%)",
              }}
            />
            {/* brand mark watermark */}
            <motion.svg
              aria-hidden
              viewBox="133 119 354 400"
              className="pointer-events-none absolute -right-10 -bottom-16 h-[130%] w-auto"
              style={{ opacity: 0.12 }}
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M468 140 L152 142 L196 264 L259 264 L259 219 L269 208 L351 208 L361 218 L361 264 L425 264 Z"
                fill="#fff"
              />
              <path
                d="M152 424 L258 497 L261 425 L468 425 L425 301 L361 301 L360 367 L310 336 L261 368 L259 301 L196 301 Z"
                fill="#fff"
              />
            </motion.svg>

            <div className="relative max-w-[640px] text-center md:text-left">
              <p
                className="text-[12px] uppercase tracking-[0.16em]"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.7)" }}
              >
                Stop guessing from resumes
              </p>
              <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)]" style={{ color: "#fff" }}>
                See the skill, not the resume.
              </h2>
              <p
                className="mt-5 max-w-xl text-[16.5px] leading-relaxed md:mx-0"
                style={{ color: "rgba(255,255,255,.82)" }}
              >
                Give one team one week on Placedon. Watch how fast “who should we
                talk to?” gets an honest answer.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <button
                  onClick={() => open("employer")}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] bg-white px-6 py-3.5 text-[15px] font-semibold transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
                  style={{ color: "var(--iris-ink)", boxShadow: "0 12px 30px -10px rgba(0,0,0,.35)" }}
                >
                  Book a demo <ArrowRight size={17} />
                </button>
                <a
                  href="/pre-interview"
                  className="inline-flex cursor-pointer items-center rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-[var(--d-micro)]"
                  style={{ border: "1px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.06)" }}
                >
                  Take an interview
                </a>
              </div>

              <p className="mt-6 text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
                No setup fee · cancel anytime · every score is bias-audited
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
