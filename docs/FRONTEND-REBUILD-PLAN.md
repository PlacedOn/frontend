# PlacedOn — Frontend Rebuild Plan

**Status:** Plan. Nothing built from this yet.
**Date:** 2026-07-30
**Scope:** marketing surfaces + the design system underneath them
**References measured:** harvey.ai, scale.com, upwork.com

---

## 1. Why the last two weeks of changes didn't work

Not opinion. Measured on the current tree:

| | Count | Should be |
|---|---:|---:|
| Homepage content sections | 11 | 6 |
| Distinct section paddings | 7+ | 1 |
| Distinct container widths | 8+ | 2 |
| Files using `.glass` | 95 | — |
| Files using `.grad-iris` | 43 | — |

Eleven sections, each built standalone at a different time, each carrying its own
padding and its own container width. `py-14`, `py-16`, `py-20`, `py-24`,
`py-[clamp(4rem,3rem+5vw,8rem)]`. `max-w-2xl`, `max-w-md`, `max-w-xl`,
`max-w-[54rem]`, `max-w-xs`, `max-w-sm`, `max-w-lg`.

**Every change I made was a repaint.** New palette, new font, flat cards, dark
hero — applied on top of bones that do not line up. That is why each pass looked
like "no change": the colour changed, the rhythm never did. A page reads as
designed when its spacing and measure are consistent, and this page has never
had either.

The fix is not another repaint. It is: define the system, then rebuild each
section against it, deleting what does not survive.

---

## 2. What the references actually do

Measured from live pages, not impressions.

### Harvey — structure and restraint

| | |
|---|---|
| Content sections | **4** |
| Page height | 7,638px |
| `h1` | `text-align: start`, left 32px, 912px wide |
| Hero | full-bleed dark, one CTA, no chips or icons |
| Proof | real customer logos immediately under the fold |
| Neutrals | warm — `#fafaf9` ivory → `#0f0e0d` ink, never `#fff`/`#000` as surfaces |
| Accents | near-colourless; saturation only in semantic state |
| Spacing | **fluid** — six steps, each with a responsive range |
| Easing | four hand-tuned curves, **zero overshoot**, dominant duration 150ms |
| Radii | 16px ceiling for normal UI |
| Hero shader | 2 colour uniforms: `#0f0e0d` + transparent. **No brand colour.** |

Harvey's hero shader is a paper simulation — `u_fiber`, `u_crumples`,
`u_folds`, `u_roughness`. The premium read comes from a physical material, not a
colour wash.

### Scale — technical credibility as content

26 shaders, `THREE` on `window`, canvas in the layout flow rather than behind it.
Their brand gradient is already violet (`#5933b2`, `#9068c2`). 3D is *content*,
not background — the one technique PlacedOn has never used.

### Upwork — the two-sided fork

Inset rounded card, dark media, left copy, and the thing that matters: the page
asks **which side are you on** before it asks anything else. Search bar as the
single CTA, quick-pick chips underneath.

### What PlacedOn takes from each

- **Harvey** — section discipline, warm neutrals, fluid spacing, no decoration
- **Upwork** — the audience fork, search-as-CTA
- **Scale** — one piece of real technical visualisation, treated as content

Not a clone of any. The combination is the identity.

---

## 3. The system

Everything below is built once, in `globals.css` and a primitives folder, before
any section is touched.

### 3.1 Grid and measure — two widths, not eight

```css
--w-page:  1200px;   /* every section's outer bound */
--w-text:   68ch;    /* every prose column */
```

Two container components, `<Page>` and `<Prose>`. Nothing sets its own width.
Anything needing a third width is a design bug to resolve, not a new value.

### 3.2 Spacing — one rhythm, fluid

Harvey makes spacing fluid, not just type. Six steps, each a responsive range:

```css
--space-2xs: clamp(0.5rem,  0.45rem + 0.2vw, 0.75rem);
--space-xs:  clamp(0.75rem, 0.65rem + 0.4vw, 1rem);
--space-sm:  clamp(1rem,    0.9rem  + 0.5vw, 1.5rem);
--space-md:  clamp(1.75rem, 1.5rem  + 1vw,   2.5rem);
--space-lg:  clamp(3rem,    2.5rem  + 2vw,   4.5rem);
--space-xl:  clamp(5rem,    4rem    + 4vw,   8rem);   /* section rhythm */
```

**Exactly one section padding: `--space-xl`.** Every section. No exceptions. If
a section needs to feel tighter, it gets less content, not less padding.

### 3.3 Type — one family, weight does the work

`ui-ux-pro-max` returned "Minimal Swiss: Inter + Inter, one family with weight
variations, ultimate simplicity". That matches the reference register.

```css
--text-xs:   0.8125rem;   /* 13 — labels, eyebrows */
--text-sm:   0.875rem;    /* 14 — dense UI */
--text-base: 1rem;        /* 16 — body */
--text-lg:   1.125rem;    /* 18 — lead */
--text-xl:   clamp(1.25rem,  1.15rem + 0.5vw, 1.5rem);
--text-2xl:  clamp(1.5rem,   1.3rem  + 1.0vw, 2rem);
--text-3xl:  clamp(1.875rem, 1.5rem  + 1.9vw, 2.75rem);
--text-4xl:  clamp(2.25rem,  1.6rem  + 3.2vw, 4rem);
--text-hero: clamp(2.5rem,   1.4rem  + 4.6vw, 4.75rem);

--weight-body: 400;
--weight-med:  500;
--weight-head: 600;   /* headings stop here — 700+ reads shouty at display size */

--tracking-hero: -0.03em;   /* non-optional: large type without negative
                               tracking is the most common amateur tell */
--tracking-head: -0.022em;
--tracking-body: 0;
--tracking-label: 0.14em;   /* uppercase eyebrows only */

--leading-hero: 1.02;
--leading-head: 1.15;
--leading-body: 1.6;
```

### 3.4 Colour — white, ink, one accent

```css
/* neutrals — faint warm bias so the page is not clinical */
--paper:    #FFFFFF;
--paper-2:  #FAFAF9;
--line:     #EAEAE8;
--line-2:   #D6D5D2;
--ink-3:    #74726E;   /* 4.7:1  — labels */
--ink-2:    #52504C;   /* 7.8:1  — body */
--ink:      #12100E;   /* 17:1   — headings */

/* dark register, for the hero card and the close */
--ink-bg:   #0B0A09;
--ink-bg-2: #17150F;

/* the single accent */
--accent:      #5E46BF;   /* 6.5:1 on white */
--accent-ink:  #4C369E;   /* 8.6:1 — small accent text */
--accent-weak: color-mix(in oklab, var(--accent) 8%, transparent);
```

**The accent rule, enforced not suggested:** violet appears on the primary
action, the active nav item, focus rings, and links. Nowhere else. Never inside
a sentence. Never as a section background. Never as a gradient.

### 3.5 Motion — restrained, purposeful

```css
--dur-fast:   150ms;   /* hover, focus, press — the default */
--dur-normal: 240ms;   /* popovers, dropdowns */
--dur-slow:   400ms;   /* modals, drawers */
--dur-reveal: 600ms;   /* scroll entry */

--ease-out:    cubic-bezier(0, 0.7, 0.3, 1);
--ease-in-out: cubic-bezier(0.7, 0, 0.3, 1);
--ease-in:     cubic-bezier(0.7, 0, 1, 1);
--ease-soft:   cubic-bezier(0.3, 0.3, 0.3, 1);
```

No overshoot curve — bounce reads consumer and undercuts a product asking a CHRO
to trust an algorithmic decision. Reduced-motion collapses these at the token
level so components nobody audits are still correct.

**Two pieces of real motion survive, both earning their place:**

1. **Hero field** — WebGL ink material behind the hero card. Owned, generated,
   two colours. This is the Harvey move.
2. **Evidence graph** — the capability visualisation, as *content* in its own
   section. This is the Scale move, and it is the only thing on the site that
   shows what the product actually does.

Everything else is CSS transitions on `transform`/`opacity`.

### 3.6 Elevation and radii

```css
--r-sm: 8px;  --r-md: 12px;  --r-lg: 16px;  --r-card: 20px;  --r-pill: 999px;
--shadow-sm: 0 1px 2px rgba(16,15,13,0.05);
--shadow-md: 0 2px 8px rgba(16,15,13,0.06), 0 12px 28px -14px rgba(16,15,13,0.10);
```

No glass. No backdrop-filter. No inset highlights. Cards are white with a
hairline; the shadow is nearly invisible and exists only to lift on hover.

---

## 4. Primitives — built before any page

`src/components/primitives/`

| Component | Responsibility |
|---|---|
| `Page` | outer bound, `--w-page`, side padding |
| `Section` | `--space-xl` block padding, optional `tone="paper" \| "ink"` |
| `Prose` | `--w-text` measure for any run of copy |
| `Eyebrow` | uppercase label, `--text-xs`, `--tracking-label` |
| `Heading` | `level` 1–3 mapped to the type scale, correct tracking per level |
| `Text` | body, `size` and `tone` props |
| `Button` | `variant="primary" \| "secondary" \| "ghost"`, one focus treatment |
| `Card` | white, hairline, radius, optional hover lift |
| `Field` | input + label + error, one focus ring |
| `Rule` | hairline divider |

**Rule:** no section sets its own padding, width, font-size, or colour. If it
needs to, the primitive is wrong and the primitive gets fixed.

This is the part that has never existed, and its absence is the whole problem.

---

## 5. Page architecture

### 5.1 Homepage — 6 sections, one narrative

| # | Section | Tone | Job | Motion |
|---|---|---|---|---|
| 1 | **Hero** | ink | Which side are you on, and what do you need | WebGL field |
| 2 | **The problem** | paper | Why resumes fail. Said once. | none |
| 3 | **How it works** | paper | conversation → evidence → capability | evidence graph |
| 4 | **What you get** | paper | the artefact — a real report surface | none |
| 5 | **Trust** | paper | LL144, EU AI Act, contestability | none |
| 6 | **Close** | ink | one action, same as the hero | none |

Bookended dark, light body. Two transitions, not five.

Target: **under 6,000px** at 1440. Currently 12,953px.

### 5.2 What happens to the current 11 sections

| Current | Fate |
|---|---|
| Hero | rebuilt on primitives, keeps search fork |
| VerifiedCompanies | folds into **Trust** |
| SignalAccordion | folds into **How it works** |
| KineticMarquee | **delete** — decoration, says nothing |
| VisionReel | folds into **The problem** |
| HowItWorks | rebuilt as **How it works** |
| FeaturedSurfaces | folds into **What you get** |
| GlobalReach | **delete from homepage** — the globe is decorative; move to `/companies` if wanted |
| Testimonials | **delete** — the one quote is attributed to a company that does not exist |
| Audiences | folds into **Hero** (the fork already does this job) |
| CTA | rebuilt as **Close** |

Six survive in some form. Two are deleted outright. Components stay in the tree
until the rebuild is verified, then get removed in a cleanup commit.

### 5.3 `/candidates` and `/companies`

Same primitives, same rhythm, four sections each:
hero → problem for that audience → how it works for that audience → close.
No search fork; the visitor already chose by being there.

---

## 6. Build sequence

Each phase is independently shippable and independently verifiable.

| Phase | Work | Verify |
|---|---|---|
| **0** | Tokens into `globals.css`; delete `.glass`, `.grad-iris` | grep: 0 `backdrop-filter`, 0 gradient text |
| **1** | Build the ten primitives with props typed | Storybook-less visual check at 4 widths |
| **2** | Rebuild Hero on primitives | search routes; tablist keyboard; 320–1440 |
| **3** | Sections 2–6, one commit each | one padding value, two widths, page < 6,000px |
| **4** | Rewrite all copy — grade 7–9, contractions, no "signal" as a noun | read aloud; no sentence > 25 words |
| **5** | Evidence graph as content | explains the product; reduced-motion holds final state |
| **6** | `/candidates`, `/companies` on the same primitives | three pages, one character |
| **7** | Delete dead components and unused CSS | `pnpm build` clean, bundle ≤ current |

**Gate on every phase:** `tsc` clean · build clean · no horizontal overflow at
320/768/1024/1440 · AA contrast verified numerically · keyboard path works ·
`prefers-reduced-motion` renders complete.

---

## 7. System architecture

The design work above sits on a product that is not connected. Stating it plainly
so the plan is honest:

| Layer | State |
|---|---|
| Session | dashboard renders logged-out; `authFetch` throws at `v1.ts:650` before any request |
| Data | `jobs 0 · companies 0 · matches 0 · interview_sessions 0` |
| Writes | no endpoint for save / pass / mark-done — every dashboard control is local state |
| Spend | **no LLM cost ceiling in production** (built on `feat/port-voice-and-usage-tracking`, unmerged) |
| Voice | `interaction_layer/voice/tts.py` is `MockTTS`; real TTS is in the unported `whisper_service` |

**Order that actually unblocks things:**

1. Merge the spend ceiling — live financial exposure, independent of design
2. Verify a real session reaches the dashboard
3. Seed the database
4. Add write endpoints for the actions the UI already implies
5. Retire `src/lib/mock/` (9 modules)

Phases 1–4 of the frontend plan can run in parallel with this; phase 5 onward
benefits from real data but does not require it.

---

## 8. Decisions needed before phase 0

1. **Section count.** Six is my recommendation. If you want more, say which and
   what job each does — the constraint is that every section must do a job no
   other section does.
2. **The globe.** Delete from the homepage, or keep as decoration? It is the
   only 3D asset and it currently explains nothing.
3. **Imagery.** Harvey and Scale each serve ~70 real images from a CMS. PlacedOn
   serves 2. Closing that needs commissioned photography or illustration — it
   cannot be closed by writing components, and I will not use unlicensed
   images. Worth deciding whether to budget for it.
4. **Typeface.** Inter is free and correct for this register. Both references
   bought a face (Diatype, Aeonik). That is the largest remaining lever this
   plan cannot pull with code.
