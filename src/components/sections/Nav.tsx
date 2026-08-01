"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { MobileMenu } from "@/components/sections/MobileMenu";
import { NavMenu } from "@/components/sections/NavMenu";
import { cn } from "@/lib/cn";

// Flat list for the mobile drawer; desktop uses NavMenu's richer dropdowns.
const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "For teams", href: "/companies" },
  { label: "For candidates", href: "/candidates" },
  { label: "Trust", href: "/trust" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { open } = useDemoDialog();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboard = role === "employer" ? "/employer" : "/candidate";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled ? "pt-2.5" : "pt-4 sm:pt-5"
      )}
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "max-w-[850px] px-4 py-1.5 backdrop-blur-[24px]"
            : "max-w-[1140px] px-6 py-2.5 backdrop-blur-[16px]"
        )}
        style={{
          background: scrolled
            ? "linear-gradient(135deg, rgba(243, 237, 255, 0.94) 0%, rgba(233, 223, 255, 0.88) 100%)"
            : "linear-gradient(135deg, rgba(248, 244, 255, 0.82) 0%, rgba(240, 233, 255, 0.72) 100%)",
          border: scrolled
            ? "1px solid rgba(105, 34, 245, 0.28)"
            : "1px solid rgba(124, 58, 237, 0.18)",
          boxShadow: scrolled
            ? "0 12px 36px -10px rgba(105, 34, 245, 0.22), 0 4px 14px -2px rgba(14, 16, 32, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.85)"
            : "0 4px 20px -4px rgba(105, 34, 245, 0.10), 0 2px 8px -1px rgba(14, 16, 32, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.65)",
        }}
      >
        {/* Left column: Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" aria-label="Placedon home" className="flex items-center">
            <Logo size={scrolled ? 24 : 26} />
          </Link>
        </div>

        {/* Center column: Nav menu */}
        <div className="hidden items-center justify-center md:flex">
          <NavMenu />
        </div>

        {/* Right column: Auth & CTA actions */}
        <div className="flex items-center justify-end gap-2">
          {user ? (
            <>
              <Link
                href={dashboard}
                className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--iris-ghost)] hover:text-[var(--ink)] sm:block"
              >
                Dashboard
              </Link>
              <AccountMenu />
            </>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 transition-opacity duration-[var(--d-micro)]",
                loading ? "opacity-0" : "opacity-100"
              )}
            >
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--iris-ghost)] hover:text-[var(--ink)] sm:block"
              >
                Log in
              </Link>
              <span className="hidden sm:inline-flex">
                <Button
                  onClick={() => open("employer")}
                  className={cn(
                    "transition-all duration-300",
                    scrolled ? "!px-4 !py-1.5 text-[13.5px]" : "!px-5 !py-2 text-[14px]"
                  )}
                >
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
      </nav>
    </header>
  );
}
