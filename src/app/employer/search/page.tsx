import type { Metadata } from "next";
import { HrCommandDeck } from "@/components/employer/HrCommandDeck";

export const metadata: Metadata = {
  title: "HR Copilot — Placedon",
  description:
    "Describe the role in plain words. The Copilot drafts the assessment and returns candidates ranked by evidence — never identity or pedigree.",
};

export default function CopilotSearchPage() {
  return <HrCommandDeck />;
}
