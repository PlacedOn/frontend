"use client";

/**
 * Drives a live PlacedOn interview. When a real backend is configured it opens
 * WS /ws/{interview_id} and streams questions (question_token → question), and
 * sends answers as { type: "answer", message_id, content } — mirroring
 * backend/app/websocket_router.py exactly. With no backend it runs an
 * interactive scripted fallback so the room is fully usable in the demo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { isLiveBackend, interviewSocketUrl } from "@/lib/api";

export type Speaker = "ai" | "you";

export interface InterviewMessage {
  id: string;
  role: Speaker;
  text: string;
}

export type InterviewStatus =
  | "connecting"
  | "asking" // AI question streaming in
  | "awaiting" // waiting for the candidate's answer
  | "thinking" // answer sent, next question forming
  | "ended"
  | "error";

const MOCK_QUESTIONS = [
  "To start — tell me about a recent problem you debugged that didn't behave the way you expected. What was the first thing you tried?",
  "You mentioned narrowing it down. How did you decide what to rule out, and what did that tell you?",
  "Switching gears — describe a time you and a teammate disagreed on an approach. How did you work through it?",
  "Last one: what's something you shipped recently that you're proud of — and what would you do differently next time?",
];

const MOCK_STREAM_MS = 42;

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

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const finalizeQuestion = useCallback((text: string) => {
    setMessages((m) => [...m, { id: newId("ai"), role: "ai", text }]);
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

  useEffect(() => {
    if (!live) {
      setStatus("thinking");
      timersRef.current.push(
        setTimeout(() => {
          mockIdxRef.current = 0;
          setTurn(1);
          streamMock(MOCK_QUESTIONS[0]!);
        }, 650),
      );
      return () => clearTimers();
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(interviewSocketUrl(interviewId));
    } catch {
      setError("Could not open the interview connection.");
      setStatus("error");
      return;
    }
    wsRef.current = ws;
    setStatus("thinking");

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
          finalizeQuestion(msg.content ?? streamBufRef.current);
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
      setError("Lost connection to the interview engine.");
      setStatus("error");
    };

    return () => {
      clearTimers();
      ws.close();
    };
  }, [live, interviewId, streamMock, finalizeQuestion]);

  const sendAnswer = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "awaiting") return;

      setMessages((m) => [...m, { id: newId("you"), role: "you", text: trimmed }]);
      setStatus("thinking");
      setStreaming("");
      streamBufRef.current = "";

      if (live) {
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
    clearTimers();
    wsRef.current?.close();
    setStatus("ended");
  }, []);

  return { interviewId, live, messages, streaming, status, turn, error, sendAnswer, end };
}
