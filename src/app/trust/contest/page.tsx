import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import {
  KeyFacts,
  DocSection,
  CheckList,
  PlacedonPanel,
  TrustFooterBlock,
} from "@/components/trust/TrustDoc";

export const metadata: Metadata = {
  title: "Contest a trait — Placedon",
  description:
    "Every trait Placedon extracts is visible to the candidate, tied to evidence, and challengeable. Here is exactly how to contest one.",
};

export default function ContestPage() {
  return (
    <RoutePage
      eyebrow="Contest a trait"
      title={
        <>
          No score is <span className="grad-iris">final</span> without a way to challenge it.
        </>
      }
      intro="You should never be labelled by a machine you can't talk back to. Before any trait reaches an employer, you see it, you see the exact moment it came from, and you can accept, hide, or formally contest it."
    >
      <KeyFacts
        items={[
          { value: "You first", label: "Candidates review traits before any employer does" },
          { value: "Every trait", label: "Shows the transcript moment it was drawn from" },
          { value: "Human review", label: "A person re-examines anything you contest" },
        ]}
      />

      <DocSection title="Your rights over your own signal">
        <p>
          A Placedon profile is yours before it is anyone else&apos;s. Every trait we extract is
          shown to you with the evidence attached — the specific passage from your own words that
          produced it. Nothing is published to an employer that you haven&apos;t had the chance to
          see and respond to.
        </p>
        <CheckList
          items={[
            <>
              <strong>See everything.</strong> Full visibility of each trait, its score, its
              confidence band, and its source moment.
            </>,
            <>
              <strong>Hide what you don&apos;t want shared.</strong> You control which traits appear
              on a shared profile.
            </>,
            <>
              <strong>Contest what feels wrong.</strong> Flag a trait, say why, and trigger human
              review.
            </>,
            <>
              <strong>Retake if the day wasn&apos;t your day.</strong> One interview is a snapshot,
              not a verdict.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="How contesting a trait works">
        <p>The process is deliberately simple and quick:</p>
        <CheckList
          items={[
            <>
              <strong>1. Open the trait.</strong> On your profile, expand any trait to read the
              evidence Placedon linked to it.
            </>,
            <>
              <strong>2. Flag it.</strong>{" "}If the evidence doesn&apos;t support the score — or misses
              context — mark it as contested and tell us why in your own words.
            </>,
            <>
              <strong>3. Human review.</strong> A reviewer re-examines the moment against your note.
              Automated scoring alone never settles a contest.
            </>,
            <>
              <strong>4. Resolution.</strong> The trait is corrected, re-scored, annotated with your
              response, or removed. A contested trait is never shown to an employer as if it were
              settled.
            </>,
          ]}
        />
      </DocSection>

      <PlacedonPanel title="Why we build it this way">
        <p>
          Contestability isn&apos;t a courtesy — it&apos;s how the system stays honest. It&apos;s
          also what the law increasingly expects: meaningful human oversight under the{" "}
          <a href="/trust/eu-ai-act" className="font-medium text-[var(--iris-ink)] hover:underline">
            EU AI Act
          </a>{" "}
          and a real alternative process under{" "}
          <a href="/trust/ll144" className="font-medium text-[var(--iris-ink)] hover:underline">
            NYC Local Law 144
          </a>
          . To understand how a trait was scored in the first place, see{" "}
          <a href="/trust/scoring" className="font-medium text-[var(--iris-ink)] hover:underline">
            How scoring works
          </a>
          .
        </p>
      </PlacedonPanel>

      <TrustFooterBlock
        current="/trust/contest"
        sources={[
          {
            label: "EU AI Act — human oversight (Article 14)",
            href: "https://artificialintelligenceact.eu/article/14/",
          },
          {
            label: "NYC DCWP — Automated Employment Decision Tools",
            href: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
          },
        ]}
      />
    </RoutePage>
  );
}
