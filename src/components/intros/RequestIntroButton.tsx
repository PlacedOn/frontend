"use client";

/**
 * Slice 7 — employer side of the consent gate. Requesting an intro is the ONLY
 * way toward contact: it requires an existing explained match (server-enforced),
 * and nothing is revealed or sent until the candidate approves. No chat exists
 * outside this flow.
 */

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { v1, V1Error } from "@/lib/v1";

type Phase = "idle" | "composing" | "sending" | "sent";

export function RequestIntroButton({ jobId, candidateId }: { jobId: string; candidateId: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!message.trim()) return;
    setPhase("sending");
    setError(null);
    try {
      await v1.requestIntro({ job_id: jobId, candidate_id: candidateId, message: message.trim() });
      setPhase("sent");
    } catch (e: unknown) {
      setError(e instanceof V1Error ? e.message : "Could not send the intro request.");
      setPhase("composing");
    }
  };

  if (phase === "sent") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold" style={{ background: "rgba(5,150,105,0.12)", color: "var(--ok)" }}>
        <Check size={14} /> Intro requested — awaiting their consent
      </span>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={() => setPhase("composing")}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,var(--iris-soft),var(--iris))", boxShadow: "var(--shadow-iris)" }}
      >
        Request intro
      </button>
    );
  }

  return (
    <div className="w-full">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Why this candidate, for this role? They read this before deciding."
        className="w-full rounded-[var(--r-btn)] border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[var(--iris)]"
        style={{ borderColor: "var(--glass-line-hi)", background: "var(--glass)" }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={phase === "sending" || !message.trim()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--r-btn)] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
          style={{ background: "var(--iris)" }}
        >
          <Send size={13} /> {phase === "sending" ? "Sending…" : "Send request"}
        </button>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="cursor-pointer rounded-[var(--r-btn)] px-3 py-2 text-[13px] font-semibold text-[var(--ink-2)]"
        >
          Cancel
        </button>
        {error && <p className="text-[12.5px] font-semibold text-[var(--bad)]">{error}</p>}
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--ink-3)]">
        Chat opens only if the candidate approves. Their identity stays hidden until then.
      </p>
    </div>
  );
}
