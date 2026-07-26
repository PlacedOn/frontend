/**
 * How it works — three plain steps. Numbers and words, no icons, no cards
 * competing for attention. Reads like a person explaining it once, clearly.
 */

const STEPS = [
  {
    n: "01",
    title: "One interview",
    body: "A 20-minute conversation that adapts to how you think. No trick questions, no whiteboard theatre — just a real problem and a real discussion.",
  },
  {
    n: "02",
    title: "Evidence, not a score",
    body: "We turn your answers into specific, quoted evidence of what you can do. Never a single number that flattens a person into a rank.",
  },
  {
    n: "03",
    title: "Introductions you approve",
    body: "Employers see the evidence that fits their role. You decide who gets an introduction — nothing is shared until you say so.",
  },
] as const;

export function PaperSteps() {
  return (
    <section id="how" className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <h2 className="max-w-xl text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] font-bold leading-tight tracking-[-0.02em]">
        How it works
      </h2>

      <div className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n}>
            <p className="font-mono text-[13px] font-medium text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
              {s.n}
            </p>
            <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">{s.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
