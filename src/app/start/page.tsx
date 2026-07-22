import type { Metadata } from "next";
import Link from "next/link";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { Logo } from "@/components/brand/Logo";
import { CandidateOnboarding } from "@/components/onboarding/CandidateOnboarding";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Welcome — Placedon",
  description:
    "Start with what you've actually done. One honest conversation becomes evidence only you control — no resume, no forms.",
};

/** First-run onboarding. Focused chrome (no dashboard sidebar) so the one job —
 *  begin — is the only thing on screen. Personalizes if a session exists, but
 *  never blocks on it. */
export default async function StartPage() {
  let firstName: string | undefined;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const full = (data.user?.user_metadata?.full_name as string | undefined) ?? "";
    firstName = full.trim().split(" ")[0] || undefined;
  } catch {
    firstName = undefined;
  }

  return (
    <>
      <AuroraMesh />
      <header className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4" style={{ zIndex: "var(--z-nav)" }}>
        <nav aria-label="Main" className="glass flex w-full max-w-[var(--max)] items-center justify-between rounded-[var(--r-chip)] px-4 py-2.5">
          <Link href="/" aria-label="Placedon home">
            <Logo />
          </Link>
          <Link href="/candidate" className="text-[13.5px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]">
            Skip for now
          </Link>
        </nav>
      </header>

      <main className="relative flex min-h-screen items-center px-5 py-28" style={{ zIndex: "var(--z-base)" }}>
        <CandidateOnboarding firstName={firstName} />
      </main>
    </>
  );
}
