import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { JobBoard } from "@/components/jobs/JobBoard";

export const metadata: Metadata = {
  title: "Open roles — Placedon",
  description:
    "Browse verified open roles. See what each one actually needs, then interview once — it counts for every role you're matched to.",
};

export default function JobsPage() {
  return (
    <>
      <Nav />
      <main className="pt-[84px]">
        {/* JobBoard reads ?q= via useSearchParams, which opts the subtree out of
            static prerendering. Without this boundary `next build` fails
            outright ("should be wrapped in a suspense boundary") — dev mode does
            not surface it, so it only appears at build time. The fallback is the
            same skeleton the loading state uses, so there is no visible jump. */}
        <Suspense fallback={<JobBoardFallback />}>
          <JobBoard />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function JobBoardFallback() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-8 md:py-16" aria-busy="true">
      <div className="h-10 w-56 rounded" style={{ background: "var(--line)" }} />
      <div className="mt-5 h-4 w-full max-w-[44rem] rounded" style={{ background: "var(--line)" }} />
      <div className="mt-7 h-12 w-full max-w-[520px] rounded-full" style={{ background: "var(--line)" }} />
      <div className="mt-8 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[var(--r-card,20px)] p-6"
            style={{ border: "1px solid var(--line)", background: "var(--paper-2)" }}
          >
            <div className="h-5 w-52 rounded" style={{ background: "var(--line)" }} />
            <div className="mt-3 h-4 w-full max-w-[38rem] rounded" style={{ background: "var(--line)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
