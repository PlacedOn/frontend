"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, MailCheck, UserRound } from "lucide-react";
import { signIn, signUp, type Role } from "@/app/login/actions";
import { AuthField } from "./AuthField";
import { BeamRing } from "./BeamRing";
import { RolePicker } from "./RolePicker";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";
type FieldErrors = Partial<Record<"fullName" | "email" | "password", string>>;

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "signin", label: "Sign in" },
  { id: "signup", label: "Create account" },
];

function validate(formData: FormData, mode: Mode): FieldErrors {
  const errors: FieldErrors = {};
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (mode === "signup") {
    const fullName = String(formData.get("fullName") ?? "").trim();
    if (fullName.length < 2) errors.fullName = "Please tell us your name.";
  }
  if (!EMAIL_RE.test(email)) errors.email = "That email address doesn't look quite right.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return errors;
}

/** Sign in / create account panel with the candidate–employer role fork. */
export function AuthPanel({ next }: { next?: string }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("candidate");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    setFormError(null);
  };

  const clearField = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    if (next) formData.set("next", next); // return to where the journey left off
    const errors = validate(formData, mode);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.values(errors).some(Boolean)) return;

    startTransition(async () => {
      const result = mode === "signin" ? await signIn(formData) : await signUp(formData);
      if (result?.error) {
        setFormError(result.error);
      } else if (result?.needsConfirmation) {
        setConfirmEmail(String(formData.get("email") ?? "").trim());
      }
    });
  };

  if (confirmEmail) {
    return (
      <section
        aria-labelledby="auth-confirm-heading"
        className="glass relative w-full min-w-0 overflow-hidden rounded-[var(--r-card)] p-7 sm:p-9"
      >
        <BeamRing />
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl text-white"
          style={{
            background: "linear-gradient(135deg, var(--iris-soft), var(--iris))",
            boxShadow: "var(--shadow-iris)",
          }}
        >
          <MailCheck size={22} />
        </span>
        <h2 id="auth-confirm-heading" className="mt-5 text-[1.5rem]">
          Check your inbox.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
          We&rsquo;ve sent a confirmation link to{" "}
          <strong className="font-semibold text-[var(--ink)]">{confirmEmail}</strong>. Follow it,
          then sign in and we&rsquo;ll take you straight to your dashboard.
        </p>
        <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">
          Nothing arrived after a couple of minutes? Check spam, or sign up again with the same
          email.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmEmail(null);
            switchMode("signin");
          }}
          className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--r-btn)] px-4 text-[14px] font-semibold transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris-ghost)]"
          style={{ color: "var(--iris-ink)" }}
        >
          Back to sign in <ArrowRight size={15} />
        </button>
      </section>
    );
  }

  const isSignup = mode === "signup";

  return (
    <section
      aria-labelledby="auth-heading"
      className="glass relative w-full min-w-0 overflow-hidden rounded-[var(--r-card)] p-6 sm:p-9"
    >
      <BeamRing />

      {/* mode toggle */}
      <div
        aria-label="Sign in or create account"
        className="relative grid grid-cols-2 rounded-[var(--r-chip)] p-1"
        style={{
          background: "var(--mist)",
          boxShadow: "inset 0 1px 3px rgba(14, 16, 32, 0.07)",
        }}
      >
        {MODES.map(({ id, label }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => switchMode(id)}
              className={cn(
                "relative min-h-[44px] rounded-[var(--r-chip)] px-3 text-[13.5px] font-semibold tracking-[0.01em] transition-colors duration-[var(--d-micro)]",
                active ? "text-[var(--ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink-2)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="auth-mode-pill"
                  transition={
                    reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-[var(--r-chip)]"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF, rgba(255,255,255,0.92))",
                    border: "1px solid var(--glass-line)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={mode}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 0.68, 0.31, 1] }}
      >
        <h2 id="auth-heading" className="mt-7 text-[1.45rem]">
          {isSignup ? "Create your account." : "Welcome back."}
        </h2>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          {isSignup
            ? "Tell us who you are, and we'll set up the right side of the table."
            : "Sign in and we'll take you straight to your dashboard."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex min-w-0 flex-col gap-4">
          {isSignup && (
            <>
              <RolePicker value={role} onChange={setRole} />
              <input type="hidden" name="role" value={role} />
              <AuthField
                id="auth-name"
                name="fullName"
                label="Full name"
                icon={UserRound}
                autoComplete="name"
                placeholder="Priya Sharma"
                error={fieldErrors.fullName}
                onValueChange={() => clearField("fullName")}
              />
            </>
          )}

          <AuthField
            id="auth-email"
            name="email"
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@work.com"
            error={fieldErrors.email}
            onValueChange={() => clearField("email")}
          />
          <AuthField
            id="auth-password"
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            error={fieldErrors.password}
            onValueChange={() => clearField("password")}
          />

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[var(--r-btn)] border px-3.5 py-3 text-[13.5px] font-medium leading-snug"
              style={{
                color: "var(--danger)",
                borderColor: "rgba(229, 72, 77, 0.35)",
                background: "rgba(229, 72, 77, 0.07)",
              }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={cn(
              "group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[var(--r-btn)] text-[15px] font-semibold text-white transition-[opacity,transform,box-shadow] duration-[var(--d-micro)]",
              pending ? "cursor-wait opacity-80" : "cursor-pointer hover:-translate-y-px",
            )}
            style={{
              background:
                "linear-gradient(135deg, var(--iris-soft) 0%, var(--iris) 60%, var(--iris-ink) 130%)",
              boxShadow: "var(--shadow-iris), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            {/* hover sheen — transform-only */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-full motion-reduce:hidden"
              style={{
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
              }}
            />
            {pending ? (
              <>
                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                {isSignup ? "Creating your account…" : "Signing you in…"}
              </>
            ) : (
              <>
                {isSignup ? "Create account" : "Sign in"} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-[var(--ink-3)]">
          {isSignup ? "Already have an account? " : "New to Placedon? "}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? "signin" : "signup")}
            className="min-h-[44px] font-semibold hover:underline"
            style={{ color: "var(--iris-ink)" }}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>

        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
          <p className="text-center text-[12.5px] leading-relaxed text-[var(--ink-3)]">
            Free for candidates. You control what employers see.{" "}
            <Link
              href="/trust"
              className="font-medium underline decoration-[var(--iris-line)] underline-offset-2 transition-colors duration-[var(--d-micro)] hover:text-[var(--iris-ink)]"
            >
              Read how we handle your data
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </section>
  );
}
