import { createClient } from "@/lib/supabase/server";
import { AudienceRegister } from "@/components/audience/AudienceRegister";
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
    /* The audience register for every logged-in surface. `role` is already
       "candidate" | "employer", the exact two values [data-audience] is keyed
       on in globals.css, so the shell is the one place the switch belongs.
       `display: contents` — the wrapper must not generate a box: the shell
       below owns fixed-position chrome, and a real box here would be a new
       containing block waiting to happen. Custom properties still inherit
       through it. */
    <div data-audience={role} className="contents">
      <AudienceRegister audience={role} />
      <DashboardShellClient role={role} email={user?.email ?? null}>
        {children}
      </DashboardShellClient>
    </div>
  );
}
