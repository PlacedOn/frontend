import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BeamsField } from "@/components/background/BeamsField";
import { AuthAside } from "@/components/auth/AuthAside";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in — Placedon",
  description:
    "Sign in to Placedon, or create an account. Job seekers and hiring teams each get their own dashboard.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // internal relative paths only (open-redirect guard)
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    redirect(safeNext ?? (profile?.role === "employer" ? "/employer" : "/candidate"));
  }

  return (
    <>
      <BeamsField />
      <main className="relative min-h-[100svh]" style={{ zIndex: "var(--z-base)" }}>
        <div className="shell grid min-h-[100svh] content-center items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.05fr_minmax(0,470px)] lg:gap-16">
          <AuthAside />
          <AuthPanel next={safeNext} />
        </div>
      </main>
    </>
  );
}
