"use client";

import { useEffect, useRef } from "react";
import { track, type ProductEvent } from "@/lib/track";

/**
 * Fires one event when a page mounts.
 *
 * A component rather than a call in the page body because the pages are Server
 * Components — `track()` touches localStorage and window, so it can only run
 * after hydration. Dropping this in is the whole integration.
 *
 * The ref guard matters: React runs effects twice in dev StrictMode, and
 * without it every local pageview is double-counted. That is the kind of error
 * you do not notice until a funnel says 200% conversion.
 */
export function TrackView({ event }: { event: ProductEvent }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event);
  }, [event]);
  return null;
}
