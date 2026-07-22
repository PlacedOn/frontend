import type { Metadata } from "next";
import { getDashboardData } from "@/lib/network/queries";
import { WorkshopHome } from "@/components/workshop/WorkshopHome";

export const metadata: Metadata = {
  title: "Your Workshop — Placedon",
  description:
    "Your work speaks for you. A readiness ring assembled from real, verified proofs — and the specimens behind it. Built from what you've done, not what you claim.",
};

/** The Workshop — the new candidate home (Fable "your work speaks" direction). */
export default async function CandidateWorkshopPage() {
  const initial = await getDashboardData();
  return <WorkshopHome initial={initial} />;
}
