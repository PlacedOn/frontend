"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * The hero's single call to action: pick a side, say what you need, go.
 *
 * Replaces two competing buttons ("Start your interview" / "Book a demo") with
 * one input. The ui-ux-pro-max Marketplace pattern is explicit about this — the
 * search bar *is* the CTA — and the two-tab fork is the thing a two-sided
 * product has to resolve before it can help anyone. PlacedOn already has both
 * sides built; the homepage just never asked which one you were.
 *
 * It routes to creation, not to results. Typing "backend engineer" and landing
 * on an empty results page would be worse than no search at all, and the
 * database has no rows yet. Both destinations already exist and both do
 * something real with the text:
 *
 *   hire  -> /employer/jobs/new?seed=…   role description, prefilled
 *   work  -> /pre-interview?focus=…      what you want to be interviewed on
 *
 * Keyboard: the tabs are a real tablist — arrow keys move between them, Home
 * and End jump to the ends, and only the selected tab is in the tab order, so
 * a keyboard user tabs straight from the tabs into the input.
 */

type Side = "hire" | "work";

const TABS: { id: Side; label: string }[] = [
  { id: "hire", label: "I want to hire" },
  { id: "work", label: "I'm looking for work" },
];

const PLACEHOLDER: Record<Side, string> = {
  hire: "Describe the role you're hiring for…",
  work: "Describe the work you want to be judged on…",
};

/** One tap instead of typing. Same destination as the input. */
const QUICK: Record<Side, string[]> = {
  hire: ["Backend engineer", "Product designer", "Data engineer", "Applied AI"],
  work: ["Backend", "Frontend", "Data", "Design"],
};

export function HeroSearch() {
  const router = useRouter();
  const [side, setSide] = useState<Side>("hire");
  const [q, setQ] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const destination = (text: string) =>
    side === "hire"
      ? `/employer/jobs/new${text ? `?seed=${encodeURIComponent(text)}` : ""}`
      : `/pre-interview${text ? `?focus=${encodeURIComponent(text)}` : ""}`;

  const go = (text: string) => router.push(destination(text.trim()));

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setSide(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="w-full max-w-2xl">
      {/* ── side fork ── */}
      <div role="tablist" aria-label="What brings you here" className="flex gap-1 rounded-full border border-white/25 p-1">
        {TABS.map((t, i) => {
          const selected = side === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              type="button"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setSide(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={
                "flex-1 cursor-pointer rounded-full px-5 py-2.5 text-[14.5px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
                (selected ? "bg-white text-[#12100E]" : "text-white/80 hover:bg-white/10 hover:text-white")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── the input, which is the CTA ── */}
      <form
        onSubmit={(e) => { e.preventDefault(); go(q); }}
        className="mt-3.5 flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)]"
      >
        <label htmlFor="hero-search" className="sr-only">
          {side === "hire" ? "Describe the role you're hiring for" : "Describe the work you want to be judged on"}
        </label>
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={PLACEHOLDER[side]}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#12100E] outline-none placeholder:text-[#77746E]"
        />
        <button
          type="submit"
          className="shrink-0 cursor-pointer rounded-full bg-[#12100E] px-6 py-3 text-[14.5px] font-semibold text-white transition-colors duration-200 hover:bg-[#2A2621] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {side === "hire" ? "Find people" : "Get started"}
        </button>
      </form>

      {/* ── one-tap alternatives ── */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {QUICK[side].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => go(label)}
            className="cursor-pointer rounded-full border border-white/25 px-4 py-2 text-[13.5px] text-white/85 transition-colors duration-200 hover:border-white/50 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {label} <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
