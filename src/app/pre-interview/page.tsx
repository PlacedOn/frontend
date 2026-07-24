import type { Metadata } from "next";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { Footer } from "@/components/sections/Footer";
import { PreInterviewBody } from "@/components/pre-interview/PreInterviewBody";
import { getJobListing } from "@/lib/mock/jobs";

export const metadata: Metadata = {
  title: "Before you start — Placedon",
  description:
    "What to expect before your Placedon interview — 25–30 minutes, no timer, voice or text, and nothing shared until you approve it.",
};

export default async function PreInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const jobId = typeof sp.job === "string" ? sp.job : undefined;
  const listing = jobId ? await getJobListing(jobId) : null;
  const role = listing
    ? { jobId: listing.id, roleFamily: listing.roleFamily, title: listing.title, company: listing.company }
    : undefined;

  return (
    <>
      <AuroraMesh />
      <RouteHeader />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <PreInterviewBody role={role} />
      </main>
      <Footer />
    </>
  );
}
