import type { ReactNode } from "react";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { RouteHeader } from "./RouteHeader";
import { Footer } from "@/components/sections/Footer";

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
};

/** Shared shell for sub-routes: mesh backdrop, header, hero header, footer. */
export function RoutePage({ eyebrow, title, intro, children }: Props) {
  return (
    <>
      <AuroraMesh />
      <RouteHeader />
      <main className="relative" style={{ zIndex: "var(--z-base)" }}>
        <section className="shell pt-36 pb-8 md:pt-40">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,1.4rem+3vw,3.6rem)]">{title}</h1>
          {intro && (
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[var(--ink-2)]">{intro}</p>
          )}
        </section>
        <section className="shell pb-24">{children}</section>
      </main>
      <Footer />
    </>
  );
}
