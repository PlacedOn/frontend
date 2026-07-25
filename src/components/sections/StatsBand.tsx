/**
 * "In numbers" — but honest ones. Placedon is pre-launch, so these are product
 * FACTS (properties of how it works), deliberately not invented traction stats.
 * Big editorial numerals, hairline dividers, no colour.
 */
const FACTS = [
  { n: "25–30", unit: "min", label: "One adaptive conversation — no résumé, no timer." },
  { n: "9", unit: "blocked", label: "Demographic inputs excluded by design (caste, college, gender, age, name…)." },
  { n: "1:1", unit: "trace", label: "Every strength links to one exact moment in the transcript." },
  { n: "0", unit: "shared", label: "Nothing reaches an employer until the candidate approves it." },
];

export function StatsBand() {
  return (
    <section aria-label="How it works, in numbers" className="shell py-[clamp(3.5rem,3rem+3vw,6rem)]">
      <div className="grid gap-x-8 gap-y-10 border-y py-10 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line-2)" }}>
        {FACTS.map((f) => (
          <div key={f.label}>
            <p className="flex items-baseline gap-1.5">
              <span className="text-[clamp(2.4rem,1.8rem+2vw,3.4rem)] font-extrabold tracking-tight text-[var(--ink)]">{f.n}</span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{f.unit}</span>
            </p>
            <p className="mt-2 max-w-[18rem] text-[13.5px] leading-relaxed text-[var(--ink-2)]">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
