"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";

type Cmd = { label: string; href: string; group: string; keywords?: string };

const COMMANDS: Cmd[] = [
  { label: "Candidate home", href: "/candidate", group: "Candidate" },
  { label: "Take your interview", href: "/pre-interview", group: "Candidate", keywords: "start begin" },
  { label: "Practice run", href: "/practice", group: "Candidate", keywords: "mock warm up rehearse" },
  { label: "Your matches", href: "/candidate/matches", group: "Candidate", keywords: "jobs roles" },
  { label: "Profile", href: "/candidate/profile", group: "Candidate", keywords: "resume claims" },
  { label: "Evidence Passport", href: "/candidate/passport", group: "Candidate" },
  { label: "Applications", href: "/candidate/applications", group: "Candidate" },
  { label: "Growth", href: "/candidate/growth", group: "Candidate", keywords: "gaps learning" },
  { label: "Preferences", href: "/candidate/preferences", group: "Candidate", keywords: "visibility settings" },
  { label: "Accommodations", href: "/accommodations", group: "Candidate", keywords: "accessibility motion" },
  { label: "Hiring overview", href: "/employer", group: "Hiring" },
  { label: "Search candidates", href: "/employer/search", group: "Hiring", keywords: "copilot find" },
  { label: "Post a role", href: "/employer/jobs/new", group: "Hiring", keywords: "job create" },
  { label: "Introductions", href: "/intros", group: "Hiring" },
  { label: "Trust & scoring", href: "/trust/scoring", group: "Learn", keywords: "help how" },
  { label: "Bias audit (LL144)", href: "/trust/ll144", group: "Learn", keywords: "fairness compliance" },
];

/** Global ⌘K / Ctrl+K command palette — quick nav to any surface. Client-only. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(s));
  }, [q]);

  useEffect(() => setActive(0), [q]);

  const go = (c?: Cmd) => {
    const target = c ?? results[active];
    if (!target) return;
    setOpen(false);
    router.push(target.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center px-4 pt-[12vh]" style={{ zIndex: "var(--z-peak)" }} onClick={() => setOpen(false)}>
      <div className="absolute inset-0" style={{ background: "rgba(14,16,32,0.4)", backdropFilter: "blur(2px)" }} aria-hidden />
      <div role="dialog" aria-label="Command palette" className="glass relative w-full max-w-lg overflow-hidden rounded-[18px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--glass-line)" }}>
          <Search size={17} className="text-[var(--ink-3)]" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); go(); }
            }}
            placeholder="Jump to…"
            aria-label="Search commands"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--ink-3)]"
          />
          <kbd className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--ink-3)]" style={{ borderColor: "var(--glass-line-hi)" }}>ESC</kbd>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-[13.5px] text-[var(--ink-3)]">No matches</li>}
          {results.map((c, i) => (
            <li key={c.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
                className="flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px]"
                style={{ background: i === active ? "var(--iris-ghost)" : "transparent", color: i === active ? "var(--iris-ink)" : "var(--ink-2)" }}
              >
                <span className="font-semibold">{c.label}</span>
                <span className="flex items-center gap-2 text-[11.5px]">
                  <span className="rounded-full px-2 py-0.5" style={{ background: "var(--mist)", color: "var(--ink-3)" }}>{c.group}</span>
                  {i === active && <CornerDownLeft size={13} aria-hidden />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
