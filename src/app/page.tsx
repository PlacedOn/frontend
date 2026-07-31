import { SignalField } from "@/components/background/SignalField";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { VisionReel } from "@/components/sections/VisionReel";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturedSurfaces } from "@/components/sections/FeaturedSurfaces";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { SignalAccordion } from "@/components/sections/SignalAccordion";
import { Testimonials } from "@/components/sections/Testimonials";
import { Audiences } from "@/components/sections/Audiences";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <SignalField />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <Hero />
        <Problem />
        <SignalAccordion />
        <VisionReel />
        <HowItWorks />
        <FeaturedSurfaces />
        <GlobalReach />
        <Testimonials />
        <Audiences />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
