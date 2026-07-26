import type { Metadata } from "next";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { Footer } from "@/components/sections/Footer";
import { PreInterviewBody } from "@/components/pre-interview/PreInterviewBody";

export const metadata: Metadata = {
  title: "Before you start — Placedon",
  description:
    "What to expect before your Placedon interview — 25–30 minutes, no timer, voice or text, and nothing shared until you approve it.",
};

export default function PreInterviewPage() {
  return (
    <>
      <AuroraMesh />
      <RouteHeader />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <PreInterviewBody />
      </main>
      <Footer />
    </>
  );
}
