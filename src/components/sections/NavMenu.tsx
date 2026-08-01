"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown, Search, Scale, ShieldCheck, Mic, FileCheck2, TrendingUp,
  Landmark, Activity, MessageSquareWarning, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Sub = { label: string; href: string; desc: string; Icon: LucideIcon };
type Item = { label: string; href?: string; menu?: Sub[] };

/**
 * Top-level marketing nav items. Items with a `menu` open an animated dropdown;
 * the dropdowns double as wayfinding for the /trust/* pages that are otherwise
 * unreachable from the homepage. Flat labels stay in sync with MobileMenu.
 */
export const NAV_ITEMS: Item[] = [
  { label: "How it works", href: "/#how" },
  {
    label: "For teams",
    menu: [
      { label: "Why evidence beats resumes", href: "/companies", desc: "The case for hiring on proof of work", Icon: Scale },
      { label: "HR Copilot search", href: "/employer/search", desc: "Prompt + skills → candidates ranked by evidence", Icon: Search },
      { label: "Fair & bias-audited", href: "/trust/ll144", desc: "LL144 and EU AI Act aligned", Icon: ShieldCheck },
    ],
  },
  {
    label: "For candidates",
    menu: [
      { label: "Take the interview", href: "/pre-interview", desc: "One honest conversation, ~25 minutes", Icon: Mic },
      { label: "Your evidence report", href: "/candidates", desc: "Every trait traces to something you said", Icon: FileCheck2 },
      { label: "Growth & readiness", href: "/candidate/growth", desc: "See your gaps and what closes them", Icon: TrendingUp },
    ],
  },
  {
    label: "Trust",
    menu: [
      { label: "LL144 compliance", href: "/trust/ll144", desc: "NYC automated-hiring bias audit", Icon: ShieldCheck },
      { label: "EU AI Act", href: "/trust/eu-ai-act", desc: "How we meet the risk obligations", Icon: Landmark },
      { label: "Model health", href: "/trust/model-health", desc: "Live fairness and calibration metrics", Icon: Activity },
      { label: "Contest a trait", href: "/trust/contest", desc: "Every score is candidate-contestable", Icon: MessageSquareWarning },
    ],
  },
];

const CLOSE_DELAY = 120;

export function NavMenu({ scrolled = false }: { scrolled?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY);
  };

  const linkBtnClass = scrolled
    ? "rounded-full px-3 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-[var(--ink-2)] transition-all duration-300 hover:bg-white/60 hover:text-[var(--ink)]"
    : "rounded-full px-3.5 py-2 text-[14px] font-medium whitespace-nowrap text-[var(--ink-2)] transition-all duration-300 hover:bg-white/60 hover:text-[var(--ink)]";

  const triggerBtnClass = scrolled
    ? "flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] font-medium whitespace-nowrap transition-all duration-300 hover:bg-white/60"
    : "flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium whitespace-nowrap transition-all duration-300 hover:bg-white/60";

  return (
    <ul className={cn("hidden items-center md:flex transition-all duration-300", scrolled ? "gap-0" : "gap-0.5")} onMouseLeave={scheduleClose}>
      {NAV_ITEMS.map((item) => {
        if (!item.menu) {
          return (
            <li key={item.label} onMouseEnter={() => setOpen(null)}>
              <a href={item.href} className={linkBtnClass}>
                {item.label}
              </a>
            </li>
          );
        }
        const isOpen = open === item.label;
        return (
          <li key={item.label} className="relative" onMouseEnter={() => enter(item.label)}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.label)}
              className={triggerBtnClass}
              style={{ color: isOpen ? "var(--ink)" : "var(--ink-2)" }}
            >
              {item.label}
              <ChevronDown
                size={scrolled ? 12 : 14}
                className="transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "none", color: "var(--ink-3)" }}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top center" }}
                  className="absolute left-1/2 top-full z-10 -translate-x-1/2 pt-3"
                  onMouseEnter={() => enter(item.label)}
                >
                  <div
                    className="w-[320px] rounded-[20px] border p-2"
                    style={{
                      background: "var(--glass-hi)",
                      borderColor: "var(--glass-line-hi)",
                      backdropFilter: "blur(22px) saturate(1.4)",
                      WebkitBackdropFilter: "blur(22px) saturate(1.4)",
                      boxShadow: "0 24px 60px -24px rgba(40,26,120,0.4), inset 0 1px 0 rgba(255,255,255,0.7)",
                    }}
                  >
                    {item.menu.map(({ label, href, desc, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(null)}
                        className="group flex items-start gap-3 rounded-[14px] p-2.5 transition-colors hover:bg-[var(--iris-ghost)]"
                      >
                        <span
                          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors"
                          style={{ background: "var(--iris-ghost)", border: "1px solid var(--iris-line)", color: "var(--iris)" }}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[14px] font-semibold text-[var(--ink)] group-hover:text-[var(--iris-ink)]">{label}</span>
                          <span className="block text-[12.5px] leading-snug text-[var(--ink-3)]">{desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
