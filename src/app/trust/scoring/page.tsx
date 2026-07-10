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
  title: "How scoring works — Placedon",
  description:
    "Exactly how Placedon turns one interview into evidence-linked trait scores with a calibrated confidence band — and where a human decides.",
};

export default function ScoringPage() {
  return (
    <RoutePage
      eyebrow="How scoring works"
      title={
        <>
          A score is only as good as the <span className="grad-iris">evidence</span> behind it.
        </>
      }
      intro="Placedon does not hand you a magic number. It listens to one structured conversation, extracts the traits a role actually needs, and links every trait back to the exact moment it was demonstrated — with an honest confidence band around it."
    >
      <KeyFacts
        items={[
          { value: "0–100", label: "Per-trait score, never a single overall rank" },
          { value: "Every trait", label: "Links to the transcript moment behind it" },
          { value: "Human", label: "Makes the hiring decision — the model informs it" },
        ]}
      />

      <DocSection title="What we measure">
        <p>
          We don&apos;t score &ldquo;a person.&rdquo; We score specific, job-relevant traits — the
          way someone reasons through ambiguity, how they make a hard call, how clearly they bring
          others along, how fast they learn from a mistake. Each role defines which traits matter
          before anyone is interviewed, so the same rubric applies to every candidate for that
          role.
        </p>
        <p>
          We deliberately do not infer protected characteristics, personality &ldquo;types,&rdquo;
          or anything a résumé keyword could stand in for. If a trait can&apos;t be tied to observed
          behaviour in the conversation, it doesn&apos;t get a score.
        </p>
      </DocSection>

      <DocSection title="From conversation to signal">
        <p>The pipeline is intentionally boring and inspectable. In order:</p>
        <CheckList
          items={[
            <>
              <strong>Structured interview.</strong> A consistent set of questions per role, adapted
              in follow-up depth — not in difficulty — so everyone is measured on the same ground.
            </>,
            <>
              <strong>Language understanding.</strong> Responses are turned into semantic embeddings
              and matched against the behaviours each trait is defined by. We compare meaning, not
              keywords, so a strong answer phrased plainly scores as well as a polished one.
            </>,
            <>
              <strong>Evidence linking.</strong>{" "}Every point of a trait&apos;s score is anchored to
              the specific passage that earned it. No passage, no points.
            </>,
            <>
              <strong>Calibrated confidence.</strong>{" "}Thin or ambiguous evidence widens the
              uncertainty band and lowers confidence — the model says &ldquo;I&apos;m not sure&rdquo;
              out loud instead of guessing precisely.
            </>,
            <>
              <strong>Bias guard.</strong> A separate check screens each generated question and score
              for adverse-impact patterns before results are shown.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="Why the confidence band matters">
        <p>
          Most tools give you a number that looks certain whether or not it should be. Placedon
          reports a score <em>and</em> the range it&apos;s confident in. A trait shown as 82 with a
          tight band means the evidence was clear and consistent. The same 82 with a wide band means
          &ldquo;promising, but ask more.&rdquo; That distinction is the point — it tells you where a
          human should look closer rather than pretending the machine already knows.
        </p>
      </DocSection>

      <PlacedonPanel title="Where the human stays in charge">
        <p>
          Placedon never auto-rejects or auto-hires. Scores and evidence are decision support for a
          person, who makes the call and owns it. A candidate can see, question, and contest every
          trait before it ever reaches an employer — see{" "}
          <a href="/trust/contest" className="font-medium text-[var(--iris-ink)] hover:underline">
            Contest a trait
          </a>
          .
        </p>
      </PlacedonPanel>

      <TrustFooterBlock
        current="/trust/scoring"
        sources={[
          {
            label: "NYC DCWP — Automated Employment Decision Tools",
            href: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
          },
          {
            label: "EU AI Act — official overview",
            href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
          },
        ]}
      />
    </RoutePage>
  );
}
