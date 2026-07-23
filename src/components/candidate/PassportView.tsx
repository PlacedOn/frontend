"use client";

/**
 * Evidence Passport — the candidate's portable, tamper-evident proof. They mint
 * a signed snapshot of the evidence they approved and can share it anywhere; the
 * signature lets anyone verify it's authentic and unaltered. Bands + quotes only,
 * never a person-score. Live backend only (needs the signing key).
 */

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Copy, Check, Loader2, BadgeCheck, ArrowRight } from "lucide-react";
import { v1, V1Error, isLiveBackend, type IssuedPassport, type Band } from "@/lib/v1";

const BAND: Record<Band, { label: string; fg: string }> = {
  supported: { label: "Supported", fg: "#047857" },
  emerging: { label: "Emerging", fg: "#B45309" },
  needs_more_evidence: { label: "Needs more evidence", fg: "var(--ink-3)" },
};

export function PassportView() {
  const live = isLiveBackend();
  const [issued, setIssued] = useState<IssuedPassport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mint = async () => {
    setBusy(true);
    setErr(null);
    try {
      setIssued(await v1.issuePassport());
    } catch (e) {
      setErr(e instanceof V1Error ? e.message : "Could not create your passport.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(issued));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6">
        <p className="text-[14.5px] font-semibold text-[var(--ink)]">Your passport mints once your account is connected.</p>
        <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">
          It&rsquo;s a signed, shareable proof of the evidence you approved — anyone can verify it&rsquo;s authentic and
          unaltered without ever seeing your private interview. It&rsquo;s created from a real, approved report, so there&rsquo;s
          nothing to preview here yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
        A portable, tamper-evident snapshot of the evidence you approved. Share the link; anyone can verify it&rsquo;s real —
        no account, no access to your raw interview. Edit a single band or quote and verification fails.
      </p>

      {!issued ? (
        <button
          type="button"
          onClick={mint}
          disabled={busy}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <BadgeCheck size={16} />} Create my Evidence Passport
        </button>
      ) : (
        <article className="glass rounded-[var(--r-card)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: "rgba(5,150,105,0.12)", color: "#047857" }}>
                <BadgeCheck size={13} /> Signed by Placedon
              </span>
              <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">
                {issued.passport.role_family} · issued {new Date(issued.passport.issued_at).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={copy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
              style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy shareable proof"}
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {issued.passport.evidence.map((ev, i) => (
              <li key={i} className="rounded-[var(--r-btn)] border p-3.5" style={{ borderColor: "var(--glass-line)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-[var(--ink)]">{ev.signal}</span>
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "var(--mist)", color: BAND[ev.band].fg }}>
                    {BAND[ev.band].label}
                  </span>
                </div>
                {ev.quote && <p className="mt-1.5 border-l-2 pl-3 text-[13px] italic text-[var(--ink-2)]" style={{ borderColor: "var(--iris-line)" }}>&ldquo;{ev.quote}&rdquo;</p>}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[12px] text-[var(--ink-3)]">
            Recipients verify authenticity at{" "}
            <Link href="/passport/verify" className="font-semibold" style={{ color: "var(--iris-ink)" }}>
              placedon.com/passport/verify <ArrowRight size={11} className="inline" />
            </Link>
          </p>
        </article>
      )}

      {err && <p className="text-[13px] font-semibold text-[#b91c1c]">{err}</p>}
    </div>
  );
}
