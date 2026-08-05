"use client";

/**
 * The pipeline — everything the recruiter has committed to, with identities.
 *
 * ══ WHY THIS SURFACE EXISTS AT ALL ══
 * `CandidateCard` has told the user, since Phase 2, that "name and contact
 * details are released to your pipeline at this point". There was no pipeline.
 * The promise was true only in the sense that nothing was ever released, which
 * is the kind of true that stops being true the moment anyone builds the other
 * half. So this is the other half, built now, so that the sentence on the card
 * is a description of a thing rather than an intention.
 *
 * ══ ORDER ══
 * Order added, oldest first. Not sorted — there is no key to sort a list of
 * people on that this product accepts, and "most recently shortlisted" would
 * quietly become a recency ranking of humans. The list is a record of what the
 * recruiter did, in the order they did it.
 *
 * ══ WHY REMOVAL IS NOT CONFIRMED ══
 * No "are you sure" dialog. Un-shortlisting is not destructive: the record goes
 * back to the grid, where it was, under its reference. A confirmation would
 * imply a cost that does not exist, and interstitials on cheap actions train
 * people to click through the ones that are not cheap.
 */

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { PipelineRecord } from "@/components/pipeline/PipelineRecord";
import { useShortlist } from "@/lib/shortlist/ShortlistProvider";
import { FIXTURE_DIRECTORY_CANDIDATES } from "@/mocks/directoryCandidates";
import { releaseIdentity } from "@/mocks/pipelineIdentities";
import type { DirectoryCandidate } from "@/types/directory";

const backLinkStyle: React.CSSProperties = {
  background: "var(--iris)",
  color: "#FFFFFF",
  border: "1px solid var(--iris)",
  textDecoration: "none",
};

export function PipelineBoard() {
  const { ids, remove, clear, hydrated } = useShortlist();

  /**
   * Shortlisted ids resolved to records, in shortlist order. An id with no
   * matching record is dropped rather than rendered as a placeholder — that
   * only happens if storage outlives a fixture rename, and inventing a row for
   * a candidate we cannot describe would be worse than losing the row.
   */
  const records = useMemo<readonly DirectoryCandidate[]>(() => {
    const byId = new Map(FIXTURE_DIRECTORY_CANDIDATES.map((c) => [c.id, c]));
    return ids.map((id) => byId.get(id)).filter((c): c is DirectoryCandidate => c !== undefined);
  }, [ids]);

  // Before the mount effect has read sessionStorage the list is empty but not
  // KNOWN to be empty, and showing "nothing here" to someone whose shortlist is
  // one frame away is a small lie. Hold the space instead.
  if (!hydrated) {
    return (
      <div
        className="mt-10 rounded-[var(--r-card)]"
        style={{ minHeight: 280, border: "1px dashed var(--glass-line)" }}
      />
    );
  }

  if (records.length === 0) {
    return (
      <div
        role="status"
        className="mt-10 rounded-[var(--r-card)] p-7 sm:p-10"
        style={{ background: "var(--porcelain-2)", border: "1px dashed var(--glass-line-hi)" }}
      >
        <p className="eyebrow">Empty pipeline</p>

        {/* Explicit color: the unlayered `h1-h4 { color: var(--ink) }` in
            globals.css beats every Tailwind text utility. */}
        <h2
          className="mt-2.5 max-w-[30ch] text-[clamp(1.25rem,1rem+1vw,1.6rem)] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          You have not shortlisted anyone yet.
        </h2>

        <p
          className="mt-3 max-w-[62ch] text-[13.5px] leading-relaxed"
          style={{ color: "var(--ink-2)" }}
        >
          {"Nothing is hidden from you here and nothing failed to load. This page holds the " +
            "records you commit to on the directory, and it is where their names and contact " +
            "details appear — the grid never shows one. Shortlist someone and they arrive here."}
        </p>

        <Link
          href="/dev/directory"
          className="mt-6 inline-block cursor-pointer rounded-[var(--r-btn)] px-5 py-2.5 text-[13px] font-semibold"
          style={backLinkStyle}
        >
          Back to the directory
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p aria-live="polite" className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{records.length}</strong>{" "}
          {records.length === 1 ? "record" : "records"} in your pipeline
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer rounded-[var(--r-chip)] px-3.5 py-1.5 text-[12.5px] font-semibold"
            style={{
              background: "var(--white)",
              border: "1px solid var(--glass-line)",
              color: "var(--ink-2)",
            }}
          >
            Clear pipeline
          </button>
          <Link
            href="/dev/directory"
            className="rounded-[var(--r-chip)] px-3.5 py-1.5 text-[12.5px] font-semibold"
            style={{
              background: "var(--iris-ghost)",
              border: "1px solid var(--iris-line)",
              color: "var(--iris-ink)",
              textDecoration: "none",
            }}
          >
            Back to directory
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <AnimatePresence>
          {records.map((candidate, i) => (
            <PipelineRecord
              key={candidate.id}
              candidate={candidate}
              // The identity is fetched WITH the shortlist, every render. There
              // is no cached identity object floating around that could outlive
              // the commitment that released it.
              identity={releaseIdentity(candidate.id, ids)}
              stagger={i}
              onRemove={remove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
