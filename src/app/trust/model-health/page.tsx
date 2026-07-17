import type { Metadata } from "next";
import { RoutePage } from "@/components/layout/RoutePage";
import { KeyFacts, DocSection, CheckList, PlacedonPanel, TrustFooterBlock } from "@/components/trust/TrustDoc";

export const metadata: Metadata = {
  title: "How we measure the model — Placedon",
  description:
    "The AI that assesses candidates is itself continuously graded against human review — for accuracy, grounding, fairness, and calibration — and no version ships unless it clears the bar and isn't worse than the last.",
};

export default function ModelHealthPage() {
  return (
    <RoutePage
      eyebrow="How we measure the model"
      title={
        <>
          We hold the AI to the same <span className="grad-iris">evidence bar</span> as the people it interviews.
        </>
      }
      intro="A tool that helps judge people has to be held to a higher standard than the people it judges. So we grade it — continuously, against real human review, with the same discipline we apply to candidates. Here, 'is the model good?' is never a vibe. It's a number, with an honest interval around it, and a gate that blocks anything worse than what's live."
    >
      <KeyFacts
        items={[
          { value: "4 checks", label: "Every model version is scored on accuracy, grounding, fairness, and calibration" },
          { value: "Human review", label: "Is the ground truth — the model is graded against people, not the reverse" },
          { value: "Two gates", label: "A change ships only if it clears the bar and isn't worse than the last version" },
        ]}
      />

      <DocSection title="Why we measure the measurer">
        <p>
          The model that reads an interview is a tool, and a tool that informs decisions about
          people carries a duty the person it&apos;s judging never asked for. So we don&apos;t take
          its quality on faith. Every version is scored against what real human reviewers actually
          concluded — the same evidence-first standard the whole product runs on, turned back on the
          model itself.
        </p>
      </DocSection>

      <DocSection title="What we check, on every version">
        <CheckList
          items={[
            <>
              <strong>Evidence accuracy.</strong> Does the model&apos;s evidence band match what a
              human reviewer concluded? Over-claiming — calling weak evidence &ldquo;strong&rdquo; —
              is treated as a worse error than a near miss, because it&apos;s the one that erodes
              trust fastest.
            </>,
            <>
              <strong>Quote grounding.</strong> Every claim must quote the candidate&apos;s own
              words, verbatim. A &ldquo;supported&rdquo; call with no grounded quote is a
              fabrication, and it&apos;s rejected — not softened.
            </>,
            <>
              <strong>Matched-pair fairness.</strong> Swap only a proxy detail — where someone
              studied, where they&apos;re from — and the assessment must come out identical. Any
              change at all is a leak, and the version fails.
            </>,
            <>
              <strong>Band calibration.</strong> Do the bands mean what they say? We track how often
              candidates agree with each band and flag any that drift from what people accept.
            </>,
          ]}
        />
      </DocSection>

      <DocSection title="Two gates before a change ships">
        <p>Techniques improve, models change. Neither ships on optimism:</p>
        <CheckList
          items={[
            <>
              <strong>The absolute bar.</strong> Accuracy, grounding, and fairness must each clear a
              fixed threshold — including a four-fifths adverse-impact check across groups.
            </>,
            <>
              <strong>The regression gate.</strong> The new version must not be worse than the one
              it replaces on any of those measures. A change that &ldquo;still passes&rdquo; but
              quietly degrades accuracy, adds over-claims, or slips on fairness is blocked.
            </>,
          ]}
        />
      </DocSection>

      <PlacedonPanel title="Honest about small samples">
        Early on, with only a handful of reviewed interviews, the numbers are genuinely uncertain.
        So we report a confidence interval rather than a false-precise figure, and flag when a result
        is too thin to act on. We would rather say &ldquo;we don&apos;t know yet&rdquo; than pretend a
        four-interview average is a verdict.
      </PlacedonPanel>

      <DocSection title="Still no person-score — even here">
        <p>
          Measuring the model produces measurements of the <em>model</em> — never a hidden score of
          a person. The same fairness firewall that keeps protected attributes and pedigree out of
          an assessment also keeps them out of the labels we grade the model on. There is no place in
          this pipeline, at any layer, where a human is reduced to a single number.
        </p>
      </DocSection>

      <TrustFooterBlock current="/trust/model-health" />
    </RoutePage>
  );
}
