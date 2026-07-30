"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ImportGithub } from "@/components/network/ImportGithub";
import { AddSpecimen } from "./AddSpecimen";
import { Facet } from "./Facet";

type Props = {
  live: boolean;
  /** Something landed on the shelf — re-read it. Both doors report the same way. */
  onChanged: () => void;
};

/** The scaffold ring shown before any proof exists. Deliberately not a target:
 *  it is the shape of the object, not a quota of things the candidate owes. */
const SCAFFOLD_FACETS = 8;

/**
 * The workshop before anything is in it — the first screen a candidate with no
 * pedigree and no network actually sees, and the most important one we ship.
 *
 * Two rules hold it honest. It shows no percentage: a number computed from zero
 * evidence would be a claim we cannot support, and 0% reads as a verdict on the
 * person rather than a fact about the shelf. And it invents no specimens — an
 * empty shelf is the truth, so the screen's whole job is to offer the three real
 * doors out of it: the interview, GitHub import, and adding work by hand.
 */
export function WorkshopEmpty({ live, onChanged }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-5">
      <section
        className="grid items-center gap-9 rounded-[26px] border p-7 md:grid-cols-[auto_1fr] md:p-10"
        style={{
          background: "linear-gradient(158deg, var(--glass-hi), var(--glass) 74%)",
          borderColor: "var(--glass-line)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <motion.div
          className="justify-self-center"
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 0.68, 0.31, 1] }}
        >
          <Facet pct={0} size={230} facets={SCAFFOLD_FACETS} lit={0} showValue={false} />
        </motion.div>

        <div className="max-w-[46ch]">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--iris)]">
            Nothing here yet
          </p>
          <h2 className="mt-2 text-[clamp(1.3rem,1.1rem+1vw,1.85rem)] font-extrabold tracking-tight text-[var(--ink)]">
            An empty shelf is the right place to start.
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            Your ring stays empty until there is something real behind it — we will not
            fill it with a guess. One conversation about work you have already done is
            enough to seat the first facet.
          </p>

          <Link
            href="/pre-interview"
            className="mt-6 inline-flex items-center gap-2 rounded-[13px] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-[0.97]"
            style={{ background: "var(--iris)", boxShadow: "0 8px 22px -8px rgba(115, 54, 255,.6)" }}
          >
            Take the trial interview <ArrowRight size={15} aria-hidden />
          </Link>
          {/* 25–30 min is the figure /pre-interview commits to; this door must
              not undercut the next screen. */}
          <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">
            25–30 minutes, conversational, pause anytime. Nothing becomes visible to
            anyone until you say so.
          </p>
        </div>
      </section>

      {/* The second door, kept at full width: ImportGithub owns its own eyebrow,
          headline and internal two-column grid, so nesting it in a prose column
          collapses it to one word per line. */}
      <div className="mt-4">
        <ImportGithub live={live} onImported={() => onChanged()} />
      </div>

      {/* The third door. Without it, a candidate whose work isn't on GitHub and
          who hasn't interviewed yet has no way onto their own shelf. */}
      <div className="mt-4">
        <AddSpecimen onAdded={onChanged} />
      </div>
    </div>
  );
}
