import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "PlacedOn — AI interviews for hiring teams",
  description:
    "Stop hiring by paper. PlacedOn interviews every candidate with adaptive AI and shows you what they can actually do — backed by evidence, bias-audited, no single score.",
  openGraph: {
    title: "PlacedOn — Built for Talent. Powered by Precision.",
    description:
      "AI interviews that surface what candidates can actually do — evidence, not resumes. Bias-audited to NYC Local Law 144 and the EU AI Act.",
    type: "website",
  },
};
import { PaperHero } from "@/components/sections/paper/PaperHero";
import { PaperSteps } from "@/components/sections/paper/PaperSteps";
import { ProductPreview } from "@/components/sections/paper/ProductPreview";
import { PaperDualPath } from "@/components/sections/paper/PaperDualPath";
import { PaperTrust } from "@/components/sections/paper/PaperTrust";
import { PaperFaq } from "@/components/sections/paper/PaperFaq";
import { PaperCta } from "@/components/sections/paper/PaperCta";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <PaperHero />
        <Reveal><PaperSteps /></Reveal>
        <ProductPreview />
        <Reveal><PaperDualPath /></Reveal>
        <Reveal><PaperTrust /></Reveal>
        <Reveal><PaperFaq /></Reveal>
        <Reveal><PaperCta /></Reveal>
      </main>
      <Footer />
    </>
  );
}
