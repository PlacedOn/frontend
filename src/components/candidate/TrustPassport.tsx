"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, BadgeCheck } from "lucide-react";
import { getHcvReport, type HcvReport } from "@/lib/mock/hcv";
import { HcvRadar } from "@/components/candidate/hcv/HcvRadar";
import { HcvDimensionRow } from "@/components/candidate/hcv/HcvDimensionRow";

export function TrustPassport() {
  const [report, setReport] = useState<HcvReport | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    let active = true;
    getHcvReport().then((d) => {
      if (active) setReport(d);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleVisibility = (index: number) =>
    setReport((prev) =>
      prev
        ? {
            ...prev,
            dimensions: prev.dimensions.map((d, i) =>
              i === index ? { ...d, employerVisible: !d.employerVisible } : d,
            ),
          }
        : prev,
    );

  const dims = report?.dimensions ?? [];
  const overall = report?.overall ?? 0;
  const overallConfidence = Math.round((report?.overallConfidence ?? 0) * 100);
  const hiddenCount = dims.filter((d) => !d.employerVisible).length;

  return (
    <>
      {report?.live && (
        <div className="mb-4 flex items-center gap-2">
          <span className="livedot" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
            Live · from backend
          </span>
        </div>
      )}

      {/* Explainer */}
      <div className="mb-6 rounded-[var(--r-card)] p-5" style={{ background: "var(--iris-ghost)" }}>
        <p className="text-[14px] font-bold text-[var(--ink)]">
          Your interview, turned into a calibrated fingerprint — and you control what employers see.
        </p>
        <ol className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            "Each dimension has a score and a confidence band — how sure we are, not just a number.",
            "Every score links to your own words. Tap a dimension to hide it from employers.",
            "Nothing is shared until you tap Approve.",
          ].map((t, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--iris)" }}>
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </div>

      {/* Fingerprint hero */}
      <div className="glass mb-6 grid gap-6 rounded-[var(--r-card)] p-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
            <BadgeCheck size={14} /> Verified via interview
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,1.2rem+1.6vw,2.2rem)]">
            {report ? `${report.candidateName}` : "Your HCV"}
            {report?.roleContext ? <span className="text-[var(--ink-3)]"> · {report.roleContext}</span> : null}
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-[var(--ink-2)]">{report?.summary}</p>
          <div className="mt-5 flex items-end gap-6">
            <div>
              <p className="font-[var(--font-mono)] text-[34px] font-bold leading-none" style={{ color: "var(--iris-ink)" }}>{overall}</p>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Overall readiness</p>
            </div>
            <div>
              <p className="font-[var(--font-mono)] text-[34px] font-bold leading-none text-[var(--ink)]">{overallConfidence}%</p>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Calibrated confidence</p>
            </div>
          </div>
        </div>

        {dims.length > 0 ? (
          <HcvRadar dimensions={dims} />
        ) : (
          <div className="mx-auto h-[280px] w-[280px] animate-pulse rounded-full" style={{ background: "var(--mist)", opacity: 0.5 }} />
        )}
      </div>

      {/* Dimension rows */}
      <ul className="grid gap-4 md:grid-cols-2">
        {dims.length > 0
          ? dims.map((d, i) => (
              <HcvDimensionRow key={d.id} dim={d} index={i} onToggle={toggleVisibility} delay={i * 0.06} />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="glass h-52 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
            ))}
      </ul>

      {approved ? (
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[var(--r-card)] p-4" style={{ background: "rgba(16,185,129,0.10)" }}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "#059669", color: "#fff" }}>
              <Check size={18} strokeWidth={3} />
            </span>
            <p className="text-[14px] font-semibold" style={{ color: "#047857" }}>
              Profile approved — matched employers can now see the {dims.length - hiddenCount} dimension
              {dims.length - hiddenCount === 1 ? "" : "s"} you left visible.
            </p>
          </div>
          <Link
            href="/candidate/matches"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            View matching roles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setApproved(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            <Check className="h-4 w-4" /> Approve &amp; publish profile
          </button>
          <Link
            href="/pre-interview"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border px-6 py-3.5 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-white"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          >
            Add more signal
          </Link>
        </div>
      )}
    </>
  );
}
