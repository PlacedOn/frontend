"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reads the interviewer's questions aloud via the browser's speech synthesis —
 * for candidates who'd rather listen than read, especially in a second language.
 * Off by default (sound must be opt-in), and a pure frontend capability.
 */
export type SpeechOutput = {
  supported: boolean;
  enabled: boolean;
  toggle: () => void;
  speak: (text: string) => void;
  cancel: () => void;
};

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function useSpeechOutput(lang = "en-IN"): SpeechOutput {
  // Resolve capability after mount so SSR and the first client render agree.
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setSupported(synth() !== null);
  }, []);

  const cancel = useCallback(() => {
    synth()?.cancel();
  }, []);

  const speak = useCallback(
    (text: string) => {
      const s = synth();
      if (!s || !enabled || !text.trim()) return;
      s.cancel(); // never let two questions overlap
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 1;
      s.speak(u);
    },
    [enabled, lang],
  );

  const toggle = useCallback(() => {
    setEnabled((e) => {
      if (e) synth()?.cancel(); // turning off silences immediately
      return !e;
    });
  }, []);

  // Never let speech outlive the interview.
  useEffect(() => () => synth()?.cancel(), []);

  return { supported, enabled, toggle, speak, cancel };
}
