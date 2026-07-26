"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "candidate" | "employer";

export type AuthResult = {
  error?: string;
  needsConfirmation?: boolean;
};

const emailSchema = z
  .email("That email address doesn't look quite right.")
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, "Your password needs at least 8 characters.")
  .max(72, "Your password is too long — 72 characters is the limit.");

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(80, "That name is a little long for our records."),
  role: z.enum(["candidate", "employer"], {
    error: "Please choose whether you're job seeking or hiring.",
  }),
});

const forgotSchema = z.object({ email: emailSchema });

const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Those passwords don't match.",
  });

function dashboardFor(role: string | null | undefined): string {
  return role === "employer" ? "/employer" : "/candidate";
}

/** Our own origin, resolved from the request so links are correct per-environment.
 *  Falls back to the configured site URL, then production. */
async function requestOrigin(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://placedon.com";
}

/** Return-to path after auth — internal relative paths only, so a crafted
 *  ?next= can never redirect the user to another origin (open-redirect guard). */
function safeNext(formData: FormData): string | null {
  const n = formData.get("next");
  if (typeof n === "string" && n.startsWith("/") && !n.startsWith("//")) return n;
  return null;
}

async function roleOf(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role ?? null;
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { error: "Please confirm your email first — the link is waiting in your inbox." };
    }
    return { error: "That email or password doesn't look right. Have another go." };
  }

  redirect(safeNext(formData) ?? dashboardFor(await roleOf(supabase, data.user.id)));
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { email, password, fullName, role } = parsed.data;
  const supabase = await createClient();
  // The confirmation link must return to our callback route (which exchanges the
  // code for a session), not Supabase's default Site URL.
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(dashboardFor(role))}`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    if (error.code === "weak_password") {
      return { error: "That password is a bit easy to guess. Try something longer or less common." };
    }
    return { error: "We couldn't create your account just now. Please try again in a moment." };
  }

  // Supabase obfuscates existing accounts: a user with no identities means the email is taken.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  if (data.session) {
    redirect(safeNext(formData) ?? dashboardFor(role));
  }

  return { needsConfirmation: true };
}

/**
 * Send a password-reset email. The link returns to our callback route, which
 * exchanges the code for a short-lived recovery session and forwards to
 * /reset-password where the user sets a new password.
 *
 * Always reports success: revealing whether an email is registered would leak
 * account existence — the same reason signUp obfuscates taken emails.
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const origin = await requestOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  // Deliberately not surfacing any error — success either way (anti-enumeration).
  return { needsConfirmation: true };
}

/**
 * Set a new password. Requires the recovery session established by the callback
 * (the user arrived from a valid reset link). On success they're signed in, so
 * we send them straight to their dashboard.
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") {
      return { error: "Please choose a stronger password that you haven't used here before." };
    }
    return { error: "We couldn't update your password just now. Please try again in a moment." };
  }

  redirect(dashboardFor(await roleOf(supabase, user.id)));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
