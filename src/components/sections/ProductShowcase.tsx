import Image from "next/image";

/**
 * Product imagery.
 *
 * These are captures of the real product, not stock photography and not
 * sourced art. That is deliberate on two counts: the references do the same
 * (Harvey and Scale both lead with product surfaces, neither uses stock), and
 * it is the only imagery PlacedOn actually owns outright.
 *
 * Sources are 1920x1200 JPEG (~270KB). next/image serves WebP/AVIF
 * derivatives at the rendered size, so the wire cost is a fraction of that.
 */

const SHOTS = [
  {
    src: "/img/product/employer-dashboard.jpg",
    alt: "The PlacedOn hiring dashboard: a pipeline summary showing candidates in play, active roles and open introductions, above a list of the day's candidate actions grouped by owner.",
    eyebrow: "For teams",
    title: "The whole pipeline, by person",
    body: "Not a leaderboard. The next respectful action for each candidate, and who owns it.",
    priority: true,
  },
  {
    src: "/img/product/candidate-growth.jpg",
    alt: "The PlacedOn candidate growth report: readiness coverage across capability areas with the evidence behind each one.",
    eyebrow: "For candidates",
    title: "What you've shown, and what's missing",
    body: "Coverage, not a verdict. The report tells you where the evidence is thin and what would close it.",
    priority: false,
  },
] as const;

export function ProductShowcase() {
  return (
    <section aria-labelledby="showcase-heading" className="section-rhythm">
      <div className="shell">
        <p className="eyebrow">The product</p>
        <h2 id="showcase-heading" className="mt-4 max-w-[20ch] text-[length:var(--text-4xl)]">
          Built for the person doing the <span className="serif-italic">hiring</span>.
        </h2>

        <div className="mt-16 flex flex-col gap-20 md:gap-28">
          {SHOTS.map((s) => (
            <figure key={s.src}>
              {/* Explicit dimensions on the wrapper prevent layout shift while
                  the optimized derivative loads. */}
              <div className="overflow-hidden rounded-[var(--r-card)] border border-[var(--mist)] bg-[var(--porcelain-2)] shadow-[var(--shadow-md)]">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={1920}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 92vw, 1180px"
                  priority={s.priority}
                  loading={s.priority ? undefined : "lazy"}
                  className="h-auto w-full"
                />
              </div>

              <figcaption className="mt-6 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                <span className="eyebrow shrink-0">{s.eyebrow}</span>
                <div>
                  <h3 className="text-[length:var(--text-xl)]">{s.title}</h3>
                  <p className="mt-1.5 max-w-[52ch] text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--ink-2)]">
                    {s.body}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
