"use client";

import { useEffect } from "react";

/**
 * Escape-to-close plus body scroll lock for a full-screen overlay, matching the
 * behaviour DemoDialogProvider established. Split out because the Workshop's two
 * registers (Instrument, Peak) both need it.
 */
export function useOverlayDismiss(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);
}
