"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "For teams", href: "#teams" },
  { label: "For candidates", href: "#candidates" },
  { label: "Trust", href: "/trust" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { open } = useDemoDialog();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full max-w-[var(--max)] items-center justify-between gap-4 rounded-[var(--r-chip)] px-4 py-2.5 transition-all duration-[var(--d-std)]",
          scrolled ? "glass" : "border border-transparent",
        )}
        style={
          scrolled ? undefined : { background: "rgba(255,255,255,.35)", backdropFilter: "blur(8px)" }
        }
      >
        <a href="#top" aria-label="PlacedOn home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:bg-white/60 hover:text-[var(--ink)]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="/candidate"
            className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
          >
            Sign in
          </a>
          <Button onClick={() => open("employer")} className="!px-5 !py-2.5 text-[14px]">
            Book a demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
