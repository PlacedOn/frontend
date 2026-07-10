import type { Metadata } from "next";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { Footer } from "@/components/sections/Footer";
import { CandidateDashboard } from "@/components/candidate/CandidateDashboard";
import { DASHBOARD_MODES, type CandidateDashboardMode } from "@/lib/mock/candidate";

export const metadata: Metadata = {
  title: "Your Placedon — Candidate dashboard",
  description: "One clear next action. Your interview, your profile, your visibility — always in your control.",
};

function resolveMode(value: string | string[] | undefined): CandidateDashboardMode {
  const v = Array.isArray(value) ? value[0] : value;
  return DASHBOARD_MODES.includes(v as CandidateDashboardMode)
    ? (v as CandidateDashboardMode)
    : "profile_review_required";
}

export default async function CandidatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;

  return (
    <>
      <AuroraMesh />
      <RouteHeader />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <section className="shell pt-32 pb-24 md:pt-36">
          <CandidateDashboard mode={resolveMode(mode)} />
        </section>
      </main>
      <Footer />
    </>
  );
}
