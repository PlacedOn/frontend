import type { Metadata } from "next";
import { Mic, ShieldCheck, Accessibility, ArrowRight } from "lucide-react";
import { RoutePage } from "@/components/layout/RoutePage";

export const metadata: Metadata = {
  title: "Before you start — PlacedOn",
  description: "Readiness, consent, and accommodations before your PlacedOn interview.",
};

const CHECKS = [
  { icon: Mic, title: "Voice or text", body: "Answer out loud or type — whichever lets you think best. You can switch mid-interview." },
  { icon: ShieldCheck, title: "Your consent", body: "We record only the conversation, extract traits you can review, and never share without your say-so." },
  { icon: Accessibility, title: "Accommodations", body: "Extra time, screen-reader support, and reduced-motion are on by request. No timer, no penalty." },
];

export default function PreInterviewPage() {
  return (
    <RoutePage
      eyebrow="Before you start"
      title="Take a breath. This is a conversation, not a test."
      intro="No timer. No trick questions. No score staring back at you. Here's what to expect before you begin."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {CHECKS.map((c) => {
          const Icon = c.icon;
          return (
            <article key={c.title} className="glass rounded-[var(--r-card)] p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--iris-ghost)", color: "var(--iris)" }}>
                <Icon size={20} />
              </span>
              <h2 className="mt-5 text-[1.2rem]">{c.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{c.body}</p>
            </article>
          );
        })}
      </div>
      <div className="glass mt-4 flex flex-col items-start justify-between gap-4 rounded-[var(--r-card)] p-7 sm:flex-row sm:items-center">
        <p className="text-[15px] text-[var(--ink-2)]">
          Ready when you are — the interview adapts to you and takes about 30&ndash;40 minutes.
        </p>
        <a
          href="/interview"
          className="inline-flex shrink-0 items-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[15px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          Begin interview <ArrowRight size={17} />
        </a>
      </div>
    </RoutePage>
  );
}
