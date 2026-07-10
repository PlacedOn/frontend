"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { requestDemo } from "@/lib/api";
import type { DemoRequest } from "@/lib/types";

type Audience = DemoRequest["audience"];
type Status = "idle" | "submitting" | "done" | "error";

const HIRING_VOLUMES = ["1–5 / month", "5–20 / month", "20–50 / month", "50+ / month"];
const ROLE_TYPES = ["Engineering", "Data / ML", "Product", "Design", "Sales", "Operations", "Other"];

const inputStyle = {
  borderColor: "var(--glass-line-hi)",
  background: "rgba(255,255,255,.7)",
} as const;
const inputClass =
  "rounded-xl border px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--iris)]";

const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function DemoForm() {
  const reduce = useReducedMotion();
  const [audience, setAudience] = useState<Audience>("employer");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: DemoRequest = {
      name: String(form.get("name") ?? "").trim(),
      workEmail: String(form.get("workEmail") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      audience,
      hiringVolume: String(form.get("hiringVolume") ?? "").trim() || undefined,
      roleType: String(form.get("roleType") ?? "").trim() || undefined,
      message: String(form.get("message") ?? "").trim() || undefined,
    };

    if (!payload.name || !payload.company || !isEmail(payload.workEmail)) {
      setStatus("error");
      setError("Please add your name, company, and a valid work email.");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      await requestDemo(payload, String(form.get("company_website") ?? ""));
      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <motion.div
        className="glass rounded-[var(--r-card)] p-8 text-center"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full"
          style={{ background: "var(--iris)", color: "#fff", boxShadow: "var(--shadow-iris)" }}
          initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Check size={26} strokeWidth={3} />
        </motion.span>
        <h2 className="text-[1.5rem]">You&rsquo;re on the list.</h2>
        <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          We&rsquo;ll reach out within one business day to set up your Placedon walkthrough.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
        >
          <ArrowLeft size={15} /> Back home
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="glass rounded-[var(--r-card)] p-7">
      {/* Honeypot: hidden from humans; bots that fill it are dropped server-side. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div
        className="grid grid-cols-2 gap-1.5 rounded-full p-1"
        style={{ background: "var(--mist)" }}
        role="tablist"
        aria-label="I am"
      >
        {(["employer", "candidate"] as Audience[]).map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={audience === a}
            onClick={() => setAudience(a)}
            className="cursor-pointer rounded-full py-2 text-[13.5px] font-semibold transition-colors"
            style={
              audience === a
                ? { background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--ink-2)" }
            }
          >
            {a === "employer" ? "I'm hiring" : "I'm a candidate"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Full name</span>
          <input name="name" required autoComplete="name" className={inputClass} style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Work email</span>
          <input name="workEmail" type="email" required autoComplete="email" className={inputClass} style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Company</span>
          <input name="company" required autoComplete="organization" className={inputClass} style={inputStyle} />
        </label>

        {audience === "employer" && (
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Hiring volume</span>
              <select name="hiringVolume" defaultValue="" className={`${inputClass} cursor-pointer`} style={inputStyle}>
                <option value="" disabled>
                  Select…
                </option>
                {HIRING_VOLUMES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Role type</span>
              <select name="roleType" defaultValue="" className={`${inputClass} cursor-pointer`} style={inputStyle}>
                <option value="" disabled>
                  Select…
                </option>
                {ROLE_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-[var(--ink-2)]">
            Anything specific? <span className="text-[var(--ink-3)]">(optional)</span>
          </span>
          <textarea
            name="message"
            rows={3}
            className={`${inputClass} resize-none`}
            style={inputStyle}
            placeholder={
              audience === "employer"
                ? "Tell us about the roles you're hiring for…"
                : "Tell us what you're looking for…"
            }
          />
        </label>

        {status === "error" && (
          <p role="alert" className="text-[13px]" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-1 inline-flex min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[15px] font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving request…
            </>
          ) : (
            "Request my walkthrough"
          )}
        </button>
        <p className="text-center text-[12px] text-[var(--ink-3)]">
          No spam. We only use this to schedule your demo.
        </p>
      </div>
    </form>
  );
}
