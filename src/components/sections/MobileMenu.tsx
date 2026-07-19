"use client";

/**
 * Mobile nav drawer. Below md the primary links are hidden, so this is the only
 * way to navigate on a phone. Glass panel slides in from the right; backdrop +
 * ESC + link-tap all close it; body scroll is locked while open; focus moves to
 * the panel and returns to the trigger on close. Reduced-motion safe.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type NavLink = { label: string; href: string };

type Props = {
  links: readonly NavLink[];
  isSignedIn: boolean;
  dashboardHref: string;
  onBookDemo: () => void;
};

export function MobileMenu({ links, isSignedIn, dashboardHref, onBookDemo }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll + ESC to close + focus the panel while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full text-[var(--ink)] transition-colors hover:bg-white/60"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: "var(--z-drawer)" }}
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* backdrop */}
            <button
              aria-label="Close menu"
              onClick={close}
              className="absolute inset-0 h-full w-full cursor-default"
              style={{ background: "rgba(14,16,32,0.36)", backdropFilter: "blur(4px)" }}
            />

            {/* panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              tabIndex={-1}
              className="glass absolute inset-y-0 right-0 flex w-[86%] max-w-[360px] flex-col gap-2 rounded-l-[28px] p-6 outline-none"
              initial={reduce ? undefined : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-3)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="grid h-10 w-10 place-items-center rounded-full text-[var(--ink)] transition-colors hover:bg-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              <nav aria-label="Mobile" className="mt-3 flex flex-col">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    className="rounded-[var(--r-btn)] px-3 py-3.5 text-[18px] font-semibold text-[var(--ink)] transition-colors hover:bg-white/60"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t pt-5" style={{ borderColor: "var(--glass-line)" }}>
                <Link
                  href={isSignedIn ? dashboardHref : "/login"}
                  onClick={close}
                  className="rounded-[var(--r-btn)] px-3 py-3 text-center text-[15px] font-medium text-[var(--ink-2)] transition-colors hover:bg-white/60"
                >
                  {isSignedIn ? "Dashboard" : "Log in"}
                </Link>
                <Button
                  onClick={() => {
                    close();
                    onBookDemo();
                  }}
                  className="w-full justify-center !py-3.5 text-[15px]"
                >
                  Book a demo <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
