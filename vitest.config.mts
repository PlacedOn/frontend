/**
 * Vitest — the unit-test runner for the PURE logic in this codebase.
 *
 * ══ WHY THIS EXISTS AT ALL ══
 * On 2026-08-05 a defect shipped through a green `tsc --noEmit` AND a green
 * `pnpm build`, and broke the directory completely. `Number(null)` is `0`, not
 * `NaN`, so a `!Number.isFinite` fallback never fired for an ABSENT `expmax`
 * param: the experience ceiling read 0, the window collapsed to 0–0, and every
 * candidate was filtered out. A bare `/dev/directory` rendered "0 of 9 records"
 * with no filter chips to explain it — indistinguishable from a broken page.
 *
 * Neither type-checking nor bundling can catch that: the types were correct and
 * the code compiled. It was caught by a human opening the page. A two-line unit
 * test would have caught it in milliseconds, which is why there is now a runner.
 *
 * ══ SCOPE ══
 * `node` environment, `src/**\/*.test.ts` only. The three modules under test —
 * `lib/directory/urlState`, `lib/directory/filter`, `types/scoring` — are pure
 * by construction (no React, no `window`, no `next/navigation`), which is what
 * makes them testable without a DOM. That purity is a deliberate property of
 * those files, not an accident; see their header comments.
 *
 * Component tests are NOT set up here. They would need jsdom plus a testing
 * library, and for surfaces this visual a rendered screenshot carries more
 * signal than an assertion about markup. Add them when there is a component
 * behaviour that a screenshot cannot see.
 */

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors `paths` in tsconfig.json. Vitest does not read tsconfig paths on
    // its own, and a missing alias here shows up as "cannot resolve @/types/…"
    // rather than as anything that points at this file.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
