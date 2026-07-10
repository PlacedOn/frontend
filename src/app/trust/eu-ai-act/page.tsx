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
  title: "EU AI Act — Placedon",
  description:
    "Recruitment AI is high-risk under the EU AI Act. What that means, the obligations it creates, and how Placedon is built to help deployers meet them.",
};

export default function EuAiActPage() {
  return (
    <RoutePage
      eyebrow="EU AI Act"
      title={
        <>
          Treated as <span className="grad-iris">high-risk</span> — because hiring is.
        </>
      }
      intro="Under the EU AI Act, AI used to recruit or evaluate candidates is classified as high-risk. That triggers real obligations around documentation, oversight, and fairness. Placedon is built so employers can meet them rather than work around them."
    >
      <KeyFacts
        items={[
          { value: "Annex III", label: "Recruitment AI is named a high-risk use case" },
          { value: "Art. 14", label: "Meaningful human oversight is mandatory" },
          { value: "€15M / 3%", label: "Deployer penalty ceiling — fine or global turnover" },
        ]}
      />

      <DocSection title="Why recruitment is high-risk">
        <p>
          The Act sorts AI systems by risk. Systems used for the recruitment or selection of people
          — screening applications, evaluating candidates — sit in the high-risk category (Annex
          III), because they can materially affect someone&apos;s livelihood and can encode bias at
          scale. High-risk does not mean banned; it means accountable. Both the provider that builds
          the system and the deployer that uses it carry duties.
        </p>
      </DocSection>

      <DocSection title="What high-risk obligations look like">
        <CheckList
          items={[
            <>
              <strong>Risk management &amp; data governance.</strong> Identify and mitigate
              foreseeable risks; test training and evaluation data for bias.
            </>,
            <>
              <strong>Technical documentation &amp; logging.</strong> Keep records of how the system
              works and automatic logs of its operation for traceability.
            </>,
            <>
              <strong>Transparency.</strong> People must be told, clearly, when they are interacting
              with an AI system and what it assesses.
            </>,
            <>
              <strong>Human oversight (Article 14).</strong>{" "}A person must be able to understand,
              override, and disregard the system&apos;s output — it cannot be the sole decider.
            </>,
            <>
              <strong>Accuracy &amp; robustness.</strong> Consistent, well-characterised performance,
              with continuous monitoring after deployment.
            </>,
          ]}
        />
        <p>
          High-risk obligations phase in from August 2026, and timelines may shift as implementation
          guidance (including the proposed Digital Omnibus) is finalised. Deployer penalties for the
          most serious breaches reach up to €15 million or 3% of worldwide annual turnover.
        </p>
      </DocSection>

      <DocSection title="How Placedon is built to help deployers comply">
        <CheckList
          items={[
            <>
              <strong>Traceable by default.</strong> Each trait score links to the evidence behind
              it, and operation is logged — the audit trail the Act expects, without extra work.
            </>,
            <>
              <strong>Documented logic &amp; data lineage.</strong> We keep records of how models
              assess, what data trained them, and the bias testing they passed.
            </>,
            <>
              <strong>Transparency to candidates.</strong> Candidates are told an AI assessment is in
              use and what it measures, up front.
            </>,
            <>
              <strong>Human oversight enforced in product.</strong> Placedon never issues a final
              hire/reject decision. Output is advisory; a person decides and can override it.
            </>,
          ]}
        />
      </DocSection>

      <PlacedonPanel title="An honest status note">
        <p>
          Placedon is pre-launch and not established in the EU today. We describe how the product is
          designed to support a deployer&apos;s obligations — we are not asserting a completed
          conformity assessment or CE marking. As we serve EU-based roles, the specific technical
          documentation and oversight records will be made available to those deployers. This page is
          a plain-language summary, not legal advice.
        </p>
      </PlacedonPanel>

      <TrustFooterBlock
        current="/trust/eu-ai-act"
        sources={[
          {
            label: "European Commission — Regulatory framework on AI",
            href: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
          },
          {
            label: "EU AI Act — high-risk systems (Annex III)",
            href: "https://artificialintelligenceact.eu/high-level-summary/",
          },
        ]}
      />
    </RoutePage>
  );
}
