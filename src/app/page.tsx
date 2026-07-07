import { AuroraMesh } from "@/components/background/AuroraMesh";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Audiences } from "@/components/sections/Audiences";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <AuroraMesh />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <Audiences />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
