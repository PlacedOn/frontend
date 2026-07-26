import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

/**
 * Full-bleed image band (Scale/Harvey style). The image is a CSS background over
 * a solid ink fallback, so the section looks intentional whether or not the
 * asset exists yet — drop /public/img/team.jpg in and it appears. Text keeps
 * AA contrast against the dark overlay regardless.
 */
export function ImageBand() {
  return (
    <section className="shell py-8">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-[calc(var(--r-card)+6px)] px-8 py-16 sm:px-14 sm:py-24"
          style={{
            backgroundColor: "var(--ink)",
            backgroundImage:
              "linear-gradient(90deg, rgba(20,20,18,0.88) 0%, rgba(20,20,18,0.5) 48%, rgba(20,20,18,0.18) 100%), url(/img/team.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60" style={{ fontFamily: "var(--font-mono)" }}>
              Built for the people who hire
            </p>
            <h2 className="mt-4 text-[clamp(2rem,1.3rem+2.8vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              Hire for what people can do.
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/75">
              One honest interview, evidence you can point to, and a shortlist you can defend. That&rsquo;s
              hiring your team can stand behind.
            </p>
            <div className="mt-8">
              <Button href="/companies" className="!bg-white !text-[var(--ink)] hover:!bg-white/90">
                Book a demo
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
