import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { InterviewRoom } from "@/components/interview/InterviewRoom";

export const metadata: Metadata = {
  title: "Interview room — PlacedOn",
  description: "A live, adaptive conversation — not a test. Answer in your own words; you review every trait before employers see it.",
};

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : undefined;

  return (
    <RoutePage
      eyebrow="Live interview"
      title={
        <>
          A conversation, <span className="grad-iris">not a test</span>.
        </>
      }
      intro="Answer in your own words. No timer, no trick questions — just a few questions that adapt to what you say."
    >
      <InterviewRoom initialId={id} />
    </RoutePage>
  );
}
