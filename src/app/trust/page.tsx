import type { Metadata } from "next";
import { ShieldCheck, ScrollText, Scale, MessageSquareWarning } from "lucide-react";
import { RoutePage } from "@/components/layout/RoutePage";

export const metadata: Metadata = {
  title: "Trust & fairness — PlacedOn",
  description:
    "How PlacedOn stays explainable, contestable, and compliant — LL144, the EU AI Act, and candidate control.",
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Bias-audited scoring",
    body: "Every trait model is tested for adverse impact across protected groups before it ships, and re-audited on a fixed cadence. Results are documented, not asserted.",
  },
  {
    icon: ScrollText,
    title: "NYC Local Law 144",
    body: "PlacedOn maintains an independent bias audit and publishes the summary of results, in line with LL144 requirements for automated employment decision tools.",
  },
  {
    icon: Scale,
    title: "EU AI Act aligned",
    body: "Hiring is a high-risk use case. We keep records of logic, data lineage, and human oversight so employers can meet their obligations under the Act.",
  },
  {
    icon: MessageSquareWarning,
    title: "Contest any trait",
    body: "Candidates see every trait we extract, the exact transcript moment behind it, and can flag or contest it. No score is final without a path to challenge it.",
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
      intro="Assessing people is a responsibility. Here is exactly how PlacedOn stays explainable, contestable, and compliant — for the candidate and the employer."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <article key={p.title} className="glass rounded-[var(--r-card)] p-7">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
              >
                <Icon size={20} />
              </span>
              <h2 className="mt-5 text-[1.35rem]">{p.title}</h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{p.body}</p>
            </article>
          );
        })}
      </div>
    </RoutePage>
  );
}
