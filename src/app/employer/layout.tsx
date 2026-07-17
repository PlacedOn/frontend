import { DashboardShell } from "@/components/dashboard/DashboardShell";

/** Every team surface renders inside the glass sidebar shell. */
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="employer">{children}</DashboardShell>;
}
