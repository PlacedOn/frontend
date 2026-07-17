import type { Band, FitBand, GapSeverity } from "@/lib/v1";

/** Copy used everywhere a readiness % appears. Coverage of public requirements — never selection odds. */
export const READINESS_NOTE =
  "How much of this role's public requirements your evidence covers — not a chance of selection.";

export const FIT_BAND_LABEL: Record<FitBand, string> = {
  strong_fit: "Strong evidence fit",
  developing_fit: "Developing fit",
  stretch: "Stretch direction",
};

const FIT_BAND_STYLE: Record<FitBand, { bg: string; fg: string }> = {
  strong_fit: { bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  developing_fit: { bg: "rgba(139,84,255,0.10)", fg: "var(--iris-ink)" },
  stretch: { bg: "var(--mist)", fg: "var(--ink-3)" },
};

export function FitBandChip({ band }: { band: FitBand }) {
  const s = FIT_BAND_STYLE[band];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      {FIT_BAND_LABEL[band]}
    </span>
  );
}

const SEVERITY_STYLE: Record<GapSeverity, { label: string; bg: string; fg: string }> = {
  critical: { label: "Unlocks the most", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
  important: { label: "Important", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  nice_to_have: { label: "Nice to have", bg: "var(--mist)", fg: "var(--ink-3)" },
};

export function SeverityChip({ severity }: { severity: GapSeverity }) {
  const s = SEVERITY_STYLE[severity];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

export const BAND_LABEL: Record<Band, string> = {
  supported: "Evidenced",
  emerging: "Emerging",
  needs_more_evidence: "To build",
};

/** Small colored dot encoding evidence strength. */
export function BandDot({ band }: { band: Band }) {
  const style =
    band === "supported"
      ? { background: "var(--iris)", boxShadow: "0 0 0 3px var(--iris-ghost)" }
      : band === "emerging"
        ? { background: "var(--iris-soft)", opacity: 0.75 }
        : { background: "transparent", border: "1.5px dashed var(--ink-3)" };
  return <span aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={style} />;
}

/** Tiny mono transparency tag: session turn + encoder similarity, never hidden. */
export function EvidenceRef({ sessionRef, similarity }: { sessionRef: string | null; similarity: number | null }) {
  if (!sessionRef && similarity == null) return null;
  return (
    <span
      className="whitespace-nowrap text-[10.5px] font-medium text-[var(--ink-3)]"
      style={{ fontFamily: "var(--font-mono)" }}
      title="Where this evidence came from in your interview, and the encoder match score"
    >
      {sessionRef}
      {sessionRef && similarity != null && " · "}
      {similarity != null && `match ${similarity.toFixed(2)}`}
    </span>
  );
}
