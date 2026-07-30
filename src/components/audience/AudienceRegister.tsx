"use client";

import { useEffect } from "react";

export type Audience = "candidate" | "employer";

/**
 * Mirrors the audience register onto <html>, so portals can't escape it.
 *
 * `[data-audience]` on a wrapper div switches the accent tokens for everything
 * inside that subtree — which is every alias-layer read except the ones that
 * leave the subtree entirely. `createPortal(children, document.body)` mounts
 * outside the wrapper, and custom properties inherit down the DOM, so a
 * portaled node resolves against `:root` instead.
 *
 * That is not theoretical. Measured on /employer before this existed: the
 * portaled dialog's "Save role" painted v-400 -> v-600 (the CANDIDATE register)
 * while "Add role", still on screen and written from the identical token
 * expression, painted v-500 -> v-700. Two registers on one screen, inside one
 * product — the precise defect the audience scope exists to prevent.
 *
 * <html> is the only element guaranteed to be an ancestor of both the React
 * tree and any portal target, so setting it there closes the whole class rather
 * than the eight reads that happen to leak today. The wrapper div stays: it is
 * what makes the register correct during SSR, before this effect has run.
 *
 * Cleanup restores the previous value rather than removing the attribute, so
 * nesting (an employer surface rendered inside a candidate one, or vice versa)
 * unwinds correctly instead of dropping the register on unmount.
 */
export function AudienceRegister({ audience }: { audience: Audience }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-audience");
    root.setAttribute("data-audience", audience);
    return () => {
      if (previous === null) root.removeAttribute("data-audience");
      else root.setAttribute("data-audience", previous);
    };
  }, [audience]);

  return null;
}
