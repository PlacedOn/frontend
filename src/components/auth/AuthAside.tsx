import Link from "next/link";
import { ShieldCheck, MessagesSquare, Scale } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "You control what employers see",
    sub: "Every trait is yours to approve before anyone else sees it.",
  },
  {
    icon: MessagesSquare,
    title: "One honest interview",
    sub: "Around 25 minutes, no trick questions, no resume theatre.",
  },
  {
    icon: Scale,
    title: "Fair and bias-audited",
    sub: "Aligned with NYC LL144 and the EU AI Act.",
  },
];

const NEXT_STEPS = [
  {
    title: "Create your free account",
    sub: "Job seekers and hiring teams each get their own dashboard.",
  },
  {
    title: "One honest interview",
    sub: "About 25 minutes. No trick questions, no resume theatre.",
  },
  {
    title: "You approve what's shared",
    sub: "Nothing reaches employers without your say-so.",
  },
];

/** Subtle line-art texture: flowing arcs in the brand hairline tone. */
function FlowLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 460 340"
      fill="none"
      className="pointer-events-none absolute -top-10 right-0 hidden w-[440px] max-w-[72%] lg:block"
    >
      <path d="M470 8 C 340 26, 236 88, 160 176 C 106 238, 66 292, 30 348" stroke="var(--iris-line)" strokeWidth="1" strokeOpacity="0.9" />
      <path d="M470 44 C 352 62, 258 116, 190 196 C 140 254, 104 302, 72 352" stroke="var(--iris-line)" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M470 84 C 366 100, 284 146, 222 218 C 178 268, 146 310, 118 354" stroke="var(--iris-line)" strokeWidth="1" strokeOpacity="0.55" />
      <path d="M470 128 C 382 142, 312 180, 258 240 C 220 282, 192 318, 168 356" stroke="var(--iris-line)" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M470 176 C 398 188, 342 218, 298 266 C 268 298, 244 328, 224 358" stroke="var(--iris-line)" strokeWidth="1" strokeOpacity="0.28" />
      <circle cx="160" cy="176" r="3" fill="var(--iris)" fillOpacity="0.32" />
      <circle cx="298" cy="266" r="2.5" fill="var(--iris)" fillOpacity="0.2" />
    </svg>
  );
}

/** Brand side of the login split: atmosphere, promise, trust points. */
export function AuthAside() {
  return (
    <aside className="relative flex min-w-0 flex-col gap-8 lg:gap-11">
      <FlowLines />

      <Link href="/" aria-label="Placedon home" className="relative self-start">
        <Logo />
      </Link>

      <div className="relative min-w-0">
        <p className="eyebrow">Welcome to Placedon</p>
        <h1 className="mt-3 max-w-md text-[clamp(1.9rem,1.2rem+2.8vw,3rem)]">
          One honest conversation.{" "}
          <span className="grad-iris">The rest follows.</span>
        </h1>
        <p className="mt-4 hidden max-w-md text-[15.5px] leading-relaxed text-[var(--ink-2)] sm:block">
          Sign in to pick up where you left off, or create an account and tell us who you are.
          Job seekers and hiring teams each get their own side of the table.
        </p>

        {/* compact reassurance for small screens, where the full lists are hidden */}
        <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
          <span className="chip">
            <ShieldCheck size={14} style={{ color: "var(--iris)" }} aria-hidden="true" />
            You approve what&rsquo;s shared
          </span>
          <span className="chip">
            <MessagesSquare size={14} style={{ color: "var(--iris)" }} aria-hidden="true" />
            Free for candidates
          </span>
        </div>
      </div>

      <ul className="relative hidden flex-col gap-5 lg:flex">
        {TRUST_POINTS.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(115, 54, 255,0.07))",
                border: "1px solid var(--iris-line)",
                color: "var(--iris)",
                boxShadow: "var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[var(--ink)]">{title}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">{sub}</p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="glass relative hidden max-w-md overflow-hidden rounded-[var(--r-card)] p-6 lg:block"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        {/* iris hairline along the top edge */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--iris-line) 30%, rgba(115, 54, 255,0.45) 50%, var(--iris-line) 70%, transparent)",
          }}
        />
        <p
          className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          What happens next
        </p>
        <ol className="mt-4 flex flex-col">
          {NEXT_STEPS.map(({ title, sub }, index) => {
            const isLast = index === NEXT_STEPS.length - 1;
            return (
              <li key={title} className="relative flex gap-3.5 pb-4 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-[13px] top-8 w-px"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--iris-line), rgba(115, 54, 255,0.06))",
                    }}
                  />
                )}
                <span
                  className="grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--iris-ghost)",
                    border: "1px solid var(--iris-line)",
                    color: "var(--iris-ink)",
                  }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[14px] font-semibold leading-snug text-[var(--ink)]">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-2)]">{sub}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
