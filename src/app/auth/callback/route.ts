import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-confirmation / magic-link callback. Supabase's confirmation link lands
 * here; we exchange the one-time code (PKCE flow) — or verify a token_hash
 * (implicit flow) — for a session cookie, then send the user to their dashboard.
 * Without this handler the confirmation link has nowhere valid to land and fails.
 *
 * NOTE: the URL of this route must be added to Supabase → Auth → URL
 * Configuration → Redirect URLs (e.g. https://placedon.com/auth/callback), and
 * the same origin set as the Site URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (!ok) {
    // Friendly failure — the token was missing, expired, or already used.
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  // Resolve the destination: an explicit ?next, else the role's dashboard.
  let dest = next;
  if (!dest) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let role: string | null = null;
    if (user) {
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const metaRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null;
      role = data?.role ?? metaRole;
    }
    dest = role === "employer" ? "/employer" : "/candidate";
  }

  return NextResponse.redirect(`${origin}${dest}`);
}
