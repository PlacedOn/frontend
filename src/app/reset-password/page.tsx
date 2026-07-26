import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LinkIcon } from "lucide-react";
import { BeamsField } from "@/components/background/BeamsField";
import { AuthAside } from "@/components/auth/AuthAside";
import { ResetPasswordPanel } from "@/components/auth/ResetPasswordPanel";
import { BeamRing } from "@/components/auth/BeamRing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password — Placedon",
  description: "Set a new password for your Placedon account.",
};

/**
 * Landing spot after a recovery link. The callback route has already exchanged
 * the code for a short-lived recovery session, so a valid arrival is signed in.
 * No session means the link was missing, expired, or already used — we show a
 * friendly recovery path rather than a dead form.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <BeamsField />
      <main className="relative min-h-[100svh]" style={{ zIndex: "var(--z-base)" }}>
        <div className="shell grid min-h-[100svh] content-center items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.05fr_minmax(0,470px)] lg:gap-16">
          <AuthAside />
          {user ? (
            <ResetPasswordPanel />
          ) : (
            <section
              aria-labelledby="reset-expired-heading"
              className="glass relative w-full min-w-0 overflow-hidden rounded-[var(--r-card)] p-7 sm:p-9"
            >
              <BeamRing />
              <span
                className="grid h-10 w-10 place-items-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", boxShadow: "var(--shadow-iris)" }}
              >
                <LinkIcon size={19} />
              </span>
              <h2 id="reset-expired-heading" className="mt-5 text-[1.5rem]">
                This link has expired.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
                Password-reset links are single-use and time out quickly for your security. Request a fresh one and
                we&rsquo;ll send it straight over.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--r-btn)] px-4 text-[14px] font-semibold transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris-ghost)]"
                style={{ color: "var(--iris-ink)" }}
              >
                Send a new link <ArrowRight size={15} />
              </Link>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
