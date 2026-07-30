"use client";

/**
 * Public passport verifier — anyone (an employer, a recruiter) pastes a shared
 * Evidence Passport and confirms it's authentic and unaltered. No account, and no
 * private candidate data is exposed by verifying. A single edited band or quote
 * fails the check.
 */

import { useState } from "react";
import { CircleCheck, CircleX, Loader2, ShieldCheck } from "lucide-react";
import { verifyPassport, type Passport, type PassportVerifyResult, type Band } from "@/lib/v1";

const BAND_LABEL: Record<Band, string> = {
  supported: "Supported",
  emerging: "Emerging",
  needs_more_evidence: "Needs more evidence",
};

export function PassportVerify() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<PassportVerifyResult | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setErr(null);
    setResult(null);
    setPassport(null);
    let parsed: { passport?: Passport; signature?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      setErr("That doesn't look like valid passport JSON.");
      return;
    }
    if (!parsed?.passport || !parsed?.signature) {
      setErr("Paste the full shareable proof — it must include both the passport and its signature.");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyPassport(parsed.passport, parsed.signature);
      setResult(res);
      setPassport(parsed.passport);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={6}
        placeholder='Paste the shared proof here — the JSON with "passport" and "signature".'
        className="w-full rounded-[var(--r-card)] border p-4 font-mono text-[12.5px] outline-none focus:border-[var(--iris)]"
        style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
      />
      <button
        type="button"
        onClick={run}
        disabled={busy || !raw.trim()}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={16} />} Verify authenticity
      </button>

      {err && <p className="text-[13.5px] font-semibold text-[var(--bad)]">{err}</p>}

      {result && (
        <div
          className="rounded-[var(--r-card)] p-5"
          style={{ background: result.valid ? "rgba(5,150,105,0.10)" : "rgba(185,28,28,0.08)", border: `1px solid ${result.valid ? "rgba(5,150,105,0.3)" : "rgba(185,28,28,0.3)"}` }}
        >
          <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: result.valid ? "var(--ok)" : "var(--bad)" }}>
            {result.valid ? <CircleCheck size={18} /> : <CircleX size={18} />}
            {result.valid ? "Authentic & unaltered" : "Not authentic / altered"}
          </p>
          <p className="mt-1 text-[13px] text-[var(--ink-2)]">{result.reason}</p>
          {result.valid && (
            <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">
              Issued by {result.issuer} · {result.role_family} · {result.evidence_count} evidence item(s)
              {result.issued_at ? ` · ${new Date(result.issued_at).toLocaleDateString()}` : ""}
            </p>
          )}

          {result.valid && passport && (
            <ul className="mt-4 flex flex-col gap-2">
              {passport.evidence.map((ev, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-[var(--r-btn)] bg-white/60 px-3 py-2">
                  <span className="text-[13.5px] font-semibold text-[var(--ink)]">{ev.signal}</span>
                  <span className="text-[11.5px] font-bold text-[var(--ink-3)]">{BAND_LABEL[ev.band]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
