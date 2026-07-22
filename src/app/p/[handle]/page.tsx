import type { Metadata } from "next";
import { PublicProfileShell, type PublicProfileData } from "@/components/candidate/profile/public/PublicProfileShell";

export const metadata: Metadata = {
  title: "Profile — Placedon",
  description: "An evidence-based candidate profile: authored story above, earned evidence below the seam.",
};

// Sample data — this is the design preview. Phase-1 next step: fetch the real
// profile by handle (public read that respects per-section visibility).
const SAMPLE: PublicProfileData = {
  displayName: "Ananya R.",
  headline: "Backend engineer who likes the hard, quiet parts of systems.",
  pills: ["Bengaluru · Remote-open", "Available in ~1 month", "Backend · Platform"],
  summary:
    "I care about the unglamorous middle of a system — the retries, the idempotency, the 3am pager math. I learn fastest when something's on fire and I get to figure out why. Looking for a team that ships carefully and explains its decisions.",
  highlights: [
    { title: "Cut checkout failures 40%", body: "Traced a flaky payments path to a retry storm, added idempotency keys + a circuit breaker, and wrote the postmortem that changed our on-call playbook." },
    { title: "Learned Kafka the hard way", body: "Inherited a consumer that silently dropped messages under load. Reproduced it, fixed the offset handling, and documented the failure mode for the next person." },
  ],
  passport: {
    name: "Ananya",
    strength: 82,
    traits: [
      { label: "Systems thinking", band: "high" },
      { label: "Structured debugging", band: "high" },
      { label: "Clear communication", band: "emerging" },
      { label: "Handles ambiguity", band: "needs_review" },
    ],
  },
  fits: [
    {
      roleName: "Backend Engineer",
      fit: { coverage_percent: 88, bucket: "strong", bucket_label: "Strong evidence to explore", role_requirements_clear: 5, role_requirements_total: 6, must_have_status: "clear", must_have_clear: 1, must_have_total: 1, work_reality: "aligned", evidence_confidence: "sufficient" },
    },
    {
      roleName: "Platform Engineer",
      fit: { coverage_percent: 61, bucket: "worth_discussing", bucket_label: "Worth discussing", role_requirements_clear: 3, role_requirements_total: 6, must_have_status: "not_specified", must_have_clear: 0, must_have_total: 0, work_reality: "not_shared", evidence_confidence: "limited" },
    },
  ],
};

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  await params; // handle wiring comes with the real public read
  return <PublicProfileShell data={SAMPLE} />;
}
