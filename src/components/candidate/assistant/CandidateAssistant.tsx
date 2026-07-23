"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Send, ShieldCheck } from "lucide-react";
import { v1, V1Error, isLiveBackend, type GrowthReport } from "@/lib/v1";
import { MOCK_GROWTH_REPORT } from "@/lib/mock/growthReport";
import { answer, matchIntent, SUGGESTED, type AssistantAnswer } from "@/lib/candidate/assistant";

type Msg =
  | { id: string; role: "you"; text: string }
  | { id: string; role: "assistant"; answer: AssistantAnswer };

let seq = 0;
const nid = () => `m${++seq}`;

/**
 * The candidate's AI assistant — grounded, not a social feed. It answers about
 * *your* evidence (fit, gaps, next step, strengths) from your real GrowthReport,
 * so it guides without inventing. Mobile-first: full-height column, suggestions
 * that scroll, input pinned to the thumb zone.
 */
export function CandidateAssistant() {
  const reduce = useReducedMotion();
  const live = isLiveBackend();
  const [report, setReport] = useState<GrowthReport | null>(live ? null : MOCK_GROWTH_REPORT);
  const [ready, setReady] = useState(!live);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    v1.growthReport()
      .then(setReport)
      .catch((e: unknown) => {
        if (!(e instanceof V1Error)) return;
      })
      .finally(() => setReady(true));
  }, [live]);

  // Opening message once the report has settled.
  useEffect(() => {
    if (!ready || messages.length > 0) return;
    const opener: AssistantAnswer = report
      ? { text: `Hi — I can help you make sense of your own evidence. ${report.headline} Ask me anything below, or tap a suggestion.` }
      : {
          text:
            "Hi — I'm your evidence assistant. Once you've taken the interview or added work, I can show which roles fit you, your biggest gap, and your next step — all grounded in your real evidence, never guessed.",
        };
    setMessages([{ id: nid(), role: "assistant", answer: opener }]);
  }, [ready, report, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, reduce]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const a = answer(matchIntent(q), report);
    setMessages((prev) => [
      ...prev,
      { id: nid(), role: "you", text: q },
      { id: nid(), role: "assistant", answer: a },
    ]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(draft);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100svh-9rem)] max-w-2xl flex-col md:h-[calc(100vh-11rem)]">
      {!live && (
        <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold" style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
          Preview · sample evidence
        </span>
      )}

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-2">
        {messages.map((m) =>
          m.role === "you" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed text-white" style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}>
                {m.text}
              </p>
            </div>
          ) : (
            <AssistantBubble key={m.id} answer={m.answer} reduce={!!reduce} />
          ),
        )}
      </div>

      {/* Suggestions */}
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {SUGGESTED.map((s) => (
          <button
            key={s.intent}
            type="button"
            onClick={() => ask(s.label)}
            className="shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--ink-2)] transition-transform active:scale-[0.97]"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input — pinned, thumb-reachable */}
      <div className="glass flex items-end gap-2 rounded-[var(--r-card)] p-2.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask about your fit, gaps, or next step…"
          aria-label="Ask the assistant"
          className="max-h-32 min-h-[2.4rem] w-full resize-none bg-transparent px-2 py-1.5 text-[14.5px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
        />
        <button
          type="button"
          onClick={() => ask(draft)}
          disabled={!draft.trim()}
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-[0.95] disabled:opacity-45"
          style={{ background: "var(--iris)" }}
        >
          <Send size={17} />
        </button>
      </div>
      <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        Grounded in your own evidence — coverage of what roles ask for, never your odds. It won't invent an answer.
      </p>
    </div>
  );
}

function AssistantBubble({ answer, reduce }: { answer: AssistantAnswer; reduce: boolean }) {
  return (
    <motion.div
      className="flex gap-2.5"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full" style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}>
        <Sparkles size={14} aria-hidden />
      </span>
      <div className="max-w-[88%] rounded-2xl px-4 py-3" style={{ background: "#fff", border: "1px solid var(--glass-line)" }}>
        <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">{answer.text}</p>
        {answer.items && answer.items.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {answer.items.map((it, i) => (
              <li key={i} className="rounded-[var(--r-btn)] border p-3" style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-bold text-[var(--ink)]">{it.label}</span>
                  {it.meta && <span className="shrink-0 font-mono text-[12px] font-semibold text-[var(--iris-ink)] tabular-nums">{it.meta}</span>}
                </div>
                {it.sub && <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-2)]">{it.sub}</p>}
              </li>
            ))}
          </ul>
        )}
        {answer.note && <p className="mt-2.5 text-[11.5px] italic text-[var(--ink-3)]">{answer.note}</p>}
      </div>
    </motion.div>
  );
}
