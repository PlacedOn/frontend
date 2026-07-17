import { DashboardShell } from "@/components/dashboard/DashboardShell";

/** Every candidate surface renders inside the glass sidebar shell. */
export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="candidate">{children}</DashboardShell>;
}
