"use client";

/**
 * The AI assistant as Placedon's core surface — a claude.ai/new-style chat.
 * Empty state first (one centered greeting + a big input + suggested prompts),
 * then a streamed conversation.
 *
 * This is the *presentation* layer only: it's engine-agnostic. Both sides of
 * the marketplace drive it through a `ChatConfig` — the candidate assistant
 * (grounded in the user's own evidence) and the hiring assistant (grounded in
 * the evidence-backed candidate pool, behind the fairness firewall). Answers
 * are always grounded, never invented, never a person-score. See
 * docs/AI-ASSISTANT-ARCHITECTURE.md.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, ArrowUp, ShieldCheck } from "lucide-react";
import type { AssistantAnswer } from "@/lib/candidate/assistant";

const STREAM_MS = 26; // per-word reveal — a calm typing feel, not a spinner
const STREAM_LEAD_MS = 200; // brief "thinking" beat before the first word

/** What an assistant surface must supply to drive the chat. */
export type ChatConfig = {
  greetingTitle: string;
  greetingSubtitle: string;
  suggestions: string[]; // shown as chips; the label is also sent as the message
  respond: (text: string) => AssistantAnswer; // bound to already-loaded, grounded context
  footerNote: string;
  badge?: string | null; // e.g. "Preview · sample data"
};

type Msg =
  | { id: string; role: "you"; text: string }
  | { id: string; role: "ai"; answer: AssistantAnswer; shownWords: number; done: boolean };

let seq = 0;
const nid = () => `m${(seq += 1)}`;

export function AiChat({ config }: { config: ChatConfig }) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear any in-flight stream timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, reduce]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    setBusy(true);

    const ans = config.respond(q);
    const aiId = nid();
    const totalWords = ans.text.split(/\s+/).length;

    setMessages((prev) => [
      ...prev,
      { id: nid(), role: "you", text: q },
      { id: aiId, role: "ai", answer: ans, shownWords: reduce ? totalWords : 0, done: !!reduce },
    ]);

    if (reduce) {
      setBusy(false);
      return;
    }

    // Stream the answer word by word for the claude-style typing reveal.
    let shown = 0;
    const stepWord = () => {
      shown += 1;
      const done = shown >= totalWords;
      setMessages((prev) =>
        prev.map((m) => (m.id === aiId && m.role === "ai" ? { ...m, shownWords: shown, done } : m)),
      );
      if (done) {
        setBusy(false);
        return;
      }
      timers.current.push(setTimeout(stepWord, STREAM_MS));
    };
    timers.current.push(setTimeout(stepWord, STREAM_LEAD_MS));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(draft);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto flex h-full min-h-[70svh] w-full max-w-2xl flex-col">
      {isEmpty ? (
        <EmptyState
          reduce={!!reduce}
          config={config}
          draft={draft}
          setDraft={setDraft}
          onKeyDown={onKeyDown}
          onSend={() => ask(draft)}
          onSuggest={ask}
        />
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-1 py-6">
            {messages.map((m) =>
              m.role === "you" ? (
                <div key={m.id} className="flex justify-end">
                  <p
                    className="max-w-[85%] rounded-[20px] rounded-br-md px-4 py-2.5 text-[14.5px] leading-relaxed text-white"
                    style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
                  >
                    {m.text}
                  </p>
                </div>
              ) : (
                <AiBubble key={m.id} msg={m} reduce={!!reduce} />
              ),
            )}
          </div>

          <div className="sticky bottom-0 pt-2 pb-4">
            <Composer
              draft={draft}
              setDraft={setDraft}
              onKeyDown={onKeyDown}
              onSend={() => ask(draft)}
              busy={busy}
            />
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-[var(--ink-3)]">
              <ShieldCheck size={12} className="shrink-0" />
              {config.footerNote}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  reduce,
  config,
  draft,
  setDraft,
  onKeyDown,
  onSend,
  onSuggest,
}: {
  reduce: boolean;
  config: ChatConfig;
  draft: string;
  setDraft: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onSuggest: (text: string) => void;
}) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-7 py-12 text-center"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="grid size-12 place-items-center rounded-2xl text-white"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        <Sparkles size={22} aria-hidden />
      </span>

      <div className="space-y-3">
        <h1 className="text-[clamp(1.6rem,1.15rem+1.8vw,2.5rem)] font-extrabold leading-tight tracking-tight text-[var(--ink)]">
          {config.greetingTitle}
        </h1>
        <p className="mx-auto max-w-md text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          {config.greetingSubtitle}
        </p>
      </div>

      <div className="w-full max-w-xl">
        <Composer draft={draft} setDraft={setDraft} onKeyDown={onKeyDown} onSend={onSend} busy={false} big />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {config.suggestions.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onSuggest(label)}
            className="rounded-full border px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]"
            style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass-hi)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {config.badge && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold"
          style={{ borderColor: "var(--iris-line)", background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
        >
          {config.badge}
        </span>
      )}
    </motion.div>
  );
}

function Composer({
  draft,
  setDraft,
  onKeyDown,
  onSend,
  busy,
  big = false,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  busy: boolean;
  big?: boolean;
}) {
  return (
    <div className="glass flex items-end gap-2 rounded-[var(--r-card)] p-2.5" style={{ boxShadow: "var(--shadow-md)" }}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask anything…"
        aria-label="Message the assistant"
        className={`w-full resize-none bg-transparent px-2.5 py-2 leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] ${
          big ? "max-h-40 min-h-[3rem] text-[15.5px]" : "max-h-32 min-h-[2.4rem] text-[14.5px]"
        }`}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!draft.trim() || busy}
        aria-label="Send message"
        className="grid size-10 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-[0.95] disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))" }}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

function AiBubble({ msg, reduce }: { msg: Extract<Msg, { role: "ai" }>; reduce: boolean }) {
  const words = msg.answer.text.split(/\s+/);
  const shownText = words.slice(0, msg.shownWords).join(" ");

  return (
    <motion.div
      className="flex gap-2.5"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full"
        style={{ background: "var(--iris-ghost)", color: "var(--iris-ink)" }}
      >
        <Sparkles size={14} aria-hidden />
      </span>
      <div className="max-w-[88%] rounded-2xl px-4 py-3" style={{ background: "#fff", border: "1px solid var(--glass-line)" }}>
        <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">
          {shownText}
          {!msg.done && (
            <span
              className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse"
              style={{ background: "var(--iris)" }}
              aria-hidden
            />
          )}
        </p>

        {/* Evidence + note only reveal once the prose has finished streaming. */}
        {msg.done && msg.answer.items && msg.answer.items.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {msg.answer.items.map((it, i) => (
              <li
                key={i}
                className="rounded-[var(--r-btn)] border p-3"
                style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-bold text-[var(--ink)]">{it.label}</span>
                  {it.meta && (
                    <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-[var(--iris-ink)]">
                      {it.meta}
                    </span>
                  )}
                </div>
                {it.sub && <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-2)]">{it.sub}</p>}
              </li>
            ))}
          </ul>
        )}
        {msg.done && msg.answer.note && (
          <p className="mt-2.5 text-[11.5px] italic text-[var(--ink-3)]">{msg.answer.note}</p>
        )}
      </div>
    </motion.div>
  );
}
