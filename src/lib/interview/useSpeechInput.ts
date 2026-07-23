"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser speech-to-text for the interview, via the Web Speech API. The backend
 * interview is text-only, so this transcribes speech and hands back plain text
 * that goes down the same send path — no backend involvement.
 *
 * Honest about capability: `supported` is false on browsers without the API
 * (notably Firefox, and it's flaky on desktop Safari), and callers fall back to
 * typing rather than showing a broken mic. Interim results stream live so the
 * candidate sees words appear as they speak; the caller edits before sending.
 */

// The API is unprefixed in some engines, webkit-prefixed in Chromium.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type SpeechState = {
  supported: boolean;
  listening: boolean;
  /** Text finalised so far this listening session. */
  transcript: string;
  /** Words still being recognised (not yet final) — show them greyed/live. */
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

/**
 * @param onFinalChunk called with each finalised phrase, so the caller can
 *   append it to the answer draft as the candidate speaks.
 * @param lang BCP-47 tag; defaults to the document/user language.
 */
export function useSpeechInput(
  onFinalChunk: (text: string) => void,
  lang?: string,
): SpeechState {
  // False on the server and the first client render (so SSR and hydration
  // agree), then resolved after mount — capability detection can't run on the
  // server, and branching on it during render trips a hydration mismatch.
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(getCtor() !== null);
  }, []);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Keep the latest callback without re-creating the recogniser each render.
  const onFinalRef = useRef(onFinalChunk);
  useEffect(() => {
    onFinalRef.current = onFinalChunk;
  }, [onFinalChunk]);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || recRef.current) return;

    const rec = new Ctor();
    rec.lang = lang || (typeof document !== "undefined" ? document.documentElement.lang : "") || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) {
        setTranscript((t) => (t ? `${t} ${finalText.trim()}` : finalText.trim()));
        onFinalRef.current(finalText.trim());
      }
      setInterim(interimText);
    };
    rec.onerror = (ev) => {
      // "no-speech"/"aborted" are benign stops, not failures to surface loudly.
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in your browser, or just type instead.");
      } else if (ev.error !== "no-speech" && ev.error !== "aborted") {
        setError("Couldn't hear you clearly — you can keep speaking or type instead.");
      }
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      recRef.current = null;
    };

    recRef.current = rec;
    setError(null);
    setInterim("");
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if called twice in quick succession — ignore.
      recRef.current = null;
    }
  }, [lang]);

  // Clean up on unmount — a live recogniser must not outlive the component.
  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
    };
  }, []);

  return { supported, listening, transcript, interim, error, start, stop, reset };
}
