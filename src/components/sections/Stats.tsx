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
  { value: <><span style={{ opacity: 0.5 }}>₹</span><CountUp to={4} suffix="k" /></>, label: "Cost to assess", sub: "vs. ₹4 lakh per bad hire" },
  { value: <CountUp to={120} suffix="k+" />, label: "Traits mapped", sub: "across the network" },
  { value: <CountUp to={0} />, label: "Resumes required", sub: "signal, not keywords" },
];

export function Stats() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="glass h-full rounded-[var(--r-card)] p-6">
              <div
                className="text-[clamp(2.2rem,1.4rem+2vw,3rem)] font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {s.value}
              </div>
              <p className="mt-2 text-[15px] font-semibold text-[var(--ink)]">{s.label}</p>
              <p className="mt-0.5 text-[13.5px] text-[var(--ink-2)]">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
