import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ScrollText, Scale, MessageSquareWarning, ArrowRight, Gauge } from "@/components/ui/icons";
import { RoutePage } from "@/components/layout/RoutePage";

export const metadata: Metadata = {
  title: "Trust & fairness — Placedon",
  description:
    "How Placedon stays explainable, contestable, and compliant — LL144, the EU AI Act, and candidate control.",
};

const PILLARS = [
  {
    href: "/trust/scoring",
    icon: ShieldCheck,
    title: "How scoring works",
    body: "One conversation becomes evidence-linked trait scores with an honest confidence band. Each score points to the exact moment behind it — results are documented, not asserted.",
    cta: "See the method",
  },
  {
    href: "/trust/model-health",
    icon: Gauge,
    title: "How we measure the model",
    body: "The AI is graded against real human review — for accuracy, grounding, fairness, and calibration — and no version ships unless it clears the bar and isn't worse than the last. We measure the measurer.",
    cta: "See how",
  },
  {
    href: "/trust/ll144",
    icon: ScrollText,
    title: "NYC Local Law 144",
    body: "The bias-audit law for automated hiring tools: an independent annual audit, a public summary, and advance notice to candidates. Here's what it requires and how we support it.",
    cta: "Read the details",
  },
  {
    href: "/trust/eu-ai-act",
    icon: Scale,
    title: "EU AI Act",
    body: "Recruitment AI is high-risk under the Act. We keep records of logic, data lineage, and human oversight so deployers can meet their obligations — with a person always in the loop.",
    cta: "Read the details",
  },
  {
    href: "/trust/contest",
    icon: MessageSquareWarning,
    title: "Contest a trait",
    body: "Candidates see every trait we extract, the exact moment behind it, and can hide or formally contest it. No score is final without a path to challenge it.",
    cta: "See your rights",
  },
];

export default function TrustPage() {
  return (
    <RoutePage
      eyebrow="Trust & fairness"
      title={
        <>
          Signal you can <span className="grad-iris">defend</span> in a room.
        </>
      }
      intro="Assessing people is a responsibility. Here is exactly how Placedon stays explainable, contestable, and compliant — for the candidate and the employer."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.title}
              href={p.href}
              className="glass group flex flex-col rounded-[var(--r-card)] p-7 transition-shadow duration-[var(--d-std)] hover:shadow-[var(--shadow-md)]"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
              >
                <Icon size={20} animateOnView animateOnHover />
              </span>
              <h2 className="mt-5 text-[1.35rem]">{p.title}</h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{p.body}</p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
                style={{ color: "var(--iris-ink)" }}
              >
                {p.cta}

              </span>
            </Link>
          );
        })}
      </div>
    </RoutePage>
  );
}
