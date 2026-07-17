"use client";

import { useState } from "react";
import { Search, ShieldAlert, Quote, ArrowRight } from "lucide-react";
import { v1, V1Error, isLiveBackend, type CopilotResponse, type Band } from "@/lib/v1";

const BAND_FG: Record<Band, string> = {
  supported: "#047857",
  emerging: "var(--iris-ink)",
  needs_more_evidence: "#B45309",
};
const BAND_LABEL: Record<Band, string> = {
  supported: "Supported",
  emerging: "Emerging",
  needs_more_evidence: "Needs more",
};

export function CopilotSearch() {
  const live = isLiveBackend();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (prompt.trim().length < 3) return;
    setBusy(true);
    setError(null);
    setRes(null);
    try {
      setRes(await v1.copilotSearch(prompt.trim()));
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass rounded-[var(--r-card)] p-5">
        {!live && (
          <p className="mb-4 rounded-[var(--r-btn)] px-4 py-3 text-[13px]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to search.
          </p>
        )}
        <label className="text-[13px] font-semibold text-[var(--ink-2)]">Describe the work — skills and behaviors, not identity</label>
        <div className="mt-2 flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="junior backend who can debug production payment issues, hybrid Bengaluru"
            className="flex-1 rounded-[var(--r-btn)] border px-4 py-3 text-[14px] outline-none focus:border-[var(--iris)]"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          />
          <button type="button" onClick={run} disabled={busy || prompt.trim().length < 3} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-5 text-[14px] font-bold text-white disabled:opacity-50" style={{ background: "var(--iris)" }}>
            <Search size={16} /> {busy ? "…" : "Search"}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-[var(--ink-3)]">Protected-class filters are refused; prestige/pedigree terms are stripped. Every result is backed by the candidate&rsquo;s own approved, quoted evidence.</p>
      </div>

      {error && <p className="text-[13px] font-semibold text-[#b91c1c]">{error}</p>}

      {res?.outcome === "refused" && (
        <div className="rounded-[var(--r-card)] p-5" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}>
          <p className="flex items-start gap-2 text-[14px] font-semibold text-[#b91c1c]">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" /> {res.refusal_reason}
          </p>
        </div>
      )}

      {res && res.outcome !== "refused" && (
        <>
          {(res.chips.length > 0 || res.stripped_terms.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {res.chips.map((c) => (
                <span key={c} className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>{c}</span>
              ))}
              {res.stripped_terms.map((s) => (
                <span key={s} className="rounded-full px-3 py-1 text-[12px] font-semibold line-through" style={{ background: "var(--mist)", color: "var(--ink-3)" }} title="Removed — PlacedOn doesn't filter on this">{s}</span>
              ))}
            </div>
          )}

          {res.results.length === 0 && (
            <p className="text-[14px] text-[var(--ink-2)]">No candidates with approved evidence match yet.</p>
          )}

          {res.results.map((r) => (
            <div key={r.candidate_id} className="glass rounded-[var(--r-card)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>Candidate · {r.candidate_id.slice(0, 8)}{r.role_family ? ` · ${r.role_family}` : ""}</p>
              </div>
              <ul className="mt-3 space-y-2.5">
                {r.cited.map((c, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold" style={{ color: BAND_FG[c.band] }}>{BAND_LABEL[c.band]}</span>
                      <span className="text-[14px] font-semibold">{c.claim}</span>
                    </div>
                    {c.quote && (
                      <blockquote className="mt-1 flex gap-2 rounded-[var(--r-btn)] border-l-2 px-3 py-1.5 text-[13px] italic text-[var(--ink-2)]" style={{ borderColor: "var(--iris)", background: "var(--glass)" }}>
                        <Quote size={13} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />{c.quote}
                      </blockquote>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
                <ArrowRight size={14} className="mt-0.5 shrink-0" /> {r.follow_up}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
