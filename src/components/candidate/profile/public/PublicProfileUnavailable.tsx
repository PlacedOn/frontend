import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/**
 * The default state of a public profile URL: not public.
 *
 * Placedon profiles are private by default, and we must never fabricate a
 * candidate here. This screen deliberately gives the *same* answer whether the
 * profile is private or the handle doesn't exist — so a stranger can't probe the
 * URL space to learn who has an account (no user enumeration).
 */
export function PublicProfileUnavailable() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-16">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, var(--iris-ghost), transparent 68%)", filter: "blur(40px)" }}
      />
      <div className="relative w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Placedon home">
            <Logo />
          </Link>
        </div>

        <span
          className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl"
          style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)", boxShadow: "var(--shadow-sm)" }}
        >
          <Lock className="h-6 w-6 text-[var(--iris-ink)]" aria-hidden />
        </span>

        <h1 className="text-[clamp(1.5rem,1.2rem+1.4vw,2rem)] font-extrabold tracking-tight text-[var(--ink)]">
          This profile isn&rsquo;t public.
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-relaxed text-[var(--ink-2)]">
          Placedon profiles are private by default. Their owner decides when — and exactly what — to
          share. If this is yours, you&rsquo;re in control of when it goes live.
        </p>

        <Link
          href="/start"
          className="mt-7 inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
        >
          Build your own evidence profile <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </main>
  );
}
