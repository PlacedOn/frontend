"use client";

import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

type Stat = {
  value: React.ReactNode;
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  { value: <CountUp to={30} suffix=" min" />, label: "One interview", sub: "replaces the whole screen" },
  { value: <><span style={{ opacity: 0.45 }}>₹</span><CountUp to={4} suffix="k" /></>, label: "Cost to assess", sub: "vs. ₹4 lakh per bad hire" },
  { value: <CountUp to={120} suffix="k+" />, label: "Traits mapped", sub: "across the network" },
  { value: <CountUp to={0} />, label: "Resumes required", sub: "signal, not keywords" },
];

export function Stats() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <div
              className="group relative h-full overflow-hidden rounded-[var(--r-card)] p-6 transition-transform duration-[var(--d-std)] will-change-transform hover:-translate-y-1"
              style={{
                background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 74%)",
                border: "1px solid var(--glass-line)",
                boxShadow: "0 14px 34px -22px rgba(30,24,70,0.5)",
              }}
            >
              {/* accent rule that grows on hover */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-[3px] w-10 rounded-full transition-all duration-[var(--d-std)] group-hover:w-full"
                style={{ background: "linear-gradient(90deg, var(--iris) 0%, #9a6bff 100%)" }}
              />
              {/* soft violet glow that lifts on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-[var(--d-std)] group-hover:opacity-100"
                style={{ background: "radial-gradient(circle, rgba(154,107,255,0.5), transparent 70%)" }}
              />
              <div
                className="grad-iris text-[clamp(2.4rem,1.5rem+2.4vw,3.3rem)] font-bold leading-none tracking-tight tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </div>
              <p className="mt-3 text-[15.5px] font-semibold text-[var(--ink)]">{s.label}</p>
              <p className="mt-0.5 text-[13.5px] text-[var(--ink-2)]">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
