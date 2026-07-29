import { SignalField } from "@/components/background/SignalField";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { KineticMarquee } from "@/components/motion/KineticMarquee";
import { VerifiedCompanies } from "@/components/sections/VerifiedCompanies";
import { TrustRow } from "@/components/sections/TrustRow";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { Audiences } from "@/components/sections/Audiences";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

/**
 * Homepage.
 *
 * Section count stays tight (Harvey ships four content sections), but the
 * motion pieces are back. Cutting them was a mistake: it was done on a
 * measurement of the *static* HTML, which showed no canvas and no motion
 * library on the references. Re-measured against the hydrated DOM, Harvey runs
 * a full-bleed WebGL paper shader at z-index -1 and Scale runs a 26-shader
 * three.js scene as page content. Motion is not what separates PlacedOn from
 * them — colour discipline and structure are.
 *
 * KineticMarquee (type in motion) and GlobalReach (the cobe globe, PlacedOn's
 * Scale-style 3D content piece) are restored.
 */
export default function Home() {
  return (
    <>
      <SignalField />
      <Nav />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <Hero />
        <KineticMarquee />
        <VerifiedCompanies />
        <TrustRow />
        <HowItWorks />
        <GlobalReach />
        <Audiences />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
