import { Logo } from "@/components/brand/Logo";

type FooterLink = { label: string; href: string };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "For teams", href: "/#teams" },
      { label: "For candidates", href: "/#candidates" },
      { label: "Take an interview", href: "/pre-interview" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "LL144 compliance", href: "/trust" },
      { label: "EU AI Act", href: "/trust" },
      { label: "How scoring works", href: "/trust" },
      { label: "Contest a trait", href: "/trust" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "For candidates", href: "/candidate" },
      { label: "For employers", href: "/employer" },
      { label: "Book a demo", href: "/demo" },
      { label: "Contact", href: "mailto:hello@placedon.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative pb-10 pt-8">
      <div className="shell">
        <div className="glass rounded-[var(--r-card)] p-8 md:p-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--ink-2)]">
                The interview that speaks for you. Hire and get hired on how people
                actually think.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {COLS.map((col) => (
                <div key={col.title}>
                  <p className="text-[12px] uppercase tracking-wider text-[var(--ink-3)]" style={{ fontFamily: "var(--font-mono)" }}>
                    {col.title}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {col.links.map((l) => (
                      <li key={l.label + l.href}>
                        <a href={l.href} className="text-[14px] text-[var(--ink-2)] transition-colors duration-[var(--d-micro)] hover:text-[var(--ink)]">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 text-[13px] text-[var(--ink-3)] sm:flex-row sm:items-center" style={{ borderColor: "var(--glass-line)" }}>
            <span>© {new Date().getFullYear()} PlacedOn. All rights reserved.</span>
            <span>Bias-audited · LL144 &amp; EU AI Act aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
