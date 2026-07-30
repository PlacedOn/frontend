"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, MessageSquarePlus, Flag, EyeOff, Quote, ShieldCheck } from "lucide-react";
import {
  v1,
  V1Error,
  isLiveBackend,
  type ReportCard,
  type ReportItem,
  type Band,
  type CandidateState,
} from "@/lib/v1";
import { MOCK_REPORT_CARD } from "@/lib/mock/reportCard";

const BAND_STYLE: Record<Band, { label: string; bg: string; fg: string }> = {
  supported: { label: "Supported", bg: "rgba(5,150,105,0.12)", fg: "var(--ok)" },
  emerging: { label: "Emerging", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  needs_more_evidence: { label: "Needs more evidence", bg: "rgba(180,120,10,0.12)", fg: "var(--warn)" },
};

const EASE = [0.16, 1, 0.3, 1] as const;
const APPROVED_MSG =
  "Approved. This evidence can now be shared — only what you kept, and only with your consent.";

export function ReportCardReview({ sessionId }: { sessionId: string }) {
  const live = isLiveBackend();
  const reduce = useReducedMotion();
  // In preview we work off sample evidence so the surface is legible and
  // reviewable without a session — never a raw dev error to a candidate.
  const [card, setCard] = useState<ReportCard | null>(live ? null : MOCK_REPORT_CARD);
  const [loaded, setLoaded] = useState(!live);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      let c: ReportCard;
      try {
        c = await v1.getReportForSession(sessionId);
      } catch (e) {
        if (e instanceof V1Error && e.status === 404) {
          c = await v1.finalizeInterview(sessionId); // create on first view
        } else {
          throw e;
        }
      }
      setCard(c);
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Could not load your report card.");
    } finally {
      setLoaded(true);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!live) return;
    load();
  }, [live, load]);

  const patchItem = (updated: ReportItem) =>
    setCard((c) => (c ? { ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) } : c));

  // Optimistic: reflect the choice instantly, then reconcile with the server
  // when live. In preview it stays local — the buttons still work.
  const review = (item: ReportItem, state: CandidateState, context?: string | null) => {
    const nextContext = context ?? item.candidate_context;
    patchItem({ ...item, candidate_state: state, candidate_context: nextContext });
    if (!live) return;
    v1
      .reviewItem(item.id, { candidate_state: state, candidate_context: nextContext })
      .then(patchItem)
      .catch((e) => setMsg(e instanceof V1Error ? e.message : "Could not save your review."));
  };

  const approve = () => {
    if (!card) return;
    setMsg(null);
    if (!live) {
      setCard({ ...card, status: "approved", approved_at: new Date().toISOString() });
      setMsg(APPROVED_MSG);
      return;
    }
    v1
      .approveReport(card.id)
      .then((c) => {
        setCard(c);
        setMsg(APPROVED_MSG);
      })
      .catch((e) => setMsg(e instanceof V1Error ? e.message : "Could not approve."));
  };

  if (!loaded) return <p className="text-[14px] text-[var(--ink-3)]">Loading your evidence…</p>;
  if (error) return <p className="text-[14px] font-semibold text-[var(--bad)]">{error}</p>;
  if (!card) return null;

  const items = card.items;
  const building = card.status === "building" || items.length === 0;
  const approved = card.status === "approved";

  // Counts derived from items so the header can never drift from what's on screen.
  const counts = {
    supported: items.filter((i) => i.band === "supported").length,
    emerging: items.filter((i) => i.band === "emerging").length,
    needs: items.filter((i) => i.band === "needs_more_evidence").length,
    reviewed: items.filter((i) => i.candidate_state !== "unreviewed").length,
    total: items.length,
  };
  const allReviewed = counts.total > 0 && counts.reviewed === counts.total;

  const reveal = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.04 * i, ease: EASE } };

  return (
    <div className="space-y-5">
      {!live && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold"
          style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
        >
          Preview · sample evidence
        </span>
      )}

      {/* Honest overview — counts and bands, never a score */}
      <motion.div {...reveal(0)} className="glass rounded-[var(--r-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Your evidence · no single score</p>
          <p className="font-mono text-[11.5px] text-[var(--ink-3)]">{card.role_family}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Stat n={counts.supported} label="Supported" style={BAND_STYLE.supported} />
          <Stat n={counts.emerging} label="Emerging" style={BAND_STYLE.emerging} />
          <Stat n={counts.needs} label="Needs more" style={BAND_STYLE.needs_more_evidence} />
        </div>
        {/* progress of review, not a grade */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-[var(--ink-2)]">
            <span>
              You&rsquo;ve reviewed {counts.reviewed} of {counts.total}
            </span>
            <span className="text-[var(--ink-3)]">you decide what employers ever see</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--mist)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,var(--iris-soft),var(--iris))" }}
              initial={false}
              animate={{ width: `${counts.total ? (counts.reviewed / counts.total) * 100 : 0}%` }}
              transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            />
          </div>
        </div>
      </motion.div>

      {building && (
        <div className="glass rounded-[var(--r-card)] p-6 text-center">
          <p className="text-[15px] font-semibold">We&rsquo;re building your evidence from your interview.</p>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">Each item will quote your own words and be checked before it appears here.</p>
        </div>
      )}

      {items.map((item, i) => (
        <motion.div key={item.id} {...reveal(i + 1)}>
          <ItemCard item={item} disabled={approved} onReview={review} />
        </motion.div>
      ))}

      {!building && (
        <motion.div {...reveal(items.length + 1)} className="glass rounded-[var(--r-card)] p-5">
          {approved ? (
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white" style={{ background: "var(--ok)" }}>
                <Check size={14} aria-hidden />
              </span>
              <div>
                <p className="text-[14px] font-bold text-[var(--ink)]">Your evidence is approved.</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-2)]">{APPROVED_MSG}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
                Approving shares only the items you kept — hidden and disputed items are never shown, and nothing is shared without your consent.
              </p>
              <button
                type="button"
                onClick={approve}
                disabled={!allReviewed}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[14px] font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
              >
                {allReviewed ? "Approve my evidence" : `Review every item to approve (${counts.reviewed}/${counts.total})`}
              </button>
              {msg && <p className="mt-3 text-[12.5px] font-semibold text-[var(--iris-ink)]">{msg}</p>}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Stat({ n, label, style }: { n: number; label: string; style: { bg: string; fg: string } }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full px-3.5 py-1.5" style={{ background: style.bg, color: style.fg }}>
      <span className="text-[15px] font-bold tabular-nums">{n}</span>
      <span className="text-[12.5px] font-semibold">{label}</span>
    </span>
  );
}

function ItemCard({
  item,
  disabled,
  onReview,
}: {
  item: ReportItem;
  disabled: boolean;
  onReview: (item: ReportItem, state: CandidateState, context?: string | null) => void;
}) {
  const [showContext, setShowContext] = useState(item.candidate_state === "context_added");
  const [context, setContext] = useState(item.candidate_context ?? "");
  const band = BAND_STYLE[item.band];
  const hidden = item.candidate_state === "hidden";

  return (
    <div className="glass rounded-[var(--r-card)] p-5 transition-opacity" style={{ opacity: hidden ? 0.55 : 1 }}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: band.bg, color: band.fg }}>{band.label}</span>
        {item.candidate_state !== "unreviewed" && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold capitalize text-[var(--ink-3)]">
            <Check size={12} aria-hidden /> {item.candidate_state.replace("_", " ")}
          </span>
        )}
      </div>

      <p className="mt-3 text-[15px] font-semibold leading-snug text-[var(--ink)]">{item.claim}</p>

      {/* The verbatim quote is the emotional core — your own words, front and centre. */}
      {item.quote ? (
        <blockquote
          className="mt-3 flex gap-2.5 rounded-[var(--r-btn)] border-l-[3px] px-4 py-3 text-[14px] italic leading-relaxed text-[var(--ink-2)]"
          style={{ borderColor: "var(--iris)", background: "var(--glass-hi)" }}
        >
          <Quote size={15} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" aria-hidden />
          <span>{item.quote}</span>
        </blockquote>
      ) : (
        <p className="mt-2.5 text-[13px] text-[var(--ink-3)]">This didn&rsquo;t come up much yet — one more example would move it up.</p>
      )}

      {!disabled && (
        <div className="mt-4 flex flex-wrap gap-2">
          <ReviewBtn active={item.candidate_state === "accurate"} onClick={() => onReview(item, "accurate")} icon={<Check size={14} />} label="Accurate" />
          <ReviewBtn active={showContext} onClick={() => setShowContext((s) => !s)} icon={<MessageSquarePlus size={14} />} label="Add context" />
          <ReviewBtn active={item.candidate_state === "disputed"} onClick={() => onReview(item, "disputed")} icon={<Flag size={14} />} label="Dispute" />
          <ReviewBtn active={item.candidate_state === "hidden"} onClick={() => onReview(item, "hidden")} icon={<EyeOff size={14} />} label="Hide" />
        </div>
      )}

      {showContext && !disabled && (
        <div className="mt-3">
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Add context in your own words…"
            className="w-full rounded-[var(--r-btn)] border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[var(--iris)]"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
          />
          <button
            type="button"
            onClick={() => onReview(item, "context_added", context.trim() || null)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-[0.97]"
            style={{ background: "var(--iris)" }}
          >
            Save context
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors active:scale-[0.97]"
      style={active ? { borderColor: "var(--iris)", background: "var(--iris-ghost)", color: "var(--iris-ink)" } : { borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }}
    >
      {icon} {label}
    </button>
  );
}
