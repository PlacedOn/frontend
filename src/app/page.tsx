import { SignalField } from "@/components/background/SignalField";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { DualPath } from "@/components/sections/DualPath";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturedSurfaces } from "@/components/sections/FeaturedSurfaces";
import { TrustBand } from "@/components/sections/TrustBand";
import { StatsBand } from "@/components/sections/StatsBand";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { Audiences } from "@/components/sections/Audiences";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

/**
 * Landing — "Ink & Paper" editorial flow. Filler/AI-slop sections removed
 * (KineticMarquee slogan wall, VerifiedCompanies placeholder marquee, fictional
 * Testimonials, VisionReel), replaced with substantive information: a clear
 * dual-path, a real trust/compliance band, honest product numbers, and an FAQ.
 */
export default function Home() {
  return (
    <>
      <SignalField />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <Hero />
        <DualPath />
        <HowItWorks />
        <FeaturedSurfaces />
        <TrustBand />
        <StatsBand />
        <GlobalReach />
        <Audiences />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
