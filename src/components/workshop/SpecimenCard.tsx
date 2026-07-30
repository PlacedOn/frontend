"use client";

import { useState } from "react";
import { ShieldCheck, GitBranch } from "lucide-react";

export type Specimen = {
  exNo: string;
  title: string;
  /** Short provenance line — e.g. "Go · verified from GitHub". */
  kind: React.ReactNode;
  sealed: boolean;
  respect: number;
  /** Optional graft: someone built on this specimen. */
  graft?: string;
};

/**
 * A Specimen Card — shipped work as a catalogued, sealed object, not a social
 * post. Warm stock so the eye registers "artifact" vs the cool everyday ground;
 * a wax-seal emblem for verification (never a checkmark-in-a-circle); a specimen
 * number; and reactions that are acknowledgement + collaboration, never a like.
 */
export function SpecimenCard({ exNo, title, kind, sealed, respect, graft }: Specimen) {
  const [respected, setRespected] = useState(false);

  return (
    <article
      className="group cursor-pointer rounded-[16px] border p-4 transition-transform duration-200 hover:-translate-y-1"
      style={{ background: "var(--specimen)", borderColor: "var(--specimen-line)" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-[0.08em] text-[var(--ink-3)]">{exNo}</span>
        {sealed ? (
          <span
            className="grid size-[26px] place-items-center rounded-full text-white"
            style={{ background: "radial-gradient(circle at 32% 30%, var(--iris-soft), var(--iris) 70%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,.4), 0 2px 5px rgba(115, 54, 255,.4)" }}
            title="Sealed — verified evidence"
          >
            <ShieldCheck size={13} aria-hidden />
          </span>
        ) : (
          <span className="grid size-[26px] place-items-center rounded-full border border-dashed" style={{ borderColor: "var(--ink-3)" }} title="Emerging — not yet sealed" />
        )}
      </div>

      <h3 className="mt-3 text-[15px] font-extrabold tracking-tight text-[var(--ink)]">{title}</h3>
      <div className="mt-0.5 text-[12px] text-[var(--ink-2)]">{kind}</div>

      {graft && (
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-dashed pt-2.5 text-[12px] text-[var(--ink-2)]" style={{ borderColor: "var(--specimen-line)" }}>
          <GitBranch size={14} className="text-[var(--iris-ink)]" aria-hidden />
          <b className="font-semibold text-[var(--ink)]">{graft}</b> built on this →
        </div>
      )}

      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setRespected((v) => !v); }}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${respected ? "text-[var(--iris-ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
        >
          <ShieldCheck size={14} aria-hidden /> Respect{" "}
          <b className="tabular-nums">{respect + (respected ? 1 : 0)}</b>
        </button>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          title="Build on it — requires attaching your own related evidence"
        >
          <GitBranch size={14} aria-hidden /> Build on it
        </button>
      </div>
    </article>
  );
}
