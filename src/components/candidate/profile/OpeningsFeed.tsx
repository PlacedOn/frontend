"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Handshake, Lock, Wrench } from "lucide-react";
import { isLiveBackend, v1, type OpeningFit } from "@/lib/v1";
import { MOCK_OPENING_FITS } from "@/lib/mock/candidateProfile";
import { ReadinessGauge } from "@/components/candidate/growth/ReadinessGauge";
import { READINESS_NOTE } from "@/components/candidate/growth/chips";
import { TiltCard } from "@/components/ui/TiltCard";
import { WORK_TYPE_LABEL } from "./kit";

/**
 * "Openings you fit" — matched openings with Readiness (coverage of the role's
 * PUBLIC requirements). Never selection odds; company identity stays an
 * archetype until a consented intro reveals it.
 */
export function OpeningsFeed() {
  const live = isLiveBackend();
  const [fits, setFits] = useState<OpeningFit[]>(MOCK_OPENING_FITS);
  const [fromBackend, setFromBackend] = useState(false);

  useEffect(() => {
    if (!live) return;
    let active = true;
    v1.listOpeningFits()
      .then((xs) => {
        if (active) {
          setFits(xs);
          setFromBackend(true);
        }
      })
      .catch(() => {
        /* keep mock */
      });
    return () => {
      active = false;
    };
  }, [live]);

  return (
    <section aria-labelledby="openings-heading" className="glass rounded-[2rem] p-6 md:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">
            After the interview
            {fromBackend && (
              <span className="ml-2 inline-flex items-center gap-1.5">
                <span className="livedot" /> live
              </span>
            )}
          </p>
          <h2 id="openings-heading" className="mt-2 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-bold tracking-tight text-[var(--ink)]">
            Openings you fit
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-6 text-[var(--ink-3)]">{READINESS_NOTE}</p>
        </div>
        <Link
          href="/candidate/matches"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[13px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          Every match, explained <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {fits.map((fit) => (
          <TiltCard key={fit.job_id} className="rounded-[1.5rem]">
            <article
              className="flex h-full flex-col rounded-[1.5rem] border p-5"
              style={{ borderColor: "var(--glass-line-hi)", background: "var(--white)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <ReadinessGauge pct={fit.readiness_pct} size={92} variant="mini" />
                {fit.work_type && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
                  >
                    {WORK_TYPE_LABEL[fit.work_type]}
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-[17px] font-bold leading-snug text-[var(--ink)]">{fit.role_title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ink-3)]">
                <Lock className="h-3 w-3 shrink-0" aria-hidden />
                {fit.company_label} · named in a consented intro
              </p>

              {fit.top_gap && (
                <p
                  className="mt-3.5 inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[12px] font-bold"
                  style={{ borderColor: "rgba(245,134,11,0.25)", background: "rgba(245,134,11,0.10)", color: "#B45309" }}
                >
                  <Wrench className="h-3 w-3 shrink-0" aria-hidden />
                  Close first: {fit.top_gap}
                </p>
              )}

              <div className="mt-auto flex items-center gap-2 pt-5">
                <Link
                  href="/candidate/matches"
                  className="flex-1 rounded-[var(--r-btn)] border px-3 py-2.5 text-center text-[12.5px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
                  style={{ borderColor: "var(--glass-line-hi)" }}
                >
                  Why you match
                </Link>
                <Link
                  href="/intros"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--r-btn)] px-3 py-2.5 text-[12.5px] font-bold text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
                >
                  <Handshake className="h-3.5 w-3.5" aria-hidden /> Intro
                </Link>
              </div>
            </article>
          </TiltCard>
        ))}
      </div>

      <p className="mt-6 text-[12px] leading-5 text-[var(--ink-3)]">
        Readiness is how much of a role&rsquo;s public requirements your evidence covers — never a chance of being
        selected, and never a ranking of you. Reaching a role&rsquo;s owner always goes through a consent-gated intro.
      </p>
    </section>
  );
}
