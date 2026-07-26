import type { Metadata } from "next";
import { ArrowRight, ShieldCheck, ScrollText, Scale, Gavel, Eye, Lock, Undo2, X, Check } from "@/components/ui/icons";

import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";

import { CandidatesHero } from "@/components/candidates/CandidatesHero";
import { ApplicationInbox } from "@/components/candidates/ApplicationInbox";
import { SampleScorecard } from "@/components/candidates/SampleScorecard";
import { JourneySteps } from "@/components/candidates/JourneySteps";
import { RoleMatchCarousel } from "@/components/candidates/RoleMatchCarousel";
import { CandidatesFaq } from "@/components/candidates/CandidatesFaq";

export const metadata: Metadata = {
  title: "For candidates · Placedon",
  description:
    "Skip the resume pile. Prove your skill in one honest conversation, then decide exactly what employers see. Free for candidates.",
};

const COMPLIANCE = [
  { icon: ScrollText, label: "NYC Local Law 144" },
  { icon: Scale, label: "EU AI Act aligned" },
  { icon: Gavel, label: "Bias-audited & contestable" },
];

const CLAIMS = [
  "A list of past job titles",
  "Keywords a filter can reject",
  "Years, not depth",
  "What you say you can do",
  "A gatekeeper you never meet",
];

const PROVEN = [
  "How you actually think through a problem",
  "Proof in your own words, read by a human",
  "Real depth, not just claims",
  "What you can genuinely do",
  "A profile you control and can challenge",
];

const CONTROL = [
  { icon: Eye, title: "You approve every trait", body: "Nothing reaches an employer until you publish it. Hide anything, anytime." },
  { icon: Lock, title: "Your transcript stays private", body: "Employers see approved evidence, never the raw interview. That never changes." },
  { icon: Undo2, title: "Contest anything", body: "Every score links to your own words, so you can challenge what doesn't feel right." },
];

function TrustStrip() {
  return (
    <section className="shell pb-6">
      <div className="glass flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-[var(--r-card)] px-6 py-4">
        <span className="text-[12.5px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Built to be trusted</span>
        {COMPLIANCE.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--ink-2)]">
            <Icon size={16} style={{ color: "var(--ink-3)" }} /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function ResumesVsProven() {
  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">The shift</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
          Resumes list claims. <span className="grad-iris">One conversation proves them.</span>
        </h2>
      </div>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--r-card)] p-6" style={{ background: "var(--mist)", border: "1px solid var(--glass-line)" }}>
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">A resume is…</p>
          <ul className="flex flex-col gap-3">
            {CLAIMS.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-[14.5px] text-[var(--ink-2)]">
                <X size={17} className="mt-0.5 shrink-0 text-[var(--ink-3)]" /> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-[var(--r-card)] p-6">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--iris-ink)" }}>A Trust Passport is…</p>
          <ul className="flex flex-col gap-3">
            {PROVEN.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14.5px] font-medium text-[var(--ink)]">
                <Check size={17} animateOnView className="mt-0.5 shrink-0" style={{ color: "var(--iris-ink)" }} /> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function InControl() {
  return (
    <section className="shell py-[clamp(4rem,3rem+5vw,7rem)]">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">You&apos;re in control</span>
        <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Your interview. Your terms.</h2>
        <p className="mt-5 leading-relaxed text-[var(--ink-2)]">
          Most tools just score you and move on. Placedon hands you the mic, and the final say.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
        {CONTROL.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass rounded-[var(--r-card)] p-6">
            <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-[0.85rem] border" style={{ borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }}>
              <Icon size={20} />
            </span>
            <h3 className="font-[var(--font-display)] text-[16.5px] font-semibold text-[var(--ink)]">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="shell border-t border-[var(--glass-line)] py-24 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">Free · 25–30 min · no resume</p>
        <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          Get hired for how you actually work.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-2)]">
          Take one honest conversation. Decide exactly what employers see. Skip the pile.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/pre-interview"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] bg-[var(--ink)] px-6 py-3.5 text-[15px] font-semibold text-[var(--white)] transition-colors hover:bg-[color-mix(in_oklab,var(--ink),#000_14%)]"
          >
            Take your interview, free <ArrowRight size={16} />
          </a>
          <a
            href="#sample"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] border border-[var(--glass-line)] bg-[var(--white)] px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
          >
            See a sample profile
          </a>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
          <ShieldCheck size={14} /> You approve everything before any employer sees it.
        </p>
      </div>
    </section>
  );
}

export default function CandidatesPage() {
  return (
    <>
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <CandidatesHero />
        <TrustStrip />
        <ApplicationInbox />
        <ResumesVsProven />
        <SampleScorecard />
        <JourneySteps />
        <RoleMatchCarousel />
        <InControl />
        <CandidatesFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
