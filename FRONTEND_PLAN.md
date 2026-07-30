# Placedon — Frontend UI/UX Build Plan

Stack (VERIFIED against package.json, 2026-07-30 — the original draft said
"React 18 + Vite, Framer Motion", none of which is true here):
**Next.js 16.2.10 · React 19.2.4 · Tailwind v4 · `motion` v12.42 (NOT framer-motion) ·
lucide-react v1.23**. There is no Vite config. App Router, not pages.
Import motion as `from "motion/react"`, never `from "framer-motion"`. Everything below is written to be directly buildable on that stack, and directly
consumable by the `ui-designer` sub-agent from the earlier `.claude/` setup.

---

## 1. Design principles (the rules every screen must follow)

1. **One token system, no exceptions.** No component may use a raw hex/rgb value. Ever.
2. **Two audiences, one product.** Candidate and employer surfaces share every token except one
   accent color each — never a second typeface, never a second spacing scale, never a second
   icon set.
3. **Evidence over illustration.** Wherever the copy claims something ("evidence-linked," "one
   honest interview"), the UI shows the real artifact (a transcript snippet, an actual score
   card) instead of decorative abstract art.
4. **Every number has a source.** Any score, percentage, or stat rendered in the UI must be
   clickable/hoverable to its evidence — this is Placedon's core differentiator and the frontend
   should never let a bare number appear without that affordance.
5. **Motion explains, it doesn't decorate.** Every animation should communicate a state change
   (loading → result, collapsed → expanded, unscored → scored). No motion exists purely for
   flourish.

---

## 2. Design tokens

### 2.1 Color — DECIDED 2026-07-30, supersedes the original draft

**The original §2.1 (dark `#0B0C0E` base, `#6C8CFF` blue-violet + `#33D6C0` teal accents) is
REJECTED and must not be built.** It retired the brand violet, reversed the light-ground
direction requested twice, and would have added two new hues immediately after 26 competing
violets were collapsed into one ramp.

**Build this instead.** The ramp already exists in `src/app/globals.css`, generated from the
brand mark's own hue (`#6922F5` → OKLCH h=-73.1deg), evenly spaced in perceptual lightness:

```css
--v-50 #F3F2FF   --v-100 #E3DFFF  --v-200 #CBC1FF  --v-300 #AB95FF
--v-400 #8E64FF  --v-500 #7336FF  --v-600 #5E1EDC  --v-700 #4914AF
--v-900 #1A0B3D  --brand-mark #6922F5   /* logo asset only, never a UI colour */
--ok #047857  --warn #B45309  --bad #B91C1C   /* + their -bg tints */
```

Ground stays **light** (`--paper #FFFFFF`). Contrast is computed, not estimated — v-500 fill +
white text 5.67, v-600 text on white 7.79, v-700 10.49, v-300 on `--ink-bg` 7.98, v-200 11.88.
All AA.

**Keep the plan's genuinely good idea** — one accent per audience, which correctly diagnoses
"one palette doing two jobs" — but derive both ends from THIS ramp so they cannot clash:

```css
--accent-candidate: var(--v-600);  /* 7.79 AA on white */
--accent-employer:  var(--v-700);  /* 10.49 AA on white */
```

If two distinct *hues* are wanted later, generate the second at the same L and C as the first so
it is a sibling of the ramp, never an import from another palette.

`node scripts/color-lint.mjs` runs as `prebuild` and fails the build on any off-ramp violet.
Adding a colour outside this ramp is the bug the ramp exists to prevent.

### 2.2 Typography
- **Typeface**: one variable sans (e.g. Inter or Geist) for everything — headings and body. Do
  not introduce a second display face; weight/size carries the hierarchy, not a second font.
- **Scale** (rem, 1.25 ratio): `12 / 14 / 16 / 20 / 25 / 31 / 39 / 49`
  - 49/39 — hero H1 only
  - 31/25 — section H2
  - 20 — H3 / card titles
  - 16 — body
  - 14 — secondary text, labels
  - 12 — captions, badges, timestamps
- **Numerals**: use tabular/monospace numeral variant for all scores and stats (matches the
  "numbers as texture" pattern from Scale) — this alone makes score cards look engineered rather
  than templated.

### 2.3 Spacing & radius
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 (px) — every margin/padding in the app
  must be one of these values.
- Radius: `--radius-sm: 6px` (badges, pills), `--radius-md: 12px` (cards, buttons),
  `--radius-lg: 20px` (modals, hero panels). Three values only.

### 2.4 Motion
```
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
```
Every Framer Motion transition in the app references these three durations and this one easing
curve. No bespoke spring/tween per component.

### 2.5 Icons
- **lucide-react**, one stroke width (1.5px / "regular"), 20px default size, 16px for inline/dense
  contexts. No filled icons, no mixed icon packs, no emoji-as-icon.

---

## 3. Core reusable components (build these once, use everywhere)

| Component | Used on | Notes |
|---|---|---|
| `<ScoreCard>` | Trust Passport, employer view, homepage demo | Trait name, 0–100 score, confidence band rendered as a horizontal range bar (not just text), evidence quote on hover/tap, timestamp link |
| `<ConfidenceBand>` | inside ScoreCard, live scoring widget | The band itself: a track with a shaded range + a point marker; tight band = narrow shaded region, wide band = wide region. This is the single most important new component — see section 5.1 |
| `<JourneyStepper>` | homepage "how it works," candidate dashboard, employer dashboard | Horizontal on desktop, vertical/collapsed-with-progress on mobile. Steps: Apply → Interview → Trust Passport → Matched → Hired (candidate) / Post role → Interviews run → Shortlist → Intro (employer) |
| `<GlossaryTerm>` | anywhere jargon appears | Underlined dotted term, tap/hover reveals a one-sentence plain-language popover. Content sourced from a single `glossary.json`, not hardcoded per instance |
| `<TrustBadge>` | candidate cards, employer verification | Small pill with icon + label ("Verified company," "Contested & resolved") — appears directly on the object it describes, never on a separate page only |
| `<EvidenceQuote>` | ScoreCard, Trust Passport | Blockquote-style component with a transcript timestamp chip that's clickable (jumps to that point in a transcript player, if available) |
| `<RoleChip>` | search, job cards, candidate skill tags | Same pill component reused for both role search and skill tags — one visual grammar for "taggable thing" everywhere |
| `<AudienceToggle>` | header, homepage hero | The existing "I want to hire" / "I'm looking for work" pair, rebuilt as a real segmented control that also sets the active accent color for the rest of the session |

---

## 4. Page-by-page plan

### 4.1 Homepage (`/`)
1. **Hero** — headline + subhead (existing copy is good), `<AudienceToggle>` instead of two loose
   buttons, background: subtle looping video or canvas animation of a transcript being parsed
   into score chips (see 5.2), not static gradient.
2. **Problem section** — keep the 3-card layout, but replace decorative icons with one consistent
   lucide icon per card at 1.5px stroke.
3. **Verification strip** — keep logo-wall pattern, but pair each vertical/category name with a
   small `<TrustBadge>`-style icon so it reads as a designed row, not a text list.
4. **"Whole signal, one conversation"** — replace the current text-stat chips ("9 never used," "1
   quote/trait") with small `<ScoreCard>`-style mini-tiles: icon + big tabular number + one line,
   consistent card shell, so they read as UI, not copy with a number bolted on.
5. **Live scoring widget** (NEW — see 5.1) — inserted right after the stat row, before the roadmap
   section. This is the highest-leverage addition on the whole page.
6. **Roadmap section** — keep "Building / Research" tags, but render as a proper `<TrustBadge>`
   variant (status pill) instead of plain text, for visual consistency.
7. **How it works** — replace the four numbered text blocks with the actual `<JourneyStepper>`
   component, horizontal, animated step-by-step reveal on scroll (Framer Motion `whileInView`).
8. **Three surfaces walkthrough** — this section already has the right idea (interview → Trust
   Passport → employer view); rebuild the three tab/cards as real `<ScoreCard>` and dashboard
   screenshot components instead of the current text mockups.
9. **Testimonials** — add real avatar photos or consistent generated avatar shells (never leave a
   blank circle) and company logos where permitted.
10. **Footer CTA** — unchanged structurally, just re-themed to tokens.

### 4.2 For Candidates (`/candidates`)
- Leads with `<JourneyStepper>` in candidate-accent color, locked to "you are here: not started."
- Embeds one real interview UI screenshot (voice/text toggle visible) — this page currently has
  the least visual evidence of the actual product and should get the most.
- "Take a sample interview" CTA styled as the primary candidate-accent button, everywhere else on
  this page uses candidate accent for interactive elements only.

### 4.3 For Teams (`/companies`)
- Same page shell, employer-accent color.
- Leads with a real `<ScoreCard>` + `<EvidenceQuote>` pairing shown as an actual shortlist row,
  not prose.
- Search bar mockup ("someone who stays calm in chaos and still ships") should be a real,
  interactive-looking input component with `<RoleChip>` results below it, not a screenshot-styled
  image.

### 4.4 Trust/Scoring (`/trust/scoring`)
- This page currently carries the entire explanation of the confidence-band concept in prose.
  Move the live widget from the homepage here too (same component, more detail alongside it —
  toggle between "tight evidence" and "thin evidence" sample states so a visitor can see both
  ends of the band mechanic).
- Every jargon term on this page becomes a `<GlossaryTerm>` instance.

### 4.5 Candidate dashboard (post-login)
- `<JourneyStepper>` persists at the top, now reflecting real status.
- Trust Passport rendered as a stack of `<ScoreCard>` components, each contestable inline (button
  on the card opens the existing `/trust/contest` flow as a modal, not a full page navigation).

### 4.6 Employer view (post-login)
- Shortlist rendered as a list of `<ScoreCard>` + `<TrustBadge>` rows, sortable by match %.
- Same `<ConfidenceBand>` component reused — critical for consistency: employers and candidates
  should see literally the same visual grammar for a score, just from different sides.

---

## 5. New interactive components in detail

### 5.1 `<ConfidenceBand>` — build this first, it's the core visual metaphor
- **Structure**: a horizontal track (0–100), a shaded region showing the confidence range, a solid
  marker at the point estimate.
- **States**: tight band (e.g. 78–84) renders as a narrow, saturated shaded region; wide band
  (e.g. 40–75) renders as a wider, lower-opacity region — opacity/width both encode confidence so
  it reads correctly even at a glance or in grayscale/print.
- **Interaction**: hover/tap the marker reveals the exact numeric range + a one-line explanation
  ("Evidence was clear and consistent" vs "Thin evidence — worth asking more").
- **Data contract** (from `ml-engineer`):
  ```ts
  type TraitScore = {
    trait: string;
    point: number;       // 0-100
    bandLow: number;
    bandHigh: number;
    evidence: { quote: string; timestamp: string }[];
  };
  ```

### 5.2 Live scoring widget (homepage + trust page)
- Visitor picks (or is shown) one of 3 pre-written sample answers (synthetic, never real candidate
  data — enforced by `ml-engineer` agent rules).
- On selection, animate: sample text → highlighted phrase → `<ScoreCard>` populates with a
  `<ConfidenceBand>` filling in over ~400ms (`--duration-slow`).
- This is a static/precomputed demo, not a live model call — keep it cheap, instant, and always
  available (no loading spinner longer than the animation itself).

### 5.3 `<JourneyStepper>`
- Desktop: horizontal bar, 4–5 steps, connecting line fills as steps complete, current step
  pulses subtly (opacity 0.85→1 loop, 2s, only while it's the active step — stops once passed).
- Mobile: collapses to current step + "Step 2 of 4" label + progress bar, expandable to full list
  on tap.

---

## 6. Layout & responsive rules

- Grid: 12-column, max content width 1200px, gutters 24px desktop / 16px mobile.
- Breakpoints: 640 / 768 / 1024 / 1280 (Tailwind defaults — don't add custom breakpoints).
- Every section that currently alternates image-left/text-right (go-lifted pattern) should stack
  image-above-text on mobile, never text-above-image, so the "evidence" (screenshot) is always
  seen first, before the claim.

---

## 7. Accessibility baseline (non-negotiable, check on every component)

- Color is never the only signal — `<ConfidenceBand>` and `<TrustBadge>` both pair color with an
  icon or label.
- All interactive components (`ConfidenceBand` marker, `JourneyStepper` steps, `GlossaryTerm`
  triggers) are keyboard-focusable with a visible focus ring using `--color-accent-*` at 2px.
- Contrast: text tokens against `--color-bg`/`--color-surface` must hit WCAG AA (4.5:1 body, 3:1
  large text) — verify token pairs once, not per-component.
- Motion respects `prefers-reduced-motion` — the live scoring widget and stepper pulse both need a
  static fallback state.

---

## 8. Build order (hand this straight to the planner sub-agent)

1. Token file + Tailwind theme extension (section 2)
2. Icon migration to lucide-react only
3. `<ConfidenceBand>` + `<ScoreCard>` (core primitive, everything else depends on it)
4. `<JourneyStepper>`
5. `<GlossaryTerm>` + `glossary.json`
6. `<TrustBadge>`, `<RoleChip>`, `<AudienceToggle>`
7. Live scoring widget (homepage + trust page) — depends on 3 and ml-engineer's sample data set
8. Page rebuilds in this order: Trust/Scoring → Homepage → For Candidates → For Teams → dashboards

This order matches the dependency logic the `planner` sub-agent should already enforce from the
earlier `.claude/agents/planner.md` rules — feed it this file directly alongside `PLAN.md`.
