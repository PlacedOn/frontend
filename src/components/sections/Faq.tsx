/**
 * Objection handling — native <details> for zero-JS accessibility. Answers the
 * hard questions honestly (fairness, privacy, accommodations, contesting).
 */
const QA = [
  {
    q: "Can an AI interview really be fair?",
    a: "Fairness here is structural, not a promise. Nine demographic inputs are blocked before scoring, the pipeline's own behaviour is audited for adverse impact (NYC LL144 / EEOC), and there is no single blended score to hide bias inside — only evidenced, contestable traits.",
  },
  {
    q: "What happens to my data?",
    a: "Your interview is yours. Answers are encrypted at rest, audio is never stored, and nothing is shared with any employer until you explicitly approve each item. You can add context, dispute, or hide anything first.",
  },
  {
    q: "How does the AI know what to ask?",
    a: "The hiring team defines the role in plain language; the AI builds the interview from those requirements and adapts to what you say. Every question traces back to a stated requirement, not a generic quiz.",
  },
  {
    q: "I need accommodations. Is that supported?",
    a: "Yes — no questions asked. You can answer by voice or text, pause anytime, and there is no timer. The format flexes to how you work best.",
  },
  {
    q: "A trait looks wrong. Can I challenge it?",
    a: "Always. Every trait links to the exact transcript moment behind it. If the evidence doesn't support it, you can dispute or hide it before anything is shared.",
  },
  {
    q: "What does it cost?",
    a: "Free for candidates, always. For teams there's no setup fee and you can cancel anytime — every score is bias-audited.",
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Straight answers</p>
          <h2 id="faq-heading" className="mt-2 text-[clamp(1.8rem,1.3rem+2vw,3rem)] tracking-tight text-[var(--ink)]">
            The questions worth asking.
          </h2>
        </div>
        <div className="border-t" style={{ borderColor: "var(--line-2)" }}>
          {QA.map((item) => (
            <details key={item.q} className="group border-b" style={{ borderColor: "var(--line)" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-semibold text-[var(--ink)] marker:hidden">
                {item.q}
                <span className="shrink-0 text-[var(--ink-3)] transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
