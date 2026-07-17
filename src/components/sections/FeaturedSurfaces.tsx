"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { motion } from "motion/react";
import {
  AnimateIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  BadgeCheck,
  ScanSearch,
} from "@/components/ui/icons";
import { SectionAurora } from "@/components/background/SectionAurora";

/*
 * Featured surfaces — a hover-split carousel of the product's three real
 * surfaces. Each card shows a CSS-drawn preview that collapses to the top
 * half on hover to reveal a title + summary and a rotating arrow. Native
 * scroll-snap (no embla dep); prev/next buttons drive scrollBy. Previews are
 * illustrative UI mock-ups, not screenshots — no external images.
 */

const ease = [0.16, 1, 0.3, 1] as const;

type Preview = ComponentType;

type Surface = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  href: string;
  Icon: ComponentType<{ size?: number }>;
  Preview: Preview;
};

/* ── CSS-drawn previews ───────────────────────────────────────── */

function bubbleRow(align: "l" | "r", width: number) {
  const isL = align === "l";
  return (
    <div className={`flex ${isL ? "justify-start" : "justify-end"}`}>
      <span
        className="block rounded-2xl px-1 py-1"
        style={{
          width: `${width}%`,
          height: 10,
          background: isL ? "rgba(105,34,245,0.14)" : "rgba(105,34,245,0.85)",
        }}
      />
    </div>
  );
}

function InterviewPreview() {
  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--iris)" }} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
          Live conversation
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {bubbleRow("l", 62)}
        {bubbleRow("r", 44)}
        {bubbleRow("l", 52)}
      </div>
      <div className="flex items-center gap-[3px]" aria-hidden>
        {[12, 20, 28, 16, 24, 30, 14, 22, 18, 26, 12].map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full"
            style={{ height: h, background: "linear-gradient(180deg,#9A6BFF,#B79BFF)" }}
            animate={{ scaleY: [0.5, 1, 0.6, 1, 0.5] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.16 }}
          />
        ))}
      </div>
    </div>
  );
}

function PassportPreview() {
  const traits = [
    { label: "Systems thinking", v: 88 },
    { label: "Clear communication", v: 76 },
    { label: "Handles ambiguity", v: 82 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: "var(--iris)" }}>
          <BadgeCheck size={13} />
        </span>
        <span className="text-[11px] font-semibold text-[var(--ink)]">Verified via interview</span>
      </div>
      {traits.map((t, i) => (
        <div key={t.label}>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--ink-2)]">
            <span>{t.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--iris-ink)" }}>{t.v}</span>
          </div>
          <span className="block h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <motion.span
              className="block h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#8B54FF,#B79BFF)" }}
              initial={{ width: 0 }}
              whileInView={{ width: `${t.v}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 + i * 0.12, ease }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function EmployerPreview() {
  const rows = [
    { i: "A.K.", role: "Applied AI Engineer", m: 94 },
    { i: "R.M.", role: "Forward Deployed Eng", m: 89 },
    { i: "S.L.", role: "Solutions Engineer", m: 85 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-5">
      <div className="flex items-center gap-2">
        <ScanSearch size={13} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--iris-ink)]" style={{ fontFamily: "var(--font-mono)" }}>
          Matched on evidence
        </span>
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={r.i}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
          style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)" }}
          initial={{ opacity: 0, x: 14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1, ease }}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            {r.i}
          </span>
          <span className="flex-1 text-[11px] font-medium text-[var(--ink)]">{r.role}</span>
          <span className="text-[11px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--iris)" }}>
            {r.m}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const SURFACES: Surface[] = [
  {
    id: "interview",
    eyebrow: "The interview",
    title: "One honest conversation",
    summary: "A 25–30 min chat that adapts to how a candidate thinks — voice or text, no fixed script.",
    href: "/pre-interview",
    Icon: MessageSquareText,
    Preview: InterviewPreview,
  },
  {
    id: "passport",
    eyebrow: "The Trust Passport",
    title: "Strengths, backed by evidence",
    summary: "Every trait ties to a moment in the candidate's own words. They approve exactly what employers see.",
    href: "/candidates",
    Icon: BadgeCheck,
    Preview: PassportPreview,
  },
  {
    id: "employer",
    eyebrow: "The employer view",
    title: "Matched on how people think",
    summary: "Search candidates in plain English and see why each one fits — evidence, not keywords.",
    href: "/companies",
    Icon: ScanSearch,
    Preview: EmployerPreview,
  },
];

/* ── card ─────────────────────────────────────────────────────── */

function SurfaceCard({ surface }: { surface: Surface }) {
  const { eyebrow, title, summary, href, Icon, Preview } = surface;
  return (
    <a
      href={href}
      className="group relative block h-[360px] w-[300px] shrink-0 snap-start overflow-hidden rounded-[calc(var(--r-card)+4px)] md:w-[350px]"
      style={{
        background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 74%)",
        border: "1px solid var(--glass-line)",
        boxShadow: "0 22px 50px -30px rgba(30,24,70,0.5)",
      }}
    >
      {/* preview — full height, collapses to top half on hover */}
      <div className="relative h-full w-full overflow-hidden transition-[height] duration-[var(--d-sig)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-1/2">
        <span
          aria-hidden
          className="absolute left-4 top-4 z-[1] inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono)", background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}
        >
          <Icon size={13} /> {eyebrow}
        </span>
        <Preview />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-16 w-full opacity-0 transition-opacity duration-[var(--d-sig)] group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, var(--glass), transparent)" }}
        />
      </div>

      {/* text — revealed in the bottom half on hover */}
      <div className="absolute bottom-0 left-0 flex h-1/2 w-full translate-y-3 flex-col justify-center px-5 opacity-0 transition-all duration-[var(--d-sig)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="text-[1.15rem] leading-tight tracking-[-0.01em]">{title}</h3>
        <p className="mt-2 text-[13px] leading-snug text-[var(--ink-2)]">{summary}</p>
        <span
          className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-[var(--d-std)] group-hover:-rotate-45"
          style={{ border: "1px solid var(--glass-line)", color: "var(--iris)" }}
        >
          <ArrowRight size={16} />
        </span>
      </div>
    </a>
  );
}

/* ── section ──────────────────────────────────────────────────── */

export function FeaturedSurfaces() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 366, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28" aria-label="Product surfaces">
      <SectionAurora />
      <div className="shell relative z-[1]">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">See it in motion</p>
            <h2 className="mt-3 text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] tracking-[-0.02em]">
              Three surfaces. <span className="grad-iris">One honest signal.</span>
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--ink-2)]">
              From the conversation to the passport to the shortlist — hover to look inside each part
              of how Placedon works.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Previous"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full transition-all duration-[var(--d-std)] disabled:cursor-default disabled:opacity-35"
              style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Next"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full transition-all duration-[var(--d-std)] disabled:cursor-default disabled:opacity-35"
              style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", color: "var(--iris-ink)" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <AnimateIcon animateOnView>
          <div
            ref={trackRef}
            className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {SURFACES.map((s) => (
              <SurfaceCard key={s.id} surface={s} />
            ))}
          </div>
        </AnimateIcon>
      </div>
    </section>
  );
}
