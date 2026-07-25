"use client";

import { useEffect, useState } from "react";
import { Accessibility, Check, Mic, MessageSquareText, Sparkles } from "lucide-react";

type Format = "either" | "voice" | "text";
const KEY = "placedon:accommodations";

const REASSURANCE = [
  "There is no timer — take all the time you need on any answer.",
  "You can pause and come back; nothing is lost.",
  "Answer by voice or text, and switch whenever you like.",
  "Everything works with a keyboard and a screen reader.",
] as const;

/**
 * Accommodations, no questions asked. Candidate comfort settings, kept on this
 * device. "Reduce motion" is functional (sets data-reduce-motion on <html>);
 * the format preference pre-sets the interview; the rest reassures — it reflects
 * what the interview already guarantees (no timer, pause anytime, voice/text).
 */
export function AccommodationsPanel() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [format, setFormat] = useState<Format>("either");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as { reduceMotion?: boolean; format?: Format };
      setReduceMotion(Boolean(v.reduceMotion));
      if (v.format) setFormat(v.format);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ reduceMotion, format }));
    } catch {
      /* storage may be unavailable */
    }
    const root = document.documentElement;
    if (reduceMotion) root.setAttribute("data-reduce-motion", "on");
    else root.removeAttribute("data-reduce-motion");
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [reduceMotion, format]);

  const FORMATS: { id: Format; label: string; icon: typeof Mic }[] = [
    { id: "either", label: "Either", icon: Sparkles },
    { id: "voice", label: "Voice", icon: Mic },
    { id: "text", label: "Text", icon: MessageSquareText },
  ];

  return (
    <div className="glass rounded-[var(--r-card)] p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[13px] border" style={{ borderColor: "var(--line-2)", background: "var(--paper-3)" }}>
          <Accessibility size={20} strokeWidth={1.75} className="text-[var(--ink)]" aria-hidden />
        </span>
        <div>
          <p className="eyebrow">Comfort settings</p>
          <h2 className="text-[18px] font-bold text-[var(--ink)]">Set up your interview your way.</h2>
        </div>
        {saved && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#047857]">
            <Check size={14} aria-hidden /> Saved on this device
          </span>
        )}
      </div>

      {/* Reduce motion — functional */}
      <div className="mt-6 flex items-center justify-between gap-4 rounded-[var(--r-card)] border p-4" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
        <div>
          <p className="text-[14.5px] font-bold text-[var(--ink)]">Reduce motion</p>
          <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">Calms animations across the whole app.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reduceMotion}
          onClick={() => setReduceMotion((v) => !v)}
          className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
          style={{ background: reduceMotion ? "var(--ink)" : "var(--mist)" }}
        >
          <span className="absolute top-1 size-5 rounded-full bg-white transition-all" style={{ left: reduceMotion ? "26px" : "4px" }} />
        </button>
      </div>

      {/* Format preference */}
      <div className="mt-4">
        <p className="text-[14.5px] font-bold text-[var(--ink)]">How you&rsquo;d like to answer</p>
        <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">Pre-sets your interview — you can still switch anytime.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMATS.map((f) => {
            const active = format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                aria-pressed={active}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors"
                style={active
                  ? { borderColor: "var(--ink)", background: "var(--ink)", color: "#fff" }
                  : { borderColor: "var(--glass-line-hi)", background: "var(--glass)", color: "var(--ink-2)" }}
              >
                <f.icon size={14} aria-hidden /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reassurance — what's always true */}
      <ul className="mt-6 space-y-2.5 border-t pt-5" style={{ borderColor: "var(--line)" }}>
        {REASSURANCE.map((r) => (
          <li key={r} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            <Check size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[var(--ink)]" aria-hidden />
            {r}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12.5px] text-[var(--ink-3)]">No approval, no note on your profile — accommodations are yours, no questions asked.</p>
    </div>
  );
}
