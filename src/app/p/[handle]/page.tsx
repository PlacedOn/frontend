import type { Metadata } from "next";
import { PublicProfileShell, type PublicProfileData } from "@/components/candidate/profile/public/PublicProfileShell";
import { PublicProfileUnavailable } from "@/components/candidate/profile/public/PublicProfileUnavailable";

export const metadata: Metadata = {
  title: "Profile — Placedon",
  description: "An evidence-based candidate profile: authored story above, earned evidence below the seam.",
};

// Sample data — reachable only via the explicit preview handles below, and
// always rendered with a "sample profile" badge. It is never shown for a real
// handle, so it can't be mistaken for an actual candidate.
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

const PREVIEW_HANDLES = new Set(["preview", "sample", "demo"]);

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  // Explicit, badged design preview so the surface stays viewable without lying.
  if (PREVIEW_HANDLES.has(handle.toLowerCase())) {
    return <PublicProfileShell data={SAMPLE} preview />;
  }

  // No public-read-by-handle endpoint exists yet, and profiles are private by
  // default — so a real handle must never be answered with fabricated evidence.
  // When the read + per-section visibility land, resolve the profile here and
  // render the shell only if the owner has published it.
  return <PublicProfileUnavailable />;
}
