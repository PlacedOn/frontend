import type { Metadata } from "next";
import { ArrowRight, ScrollText, Scale, Gavel, ShieldCheck } from "@/components/ui/icons";

import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";

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
            <Icon size={16} style={{ color: "var(--ink-3)" }} /> {label}
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
            className="glass group rounded-[var(--r-card)] p-6 transition-colors hover:bg-[var(--mist)]"
          >
            <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-[0.85rem] border" style={{ borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }}>
              <Icon size={20} />
            </span>
            <h3 className="font-[var(--font-display)] text-[16.5px] font-semibold text-[var(--ink)]">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--ink)]">
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
    <section className="shell border-t border-[var(--glass-line)] py-24 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">No setup fee · cancel anytime</p>
        <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Stop guessing from resumes.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-2)]">
          Give one team one week. Watch how fast &ldquo;who should we talk to?&rdquo; gets an honest answer.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] bg-[var(--ink)] px-6 py-3.5 text-[15px] font-semibold text-[var(--white)] transition-colors hover:bg-[color-mix(in_oklab,var(--ink),#000_14%)]"
          >
            Book a demo <ArrowRight size={16} />
          </a>
          <a
            href="/employer"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border border-[var(--glass-line)] bg-[var(--white)] px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
          >
            See the dashboard
          </a>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
          <ShieldCheck size={14} /> Every score is bias-audited and contestable.
        </p>
      </div>
    </section>
  );
}

export default function CompaniesPage() {
  return (
    <>
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <CompaniesHero />
        <TrustStrip />
        <ResumeTriage />
        <EvidencePanel />
        <TeamJourneySteps />
        <CandidateMatchCarousel />
        <ComplianceBlock />
        <CompaniesFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
