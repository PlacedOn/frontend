"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { MobileMenu } from "@/components/sections/MobileMenu";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "For teams", href: "/companies" },
  { label: "For candidates", href: "/candidates" },
  { label: "Trust", href: "/trust" },
];

/**
 * Top navigation — a calm bar, not a floating glass pill. Transparent over the
 * hero, then a plain paper background with a single hairline once you scroll.
 * Plain text links, no dropdowns: fewer clicks, nothing to decode.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { open } = useDemoDialog();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboard = role === "employer" ? "/employer" : "/candidate";

  return (
    <header
      className="fixed inset-x-0 top-0 transition-colors duration-[var(--d-std)]"
      style={{
        zIndex: "var(--z-nav)",
        background: scrolled ? "var(--porcelain)" : "transparent",
        borderBottom: `1px solid ${scrolled ? "var(--glass-line)" : "transparent"}`,
      }}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Placedon home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={dashboard}
                className="hidden text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Dashboard
              </Link>
              <AccountMenu />
            </>
          ) : (
            <div
              className="flex items-center gap-3 transition-opacity duration-[var(--d-micro)]"
              style={{ opacity: loading ? 0 : 1 }}
            >
              <Link
                href="/login"
                className="hidden text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Log in
              </Link>
              <span className="hidden sm:inline-flex">
                <Button onClick={() => open("employer")} className="!px-4 !py-2 text-[14px]">
                  Book a demo
                </Button>
              </span>
            </div>
          )}

          <MobileMenu
            links={LINKS}
            isSignedIn={!!user}
            dashboardHref={dashboard}
            onBookDemo={() => open("employer")}
          />
        </div>
      </div>
    </header>
  );
}
