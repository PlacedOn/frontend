import { SignalField } from "@/components/background/SignalField";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { VerifiedCompanies } from "@/components/sections/VerifiedCompanies";
import { TrustRow } from "@/components/sections/TrustRow";
import { HowItWorks } from "@/components/sections/HowItWorks";
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
        <VerifiedCompanies />
        <TrustRow />
        <HowItWorks />
        <Audiences />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
