import type { Metadata } from "next";
import { AnimateIcon, ArrowRight, ShieldCheck, ScrollText, Scale, Gavel, Eye, Lock, Undo2, X, Check } from "@/components/ui/icons";

import { BeamsField } from "@/components/background/BeamsField";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { Testimonials } from "@/components/sections/Testimonials";

import { PageHero } from "@/components/sections/PageHero";
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
            <Icon size={16} animateOnView style={{ color: "var(--iris-ink)" }} /> {label}
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
            <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-[0.85rem]" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
              <Icon size={20} animateOnView animateOnHover />
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
    <section className="relative py-20 md:py-28">
      <div className="shell">
        <div
          className="relative overflow-hidden rounded-[calc(var(--r-card)+10px)] px-8 py-14 text-center md:px-16 md:py-20"
          style={{
            background: "linear-gradient(118deg, var(--v-400) 0%, var(--v-500) 46%, var(--v-500) 108%)",
            boxShadow: "0 34px 80px -34px rgba(115, 54, 255,0.55)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(700px circle at 50% -20%, rgba(255,255,255,.28), transparent 55%)" }}
          />
          <div className="relative mx-auto max-w-xl">
            <p className="text-[12px] uppercase tracking-[0.16em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,.7)" }}>
              Free · 25–30 min · no resume
            </p>
            <h2 className="mt-4 text-[clamp(2rem,1.3rem+3vw,3.4rem)]" style={{ color: "#fff" }}>
              Get hired for how you actually work.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed" style={{ color: "rgba(255,255,255,.82)" }}>
              Take one honest conversation. Decide exactly what employers see. Skip the pile.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <AnimateIcon animateOnHover>
                <a
                  href="/pre-interview"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] bg-white px-6 py-3.5 text-[15px] font-semibold transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
                  style={{ color: "var(--iris-ink)", boxShadow: "0 12px 30px -10px rgba(0,0,0,.35)" }}
                >
                  Take your interview, free <ArrowRight size={17} />
                </a>
              </AnimateIcon>
              <a
                href="#sample"
                className="inline-flex cursor-pointer items-center rounded-[var(--r-btn)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-[var(--d-micro)]"
                style={{ border: "1px solid rgba(255,255,255,.45)", background: "rgba(255,255,255,.06)" }}
              >
                See a sample profile
              </a>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              <ShieldCheck size={14} animateOnView /> You approve everything before any employer sees it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CandidatesPage() {
  return (
    <>
      <BeamsField />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <PageHero
          eyebrow="For candidates"
          title="Skip the resume pile."
          intro="Prove your skills in one honest conversation, then decide exactly what employers see. No resume roulette, no ghosting, no mystery score."
          cta={{ label: "Take your interview, free", href: "/pre-interview" }}
          secondary={{ label: "See a sample profile", href: "#sample" }}
          note="You approve everything before any employer sees it."
        />
        <TrustStrip />
        <ApplicationInbox />
        <ResumesVsProven />
        <SampleScorecard />
        <JourneySteps />
        <RoleMatchCarousel />
        <InControl />
        <Testimonials />
        <CandidatesFaq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
