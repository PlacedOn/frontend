import type { ComponentType, SVGProps } from "react";

/**
 * TrustRow — the proof section.
 *
 * Structure follows the 21st.dev `logo-cloud-09` scaffold (grayscale grid,
 * muted tiles, responsive 2/3/4 columns) with its styling re-expressed in
 * PlacedOn tokens rather than shadcn defaults, so it inherits the theme
 * instead of introducing a second one.
 *
 * Content is deliberately NOT customer logos. PlacedOn has no customers to
 * show yet, and a wall of borrowed logos is the fastest way to lose an
 * enterprise buyer who checks one. What it shows instead is the set of
 * standards the product is actually built against — which is what a hiring
 * lead evaluating an AI vendor is really trying to find out.
 *
 * When real customers exist, swap CREDENTIALS for a logo array and keep the
 * grid; the layout is the same either way.
 */

type Credential = {
  label: string;
  detail: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/* Monochrome line icons, 24x24 viewBox, 1.5 stroke — one visual family.
   Drawn here rather than imported so the set stays consistent; lucide's
   equivalents vary in optical weight at this size. */
const IconBalance = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" />
  </svg>
);

const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconTranscript = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h4" />
  </svg>
);

const IconAppeal = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12a9 9 0 1 1-3.5-7.1" />
    <path d="M21 3v5h-5" />
  </svg>
);

const CREDENTIALS: Credential[] = [
  {
    label: "NYC Local Law 144",
    detail: "Bias audit and candidate notice, as the law requires.",
    Icon: IconBalance,
  },
  {
    label: "EU AI Act",
    detail: "Built for the high-risk tier that covers hiring.",
    Icon: IconShield,
  },
  {
    label: "Traceable scoring",
    detail: "Every score points back to a moment in the transcript.",
    Icon: IconTranscript,
  },
  {
    label: "The right to contest",
    detail: "Candidates can challenge a result and get a human read.",
    Icon: IconAppeal,
  },
];

export function TrustRow() {
  return (
    <section aria-labelledby="trust-row-heading" className="py-20 md:py-28">
      <div className="shell">
        <p className="eyebrow">Where we stand</p>

        <h2
          id="trust-row-heading"
          className="mt-4 max-w-[24ch] text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] text-[var(--ink)]"
        >
          Hiring software should be able to show its work.
        </h2>

        <p className="mt-5 max-w-[56ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
          We&apos;re early, so we&apos;re not going to show you a wall of customer logos we
          haven&apos;t earned yet. Here&apos;s what we can show you — the rules we build
          against, and what happens when someone disagrees with a result.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--mist)] sm:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map(({ label, detail, Icon }) => (
            <li key={label} className="bg-[var(--porcelain-2)] p-6">
              <Icon className="h-6 w-6 text-[var(--ink-3)]" aria-hidden="true" />
              <h3 className="mt-4 text-[15px] font-semibold text-[var(--ink)]">{label}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">{detail}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[14px] text-[var(--ink-3)]">
          <a
            href="/trust"
            className="text-[var(--iris-ink)] underline decoration-[var(--iris-line)] underline-offset-4 transition-colors duration-200 hover:decoration-[var(--iris)]"
          >
            Read how scoring works
          </a>{" "}
          — including what we don&apos;t measure, and why.
        </p>
      </div>
    </section>
  );
}
