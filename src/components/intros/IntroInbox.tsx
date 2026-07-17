"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X, Send, MapPin, Building2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  v1,
  V1Error,
  isLiveBackend,
  type Intro,
  type IntroMessage,
  type OutcomeCheckin,
  type CheckinHorizon,
  type CheckinOutcome,
} from "@/lib/v1";

const OUTCOMES: { value: CheckinOutcome; label: string }[] = [
  { value: "advanced", label: "Advanced to next round" },
  { value: "offer", label: "Offer made" },
  { value: "mutual_worth_it", label: "Both felt it was worth it" },
  { value: "not_useful", label: "Not a fit" },
];

export function IntroInbox() {
  const live = isLiveBackend();
  const [userId, setUserId] = useState<string | null>(null);
  const [intros, setIntros] = useState<Intro[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIntros(await v1.listIntros());
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Could not load introductions.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!live) {
      setLoaded(true);
      return;
    }
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    load();
  }, [live, load]);

  const respond = async (intro: Intro, decision: "approved" | "declined") => {
    try {
      const updated = await v1.respondIntro(intro.id, decision);
      setIntros((xs) => xs.map((i) => (i.id === intro.id ? updated : i)));
    } catch (e) {
      setError(e instanceof V1Error ? e.message : "Could not respond.");
    }
  };

  if (!live) {
    return (
      <div className="glass max-w-xl rounded-[var(--r-card)] p-6" style={{ color: "var(--iris-ink)" }}>
        Backend not connected. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to see introductions.
      </div>
    );
  }
  if (!loaded) return <p className="text-[14px] text-[var(--ink-3)]">Loading…</p>;
  if (error) return <p className="text-[14px] font-semibold text-[#b91c1c]">{error}</p>;
  if (intros.length === 0) {
    return <p className="text-[14px] text-[var(--ink-2)]">No introductions yet. When there&rsquo;s mutual interest, it shows up here — and nowhere else.</p>;
  }

  return (
    <div className="space-y-4">
      {intros.map((intro) => {
        const isCandidate = intro.candidate_id === userId;
        return (
          <div key={intro.id} className="glass rounded-[var(--r-card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[15px] font-bold">{intro.job_title || "A role"}</p>
              <StatusChip status={intro.status} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--ink-3)]">
              {intro.company_name && <span className="inline-flex items-center gap-1"><Building2 size={13} /> {intro.company_name}</span>}
              {!intro.company_name && isCandidate && <span className="italic">Company revealed when you approve</span>}
              {intro.reality?.work_mode && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {intro.reality.work_mode}{intro.reality.location ? ` · ${intro.reality.location}` : ""}</span>}
              {intro.reality?.response_sla && <span className="inline-flex items-center gap-1"><Clock size={13} /> {intro.reality.response_sla}</span>}
            </p>
            {intro.reality?.compensation_range && <p className="mt-1 text-[13px] font-semibold text-[var(--ink-2)]">{intro.reality.compensation_range}</p>}
            <p className="mt-3 rounded-[var(--r-btn)] px-4 py-2.5 text-[13.5px] leading-relaxed" style={{ background: "var(--glass)" }}>{intro.message}</p>

            {intro.status === "pending" && isCandidate && (
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => respond(intro, "approved")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-5 py-2.5 text-[13.5px] font-bold text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}>
                  <Check size={15} /> Approve & reveal
                </button>
                <button type="button" onClick={() => respond(intro, "declined")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] border px-5 py-2.5 text-[13.5px] font-semibold text-[var(--ink-2)]" style={{ borderColor: "var(--glass-line-hi)" }}>
                  <X size={15} /> Decline
                </button>
              </div>
            )}
            {intro.status === "pending" && !isCandidate && (
              <p className="mt-3 text-[12.5px] font-semibold text-[var(--ink-3)]">Awaiting their consent — nothing is shared until they approve.</p>
            )}

            {intro.status === "approved" && userId && <IntroThread introId={intro.id} userId={userId} />}
          </div>
        );
      })}
    </div>
  );
}

function StatusChip({ status }: { status: Intro["status"] }) {
  const map = {
    pending: { label: "Pending", bg: "rgba(180,120,10,0.12)", fg: "#B45309" },
    approved: { label: "Connected", bg: "rgba(5,150,105,0.12)", fg: "#047857" },
    declined: { label: "Declined", bg: "var(--mist)", fg: "var(--ink-3)" },
  }[status];
  return <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: map.bg, color: map.fg }}>{map.label}</span>;
}

function IntroThread({ introId, userId }: { introId: string; userId: string }) {
  const [messages, setMessages] = useState<IntroMessage[]>([]);
  const [checkins, setCheckins] = useState<OutcomeCheckin[]>([]);
  const [draft, setDraft] = useState("");
  const [horizon, setHorizon] = useState<CheckinHorizon>("30d");
  const [outcome, setOutcome] = useState<CheckinOutcome>("advanced");

  const refresh = useCallback(() => {
    v1.listIntroMessages(introId).then(setMessages).catch(() => {});
    v1.listCheckins(introId).then(setCheckins).catch(() => {});
  }, [introId]);

  useEffect(refresh, [refresh]);

  const send = async () => {
    if (!draft.trim()) return;
    try {
      const m = await v1.sendIntroMessage(introId, draft.trim());
      setMessages((xs) => [...xs, m]);
      setDraft("");
    } catch { /* surfaced on next load */ }
  };

  const submitCheckin = async () => {
    try {
      const c = await v1.addCheckin(introId, { horizon, outcome });
      setCheckins((xs) => [...xs, c]);
    } catch { /* ignore */ }
  };

  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--glass-line)" }}>
      <div className="max-h-56 space-y-2 overflow-y-auto">
        {messages.map((m) => {
          const mine = m.sender_profile_id === userId;
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <span className="max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed" style={mine ? { background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", color: "#fff" } : { background: "#fff", border: "1px solid var(--glass-line)", color: "var(--ink)" }}>{m.body}</span>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-[12.5px] text-[var(--ink-3)]">You&rsquo;re connected — say hello.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" className="flex-1 rounded-[var(--r-btn)] border px-3.5 py-2 text-[13.5px] outline-none focus:border-[var(--iris)]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }} />
        <button type="button" onClick={send} disabled={!draft.trim()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: "var(--iris)" }}><Send size={14} /></button>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-[12.5px] font-semibold text-[var(--ink-3)]">Outcome check-in {checkins.length > 0 && `(${checkins.length})`}</summary>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={horizon} onChange={(e) => setHorizon(e.target.value as CheckinHorizon)} className="rounded-[10px] border px-2.5 py-1.5 text-[12.5px]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as CheckinOutcome)} className="rounded-[10px] border px-2.5 py-1.5 text-[12.5px]" style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}>
            {OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" onClick={submitCheckin} className="cursor-pointer rounded-[var(--r-btn)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white" style={{ background: "var(--iris)" }}>Record</button>
        </div>
      </details>
    </div>
  );
}
