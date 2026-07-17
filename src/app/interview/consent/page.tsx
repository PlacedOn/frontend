import type { Metadata } from "next";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { Footer } from "@/components/sections/Footer";
import { ConsentGate } from "@/components/interview/ConsentGate";

export const metadata: Metadata = {
  title: "Your consent — Placedon",
  description: "Review exactly what's recorded and how it's assessed, then consent to begin. Nothing starts until you agree.",
};

export default async function InterviewConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; job?: string }>;
}) {
  const { role, job } = await searchParams;
  return (
    <>
      <AuroraMesh />
      <RouteHeader />
      <main className="relative flex min-h-[70vh] items-center px-5 py-16" style={{ zIndex: "var(--z-base)" }}>
        <div className="mx-auto w-full">
          <ConsentGate roleFamily={role || undefined} jobId={job || null} />
        </div>
      </main>
      <Footer />
    </>
  );
}
