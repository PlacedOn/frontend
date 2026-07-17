import type { Metadata } from "next";
import { PlasmaVeil } from "@/components/background/PlasmaVeil";
import { RouteHeader } from "@/components/layout/RouteHeader";
import { Footer } from "@/components/sections/Footer";
import { DemoForm } from "@/components/demo/DemoForm";
import { Quote, ShieldCheck, Gauge } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Book a demo — Placedon",
  description:
    "See Placedon on your own roles. Evidence-backed candidate signal from one calm interview — no keyword roulette, no black box.",
};

const PROMISES = [
  {
    icon: Quote,
    title: "Every signal traces to a quote",
    body: "No opaque score. Each trait links to the exact moment a candidate showed it.",
  },
  {
    icon: ShieldCheck,
    title: "Candidate-approved profiles only",
    body: "Raw transcripts stay private. You see the evidence a candidate has reviewed and released.",
  },
  {
    icon: Gauge,
    title: "One role, live in the walkthrough",
    body: "Bring a real opening. We'll show the candidate feed and evidence drawer on it.",
  },
];

export default function DemoPage() {
  return (
    <>
      <PlasmaVeil />
      <RouteHeader />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <section className="shell grid grid-cols-1 gap-12 pt-36 pb-24 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-16 md:pt-40">
          {/* Promise column */}
          <div className="md:pt-6">
            <p className="eyebrow">Book a demo</p>
            <h1 className="mt-3 text-[clamp(2.3rem,1.5rem+3vw,3.7rem)] leading-[1.02]">
              See Placedon on
              <br />
              your own roles.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[var(--ink-2)]">
              A 20-minute walkthrough with a real opening of yours. We&rsquo;ll show how evidence-backed
              signal replaces resume guesswork.
            </p>

            <ul className="mt-9 flex flex-col gap-5">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
                  >
                    <Icon size={19} animateOnView animateOnHover />
                  </span>
                  <div>
                    <h3 className="text-[15.5px] font-semibold text-[var(--ink)]">{title}</h3>
                    <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-[var(--ink-2)]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form column */}
          <div className="md:sticky md:top-28">
            <DemoForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
