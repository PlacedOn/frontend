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

/** Brand side of the login split: atmosphere, promise, trust points. */
export function AuthAside() {
  return (
    <aside className="flex min-w-0 flex-col gap-8 lg:gap-12">
      <Link href="/" aria-label="Placedon home" className="self-start">
        <Logo />
      </Link>

      <div className="min-w-0">
        <p className="eyebrow">Welcome to Placedon</p>
        <h1 className="mt-3 max-w-md text-[clamp(1.9rem,1.2rem+2.8vw,3rem)]">
          One honest conversation.{" "}
          <span className="grad-iris">The rest follows.</span>
        </h1>
        <p className="mt-4 hidden max-w-md text-[15.5px] leading-relaxed text-[var(--ink-2)] sm:block">
          Sign in to pick up where you left off, or create an account and tell us who you are.
          Job seekers and hiring teams each get their own side of the table.
        </p>
      </div>

      <ul className="hidden flex-col gap-5 lg:flex">
        {TRUST_POINTS.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                background: "var(--glass-hi)",
                border: "1px solid var(--glass-line)",
                color: "var(--iris)",
                boxShadow: "var(--shadow-sm)",
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

      <figure
        className="glass hidden max-w-md rounded-[var(--r-card)] p-5 lg:block"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <blockquote className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          &ldquo;The first interview where I felt seen for how I think, not how my resume
          reads.&rdquo;
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[var(--ink-3)]">
          <span className="livedot" aria-hidden="true" />
          Priya, product engineer &middot; placed via Placedon
        </figcaption>
      </figure>
    </aside>
  );
}
