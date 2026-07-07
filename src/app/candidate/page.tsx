import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { RoutePage } from "@/components/layout/RoutePage";
import type { CandidateMatch } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your matches — PlacedOn",
  description: "Roles that want how you think, not your keywords.",
};

const MATCHES: CandidateMatch[] = [
  {
    id: "m1",
    company: "Meridian",
    role: "Senior Frontend Engineer",
    matchPercent: 94,
    location: "Remote · EU",
    workMode: "remote",
    status: "Actively hiring",
    whyMatched: "Your ambiguity tolerance and systems thinking map to how this team ships.",
    evidence: ["Ambiguity tolerance 92", "Systems thinking 90"],
  },
  {
    id: "m2",
    company: "Cortex",
    role: "Product Engineer",
    matchPercent: 88,
    location: "Hybrid · Berlin",
    workMode: "hybrid",
    status: "New role",
    whyMatched: "Decision velocity and user empathy are exactly what they screen for.",
    evidence: ["Decision velocity 88", "User empathy 86"],
  },
  {
    id: "m3",
    company: "Lumen",
    role: "Frontend Engineer",
    matchPercent: 85,
    location: "Onsite · Amsterdam",
    workMode: "onsite",
    status: "Interviewing",
    whyMatched: "Your rigor and communication stood out against this role's bar.",
    evidence: ["Rigor 87", "Communication 84"],
  },
];

export default function CandidatePage() {
  return (
    <RoutePage
      eyebrow="Your PlacedOn"
      title={
        <>
          Roles that want <span className="grad-iris">how you think</span>.
        </>
      }
      intro="One interview, matched everywhere. Each match shows exactly why — tied to your own answers."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {MATCHES.map((m) => (
          <li key={m.id} className="glass flex h-full flex-col rounded-[var(--r-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[var(--ink)]">{m.company}</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
                {m.matchPercent}%
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[var(--ink-2)]">{m.role}</p>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[var(--ink-3)]">
              <MapPin size={13} /> {m.location}
            </p>
            <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{m.whyMatched}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.evidence.map((e) => (
                <span key={e} className="rounded-full px-2.5 py-1 text-[11.5px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  {e}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </RoutePage>
  );
}
