/**
 * The motion contract. One easing curve, three durations, one reduced-motion rule.
 *
 * Every animation in the app imports from here. If a component hardcodes a
 * duration or a cubic-bezier, that is a bug — the value will drift from
 * globals.css and nobody will notice until the site feels subtly inconsistent.
 *
 * ── Why the values are mirrored rather than read from CSS ──
 * The durations live in globals.css as `--d-micro/--d-std/--d-sig` (see the
 * motion block there for why that scale won). CSS custom properties can only be
 * read at runtime via `getComputedStyle`, which:
 *   - is unavailable during SSR, so the first render would disagree with the
 *     second and React would log a hydration mismatch;
 *   - returns a string ("320ms") that every caller would have to parse.
 * So CSS keeps the values for CSS consumers, and this file mirrors them for JS
 * consumers. `CSS_VAR` below exists so CSS-bound call sites (style props,
 * transition strings) reference the variable instead of a literal, and
 * `assertMotionTokensInSync()` catches drift in development.
 *
 * NOTE ON THE FILENAME: `src/lib/motion/gsap.ts` also exists. A file and a
 * directory of the same name coexist fine — `@/lib/motion` resolves here,
 * `@/lib/motion/gsap` resolves there. Neither shadows the other, and neither is
 * the `motion` npm package (that is a bare specifier: `motion/react`).
 */

import type { Transition } from "motion/react";

/** The one easing curve. Matches `--ease-out` in globals.css. */
export const EASE_OUT = [0.22, 0.68, 0.31, 1] as const;

/**
 * The only curve permitted to overshoot. Matches `--ease-spring`.
 * Reserved for reveals where a value settles into place (a confidence band
 * growing, a score landing). Overshoot on something that merely appeared reads
 * as decoration; overshoot on something that *arrived* reads as physical.
 */
export const EASE_SPRING = [0.34, 1.45, 0.5, 1] as const;

/**
 * The three durations, in SECONDS — motion/react's unit. Mirrors
 * `--d-micro` / `--d-std` / `--d-sig`.
 */
export const DUR = {
  /** 160ms — state flips the user already expects: hover, focus, press. */
  micro: 0.16,
  /** 320ms — the default. Reveals, expansions, popovers. */
  std: 0.32,
  /** 620ms — signature moments only. The confidence band reveal. */
  sig: 0.62,
} as const;

/** The same three durations in milliseconds, for `setTimeout` and CSS strings. */
export const DUR_MS = {
  micro: 160,
  std: 320,
  sig: 620,
} as const;

/** CSS variable names, so style props reference the token, never a literal. */
export const CSS_VAR = {
  easeOut: "var(--ease-out)",
  easeSpring: "var(--ease-spring)",
  micro: "var(--d-micro)",
  std: "var(--d-std)",
  sig: "var(--d-sig)",
} as const;

export type DurationKey = keyof typeof DUR;

/**
 * A motion/react transition using the house curve.
 * `stagger` is the index in a list; it delays each item by 40ms so a group
 * resolves as a sequence rather than a flash.
 */
export function transition(
  duration: DurationKey = "std",
  { stagger = 0, ease = EASE_OUT }: { stagger?: number; ease?: readonly number[] } = {},
) {
  return {
    duration: DUR[duration],
    delay: stagger * 0.04,
    ease: ease as unknown as [number, number, number, number],
  };
}

/** What `reveal()` returns — shaped to spread onto a motion element. */
export interface RevealProps {
  initial: Record<string, number>;
  animate: Record<string, number>;
  transition: Transition;
}

/** Identity value for a transform key at rest. Scales settle at 1, offsets at 0. */
function settledValue(key: string): number {
  return key === "scale" || key === "scaleX" || key === "scaleY" ? 1 : 0;
}

/**
 * The reduced-motion rule, in one function.
 *
 * Reduced motion removes MOVEMENT, never INFORMATION. Both branches produce an
 * identical `animate` target — the complete, finished state. The only
 * difference is the TRANSITION: full motion lets the transforms travel, reduced
 * motion snaps them to rest instantly and lets opacity alone carry the change.
 *
 * ══ WHY THE KEY SETS MUST MATCH — this bit is load-bearing ══
 * An earlier version of this helper dropped the transform keys from BOTH
 * `initial` and `animate` under reduce, on the reasoning that a shared target
 * makes a degraded end state impossible. It does not, because of SSR:
 *
 *   1. On the server `useReducedMotion()` is false, so motion serialises the
 *      FULL-MOTION `initial` into the HTML — `transform: translateY(14px)`.
 *   2. On the client a reduced-motion user takes the other branch, where
 *      `animate` has no `y` key at all.
 *   3. Motion therefore never writes `y`, and the server's translateY(14px)
 *      stays on the element forever.
 *
 * Measured, not theorised: every card on /dev/scoring sat at translateY(12px)
 * under `prefers-reduced-motion: reduce` until this was fixed. It reads as a
 * spacing bug rather than a motion bug, which is why it survived so long.
 *
 * So the rule is: `initial` and `animate` always carry the SAME KEYS. Only the
 * transition branches on `reduce`. Then there is no reachable state in which a
 * transform is left unwritten.
 *
 * @param reduce  the value from motion/react's `useReducedMotion()`
 * @param from    the transform offsets to animate FROM (y, scaleX, …)
 */
export function reveal(
  reduce: boolean | null,
  from: Record<string, number> = { y: 14 },
  duration: DurationKey = "std",
  opts: { stagger?: number; ease?: readonly number[] } = {},
): RevealProps {
  const keys = Object.keys(from);
  const settled = Object.fromEntries(keys.map((k) => [k, settledValue(k)]));

  return {
    initial: { opacity: 0, ...from },
    animate: { opacity: 1, ...settled },
    transition: reduce
      ? {
          // Transforms arrive at rest with no elapsed time — nothing moves, and
          // nothing is left unwritten. Opacity is the one channel that travels.
          ...Object.fromEntries(keys.map((k) => [k, { duration: 0 }])),
          opacity: transition("micro", { stagger: opts.stagger }),
        }
      : transition(duration, opts),
  };
}

/**
 * The same rule for call sites that hand-roll `initial`/`animate` instead of
 * using `reveal()`: pass the transform keys being animated and get back a
 * transition that snaps them under reduce while opacity still fades.
 */
export function revealTransition(
  reduce: boolean | null,
  transformKeys: readonly string[],
  full: Transition,
  reducedOpacity: DurationKey = "std",
): Transition {
  if (!reduce) return full;
  return {
    ...Object.fromEntries(transformKeys.map((k) => [k, { duration: 0 }])),
    opacity: transition(reducedOpacity),
  };
}

/**
 * Development-only drift check. Reads the real computed values out of the
 * document and warns if globals.css and this file have diverged. Call once from
 * a client component during development; it is a no-op in production and on the
 * server.
 */
export function assertMotionTokensInSync(): void {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return;

  const styles = getComputedStyle(document.documentElement);
  const pairs: ReadonlyArray<[string, number]> = [
    ["--d-micro", DUR_MS.micro],
    ["--d-std", DUR_MS.std],
    ["--d-sig", DUR_MS.sig],
  ];

  for (const [name, expected] of pairs) {
    const raw = styles.getPropertyValue(name).trim();
    if (!raw) continue;
    const actual = raw.endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000;
    if (Number.isFinite(actual) && actual !== expected) {
      console.warn(
        `[motion] ${name} is ${actual}ms in globals.css but ${expected}ms in src/lib/motion.ts. ` +
          `Update src/lib/motion.ts to match — globals.css is the source of truth.`,
      );
    }
  }
}
