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
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboard = role === "employer" ? "/employer" : "/candidate";

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
          scrolled ? undefined : { background: "rgba(255,255,255,.35)", }
        }
      >
        <Link href="/" aria-label="Placedon home">
          <Logo />
        </Link>

        <NavMenu />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={dashboard}
                className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Dashboard
              </Link>
              <AccountMenu />
            </>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 transition-opacity duration-[var(--d-micro)]",
                loading ? "opacity-0" : "opacity-100",
              )}
            >
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:block"
              >
                Log in
              </Link>
              <span className="hidden sm:inline-flex">
                <Button onClick={() => open("employer")} className="!px-5 !py-2.5 text-[14px]">
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
