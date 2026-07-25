"use client";

/**
 * Drives a live Placedon interview. When a real backend is configured it opens
 * WS /ws/{interview_id} and streams questions (question_token → question), and
 * sends answers as { type: "answer", message_id, content } — mirroring
 * backend/app/websocket_router.py exactly. With no backend it runs an
 * interactive scripted fallback so the room is fully usable in the demo.
 *
 * Resilience: on an unexpected socket drop it auto-reconnects with backoff
 * (the backend resends the current question on reconnect, keyed by turn so the
 * transcript never duplicates), preserving the candidate's in-flight answer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { isLiveBackend, interviewSocketUrl } from "@/lib/api";

export type Speaker = "ai" | "you";

export interface InterviewMessage {
  id: string;
  role: Speaker;
  text: string;
  turn?: number;
  /** Which Role-DNA requirement this question explores (live sessions bound to
   *  a job only). Surfaced for transparency; absent for demo / unbound. */
  signal?: { text: string; kind?: string };
}

export type InterviewStatus =
  | "connecting"
  | "asking" // AI question streaming in
  | "awaiting" // waiting for the candidate's answer
  | "thinking" // answer sent, next question forming
  | "reconnecting" // socket dropped, retrying — answer preserved
  | "ended"
  | "error";

const MOCK_QUESTIONS = [
  "To start — tell me about a recent problem you debugged that didn't behave the way you expected. What was the first thing you tried?",
  "You mentioned narrowing it down. How did you decide what to rule out, and what did that tell you?",
  "Switching gears — describe a time you and a teammate disagreed on an approach. How did you work through it?",
  "Last one: what's something you shipped recently that you're proud of — and what would you do differently next time?",
];

const MOCK_STREAM_MS = 42;
const MAX_RECONNECT = 5;

const newId = (prefix: string): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useInterviewSession(initialId?: string) {
  const [interviewId] = useState(() => initialId ?? newId("iv"));
  const [live] = useState(() => isLiveBackend());

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [status, setStatus] = useState<InterviewStatus>("connecting");
  const [turn, setTurn] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamBufRef = useRef("");
  const mockIdxRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intentionalCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether the live socket ever opened, and whether we've handed the room to
  // the scripted demo (either because we started mock, or the backend never
  // came up). Once mock is active, answers drive the scripted flow.
  const everOpenRef = useRef(false);
  const mockActiveRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Finalize a streamed question. On reconnect the backend resends the current
  // question (same turn) — replace the last AI bubble instead of duplicating it.
  const finalizeQuestion = useCallback((text: string, questionTurn?: number) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (questionTurn != null && last && last.role === "ai" && last.turn === questionTurn) {
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text } : m));
      }
      return [...prev, { id: newId("ai"), role: "ai", text, turn: questionTurn }];
    });
    setStreaming("");
    streamBufRef.current = "";
    setStatus("awaiting");
  }, []);

  // Reveal a mock question word-by-word to mimic token streaming.
  const streamMock = useCallback(
    (text: string) => {
      const words = text.split(" ");
      let i = 0;
      setStatus("asking");
      setStreaming("");
      const tick = () => {
        i += 1;
        setStreaming(words.slice(0, i).join(" "));
        if (i >= words.length) {
          timersRef.current.push(setTimeout(() => finalizeQuestion(text), 220));
          return;
        }
        timersRef.current.push(setTimeout(tick, MOCK_STREAM_MS));
      };
      timersRef.current.push(setTimeout(tick, MOCK_STREAM_MS));
    },
    [finalizeQuestion],
  );

  // Hand the room to the scripted interview. Used both when no backend is
  // configured and as a graceful fallback when a configured backend can't be
  // reached — so the interview room is always usable for testing/demos.
  const startMock = useCallback(() => {
    mockActiveRef.current = true;
    clearTimers();
    setError(null);
    setStreaming("");
    streamBufRef.current = "";
    setStatus("thinking");
    timersRef.current.push(
      setTimeout(() => {
        mockIdxRef.current = 0;
        setTurn(1);
        streamMock(MOCK_QUESTIONS[0]!);
      }, 650),
    );
  }, [streamMock]);

  const connectLive = useCallback(() => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(interviewSocketUrl(interviewId));
    } catch {
      setError("Could not open the interview connection.");
      setStatus("error");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      everOpenRef.current = true;
      reconnectAttemptsRef.current = 0;
      // If we were mid-answer the next question streams in; otherwise the
      // backend resends the current question. Either way, wait for it.
      setStatus((s) => (s === "reconnecting" ? "thinking" : s));
    };

    ws.onmessage = (ev: MessageEvent) => {
      let msg: { type?: string; content?: string; turn?: number; detail?: unknown };
      try {
        msg = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      switch (msg.type) {
        case "question_token":
          streamBufRef.current += msg.content ?? "";
          setStreaming(streamBufRef.current);
          setStatus("asking");
          break;
        case "question":
          if (typeof msg.turn === "number") setTurn(msg.turn + 1);
          finalizeQuestion(msg.content ?? streamBufRef.current, msg.turn);
          break;
        case "error":
          setError(
            typeof msg.detail === "string" ? msg.detail : "The interview engine reported an error.",
          );
          setStatus("error");
          break;
        case "duplicate":
          setStatus("awaiting");
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      // Let onclose drive the reconnect flow (it fires right after).
    };

    ws.onclose = () => {
      if (intentionalCloseRef.current) return;
      // Backend was configured but never reachable → seamlessly run the
      // scripted interview instead of stranding the candidate.
      if (!everOpenRef.current) {
        startMock();
        return;
      }
      const attempts = reconnectAttemptsRef.current;
      if (attempts >= MAX_RECONNECT) {
        // Exhausted reconnects on a real drop → continue in scripted mode so
        // the room stays usable rather than dead-ending on an error.
        startMock();
        return;
      }
      reconnectAttemptsRef.current = attempts + 1;
      streamBufRef.current = "";
      setStreaming("");
      setStatus("reconnecting");
      const delay = Math.min(1000 * 2 ** attempts, 8000);
      reconnectTimerRef.current = setTimeout(connectLive, delay);
    };
  }, [interviewId, finalizeQuestion, startMock]);

  useEffect(() => {
    if (!live) {
      startMock();
      return () => clearTimers();
    }

    intentionalCloseRef.current = false;
    setStatus("thinking");
    connectLive();

    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      clearTimers();
      wsRef.current?.close();
    };
  }, [live, connectLive, streamMock, startMock]);

  const sendAnswer = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "awaiting") return;

      setMessages((m) => [...m, { id: newId("you"), role: "you", text: trimmed }]);
      setStatus("thinking");
      setStreaming("");
      streamBufRef.current = "";

      if (!mockActiveRef.current) {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "answer", message_id: newId("msg"), content: trimmed }));
        }
        return;
      }

      const next = mockIdxRef.current + 1;
      timersRef.current.push(
        setTimeout(() => {
          if (next >= MOCK_QUESTIONS.length) {
            setStatus("ended");
            return;
          }
          mockIdxRef.current = next;
          setTurn(next + 1);
          streamMock(MOCK_QUESTIONS[next]!);
        }, 850),
      );
    },
    [live, status, streamMock],
  );

  const end = useCallback(() => {
    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    clearTimers();
    wsRef.current?.close();
    setStatus("ended");
  }, []);

  return { interviewId, live, messages, streaming, status, turn, error, sendAnswer, end };
}
