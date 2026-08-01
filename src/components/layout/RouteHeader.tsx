"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";

/** Compact header for sub-routes: home link + demo CTA. */
export function RouteHeader() {
  const { open } = useDemoDialog();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (user) return null;
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled ? "pt-2" : "pt-4 sm:pt-5"
      )}
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full items-center justify-between rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "max-w-[720px] px-3.5 py-1 backdrop-blur-[24px]"
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
        <Link href="/" aria-label="Placedon home" className="flex items-center">
          <Logo size={scrolled ? 21 : 26} />
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className={cn(
              "hidden items-center gap-1.5 rounded-full font-medium text-[var(--ink-2)] transition-all duration-300 hover:bg-[var(--iris-ghost)] hover:text-[var(--ink)] sm:flex",
              scrolled ? "px-2.5 py-1 text-[13px]" : "px-4 py-2 text-[14px]"
            )}
          >
            <ArrowLeft size={scrolled ? 13 : 15} /> Home
          </Link>
          <Button
            onClick={() => open("employer")}
            className={cn(
              "transition-all duration-300",
              scrolled ? "!px-3.5 !py-1 text-[13px]" : "!px-5 !py-2 text-[14px]"
            )}
          >
            Book a demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
