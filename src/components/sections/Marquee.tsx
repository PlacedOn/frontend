"use client";

const LOGOS = ["Northwind", "Aperture", "Cortex", "Lumen", "Vertex", "Halcyon", "Meridian", "Kite"];

export function Marquee() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section aria-label="Trusted by" className="relative py-10">
      <div className="shell">
        <p className="mb-5 text-center text-[12px] uppercase tracking-[0.16em] text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
          Signal-first hiring teams
        </p>
      </div>
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="marquee-track flex w-max items-center gap-14 px-8">
          {row.map((name, i) => (
            <span key={i} className="text-[19px] font-semibold tracking-tight text-[var(--ink-3)] opacity-70">
              {name}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .marquee-track { animation: marquee 30s linear infinite; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
      `}</style>
    </section>
  );
}
