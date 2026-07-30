"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Tag = "building" | "research" | "solve" | "principle";
type Card = { tag: Tag; title: string; body: string };

const TAG_LABEL: Record<Tag, string> = {
  building: "Building",
  research: "Research",
  solve: "What we solve",
  principle: "Principle",
};
const TAG_STYLE: Record<Tag, { fg: string; bg: string }> = {
  building: { fg: "var(--iris-ink)", bg: "var(--iris-ghost)" },
  research: { fg: "#1D4ED8", bg: "rgba(37,99,235,0.10)" },
  solve: { fg: "var(--warn)", bg: "rgba(245,134,11,0.12)" },
  principle: { fg: "var(--ok)", bg: "rgba(16,185,129,0.12)" },
};

// The company's vision + roadmap, told as a reel. "Building" cards are honestly
// forward-looking; principles/what-we-solve are true today.
const CARDS: Card[] = [
  { tag: "building", title: "The thinking model", body: "A reasoning layer that judges how you solve problems under pressure — not the keywords on a page." },
  { tag: "building", title: "The emotional engine", body: "An emotional-intelligence LLM that reads tone, hesitation and care — the human signal a resume can't carry." },
  { tag: "research", title: "Grounded in the literature", body: "Every scoring decision traces to published work on fair, valid assessment — not vibes." },
  { tag: "solve", title: "Hiring on gut feel", body: "Teams still screen on resumes and instinct. We replace both with evidence you can defend." },
  { tag: "principle", title: "Evidence, not identity", body: "Every trait traces to a transcript moment. Zero resume bias, by construction." },
  { tag: "building", title: "Human touch, at scale", body: "Interviews that hear how people communicate and hold up — for the humans doing the hiring." },
  { tag: "principle", title: "You stay in control", body: "You own your evidence and decide who sees it. Nothing is shared by default." },
  { tag: "solve", title: "Callback limbo", body: "Candidates wait weeks for a first screen. One conversation becomes proof they take anywhere." },
  { tag: "principle", title: "Fair, and auditable", body: "LL144 and EU AI Act aligned. Every score is candidate-contestable." },
];

const COLUMNS: Card[][] = [CARDS.slice(0, 3), CARDS.slice(3, 6), CARDS.slice(6, 9)];
const DIR = [-1, 1, -1] as const; // outer columns rise, middle falls (counter-rotating)
const DUR = [30, 36, 32] as const;

function ReelCard({ c }: { c: Card }) {
  const t = TAG_STYLE[c.tag];
  return (
    <div className="glass rounded-[18px] p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: t.fg, background: t.bg }}>
        {TAG_LABEL[c.tag]}
      </span>
      <p className="mt-3 text-[15.5px] font-bold leading-snug text-[var(--ink)]">{c.title}</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
    </div>
  );
}

function Column({ cards, dir, dur, reduce, className }: { cards: Card[]; dir: number; dur: number; reduce: boolean; className?: string }) {
  const doubled = [...cards, ...cards]; // duplicate for a seamless -50% loop
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: "linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <motion.div
        className="flex flex-col gap-4"
        animate={reduce ? undefined : { y: dir < 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={reduce ? undefined : { duration: dur, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((c, i) => (
          <ReelCard key={i} c={c} />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Vision/roadmap reel (after 21st.dev @smammar100/scroll-reel-testimonials):
 * counter-rotating columns of cards — outer columns rise, the middle falls —
 * carrying what PlacedOn is building and the problems it's solving. Replaces the
 * old "beyond the resume" statement. Reduced-motion holds the columns still.
 */
export function VisionReel() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="vision-heading" className="shell relative py-[clamp(4rem,3rem+5vw,8rem)]">
      <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
        {/* heading */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="eyebrow">Our roadmap · what we&rsquo;re building</p>
          <h2 id="vision-heading" className="mt-4 max-w-[18ch] text-[clamp(2rem,1.3rem+2.4vw,3.2rem)] leading-[1.03] tracking-[-0.02em] text-[var(--ink)]" style={{ fontWeight: 660 }}>
            An interview that reads judgment — and the <span className="grad-iris">human signal</span> underneath.
          </h2>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-[var(--ink-2)]">
            Where PlacedOn is going: a reasoning model grounded in research, and an emotional
            engine that hears how people actually show up — so hiring runs on evidence and care,
            not resumes and gut feel.
          </p>
          <a href="/trust/model-health" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-bold text-[var(--iris-ink)] transition-transform hover:translate-x-0.5">
            How the model is measured →
          </a>
        </motion.div>

        {/* counter-rotating reel */}
        <div className="grid h-[440px] grid-cols-1 gap-4 sm:grid-cols-2 md:h-[500px] lg:grid-cols-3">
          <Column cards={COLUMNS[0]} dir={DIR[0]} dur={DUR[0]} reduce={!!reduce} />
          <Column cards={COLUMNS[1]} dir={DIR[1]} dur={DUR[1]} reduce={!!reduce} className="hidden sm:block" />
          <Column cards={COLUMNS[2]} dir={DIR[2]} dur={DUR[2]} reduce={!!reduce} className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
