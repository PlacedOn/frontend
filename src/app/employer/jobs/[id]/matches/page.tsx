import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { MatchList } from "@/components/employer/matches/MatchList";

export const metadata: Metadata = {
  title: "Explained matches — Placedon",
  description:
    "Per-signal evidence bands with the candidate's own quoted words and disclosed salary fit — never a single score.",
};

export default async function JobMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PageHeading
        eyebrow="For teams · explained matches"
        title={
          <>
            Matched on <span className="grad-iris">evidence, dimension by dimension</span>.
          </>
        }
        intro="Each candidate is lined up against your Role DNA signals — supported, emerging, or missing — cited with their own approved words, plus how your disclosed salary meets their expectation. No overall score exists."
      />
      <MatchList jobId={id} />
    </>
  );
}
