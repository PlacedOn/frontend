import type { Metadata } from "next";
import { Search } from "lucide-react";
import { RoutePage } from "@/components/layout/RoutePage";
import type { EmployerCandidate } from "@/lib/types";

export const metadata: Metadata = {
  title: "Discover candidates — PlacedOn",
  description: "Search people the way you actually think about them.",
};

const SAMPLE: EmployerCandidate[] = [
  {
    id: "c1",
    displayName: "Candidate · A6F2",
    roleFitPercent: 94,
    targetRole: "Senior Frontend Engineer",
    experienceLabel: "6 yrs · product-led teams",
    topTraits: ["Ambiguity tolerance", "Systems thinking", "Ownership"],
    verifiedSkills: ["React", "TypeScript", "Design systems"],
    interviewFreshness: "Interviewed 3 days ago",
    visibility: "limited",
  },
  {
    id: "c2",
    displayName: "Candidate · 91BD",
    roleFitPercent: 89,
    targetRole: "Product Engineer",
    experienceLabel: "4 yrs · early-stage",
    topTraits: ["Decision velocity", "User empathy", "Pragmatism"],
    verifiedSkills: ["Next.js", "Node", "Postgres"],
    interviewFreshness: "Interviewed 1 week ago",
    visibility: "anonymous",
  },
  {
    id: "c3",
    displayName: "Candidate · 3C0E",
    roleFitPercent: 86,
    targetRole: "Frontend Engineer",
    experienceLabel: "5 yrs · fintech",
    topTraits: ["Risk framing", "Rigor", "Communication"],
    verifiedSkills: ["Vue", "TypeScript", "Testing"],
    interviewFreshness: "Interviewed 2 days ago",
    visibility: "limited",
  },
];

export default function EmployerPage() {
  return (
    <RoutePage
      eyebrow="For teams · discovery"
      title="Search people the way you actually think."
      intro="Ask in plain language. Every match opens to the transcript moment behind it."
    >
      <div className="glass flex items-center gap-3 rounded-[var(--r-card)] px-5 py-4">
        <Search size={18} style={{ color: "var(--ink-3)" }} />
        <span className="text-[15px] text-[var(--ink-3)]">
          &ldquo;Someone who can hold ambiguity and still ship&hellip;&rdquo;
        </span>
      </div>

      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {SAMPLE.map((c) => (
          <li key={c.id} className="glass flex h-full flex-col rounded-[var(--r-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono text-[var(--ink-3)]">{c.displayName}</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--iris-ink)" }}>
                {c.roleFitPercent}% fit
              </span>
            </div>
            <h2 className="mt-3 text-[1.1rem]">{c.targetRole}</h2>
            <p className="mt-1 text-[13px] text-[var(--ink-2)]">{c.experienceLabel}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.topTraits.map((t) => (
                <span key={t} className="rounded-full px-2.5 py-1 text-[11.5px] font-medium" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-[var(--ink-3)]">{c.interviewFreshness}</p>
          </li>
        ))}
      </ul>
    </RoutePage>
  );
}
