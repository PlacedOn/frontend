/**
 * The /dev shell.
 *
 * Exists for one reason: `/dev/directory` and `/dev/pipeline` are two views of
 * one decision. Shortlisting on the grid has to show up on the pipeline, and
 * un-shortlisting on the pipeline has to show up on the grid, which means the
 * list cannot live in either page's state. A layout is the lowest node both
 * routes share, so the provider goes here and survives client-side navigation
 * between them.
 *
 * This stays a Server Component; `ShortlistProvider` carries its own
 * `"use client"`. Marking the whole layout as client would drag every /dev page
 * into the client bundle for the sake of one context.
 */

import type { ReactNode } from "react";
import { ShortlistProvider } from "@/lib/shortlist/ShortlistProvider";

export default function DevLayout({ children }: { children: ReactNode }) {
  return <ShortlistProvider>{children}</ShortlistProvider>;
}
