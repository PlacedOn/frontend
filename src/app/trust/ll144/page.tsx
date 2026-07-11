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
  title: "NYC Local Law 144 — Placedon",
  description:
    "What New York City's bias-audit law for automated hiring tools requires, and how Placedon is built to make employer compliance straightforward.",
};

export default function Ll144Page() {
  return (
    <RoutePage
      eyebrow="NYC Local Law 144"
      title={
        <>
          Built for the <span className="grad-iris">bias-audit</span> law, not around it.
        </>
      }
      intro="If you use an automated tool to help hire or promote someone working in New York City, Local Law 144 sets rules: an independent bias audit, a public summary, and advance notice to candidates. Here is what the law asks for and how Placedon supports each part."
    >
      <KeyFacts
        items={[
          { value: "Annual", label: "Independent bias audit, not by the employer or vendor" },
          { value: "≥ 10 days", label: "Advance notice to candidates before use" },
          { value: "$500–$1,500", label: "Per-violation penalty (about ₹42,000–₹1.3 lakh), charged per day" },
        ]}
      />

      <DocSection title="What the law requires">
        <p>
          Local Law 144 governs an &ldquo;automated employment decision tool&rdquo; (AEDT) — software
          that uses machine learning or statistical modelling to substantially assist a hiring or
          promotion decision for a role based in NYC. If a tool meets that bar, the{" "}
          <em>employer</em> must:
        </p>
        <CheckList
          items={[
            <>
              Commission an <strong>independent bias audit</strong> within the past year — performed
              by an auditor with no stake in the tool or the employer.
            </>,
            <>
              Publish a <strong>summary of the audit results</strong> publicly, including impact
              ratios across sex, race/ethnicity, and intersectional categories.
            </>,
            <>
              Give candidates and employees at least <strong>ten business days&apos; notice</strong>{" "}
              before the tool is used, disclosing that an AEDT is in use and the job qualifications
              it assesses.
            </>,
            <>
              Offer an <strong>alternative process or accommodation</strong> and honour data-related
              requests where required.
            </>,
          ]}
        />
        <p>
          Enforcement sits with the NYC Department of Consumer and Worker Protection (DCWP). Penalties
          run from $500 (about ₹42,000) for a first violation up to $1,500 (about ₹1.3 lakh) for each
          subsequent one — and each day a
          tool is used out of compliance can count as a separate violation.
        </p>
      </DocSection>

      <DocSection title="How Placedon supports compliance">
        <p>
          The legal obligation belongs to the employer, but a tool can make it easy or painful to
          meet. Placedon is built to make it easy:
        </p>
        <CheckList
          items={[
            <>
              <strong>Audit-ready by design.</strong> Every trait model is tested for adverse impact
              across protected groups, and we retain the scoring records and evidence links an
              independent auditor needs to compute impact ratios.
            </>,
            <>
              <strong>Candidate notice built in.</strong> The flow discloses that an AI assessment is
              in use and the qualifications being measured, so the ten-business-day notice
              requirement is straightforward to satisfy.
            </>,
            <>
              <strong>A published summary, here.</strong> When Placedon serves NYC roles, the
              independent audit summary is posted on this page — not buried in a contract.
            </>,
            <>
              <strong>A real alternative.</strong> Candidates can contest any trait and request human
              review, so the tool never becomes an unappealable gate.
            </>,
          ]}
        />
      </DocSection>

      <PlacedonPanel title="Where we are today — stated plainly">
        <p>
          Placedon is pre-launch. We have not yet run a public NYC engagement, so there is no
          completed audit summary to post <em>yet</em>. We&apos;re telling you our commitment, not
          claiming a finished result: before Placedon assists a hiring decision for any NYC-based
          role, an independent bias-audit summary will be published on this page and dated. If you
          are evaluating us for an NYC role, ask — we&apos;ll show you exactly where that stands.
        </p>
        <p className="text-[13px] text-[var(--ink-3)]">
          The rules tightened further in 2026; employers should confirm current obligations with
          their own counsel.
        </p>
      </PlacedonPanel>

      <TrustFooterBlock
        current="/trust/ll144"
        sources={[
          {
            label: "NYC DCWP — Automated Employment Decision Tools (Local Law 144)",
            href: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
          },
          {
            label: "NYC DCWP — AEDT FAQ",
            href: "https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf",
          },
        ]}
      />
    </RoutePage>
  );
}
