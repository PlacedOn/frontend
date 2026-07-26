"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/login/actions";
import { AuthField } from "./AuthField";
import { BeamRing } from "./BeamRing";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Request a password-reset link. Mirrors the sign-in panel's language and glass. */
export function ForgotPasswordPanel() {
  const reduce = useReducedMotion();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setFormError(null);
    if (!EMAIL_RE.test(email)) {
      setEmailError("That email address doesn't look quite right.");
      return;
    }
    setEmailError(undefined);

    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setSentTo(email);
      }
    });
  };

  if (sentTo) {
    return (
      <section
        aria-labelledby="reset-sent-heading"
        className="glass relative w-full min-w-0 overflow-hidden rounded-[var(--r-card)] p-7 sm:p-9"
      >
        <BeamRing />
        <span
          className="grid h-10 w-10 place-items-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, var(--iris-soft), var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          <MailCheck size={19} />
        </span>
        <h2 id="reset-sent-heading" className="mt-5 text-[1.5rem]">
          Check your inbox.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
          If an account exists for{" "}
          <strong className="font-semibold text-[var(--ink)]">{sentTo}</strong>, we&rsquo;ve sent a link to reset your
          password. Follow it and you&rsquo;ll be able to choose a new one.
        </p>
        <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">
          The link expires shortly, so use it soon. Nothing after a couple of minutes? Check spam, or try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--r-btn)] px-4 text-[14px] font-semibold transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris-ghost)]"
          style={{ color: "var(--iris-ink)" }}
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="reset-heading"
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
        <h2 id="reset-heading" className="mt-5 text-[1.45rem]">
          Reset your password.
        </h2>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          Enter the email you signed up with and we&rsquo;ll send you a link to set a new password.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex min-w-0 flex-col gap-4">
          <AuthField
            id="reset-email"
            name="email"
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@work.com"
            error={emailError}
            onValueChange={() => setEmailError(undefined)}
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
                <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Sending your link…
              </>
            ) : (
              <>
                Send reset link <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[13.5px] text-[var(--ink-3)]">
          Remembered it?{" "}
          <Link href="/login" className="min-h-[44px] font-semibold hover:underline" style={{ color: "var(--iris-ink)" }}>
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
