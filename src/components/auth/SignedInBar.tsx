import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

/**
 * Server component: shows who is signed in, with a sign-out control.
 * Renders nothing for anonymous visitors, so public previews stay untouched.
 */
export async function SignedInBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="chip min-w-0">
        <span className="truncate">
          Signed in as{" "}
          <strong className="font-semibold text-[var(--ink)]">{user.email}</strong>
        </span>
      </p>
      <SignOutButton />
    </div>
  );
}
