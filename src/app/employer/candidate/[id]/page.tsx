"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ReportHeader } from "@/components/employer/report/ReportHeader";
import { ScoreBreakdown } from "@/components/employer/report/ScoreBreakdown";
import { TraitAnalysis } from "@/components/employer/report/TraitAnalysis";
import { GithubInsight } from "@/components/employer/report/GithubInsight";
import { InterviewSummary } from "@/components/employer/report/InterviewSummary";
import { FairnessFooter } from "@/components/employer/report/FairnessFooter";
import { getCandidateReport, type CandidateReport } from "@/lib/mock/candidateReport";

const EASE = [0.16, 1, 0.3, 1] as const;

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function CandidateReportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const reduce = useReducedMotion();
  const [report, setReport] = useState<CandidateReport | "loading" | "notfound">("loading");
  const [status, setStatus] = useState<string>("new");
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setReport("loading");
    getCandidateReport(id).then((r) => {
      if (!active) return;
      if (!r) {
        setReport("notfound");
        return;
      }
      setReport(r);
      setStatus(r.status);
    });
    return () => {
      active = false;
    };
  }, [id]);

  // The dashboard shell (segment layout) provides the background, sidebar, and
  // content padding — this page only renders its content.
  const shell = (inner: ReactNode) => <>{inner}</>;

  if (report === "loading") {
    return shell(
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="glass h-40 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
        <div className="glass h-64 animate-pulse rounded-[var(--r-card)]" style={{ opacity: 0.5 }} />
      </div>,
    );
  }

  if (report === "notfound") {
    return shell(
      <div className="glass rounded-[var(--r-card)] p-10 text-center">
        <h1 className="text-[1.4rem] font-bold text-[var(--ink)]">Candidate not found</h1>
        <p className="mt-2 text-[14.5px] text-[var(--ink-2)]">This report may have been withdrawn or the link is out of date.</p>
        <Link href="/employer" className="mt-5 inline-flex items-center gap-1.5 rounded-[var(--r-btn)] px-5 py-2.5 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
          Back to candidates
        </Link>
      </div>,
    );
  }

  const r = report;

  return shell(
    <div className="flex flex-col gap-9">
      <ReportHeader
        report={r}
        status={status}
        onSave={() => setStatus("saved")}
        onPass={() => setStatus("passed")}
        onRequestIntro={() => setIntroOpen(true)}
      />
      <ScoreBreakdown report={r} />
      <TraitAnalysis dimensions={r.dimensions} />
      <GithubInsight github={r.github} />
      <InterviewSummary interview={r.interview} />
      <FairnessFooter />

      {/* Request intro dialog */}
      <Portal>
        <AnimatePresence>
          {introOpen && (
            <motion.div className="fixed inset-0 z-[75] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <button aria-label="Close" onClick={() => setIntroOpen(false)} className="absolute inset-0 cursor-default" style={{ background: "rgba(14,16,32,0.42)", backdropFilter: "blur(6px)" }} tabIndex={-1} />
              <motion.div role="dialog" aria-modal="true" className="glass relative w-full max-w-[420px] rounded-[var(--r-card)] p-7" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.26, ease: EASE }}>
                <p className="eyebrow">Request intro</p>
                <h2 className="mt-2 text-[1.35rem]">Ask {r.initials} for an intro?</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
                  The candidate must accept before any contact details are shared. They see the role and your note, and can decline — you&rsquo;ll be notified either way.
                </p>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => { setStatus("intro"); setIntroOpen(false); }} className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] py-3 text-[14px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                    Send request
                  </button>
                  <button type="button" onClick={() => setIntroOpen(false)} className="cursor-pointer rounded-[var(--r-btn)] border px-5 py-3 text-[14px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]" style={{ borderColor: "var(--glass-line-hi)" }}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>,
  );
}
