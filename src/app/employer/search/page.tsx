import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { CopilotSearch } from "@/components/employer/CopilotSearch";

export const metadata: Metadata = {
  title: "HR Copilot — Placedon",
  description: "Search candidates by the work they can evidence — not by identity or pedigree. Every result is backed by their own approved, quoted words.",
};

export default function CopilotSearchPage() {
  return (
    <>
      <PageHeading
        eyebrow="For teams · HR Copilot"
        title={
          <>
            Search the <span className="grad-iris">evidence</span>, not the resume.
          </>
        }
        intro="Describe the work in plain words. The Copilot refuses protected-class filters, strips pedigree bias, and returns only candidates whose approved evidence backs your ask — cited in their own words."
      />
      <CopilotSearch />
    </>
  );
}
