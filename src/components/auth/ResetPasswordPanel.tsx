"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowRight, KeyRound, Loader2, Lock } from "lucide-react";
import { updatePassword } from "@/app/login/actions";
import { AuthField } from "./AuthField";
import { BeamRing } from "./BeamRing";
import { cn } from "@/lib/cn";

const MIN_PASSWORD_LENGTH = 8;
type FieldErrors = Partial<Record<"password" | "confirm", string>>;

function validate(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirm !== password) errors.confirm = "Those passwords don't match.";
  return errors;
}

/** Choose a new password. Reached only from a valid recovery link (the page
 *  guards for the recovery session before rendering this). */
export function ResetPasswordPanel() {
  const reduce = useReducedMotion();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const clearField = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const errors = validate(formData);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.values(errors).some(Boolean)) return;

    startTransition(async () => {
      const result = await updatePassword(formData);
      // Success redirects server-side; only an error returns here.
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <section
      aria-labelledby="new-pass-heading"
      className="glass relative w-full min-w-0 overflow-hidden rounded-[var(--r-card)] p-6 sm:p-9"
    >
      <BeamRing />
      <span
        className="grid h-10 w-10 place-items-center rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        <KeyRound size={19} />
      </span>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 0.68, 0.31, 1] }}
      >
        <h2 id="new-pass-heading" className="mt-5 text-[1.45rem]">
          Choose a new password.
        </h2>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Pick something you haven&rsquo;t used here before. Once it&rsquo;s set, we&rsquo;ll take you to your dashboard.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex min-w-0 flex-col gap-4">
          <AuthField
            id="new-password"
            name="password"
            label="New password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={fieldErrors.password}
            onValueChange={() => clearField("password")}
          />
          <AuthField
            id="confirm-password"
            name="confirm"
            label="Confirm password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="Type it again"
            error={fieldErrors.confirm}
            onValueChange={() => clearField("confirm")}
          />

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[var(--r-btn)] border px-3.5 py-3 text-[13.5px] font-medium leading-snug"
              style={{ color: "var(--danger)", borderColor: "rgba(229, 72, 77, 0.35)", background: "rgba(229, 72, 77, 0.07)" }}
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
              background: "linear-gradient(135deg, var(--iris-soft) 0%, var(--iris) 60%, var(--iris-ink) 130%)",
              boxShadow: "var(--shadow-iris), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            {pending ? (
              <>
                <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Saving your password…
              </>
            ) : (
              <>
                Set new password <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-[var(--ink-3)]">
          Changed your mind?{" "}
          <Link href="/login" className="min-h-[44px] font-semibold hover:underline" style={{ color: "var(--iris-ink)" }}>
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
