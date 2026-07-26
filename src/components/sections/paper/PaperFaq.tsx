/**
 * FAQ — the honest objections, answered plainly. Native <details> so it's
 * keyboard-accessible and needs no JavaScript.
 */

const FAQS = [
  {
    q: "Is this just another AI that scores people?",
    a: "No. We never produce a single score or ranking of a person. We surface specific evidence — quoted from your interview — of what you can do, and let employers judge fit against a real role.",
  },
  {
    q: "How do you keep it fair?",
    a: "The interview is audited for bias against NYC Local Law 144 and aligned with the EU AI Act. Protected characteristics are never used, and where you studied is blocked from matching entirely.",
  },
  {
    q: "What happens to my data?",
    a: "Your interview is yours. Nothing is shared with an employer until you approve that specific introduction. You can see, and revoke, what's visible at any time.",
  },
  {
    q: "I need accommodations for the interview.",
    a: "That's built in. You can adjust timing, take breaks, and use a reduced-motion, screen-reader-friendly interface — without disclosing why to anyone.",
  },
  {
    q: "What if the AI gets me wrong?",
    a: "You review your evidence before anyone sees it, and you can contest or add context. A person is never reduced to what one model concluded in one sitting.",
  },
];

export function PaperFaq() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-20 sm:py-28">
      <h2 className="text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] font-bold leading-tight tracking-[-0.02em]">
        Questions, answered.
      </h2>

      <div className="mt-10 max-w-3xl">
        {FAQS.map((f) => (
          <details key={f.q} className="group border-b border-[var(--glass-line)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16.5px] font-semibold text-[var(--ink)] marker:content-none">
              {f.q}
              <span
                aria-hidden
                className="shrink-0 text-[var(--ink-3)] transition-transform duration-[var(--d-micro)] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-5 pr-8 text-[15px] leading-relaxed text-[var(--ink-2)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
