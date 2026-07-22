import type { Metadata } from "next";
import { getDashboardData } from "@/lib/network/queries";
import { NetworkDashboard } from "@/components/network/NetworkDashboard";

export const metadata: Metadata = {
  title: "Your Network — Placedon",
  description:
    "Your proof-of-work home: the skills your evidence covers, the loops still open, and the work you've shipped. Built from what you've done — never followers or likes.",
};

/**
 * The candidate's returning surface. Opens on STATE, not a feed: where your
 * evidence stands, what's still open, and the work behind it. Reads the
 * candidate's own artifacts / progress / coverage history under RLS; the live
 * readiness ring + open loops come from the growth engine, fetched client-side.
 */
export default async function CandidateNetworkPage() {
  const initial = await getDashboardData();
  return <NetworkDashboard initial={initial} />;
}
