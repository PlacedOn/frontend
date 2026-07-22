"use client";

import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/useMounted";

/**
 * Renders children into document.body.
 *
 * Required for anything that must cover the dashboard chrome: the shell wraps
 * page content in `position:relative; z-index:var(--z-base)`, which opens a
 * stacking context — so a fixed child can never out-stack the sidebar from
 * inside it, no matter how high its z-index.
 */
export function OverlayPortal({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}
