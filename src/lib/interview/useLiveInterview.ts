"use client";

/**
 * Drives a REAL authenticated interview against WS /v1/interviews/{id}/live.
 * Unlike useInterviewSession's demo path, this NEVER falls back to a scripted
 * mock — a real interview that can't connect surfaces an honest error and a
 * retry, and a dropped socket persists the in-flight answer via the REST
 * fallback (POST /v1/interviews/{id}/turns) so nothing is lost.
 *
 * Protocol (versioned "v":1), mirrors backend/app/interviews_ws.py:
 *   in:  question_token · question · ack · duplicate · session_complete · error
 *   out: { v:1, type:"answer_text", message_id, content }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { liveInterviewSocketUrl } from "@/lib/api";
import { v1 } from "@/lib/v1";
import type { InterviewMessage, InterviewStatus } from "./useInterviewSession";

const MAX_RECONNECT = 3; // then offer REST fallback (plan §11 reconnect contract)

const newId = (prefix: string): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useLiveInterview(sessionId: string, token: string) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [status, setStatus] = useState<InterviewStatus>("connecting");
  const [turn, setTurn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bufRef = useRef("");
  const pendingQuestionRef = useRef("");
  const intentionalRef = useRef(false);
  const attemptsRef = useRef(0);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finalizeQuestion = useCallback((text: string, questionTurn?: number) => {
    pendingQuestionRef.current = text;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (questionTurn != null && last && last.role === "ai" && last.turn === questionTurn) {
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text } : m));
      }
      return [...prev, { id: newId("ai"), role: "ai", text, turn: questionTurn }];
    });
    setStreaming("");
    bufRef.current = "";
    setStatus("awaiting");
  }, []);

  const connect = useCallback(() => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(liveInterviewSocketUrl(sessionId, token));
    } catch {
      setError("Could not open the interview connection.");
      setStatus("error");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      attemptsRef.current = 0;
      setStatus((s) => (s === "reconnecting" ? "thinking" : s));
    };

    ws.onmessage = (ev: MessageEvent) => {
      let msg: { type?: string; content?: string; turn?: number; code?: string };
      try {
        msg = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      switch (msg.type) {
        case "question_token":
          bufRef.current += msg.content ?? "";
          setStreaming(bufRef.current);
          setStatus("asking");
          break;
        case "question":
          if (typeof msg.turn === "number") setTurn(msg.turn + 1);
          finalizeQuestion(msg.content ?? bufRef.current, msg.turn);
          break;
        case "ack":
          setSaved(true);
          break;
        case "duplicate":
          setStatus("awaiting");
          break;
        case "session_complete":
          intentionalRef.current = true;
          setStatus("ended");
          ws.close();
          break;
        case "error":
          setError("The interview engine reported an error.");
          setStatus("error");
          break;
        default:
          break;
      }
    };

    ws.onclose = (ev: CloseEvent) => {
      if (intentionalRef.current) return;
      if (ev.code === 4401) {
        setError("Your session expired. Please sign in again.");
        setStatus("error");
        return;
      }
      if (ev.code === 4404) {
        setError("This interview couldn't be found for your account.");
        setStatus("error");
        return;
      }
      const attempts = attemptsRef.current;
      if (attempts >= MAX_RECONNECT) {
        setError("Connection lost. Your answers are saved — you can retry.");
        setStatus("error");
        return;
      }
      attemptsRef.current = attempts + 1;
      bufRef.current = "";
      setStreaming("");
      setStatus("reconnecting");
      reconnectRef.current = setTimeout(connect, Math.min(1000 * 2 ** attempts, 8000));
    };
  }, [sessionId, token, finalizeQuestion]);

  useEffect(() => {
    intentionalRef.current = false;
    setStatus("thinking");
    connect();
    return () => {
      intentionalRef.current = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendAnswer = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "awaiting") return;
      setMessages((m) => [...m, { id: newId("you"), role: "you", text: trimmed }]);
      setSaved(false);
      setStatus("thinking");
      setStreaming("");
      bufRef.current = "";

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ v: 1, type: "answer_text", message_id: newId("msg"), content: trimmed }));
        return;
      }
      // REST fallback — socket is down; persist so the answer is never lost.
      try {
        await v1.addTurn(sessionId, {
          question_text: pendingQuestionRef.current || "(question unavailable)",
          answer_text: trimmed,
          answer_mode: "text",
        });
        setSaved(true);
        setError("Saved over a backup connection. Reconnecting for your next question…");
      } catch {
        setError("We couldn't save that answer. Please retry.");
        setStatus("error");
      }
    },
    [sessionId, status],
  );

  const retry = useCallback(() => {
    setError(null);
    attemptsRef.current = 0;
    intentionalRef.current = false;
    setStatus("thinking");
    connect();
  }, [connect]);

  const end = useCallback(() => {
    intentionalRef.current = true;
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    wsRef.current?.close();
    setStatus("ended");
  }, []);

  return { live: true, messages, streaming, status, turn, error, saved, sendAnswer, retry, end };
}
