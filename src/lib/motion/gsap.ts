"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP scroll choreography.
 * ScrollTrigger drives scroll-linked motion across the marketing site;
 * motion/react stays responsible for component-level micro-interactions.
 *
 * Imported only by client motion components on routes that need it, so
 * GSAP lands in those route chunks — never the shared/global bundle.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Brand-matched eases (approximate the CSS --ease-out / --ease-spring tokens). */
export const EASE_OUT = "power3.out";
export const EASE_SPRING = "back.out(1.6)";

export { gsap, ScrollTrigger };
