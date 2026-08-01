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
        scrolled ? "pt-2.5" : "pt-4 sm:pt-5"
      )}
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full items-center justify-between rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "max-w-[790px] px-4 py-1.5 backdrop-blur-[24px]"
            : "max-w-[1140px] px-6 py-2.5 backdrop-blur-[16px]"
        )}
        style={{
          background: scrolled
            ? "linear-gradient(135deg, rgba(243, 236, 255, 0.85) 0%, rgba(234, 224, 255, 0.72) 100%)"
            : "linear-gradient(135deg, rgba(246, 241, 255, 0.65) 0%, rgba(238, 231, 255, 0.50) 100%)",
          border: scrolled
            ? "1px solid rgba(124, 58, 237, 0.22)"
            : "1px solid rgba(139, 92, 246, 0.15)",
          boxShadow: scrolled
            ? "0 10px 30px -8px rgba(105, 34, 245, 0.16), 0 2px 6px -1px rgba(14, 16, 32, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)"
            : "0 4px 20px -4px rgba(105, 34, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        <Link href="/" aria-label="Placedon home" className="flex items-center shrink-0">
          <Logo size={scrolled ? 22 : 26} />
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className={cn(
              "hidden items-center gap-1.5 rounded-full font-medium whitespace-nowrap text-[var(--ink-2)] transition-all duration-300 hover:bg-[var(--iris-ghost)] hover:text-[var(--ink)] sm:flex",
              scrolled ? "px-3 py-1.5 text-[13.5px]" : "px-4 py-2 text-[14px]"
            )}
          >
            <ArrowLeft size={scrolled ? 14 : 15} /> Home
          </Link>
          <Button
            onClick={() => open("employer")}
            className={cn(
              "whitespace-nowrap transition-all duration-300",
              scrolled ? "!px-4 !py-1.5 text-[13.5px]" : "!px-5 !py-2 text-[14px]"
            )}
          >
            Book a demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
