"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { v1, V1Error, isLiveBackend } from "@/lib/v1";

/**
 * Create a job (real /v1/jobs). The first job bootstraps the employer's company
 * (name from `company_name`); after that the field is ignored server-side.
 * On success we route to the Role DNA + Reality Card setup.
 */
export function NewJobForm() {
  const router = useRouter();
  const live = isLiveBackend();
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const job = await v1.createJob({
        title: title.trim(),
        level: level.trim() || null,
        company_name: company.trim() || null,
      });
      router.push(`/employer/jobs/${job.id}/setup`);
    } catch (err) {
      setError(err instanceof V1Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass max-w-xl rounded-[var(--r-card)] p-6 sm:p-8">
      {!live && (
        <p className="mb-5 rounded-[var(--r-btn)] px-4 py-3 text-[13px] leading-relaxed" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to the live API to create real roles.
        </p>
      )}

      <label className="block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Role title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Junior Backend Engineer"
          required
          className="mt-1.5 w-full rounded-[var(--r-btn)] border px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        />
      </label>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Level <span className="text-[var(--ink-3)]">(optional)</span></span>
        <input
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="Junior · 0–3 years"
          className="mt-1.5 w-full rounded-[var(--r-btn)] border px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        />
      </label>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[var(--ink-2)]">Company name <span className="text-[var(--ink-3)]">(first role only)</span></span>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Systems"
          className="mt-1.5 w-full rounded-[var(--r-btn)] border px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--iris)]"
          style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
        />
      </label>

      {error && <p className="mt-4 text-[13px] font-semibold text-[var(--bad)]">{error}</p>}

      <button
        type="submit"
        disabled={busy || !title.trim()}
        className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        {busy ? "Creating…" : "Create role & add Role DNA"} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
