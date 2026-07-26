import type { Metadata } from "next";
import { BeamsField } from "@/components/background/BeamsField";
import { AuthAside } from "@/components/auth/AuthAside";
import { ForgotPasswordPanel } from "@/components/auth/ForgotPasswordPanel";

export const metadata: Metadata = {
  title: "Reset password — Placedon",
  description: "Request a link to reset your Placedon password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <BeamsField />
      <main className="relative min-h-[100svh]" style={{ zIndex: "var(--z-base)" }}>
        <div className="shell grid min-h-[100svh] content-center items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.05fr_minmax(0,470px)] lg:gap-16">
          <AuthAside />
          <ForgotPasswordPanel />
        </div>
      </main>
    </>
  );
}
