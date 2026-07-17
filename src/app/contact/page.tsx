import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, MapPin, ArrowRight } from "@/components/ui/icons";

/** Official brand marks (Simple Icons) — lucide dropped brand glyphs. */
function LinkedInIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
import { RoutePage } from "@/components/layout/RoutePage";

export const metadata: Metadata = {
  title: "Contact — Placedon",
  description: "Talk to the Placedon team about a pilot, a partnership, or a question. We usually reply within a day.",
};

export default function ContactPage() {
  return (
    <RoutePage
      eyebrow="Contact"
      title={
        <>
          Let&rsquo;s <span className="grad-iris">talk</span>.
        </>
      }
      intro="A pilot for your team, a partnership, or just a question — reach us directly. We usually reply within a day."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Direct email */}
        <a
          href="mailto:Placedon.com@gmail.com"
          className="glass group flex flex-col rounded-[var(--r-card)] p-7 transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
            <Mail size={20} animateOnView animateOnHover />
          </span>
          <h2 className="mt-5 text-[1.2rem]">Email us</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            The fastest way to reach a human on the team.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--iris-ink)" }}>
            Placedon.com@gmail.com <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>

        {/* Book a demo */}
        <Link
          href="/demo"
          className="glass group flex flex-col rounded-[var(--r-card)] p-7 transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
            <MessageSquare size={20} animateOnView animateOnHover />
          </span>
          <h2 className="mt-5 text-[1.2rem]">Book a demo</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            See Placedon on your own roles. 20 minutes, no slides.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--iris-ink)" }}>
            Request a demo <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {/* Company details */}
      <div className="glass mt-4 flex items-start gap-3 rounded-[var(--r-card)] p-7">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
          <MapPin size={20} animateOnView animateOnHover />
        </span>
        <div>
          <h2 className="text-[1.2rem]">Placedon</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            Building fair, evidence-based hiring — based in India, working with teams worldwide.
          </p>
          <dl className="mt-4 flex flex-col gap-2 text-[14px]">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Email</dt>
              <Mail size={15} style={{ color: "var(--iris-ink)" }} />
              <dd>
                <a
                  href="mailto:Placedon.com@gmail.com"
                  className="font-medium text-[var(--iris-ink)] hover:underline"
                >
                  Placedon.com@gmail.com
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2 text-[var(--ink-2)]">
              <dt className="sr-only">Location</dt>
              <MapPin size={15} className="shrink-0" style={{ color: "var(--ink-3)" }} />
              <dd>Bengaluru, India</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center gap-2.5">
            <a
              href="https://www.linkedin.com/company/placedon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Placedon on LinkedIn"
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--iris-ghost)] text-[var(--iris-ink)] transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris)] hover:text-white"
            >
              <LinkedInIcon size={17} />
            </a>
            <a
              href="https://www.instagram.com/placedon.ai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Placedon on Instagram"
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--iris-ghost)] text-[var(--iris-ink)] transition-colors duration-[var(--d-micro)] hover:bg-[var(--iris)] hover:text-white"
            >
              <InstagramIcon size={17} />
            </a>
          </div>
          {/* TODO(founder): add registered company name, address, and phone once incorporated. */}
        </div>
      </div>
    </RoutePage>
  );
}
