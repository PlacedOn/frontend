import { AuroraFlow } from "@/components/background/AuroraFlow";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import { ScrollStatement } from "@/components/motion/ScrollStatement";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Audiences } from "@/components/sections/Audiences";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <AuroraFlow />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <Hero />
        <KineticMarquee />
        <ScrollStatement />
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
