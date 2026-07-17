import { createClient } from "@/lib/supabase/server";
import { DashboardShellClient } from "./DashboardShellClient";
import type { DashboardRole } from "@/lib/dashboardNav";

/**
 * Server wrapper for the logged-in dashboard chrome. Reads the signed-in user
 * (so the sidebar can show identity + sign-out) and hands the client shell the
 * email + role. Anonymous visitors still get the shell with a "Sign in" control.
 */
export async function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardShellClient role={role} email={user?.email ?? null}>
      {children}
    </DashboardShellClient>
  );
}
