import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, MapPin, ArrowRight } from "lucide-react";
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
          href="mailto:hello@placedon.com"
          className="glass group flex flex-col rounded-[var(--r-card)] p-7 transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
            <Mail size={20} />
          </span>
          <h2 className="mt-5 text-[1.2rem]">Email us</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            The fastest way to reach a human on the team.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--iris-ink)" }}>
            hello@placedon.com <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>

        {/* Book a demo */}
        <Link
          href="/demo"
          className="glass group flex flex-col rounded-[var(--r-card)] p-7 transition-transform duration-[var(--d-micro)] hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
            <MessageSquare size={20} />
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
          <MapPin size={20} />
        </span>
        <div>
          <h2 className="text-[1.2rem]">Placedon</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            Building fair, evidence-based hiring — based in India, working with teams worldwide.
          </p>
          {/* TODO(founder): add registered company name, address, and phone once available. */}
        </div>
      </div>
    </RoutePage>
  );
}
