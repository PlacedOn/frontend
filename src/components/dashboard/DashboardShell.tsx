import { DashboardShellClient } from "./DashboardShellClient";
import type { DashboardRole } from "@/lib/dashboardNav";

/**
 * Wrapper for the logged-in dashboard chrome. Handing role to DashboardShellClient
 * which hydrates identity instantly via useAuth() on the client without route delays.
 */
export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  return (
    <DashboardShellClient role={role}>
      {children}
    </DashboardShellClient>
  );
}
