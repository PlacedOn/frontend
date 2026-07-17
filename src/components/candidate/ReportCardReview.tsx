"use client";

import { useCallback, useEffect, useState } from "react";
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

const BAND_STYLE: Record<Band, { label: string; bg: string; fg: string }> = {
  supported: { label: "Supported", bg: "rgba(5,150,105,0.12)", fg: "#047857" },
  emerging: { label: "Emerging", bg: "var(--iris-ghost)", fg: "var(--iris-ink)" },
  needs_more_evidence: { label: "Needs more evidence", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
};

export function ReportCardReview({ sessionId }: { sessionId: string }) {
  const live = isLiveBackend();
  const [card, setCard] = useState<ReportCard | null>(null);
  const [loaded, setLoaded] = useState(false);
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
    if (!live) {
      setLoaded(true);
      return;
    }
    load();
  }, [live, load]);

  const patchItem = (updated: ReportItem) =>
    setCard((c) => (c ? { ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) } : c));

  const review = async (item: ReportItem, state: CandidateState, context?: string | null) => {
    try {
      const updated = await v1.reviewItem(item.id, { candidate_state: state, candidate_context: context ?? item.candidate_context });
      patchItem(updated);
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not save your review.");
    }
  };

  const approve = async () => {
    if (!card) return;
    setMsg(null);
    try {
      setCard(await v1.approveReport(card.id));
      setMsg("Approved. This evidence can now be shared — only what you kept, and only with your consent.");
    } catch (e) {
      setMsg(e instanceof V1Error ? e.message : "Could not approve.");
    }
  };

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6" style={{ color: "var(--iris-ink)" }}>
        Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to review your evidence.
      </div>
    );
  }
  if (!loaded) return <p className="text-[14px] text-[var(--ink-3)]">Loading your evidence…</p>;
  if (error) return <p className="text-[14px] font-semibold text-[#b91c1c]">{error}</p>;
  if (!card) return null;

  const building = card.status === "building" || card.items.length === 0;
  const allReviewed = card.items.length > 0 && card.summary.reviewed === card.summary.total;
  const approved = card.status === "approved";

  return (
    <div className="space-y-5">
      {/* Honest summary — counts and bands, never a score */}
      <div className="glass rounded-[var(--r-card)] p-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">Your evidence · no single score</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Stat n={card.summary.supported} label="Supported" style={BAND_STYLE.supported} />
          <Stat n={card.summary.emerging} label="Emerging" style={BAND_STYLE.emerging} />
          <Stat n={card.summary.needs_more_evidence} label="Needs more" style={BAND_STYLE.needs_more_evidence} />
        </div>
        <p className="mt-3 text-[13px] text-[var(--ink-2)]">
          {card.summary.reviewed}/{card.summary.total || 0} reviewed · you decide what employers ever see.
        </p>
      </div>

      {building && (
        <div className="glass rounded-[var(--r-card)] p-6 text-center">
          <p className="text-[15px] font-semibold">We&rsquo;re building your evidence from your interview.</p>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-2)]">Each item will quote your own words and be checked before it appears here.</p>
        </div>
      )}

      {card.items.map((item) => (
        <ItemCard key={item.id} item={item} disabled={approved} onReview={review} />
      ))}

      {!building && (
        <div className="glass rounded-[var(--r-card)] p-5">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ink-2)]">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
            Approving shares only the items you kept — hidden and disputed items are never shown, and nothing is shared without your consent.
          </p>
          <button
            type="button"
            onClick={approve}
            disabled={!allReviewed || approved}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] px-6 py-3 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
          >
            {approved ? "Approved" : allReviewed ? "Approve my evidence" : "Review every item to approve"}
          </button>
          {msg && <p className="mt-3 text-[12.5px] font-semibold text-[var(--iris-ink)]">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function Stat({ n, label, style }: { n: number; label: string; style: { bg: string; fg: string } }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full px-3.5 py-1.5" style={{ background: style.bg, color: style.fg }}>
      <span className="text-[15px] font-bold">{n}</span>
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
    <div className="glass rounded-[var(--r-card)] p-5" style={{ opacity: hidden ? 0.55 : 1 }}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: band.bg, color: band.fg }}>{band.label}</span>
        {item.candidate_state !== "unreviewed" && (
          <span className="text-[12px] font-semibold text-[var(--ink-3)] capitalize">{item.candidate_state.replace("_", " ")}</span>
        )}
      </div>

      <p className="mt-3 text-[15px] font-semibold leading-snug">{item.claim}</p>
      {item.quote && (
        <blockquote className="mt-2.5 flex gap-2 rounded-[var(--r-btn)] border-l-2 px-3.5 py-2.5 text-[13.5px] italic leading-relaxed text-[var(--ink-2)]" style={{ borderColor: "var(--iris)", background: "var(--glass)" }}>
          <Quote size={14} className="mt-0.5 shrink-0 text-[var(--iris-ink)]" />
          <span>{item.quote}</span>
        </blockquote>
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
            className="mt-2 cursor-pointer rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-semibold text-white"
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
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
      style={active ? { borderColor: "var(--iris)", background: "var(--iris-ghost)", color: "var(--iris-ink)" } : { borderColor: "var(--glass-line-hi)", color: "var(--ink-2)" }}
    >
      {icon} {label}
    </button>
  );
}
