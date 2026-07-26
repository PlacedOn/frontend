import { Nav } from "@/components/sections/Nav";
import { PaperHero } from "@/components/sections/paper/PaperHero";
import { PaperSteps } from "@/components/sections/paper/PaperSteps";
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
        <PaperSteps />
        <PaperDualPath />
        <PaperTrust />
        <PaperFaq />
        <PaperCta />
      </main>
      <Footer />
    </>
  );
}
