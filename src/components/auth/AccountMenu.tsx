"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "./AuthProvider";

function initials(name: string | undefined, email: string | undefined): string {
  const source = (name ?? email ?? "").trim();
  if (!source) return "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return letters.join("").toUpperCase() || source[0].toUpperCase();
}

/** Signed-in identity control for the nav: avatar + name, opening a menu. */
export function AccountMenu() {
  const { user, role, signOut } = useAuth();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const name = (user.user_metadata?.full_name as string | undefined) ?? undefined;
  const label = name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Account";
  const dashboard = role === "employer" ? "/employer" : "/candidate";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-[14px] font-semibold text-[var(--ink)] transition-colors duration-[var(--d-micro)] hover:bg-white/60"
        style={{ border: "1px solid var(--glass-line)" }}
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
          aria-hidden="true"
        >
          {initials(name, user.email)}
        </span>
        <span className="hidden max-w-[9rem] truncate sm:block">{label}</span>
        <ChevronDown
          size={15}
          className="text-[var(--ink-3)] transition-transform duration-[var(--d-micro)]"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 0.68, 0.31, 1] }}
            className="glass absolute right-0 mt-2 w-60 overflow-hidden rounded-[var(--r-card)] p-1.5"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13.5px] font-semibold text-[var(--ink)]">{name ?? label}</p>
              <p className="mt-0.5 truncate text-[12px] text-[var(--ink-3)]">{user.email}</p>
              <span
                className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
              >
                {role === "employer" ? "Hiring team" : "Job seeker"}
              </span>
            </div>

            <div className="my-1 h-px" style={{ background: "var(--glass-line)" }} />

            <Link
              href={dashboard}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[var(--r-btn)] px-3 py-2.5 text-[14px] font-medium text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris-ghost)] hover:text-[var(--iris-ink)]"
            >
              <LayoutDashboard size={16} /> Go to dashboard
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--r-btn)] px-3 py-2.5 text-left text-[14px] font-medium text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
            >
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
