import { Globe as GlobeIcon, Mic, Scale } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Globe } from "@/components/ui/globe";
import { SectionAurora } from "@/components/background/SectionAurora";

const POINTS = [
  { icon: GlobeIcon, text: "Runs in the browser, in any timezone — no travel, no scheduling roulette." },
  { icon: Mic, text: "Voice or text, whichever the candidate is comfortable with." },
  { icon: Scale, text: "The same fair, bias-audited scoring wherever they are." },
];

/** Remote-first capability, shown with an interactive globe (drag to spin). */
export function GlobalReach() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <SectionAurora />
      <div className="shell relative z-[1] grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <p className="eyebrow">Remote-first by design</p>
          <h2 className="mt-3 max-w-xl text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)]">
            Interview anyone, <span className="grad-iris">anywhere</span>.
          </h2>
          <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            One adaptive interview, run entirely in the browser. Whether your
            candidate is in Bengaluru, London or San Francisco, they get the same
            honest conversation — and you get the same signal back.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3.5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}
                >
                  <Icon size={17} animateOnView animateOnHover />
                </span>
                <span className="pt-1.5 text-[15px] leading-relaxed text-[var(--ink-2)]">{text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[460px]">
            {/* soft violet spotlight so the globe reads on porcelain */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(154,107,255,0.20), transparent 62%)",
                filter: "blur(34px)",
              }}
            />
            <div className="relative mx-auto aspect-square w-full">
              <Globe />
            </div>
            <p className="mt-4 text-center text-[12.5px] text-[var(--ink-3)]">
              Drag to spin · cities shown are illustrative
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
