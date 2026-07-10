import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ArrowRight, ExternalLink } from "lucide-react";

/** Key-facts strip at the top of a trust document. */
export function KeyFacts({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((f) => (
        <div key={f.label} className="glass rounded-[var(--r-card)] p-5">
          <p className="font-[var(--font-display)] text-[1.5rem] font-bold leading-none" style={{ color: "var(--iris-ink)" }}>
            {f.value}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-[var(--ink-3)]">{f.label}</p>
        </div>
      ))}
    </div>
  );
}

/** A titled prose section. */
export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-11">
      <h2 className="text-[clamp(1.35rem,1.1rem+1vw,1.7rem)]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{children}</div>
    </section>
  );
}

/** Check-marked list of points. */
export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">
          <Check size={17} className="mt-0.5 shrink-0" style={{ color: "var(--iris-ink)" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Highlighted "what Placedon does" panel. */
export function PlacedonPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass mt-6 rounded-[var(--r-card)] p-6" style={{ boxShadow: "0 0 0 1.5px var(--iris-soft), var(--shadow-md)" }}>
      <h3 className="font-[var(--font-display)] text-[1.15rem] font-semibold text-[var(--ink)]">{title}</h3>
      <div className="mt-3 flex flex-col gap-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{children}</div>
    </div>
  );
}

const TRUST_PAGES = [
  { href: "/trust/scoring", label: "How scoring works" },
  { href: "/trust/ll144", label: "NYC Local Law 144" },
  { href: "/trust/eu-ai-act", label: "EU AI Act" },
  { href: "/trust/contest", label: "Contest a trait" },
];

/** Sources, disclaimer, and cross-links. */
export function TrustFooterBlock({
  current,
  sources,
}: {
  current: string;
  sources?: { label: string; href: string }[];
}) {
  return (
    <div className="mt-16 border-t pt-8" style={{ borderColor: "var(--glass-line)" }}>
      {sources && sources.length > 0 && (
        <div className="mb-7">
          <p className="eyebrow">Primary sources</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--iris-ink)] hover:underline"
                >
                  {s.label} <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--ink-3)]">
        This page explains our approach in plain language for candidates and hiring teams. It is a
        summary, not legal advice — employers should confirm their own obligations with counsel.
        Last reviewed July&nbsp;2026.
      </p>
      <div className="mt-7 flex flex-wrap gap-2.5">
        {TRUST_PAGES.filter((p) => p.href !== current).map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
            style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
          >
            {p.label} <ArrowRight size={13} />
          </Link>
        ))}
      </div>
    </div>
  );
}
