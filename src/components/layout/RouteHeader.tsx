"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useDemoDialog } from "@/components/demo/DemoDialogProvider";

/** Compact header for sub-routes: home link + demo CTA. */
export function RouteHeader() {
  const { open } = useDemoDialog();
  return (
    <header className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4" style={{ zIndex: "var(--z-nav)" }}>
      <nav
        aria-label="Main"
        className="glass flex w-full max-w-[var(--max)] items-center justify-between rounded-[var(--r-chip)] px-4 py-2.5"
      >
        <Link href="/" aria-label="Placedon home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] sm:flex"
          >
            <ArrowLeft size={15} /> Home
          </Link>
          <Button onClick={() => open("employer")} className="!px-5 !py-2.5 text-[14px]">
            Book a demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
