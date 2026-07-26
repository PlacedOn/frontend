import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BeamsField } from "@/components/background/BeamsField";
import { EmployerAiChat } from "@/components/assistant/EmployerAiChat";

export const metadata: Metadata = {
  title: "Hiring assistant — Placedon",
  description:
    "Describe the work and surface evidence-backed candidates — ranked on evidenced work only, behind a fairness firewall. Never a résumé, a school, or a person-score.",
};

/**
 * The hiring assistant as a first-class, full-screen surface (claude.ai/new
 * pattern) — the employer half of the two-sided core assistant.
 */
export default function EmployerAssistantPage() {
  return (
    <>
      <BeamsField />
      <div className="relative flex min-h-[100svh] flex-col" style={{ zIndex: "var(--z-base)" }}>
        <header className="flex items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Placedon home">
            <Logo />
          </Link>
          <Link
            href="/employer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft size={15} /> Dashboard
          </Link>
        </header>

        <main className="flex flex-1 flex-col px-5 pb-4">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
            <EmployerAiChat />
          </div>
        </main>
      </div>
    </>
  );
}
