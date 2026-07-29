import type { Metadata } from "next";
import { AnimateIcon, ArrowRight, ScrollText, Scale, Gavel, ShieldCheck } from "@/components/ui/icons";

import { PlasmaVeil } from "@/components/background/PlasmaVeil";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { Testimonials } from "@/components/sections/Testimonials";

import { CompaniesHero } from "@/components/companies/CompaniesHero";
import { ResumeTriage } from "@/components/companies/ResumeTriage";
import { EvidencePanel } from "@/components/companies/EvidencePanel";
import { TeamJourneySteps } from "@/components/companies/TeamJourneySteps";
import { CandidateMatchCarousel } from "@/components/companies/CandidateMatchCarousel";
import { CompaniesFaq } from "@/components/companies/CompaniesFaq";

export const metadata: Metadata = {
  title: "For hiring teams · Placedon",
  description:
    "Hire on evidence, not resumes. Every candidate arrives pre-interviewed — you see approved, verifiable signals, never a raw transcript. Bias-audited and compliant.",
};

const COMPLIANCE = [
  { icon: ScrollText, title: "NYC Local Law 144", body: "Automated employment decisions are bias-audited, as the law requires.", href: "/trust/ll144" },
  { icon: Scale, title: "EU AI Act aligned", body: "Built for transparency and human oversight from the ground up.", href: "/trust/eu-ai-act" },
  { icon: Gavel, title: "Contestable by design", body: "Every score is sourced and challengeable — no black-box decisions.", href: "/trust/contest" },
];

const STRIP = [
  { icon: ScrollText, label: "NYC Local Law 144" },
  { icon: Scale, label: "EU AI Act aligned" },
  { icon: Gavel, label: "Bias-audited & contestable" },
];

function TrustStrip() {
  return (
    <section className="shell pb-6">
      <div className="glass flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-[var(--r-card)] px-6 py-4">
        <span className="text-[12.5px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Defensible hiring</span>
        {STRIP.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--ink-2)]">
            <Icon size={16} animateOnView style={{ color: "var(--iris-ink)" }} /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function ComplianceBlock() {
  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">Built to be trusted</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
          Fast to hire. <span className="grad-iris">Safe to defend.</span>
        </h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          Speed means nothing if you can&apos;t defend the hire later. On Placedon, every
          decision is backed by evidence you can point to, and a candidate can challenge.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
        {COMPLIANCE.map(({ icon: Icon, title, body, href }) => (
          <a
            key={title}
            href={href}
            className="glass group rounded-[var(--r-card)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-[0.85rem]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
              <Icon size={20} animateOnView animateOnHover />
            </span>
            <h3 className="font-[var(--font-display)] text-[16.5px] font-semibold text-[var(--ink)]">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
              Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative section-rhythm">
      <div className="shell">
        <div
          className="relative overflow-hidden rounded-[calc(var(--r-card)+10px)] px-8 py-14 text-center md:px-16 md:py-20"
          style={{
            background: "linear-gradient(118deg, #8f61f7 0%, #7c48f1 46%, #6b38e6 108%)",
            boxShadow: "0 34px 80px -34px rgba(110,60,230,0.55)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(700px circle at 50% -20%, rgba(255,255,255,.28), transparent 55%)" }}
          />
          <div className="relative mx-auto max-w-xl">
            <p className="text-[12px] uppercase tracking-[0.16em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.7)" }}>
              No setup fee · cancel anytime
            </p>
            <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)]" style={{ color: "#fff" }}>
              Stop guessing from resumes.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed" style={{ color: "rgba(255,255,255,.82)" }}>
              Give one team one week. Watch how fast &ldquo;who should we talk to?&rdquo; gets an honest answer.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <AnimateIcon animateOnHover>
                <a
                  href="/demo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] bg-white px-6 py-3.5 text-[15px] font-semibold transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
                  style={{ color: "var(--iris-ink)", boxShadow: "0 12px 30px -10px rgba(0,0,0,.35)" }}
                >
                  Book a demo <ArrowRight size={17} />
                </a>
              </AnimateIcon>
              <a
                href="/employer"
                className="inline-flex cursor-pointer items-center rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-[var(--d-micro)]"
                style={{ border: "1px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.06)" }}
              >
                See the dashboard
              </a>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              <ShieldCheck size={14} animateOnView /> Every score is bias-audited and contestable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CompaniesPage() {
  return (
    <>
      <PlasmaVeil />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <CompaniesHero />
        <TrustStrip />
        <ResumeTriage />
        <EvidencePanel />
        <TeamJourneySteps />
        <CandidateMatchCarousel />
        <ComplianceBlock />
        <Testimonials />
        <CompaniesFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
