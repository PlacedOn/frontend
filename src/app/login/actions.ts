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

function dashboardFor(role: string | null | undefined): string {
  return role === "employer" ? "/employer" : "/candidate";
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
  // code for a session), not Supabase's default Site URL. Origin comes from the
  // request so it's correct in every environment.
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://placedon.com";
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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
