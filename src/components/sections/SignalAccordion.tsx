"use client";

/**
 * Interactive signal accordion — the eye-catching replacement for the flat stat
 * grid. Adapted from the 21st.dev "interactive image accordion" pattern (hover a
 * panel → it expands, others collapse to labelled slivers), but rebuilt native to
 * the iris system: rich brand gradients instead of stock photos (honest, no
 * borrowed imagery), each panel folding a real proof point into its reveal.
 * Horizontal accordion on md+, a clean stacked list on mobile. Keyboard + hover
 * both drive it; reduced-motion still gets the content, just without the glide.
 */

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

type Art = "wave" | "quote" | "fair" | "control" | "skill";
type Panel = { art: Art; title: string; stat: string; body: string; grad: string };

const PANELS: Panel[] = [
  { art: "wave", title: "One honest interview", stat: "30 min", body: "One adaptive conversation replaces the whole screening funnel.", grad: "linear-gradient(155deg,#8B54FF,#6922F5)" },
  { art: "quote", title: "Evidence, not keywords", stat: "1 quote / trait", body: "Every signal cited to a real transcript moment — and contestable.", grad: "linear-gradient(155deg,#6922F5,#4311a8)" },
  { art: "fair", title: "Fair by design", stat: "9 never used", body: "Caste, college, gender, age, name — blocked as inputs, always.", grad: "linear-gradient(155deg,#7C3AED,#9333EA)" },
  { art: "control", title: "You stay in control", stat: "0 shared", body: "Nothing reaches an employer without the candidate’s yes.", grad: "linear-gradient(155deg,#5B21B6,#7C3AED)" },
  { art: "skill", title: "Real skill over resumes", stat: "0 resumes", body: "Hired for how they think, not for what they wrote down.", grad: "linear-gradient(155deg,#6D28D9,#8B54FF)" },
];

/** Honest, on-brand mini-illustrations — white-on-gradient SVG, no stock imagery. */
function PanelArt({ art }: { art: Art }) {
  const w = "rgba(255,255,255,0.92)";
  const f = "rgba(255,255,255,0.16)";
  if (art === "wave")
    return (
      <svg viewBox="0 0 132 52" className="h-14 w-auto" fill="none" aria-hidden>
        {[10, 26, 40, 20, 46, 30, 14, 38, 24, 44, 18, 32].map((h, i) => (
          <rect key={i} x={4 + i * 11} y={(52 - h) / 2} width="5" height={h} rx="2.5" fill={i % 3 === 0 ? w : "rgba(255,255,255,0.5)"} />
        ))}
      </svg>
    );
  if (art === "quote")
    return (
      <svg viewBox="0 0 150 72" className="h-16 w-auto" fill="none" aria-hidden>
        <rect x="1" y="1" width="148" height="70" rx="12" fill={f} stroke="rgba(255,255,255,0.22)" />
        <text x="14" y="30" fontSize="24" fontWeight="800" fill={w}>&ldquo;</text>
        <rect x="34" y="18" width="98" height="6" rx="3" fill="rgba(255,255,255,0.55)" />
        <rect x="14" y="38" width="118" height="6" rx="3" fill="rgba(255,255,255,0.30)" />
        <rect x="14" y="52" width="70" height="6" rx="3" fill="rgba(255,255,255,0.30)" />
        <rect x="92" y="50" width="42" height="12" rx="6" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  if (art === "fair")
    return (
      <svg viewBox="0 0 150 64" className="h-16 w-auto" fill="none" aria-hidden>
        {[
          [6, 8, 60],
          [74, 8, 66],
          [6, 30, 48],
          [60, 30, 42],
          [6, 52, 74],
        ].map(([x, y, ww], i) => (
          <g key={i}>
            <rect x={x} y={y} width={ww} height="15" rx="7.5" fill={f} stroke="rgba(255,255,255,0.25)" />
            <line x1={x + 6} y1={y + 7.5} x2={x + ww - 6} y2={y + 7.5} stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" />
          </g>
        ))}
      </svg>
    );
  if (art === "control")
    return (
      <svg viewBox="0 0 120 56" className="h-14 w-auto" fill="none" aria-hidden>
        <rect x="2" y="14" width="64" height="28" rx="14" fill={f} stroke="rgba(255,255,255,0.3)" />
        <circle cx="50" cy="28" r="10" fill={w} />
        <rect x="86" y="20" width="28" height="24" rx="5" fill={f} stroke="rgba(255,255,255,0.4)" />
        <path d="M92 20v-5a8 8 0 0116 0v5" stroke={w} strokeWidth="2.4" fill="none" />
        <circle cx="100" cy="31" r="2.6" fill={w} />
      </svg>
    );
  // skill
  return (
    <svg viewBox="0 0 132 56" className="h-14 w-auto" fill="none" aria-hidden>
      {[16, 26, 22, 38, 30, 48].map((h, i) => (
        <rect key={i} x={6 + i * 21} y={54 - h} width="13" height={h} rx="4" fill={i === 5 ? w : "rgba(255,255,255,0.42)"} />
      ))}
    </svg>
  );
}

export function SignalAccordion() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-20 md:py-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
        {/* Left — the pitch */}
        <div>
          <p className="eyebrow">Why teams switch</p>
          <h2 className="mt-3 text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] leading-[1.06] tracking-[-0.02em]">
            The whole signal, in <span className="grad-iris">one conversation</span>.
          </h2>
          <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            Resume screening throws away everything that actually predicts the work. One adaptive
            interview keeps it — and shows you how someone thinks, decides, and holds up when it&rsquo;s hard.
          </p>
          <Link
            href="/trust/scoring"
            className="mt-7 inline-flex items-center gap-2 text-[14.5px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--iris-ink)" }}
          >
            See how the signal is scored <ArrowRight size={15} />
          </Link>
        </div>

        {/* Right — the accordion (md+) */}
        <div className="hidden gap-3 md:flex" style={{ height: 452 }}>
          {PANELS.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.title}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-label={p.title}
                className="group relative h-full cursor-pointer overflow-hidden rounded-[26px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{
                  flexGrow: isActive ? 1 : 0,
                  flexBasis: 66,
                  flexShrink: 1,
                  transition: "flex-grow 0.62s cubic-bezier(0.22,0.68,0.31,1), box-shadow 0.4s",
                  background: p.grad,
                  boxShadow: isActive ? "0 30px 70px -20px rgba(58,20,140,0.55)" : "0 10px 30px -14px rgba(58,20,140,0.4)",
                }}
              >
                {/* glossy 3D sheen */}
                <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.28), transparent 55%)" }} />
                <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(20,8,50,0.5))" }} />

                {/* collapsed: vertical label */}
                <span
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[15px] font-bold text-white/95 transition-opacity duration-300"
                  style={{ writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)", opacity: isActive ? 0 : 1 }}
                >
                  {p.title}
                </span>

                {/* expanded: full content */}
                <span
                  className="absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <span className="flex items-start justify-end">
                    {isActive && <PanelArt art={p.art} />}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[30px] font-extrabold leading-none text-white" style={{ fontFamily: "var(--font-mono)" }}>{p.stat}</span>
                    <span className="mt-2 text-[18px] font-bold leading-tight text-white">{p.title}</span>
                    <span className="mt-2 max-w-[320px] text-[13.5px] leading-relaxed text-white/80">{p.body}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right — stacked cards (mobile) */}
        <div className="flex flex-col gap-3 md:hidden">
          {PANELS.map((p) => {
            return (
              <div key={p.title} className="relative overflow-hidden rounded-[22px] p-5" style={{ background: p.grad, boxShadow: "0 14px 34px -18px rgba(58,20,140,0.5)" }}>
                <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 80% at 15% 0%, rgba(255,255,255,0.22), transparent 55%)" }} />
                <div className="relative flex items-start gap-3.5">
                  <div>
                    <p className="text-[20px] font-extrabold leading-none text-white" style={{ fontFamily: "var(--font-mono)" }}>{p.stat}</p>
                    <p className="mt-1.5 text-[15px] font-bold text-white">{p.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/80">{p.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
