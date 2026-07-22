"use client";

import { useEffect, useState } from "react";

/**
 * False during SSR and the first client render, true after mount. Use to gate
 * client-only, time-dependent values (greetings, relative timestamps) that would
 * otherwise differ between server and client and trip a hydration mismatch.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
