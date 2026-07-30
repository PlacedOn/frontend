# PlacedOn — Frontend Rebuild Spec

**Status:** Buildable specification. Nothing built from this yet.
**Date:** 2026-07-30
**Companion to:** `FRONTEND-REBUILD-PLAN.md` (the why). This is the what and how.

Written so it can be built without asking a question. Every value is stated,
every contrast ratio is verified, every component has a signature, every section
has a wireframe and its finished copy.

---

# PART A — THE SYSTEM

## A1. Colour, with verified contrast

All ratios computed, not estimated. `AA body` needs 4.5, `AA large/UI` needs 3.0.

```css
:root {
  /* neutrals — faint warm bias so white does not read clinical */
  --paper:     #FFFFFF;
  --paper-2:   #FAFAF9;   /* raised surface */
  --line:      #EAEAE8;   /* hairline           1.20 on white — decorative */
  --line-2:    #D6D5D2;   /* stronger divider */
  --ink-3:     #74726E;   /* labels             4.80 on white — AA */
  --ink-2:     #52504C;   /* body               8.04 on white — AA */
  --ink:       #12100E;   /* headings          18.98 on white — AAA */

  /* dark register — hero card and close only */
  --ink-bg:    #0B0A09;
  --ink-bg-2:  #17150F;
  --on-ink:      #FBFAF9;  /* 18.98 on --ink-bg — AAA */
  --on-ink-2:    #B3B2AF;  /*  9.33 on --ink-bg — AA  */
  --on-ink-3:    #7E7D7A;  /*  4.81 on --ink-bg — AA  */

  /* the single accent */
  --accent:      #5E46BF;  /*  6.76 on white — AA. White on it: 6.76 — AA */
  --accent-ink:  #4C369E;  /*  9.02 on white — AAA, for small accent text */
  --accent-weak: color-mix(in oklab, var(--accent) 8%, transparent);

  --danger:  #B3261E;
  --success: #1B6B3A;
}
```

**Accent rule — enforced by lint, not convention.** Violet may appear on:
primary button fill, active nav item, focus ring, inline link. Nowhere else.
Never inside a sentence. Never a section background. Never a gradient.

## A2. Space — one rhythm

```css
--space-2xs: clamp(0.5rem,  0.45rem + 0.20vw, 0.75rem);
--space-xs:  clamp(0.75rem, 0.65rem + 0.40vw, 1rem);
--space-sm:  clamp(1rem,    0.90rem + 0.50vw, 1.5rem);
--space-md:  clamp(1.75rem, 1.50rem + 1.00vw, 2.5rem);
--space-lg:  clamp(3rem,    2.50rem + 2.00vw, 4.5rem);
--space-xl:  clamp(5rem,    4.00rem + 4.00vw, 8rem);   /* section rhythm */
```

At 1440 these resolve to: 12 / 16 / 24 / 40 / 72 / 128 px.

**Every section uses `--space-xl` block padding. No exceptions.** A section that
feels too tall gets less content, never less padding.

## A3. Measure — two widths

```css
--w-page: 1200px;   /* outer bound of every section */
--w-text:   68ch;   /* every run of prose */
```

Side padding: `clamp(1.25rem, 5vw, 2.5rem)`.

Anything wanting a third width is a design bug. Resolve it, do not add a value.

## A4. Type

```css
--font-sans: var(--font-inter), "Segoe UI", system-ui, sans-serif;
--font-mono: ui-monospace, "SF Mono", Menlo, monospace;

--text-xs:   0.8125rem;
--text-sm:   0.875rem;
--text-base: 1rem;
--text-lg:   1.125rem;
--text-xl:   clamp(1.25rem,  1.15rem + 0.50vw, 1.5rem);
--text-2xl:  clamp(1.5rem,   1.30rem + 1.00vw, 2rem);
--text-3xl:  clamp(1.875rem, 1.50rem + 1.90vw, 2.75rem);
--text-4xl:  clamp(2.25rem,  1.60rem + 3.20vw, 4rem);
--text-hero: clamp(2.5rem,   1.40rem + 4.60vw, 4.75rem);

--weight-body: 400;
--weight-med:  500;
--weight-head: 600;   /* stop here — 700+ reads shouty at display size */

--tracking-hero:  -0.030em;
--tracking-head:  -0.022em;
--tracking-body:   0;
--tracking-label:  0.14em;

--leading-hero: 1.02;
--leading-head: 1.15;
--leading-body: 1.60;
```

| Role | Size | Weight | Tracking | Leading |
|---|---|---|---|---|
| Hero h1 | `--text-hero` | 600 | −0.030em | 1.02 |
| Section h2 | `--text-3xl` | 600 | −0.022em | 1.15 |
| Card h3 | `--text-lg` | 600 | −0.015em | 1.25 |
| Lead | `--text-lg` | 400 | 0 | 1.60 |
| Body | `--text-base` | 400 | 0 | 1.60 |
| Label | `--text-xs` | 500 | 0.14em, uppercase | 1.4 |

## A5. Motion

```css
--dur-fast:   150ms;   /* hover, focus, press — default */
--dur-normal: 240ms;   /* popover, dropdown */
--dur-slow:   400ms;   /* modal, drawer */
--dur-reveal: 600ms;   /* scroll entry */
--stagger:     60ms;

--ease-out:    cubic-bezier(0, 0.7, 0.3, 1);
--ease-in-out: cubic-bezier(0.7, 0, 0.3, 1);
--ease-in:     cubic-bezier(0.7, 0, 1, 1);
--ease-soft:   cubic-bezier(0.3, 0.3, 0.3, 1);

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast:1ms; --dur-normal:1ms; --dur-slow:1ms;
          --dur-reveal:1ms; --stagger:0ms; }
}
```

No overshoot curve exists in the system. Animate only `transform`, `opacity`,
`clip-path`. Reduced motion collapses at token level so unaudited components are
correct by default.

## A6. Shape and elevation

```css
--r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-card: 20px; --r-pill: 999px;
--shadow-sm: 0 1px 2px rgba(16,15,13,0.05);
--shadow-md: 0 2px 8px rgba(16,15,13,0.06), 0 12px 28px -14px rgba(16,15,13,0.10);
```

No glass, no `backdrop-filter`, no inset highlights, no gradients on surfaces.

---

# PART B — PRIMITIVES

`src/components/primitives/` — built and verified before any page is touched.

### B1. `Page`
```tsx
function Page({ children, className }: { children: ReactNode; className?: string })
// width: 100%; max-width: var(--w-page); margin-inline: auto;
// padding-inline: clamp(1.25rem, 5vw, 2.5rem)
```

### B2. `Section`
```tsx
function Section({
  tone = "paper",              // "paper" | "ink"
  labelledBy,                  // id of its heading — required for a11y
  children, className,
}: SectionProps)
// <section aria-labelledby={labelledBy}>
// padding-block: var(--space-xl)
// tone="ink" -> background var(--ink-bg), sets --local-fg to --on-ink
```
Tone is the only structural variant. It swaps foreground tokens so children need
no dark-mode awareness.

### B3. `Prose`
```tsx
function Prose({ children, className }: { children: ReactNode; className?: string })
// max-width: var(--w-text)
```

### B4. `Eyebrow`
```tsx
function Eyebrow({ children }: { children: ReactNode })
// --text-xs / 500 / --tracking-label / uppercase / --ink-3 (or --on-ink-3 in ink tone)
```

### B5. `Heading`
```tsx
function Heading({
  level,                       // 1 | 2 | 3   -> h1 | h2 | h3
  size,                        // optional override; defaults per level
  id, children, className,
}: HeadingProps)
```
Maps level → size/tracking/leading from the table in A4. **Sets colour inline**,
because `globals.css` currently carries an unlayered `h1,h2,h3,h4 { color }`
rule that beats layered Tailwind utilities regardless of specificity. Phase 0
moves that rule into `@layer base`; until then, inline is the only safe route.
This has caused two invisible-headline bugs already.

### B6. `Text`
```tsx
function Text({
  size = "base",               // "sm" | "base" | "lg"
  tone = "body",               // "body" | "muted" | "strong"
  as = "p", children, className,
}: TextProps)
```

### B7. `Button`
```tsx
function Button({
  variant = "primary",         // "primary" | "secondary" | "ghost"
  size = "md",                 // "sm" | "md" | "lg"
  href,                        // renders <Link> when present, else <button>
  ...rest
}: ButtonProps)
```

| Variant | Rest | Hover | Active | Focus-visible |
|---|---|---|---|---|
| primary | `--accent` bg, white text | `--accent-ink` bg | `translateY(1px)` | 2px `--accent` ring, 2px offset |
| secondary | white bg, `--line-2` border, `--ink` | `--paper-2` bg | `translateY(1px)` | same |
| ghost | transparent, `--ink-2` | `--paper-2` bg | `translateY(1px)` | same |

On `tone="ink"` sections the same variants invert: primary becomes white fill
with `--ink` text, secondary becomes a `rgba(255,255,255,.25)` border.
All transitions `--dur-fast` `--ease-out`. Sizes: sm 36px, md 44px, lg 52px —
md and lg clear the 44px touch minimum; sm is desktop-only UI.

### B8. `Card`
```tsx
function Card({ interactive = false, children, className }: CardProps)
// white, 1px --line, --r-card, --shadow-sm
// interactive -> hover: --shadow-md + translateY(-2px), --dur-fast
```

### B9. `Field`
```tsx
function Field({
  label,                       // always rendered; visually-hidden if hideLabel
  hideLabel = false, error, hint, id, ...inputProps
}: FieldProps)
// label htmlFor -> input id; aria-describedby wires hint and error
// error: --danger text + --danger border, role="alert"
// focus-visible: 2px --accent ring
```

### B10. `Rule`
```tsx
function Rule({ className }: { className?: string })   // 1px --line
```

**Enforcement:** no section may set its own padding, max-width, font-size, or
colour. A `token-lint` rule fails the build on raw hex, raw ms, inline
`cubic-bezier`, or `py-*`/`max-w-*` inside `src/components/sections/`.

---

# PART C — THE HOMEPAGE, SECTION BY SECTION

Six sections. Each has a job no other section does.

---

## C1. Hero — `tone="ink"`

**Job:** which side are you on, and what do you need.

```
┌────────────────────────────────────────────────────────────┐
│  [inset card, --r-card 28/36px, --ink-bg, WebGL field]     │
│                                                             │
│  FOR HIRING TEAMS AND CANDIDATES          ← Eyebrow         │
│                                                             │
│  Hire for how people                      ← h1, --text-hero │
│  actually work.                             max 17ch        │
│                                                             │
│  One honest conversation, then a report    ← lead, 50ch     │
│  you can check line by line.                                │
│                                                             │
│  ┌──────────────┬──────────────┐          ← tablist        │
│  │ I want to hire│ I'm looking  │                           │
│  └──────────────┴──────────────┘                           │
│  ┌────────────────────────────┬─────────┐ ← search         │
│  │ Describe the role…         │ Find    │                   │
│  └────────────────────────────┴─────────┘                   │
│  [Backend →][Design →][Data →][AI →]     ← quick picks     │
└────────────────────────────────────────────────────────────┘
```

**Layout.** Card inset `--space-2xs` from viewport, `padding-top` 84px to clear
the fixed nav. Content column `max-width: 54rem`, left-aligned, vertically
centred, `min-height: clamp(520px, 70vh, 720px)`.

**Media.** `HeroField` — WebGL ink material, two colours, 30fps cap, paused
off-screen, single still frame under reduced motion. Scrim over it:
`linear-gradient(96deg, rgba(11,10,9,.95), rgba(11,10,9,.86) 34%, rgba(11,10,9,.45) 62%, rgba(11,10,9,.10))`
so copy never depends on the shader's state.

**Behaviour.** Tabs are a real `role="tablist"`: ArrowLeft/Right move selection,
Home/End jump, only the selected tab is tabbable so Tab lands on the input.
Submit routes to `/employer/jobs/new?seed=` or `/pre-interview?focus=`.
Routes to *creation*, never results — the database is empty and an empty results
page is worse than no search.

**Responsive.** ≤640: tabs stack full-width, search button drops below input,
quick picks wrap to two rows, `--text-hero` bottoms out at 2.5rem.

**Copy (final).**
- Eyebrow: `For hiring teams and candidates`
- h1: `Hire for how people actually work.`
- Lead: `One honest conversation, then a report you can check line by line.`
- Tabs: `I want to hire` · `I'm looking for work`
- Placeholders: `Describe the role you're hiring for…` · `Describe the work you want to be judged on…`
- Buttons: `Find people` · `Get started`

---

## C2. The problem — `tone="paper"`

**Job:** why resumes fail. Said once, never repeated.

```
┌────────────────────────────────────────────────────────────┐
│  THE PROBLEM                                                │
│                                                             │
│  A resume tells you where          ← h2, --text-3xl, 20ch  │
│  someone has been.                                          │
│                                                             │
│  It can't tell you how they think, how they decide, or     │
│  what they do when the problem isn't in the spec.          │  ← Prose
│                                                             │
│  ── 3-col, --space-md gap ─────────────────────────────    │
│  Screening is a lottery │ Good people │ Bias hides in      │
│  6 seconds per resume   │ get missed  │ the shortlist      │
└────────────────────────────────────────────────────────────┘
```

Three plain text columns — no cards, no icons, no numbers. Stacks at ≤768.

**Copy.**
- h2: `A resume tells you where someone has been.`
- Lead: `It can't tell you how they think, how they decide, or what they do when the problem isn't in the spec.`
- Col 1: `Screening is a lottery` / `A resume gets about six seconds. Most of what matters isn't on it.`
- Col 2: `Good people get missed` / `Non-linear careers and self-taught skills don't survive a keyword filter.`
- Col 3: `Bias hides in the shortlist` / `School, name, and company are proxies. They're also where bias lives.`

---

## C3. How it works — `tone="paper"`, carries the evidence graph

**Job:** the mechanism. The only place it is explained.

```
┌────────────────────────────────────────────────────────────┐
│  HOW IT WORKS                                               │
│  One conversation, read three ways.   ← h2                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [evidence graph — SVG, animated, on --paper-2]      │  │
│  │  utterance ──▶ evidence ──▶ capability               │  │
│  ├──────────────┬──────────────┬────────────────────────┤  │
│  │ CONVERSATION │  EVIDENCE    │  CAPABILITY            │  │
│  └──────────────┴──────────────┴────────────────────────┘  │
│                                                             │
│  01 The conversation │ 02 Evidence │ 03 Capability         │
│  (three columns of copy, aligned under the graph columns)  │
└────────────────────────────────────────────────────────────┘
```

**The graph.** Pure SVG + CSS keyframes, no library. 160×100 viewBox so the
three stages read as a band. Animates only `opacity`, `transform`,
`stroke-dashoffset`. A sweep travels the width lighting each stage in turn — the
motion *is* the explanation. Reduced motion holds the completed state; nothing
is hidden. `aria-hidden`; the column captions and copy carry the meaning.

**Copy.**
- h2: `One conversation, read three ways.`
- 01 `The conversation` / `A 22-minute interview that adapts. No script to game, no résumé to polish.`
- 02 `Evidence` / `Specific moments get lifted out and kept. Not impressions — things that were said, with a timestamp.`
- 03 `Capability` / `Evidence adds up to a signal with a confidence attached. You see the reasoning, not just the number.`

---

## C4. What you get — `tone="paper"`

**Job:** the artefact. What lands on your desk.

Two-up at ≥1024, stacked below. Left: the employer report. Right: the candidate
report. Each is a `Card` with a real product capture, `next/image`, explicit
dimensions, `loading="lazy"` on the second.

**Copy.**
- h2: `A report you can argue with.`
- Lead: `Every score points back to a moment in the transcript. If you disagree, you can see exactly what it was reading.`
- Left: `For the hiring team` / `Evidence bands per capability, the transcript moment behind each one, and a written read you can forward.`
- Right: `For the candidate` / `The same report, before anyone else sees it. You decide what's shared.`

---

## C5. Trust — `tone="paper"`

**Job:** the regulatory and fairness position. Load-bearing for a hiring product.

Four cells in one panel, hairline-divided (`gap-px` on `--line` background), 2×2
at ≤768. No icons.

**Copy.**
- Eyebrow: `Where we stand`
- h2: `Hiring software should be able to show its work.`
- Lead: `We're early, so there's no wall of customer logos here we haven't earned. Here's what we can show you.`
- `NYC Local Law 144` / `Bias audit and candidate notice, as the law requires.`
- `EU AI Act` / `Built for the high-risk tier that covers hiring.`
- `Traceable scoring` / `Every score points back to a moment in the transcript.`
- `The right to contest` / `Candidates can challenge a result and get a human read.`
- Link: `Read how scoring works` → `/trust`

---

## C6. Close — `tone="ink"`

**Job:** one action. Same as the hero, no new argument.

**Copy.**
- h2: `See how someone works before you hire them.`
- Lead: `Free for candidates. One conversation for teams.`
- Primary: `Start an interview` → `/pre-interview`
- Secondary: `Book a demo` → opens the demo dialog
- Note: `No setup. Cancel anytime.`

---

# PART D — OTHER SURFACES

## D1. `/candidates` and `/companies`

Same primitives, four sections: hero (no fork — they already chose) → problem
for that audience → how it works for that audience → close. `PageHero` shared,
`min-height: clamp(420px, 56vh, 560px)`.

## D2. Nav

Transparent at rest over the ink hero; white with a `--line` bottom border once
`scrollY > 16`. Logo glyph stays `--accent` on every ground; only the wordmark
inherits tone. Links `--ink-2` → `--ink` on hover, `--dur-fast`.

## D3. Footer

`tone="paper"`, `--line` top border, four columns → two at ≤768 → one at ≤480.

---

# PART E — BUILD SEQUENCE

Each phase is one commit, independently shippable and revertible.

| # | Phase | Files | Done when |
|---|---|---|---|
| 0 | Tokens + move `h1..h4` into `@layer base`; delete `.glass`, `.grad-iris` | `globals.css` | `grep -c backdrop-filter src/` = 0; gradient-text count 0 |
| 1 | Ten primitives | `src/components/primitives/*` | each renders at 320/768/1024/1440; Button has all 3 variants × 2 tones |
| 2 | `token-lint` rule extension | `scripts/token-lint.mjs` | fails on `py-*`/`max-w-*` in `sections/` |
| 3 | Hero on primitives | `sections/Hero.tsx`, `HeroSearch.tsx` | tablist keyboard passes; search routes with seed |
| 4 | Sections C2–C6, one commit each | `sections/*` | one padding value, two widths across the page |
| 5 | Evidence graph | `motion/EvidenceGraph.tsx` | explains the product; reduced motion holds final state |
| 6 | `/candidates`, `/companies` | `app/*/page.tsx` | three pages, one character |
| 7 | Delete dead components + unused CSS | many | build clean; bundle ≤ current 395KB |

**Gate — every phase, no exceptions:**

```bash
npx tsc --noEmit                      # clean
node scripts/token-lint.mjs           # exit 0
pnpm build                            # clean
# then, at 320 / 768 / 1024 / 1440:
#   documentElement.scrollWidth <= innerWidth
#   contrast verified numerically, not by eye
#   keyboard: tab through every interactive element, visible focus
#   prefers-reduced-motion: page renders complete and static
```

**Target metrics on completion:**

| | Now | Target |
|---|---:|---:|
| Homepage sections | 11 | 6 |
| Page height @1440 | 12,953px | < 6,000px |
| Distinct section paddings | 7+ | 1 |
| Distinct container widths | 8+ | 2 |
| `backdrop-filter` instances | 0 | 0 |
| JS bundle | 395KB | ≤ 395KB |

---

# PART F — OPEN DECISIONS

These block nothing in phases 0–2 but shape phases 4–6.

1. **Six sections** — agreed, or name substitutes and the job each does.
2. **The globe** (`GlobalReach`) — delete, or move to `/companies`? It is
   decorative and explains nothing today.
3. **Imagery** — Harvey and Scale each serve ~70 real images from a CMS;
   PlacedOn serves 2. C4 needs real product captures at minimum. Anything beyond
   that needs commissioned photography or illustration — it cannot be closed by
   writing components, and unlicensed images are not an option.
4. **Typeface** — Inter is free and correct for this register. Both references
   bought one (Diatype, Aeonik). Largest lever this spec cannot pull with code.
