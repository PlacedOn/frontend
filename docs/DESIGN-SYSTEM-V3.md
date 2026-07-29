# PlacedOn V3 — Design System & Product Experience Spec

**Status:** Audit + specification. Nothing implemented yet, by design.
**Date:** 2026-07-29
**Palette direction:** violet / white / black, balanced
**References measured:** harvey.ai, scale.com (live CSS + shipped bundles, not screenshots)

---

## 0. How this document was produced

Every number below is measured from the live sites, not recalled or estimated. Harvey's
and Scale's stylesheets were downloaded and parsed for custom properties; their shipped
JS chunks were fetched with compression to get real transfer sizes; brand colors were
converted to OKLCH to compare chroma at matched lightness.

Where a claim is an opinion, it is labelled as one.

---

## 1. What actually makes Harvey and Scale feel expensive

### 1.1 Harvey's grays are not gray

Harvey's entire neutral ramp is warm-tinted. This is the single most copied-wrong thing
about their look — people reach for Tailwind's `neutral` or `zinc` and wonder why it
reads colder and cheaper.

| Token | Hex | Note |
|---|---|---|
| `--color-gray-50-ivory` | `#fafaf9` | named *ivory*, not white |
| `--color-gray-100` | `#f2f1f0` | |
| `--color-gray-200` | `#e5e5e3` | |
| `--color-gray-300` | `#cccac6` | |
| `--color-gray-400` | `#adaba5` | |
| `--color-gray-500` | `#8f8b85` | |
| `--color-gray-600` | `#706d66` | |
| `--color-gray-700` | `#524f49` | |
| `--color-gray-800` | `#33312c` | |
| `--color-gray-900` | `#1f1d1a` | |
| `--color-gray-950-ink` | `#0f0e0d` | named *ink*, not black |

Measured in OKLCH, `#0f0e0d` is **L 16.5, C 0.003, H 67.6** — essentially achromatic but
biased warm. Their "white" `#fafaf9` is **L 98.5, C 0.001**.

They never use `#000` or `#fff` as page surfaces. Both exist as tokens
(`--color-black`, `--color-white`) but are reserved for text-on-color, per their own
"pair every color with black or white" rule.

### 1.2 Their accent colors are almost colorless

| Token | Hex | Chroma |
|---|---|---|
| `--color-dark-bronze` | `#593d3a` | very low |
| `--color-dark-casal` | `#333f40` | very low |
| `--color-dark-velvet` | `#373340` | **C 0.023** |
| `--color-light-alabaster` | `#dbd9d1` | very low |
| `--color-light-blush` | `#d9cdcc` | very low |

Saturated color appears **only** in semantic states: green `#16a34a`, yellow `#eab308`,
red `#f26161`. Nothing decorative is saturated. That restraint is the effect.

### 1.3 Two-tier token architecture

Harvey never references a raw color in a component. There is a primitive layer and a
semantic layer:

```
--color-gray-50-ivory: #fafaf9;          /* primitive: what it is   */
--background-primary: var(--color-gray-50-ivory);  /* semantic: what it's for */
```

Dark mode is then one block that re-points the semantic layer at different primitives.
`--background-primary` appears three times in their CSS with three different values —
light, dark, and an elevated context — and no component changes.

**This is the highest-leverage thing to copy.** It is architecture, not taste.

### 1.4 Their spacing scale is fluid, not just their type

Everyone makes type fluid with `clamp()`. Harvey makes *spacing* fluid too. Each spacing
token carries four values across breakpoints:

| Token | Mobile → Desktop |
|---|---|
| `--spacing-xs` | 0.4375 → 0.625rem |
| `--spacing-sm` | 0.875 → 1.25rem |
| `--spacing-md` | 1.75 → 2.5rem |
| `--spacing-lg` | 3.5 → 5rem |
| `--spacing-xl` | 7 → 10rem |
| `--spacing-2xl` | 8.75 → 12.5rem |

Note the ratio: each step is ~2× the one below it. Section rhythm on desktop is 7–12.5rem
(112–200px). That is where the "breathing room" comes from — it is a token, not a
judgement call made per-section.

### 1.5 Four easing curves, hand-tuned, zero overshoot

```css
--ease-in-out:      cubic-bezier(.7, 0, .3, 1);   /* aggressive, symmetric */
--ease-out:         cubic-bezier(0, .7, .3, 1);   /* instant start, hard decel */
--ease-in-soft-out: cubic-bezier(.7, 0, .7, .7);
--ease-out-soft-in: cubic-bezier(.3, .3, .3, 1);
```

Compare Scale, which uses **stock Tailwind defaults** (`cubic-bezier(.4,0,.2,1)`).
Harvey's curves are meaningfully more crafted, and this is a real differentiator between
the two references.

`--ease-out: cubic-bezier(0,.7,.3,1)` starts at maximum velocity — the element is already
moving on frame one. That is what "responsive" feels like, distinct from "fast."

**Neither reference has a single overshoot/bounce curve.** More on this in §3.2.

### 1.6 Durations are short

Harvey's dominant duration is **150ms**. Accordions, fades, all 150ms. Dropdown selects
get 200ms. The only long animation is a 2.5s shimmer on loading skeletons.

### 1.7 Radii are restrained

Both cap at modest values: Harvey `--radius-2xl: 1rem` (16px) is the ceiling for normal
UI; Scale goes to `--radius-4xl: 2rem`. Neither uses pill-shaped buttons for primary
actions.

### 1.8 Scale's brand gradient is already violet

Directly relevant to your palette direction:

```css
--gradient-color-1: #9068c2;   /* soft violet     */
--gradient-color-2: #5933b2;   /* deep violet     */
--gradient-color-3: #8a507e;   /* plum / mauve    */
--gradient-color-4: #7b8ce7;   /* periwinkle      */
```

So "violet, white, black" is not a departure from the Scale reference. It *is* the Scale
reference. The question is only how saturated — which §2 answers with numbers.

### 1.9 Neither ships a motion library

This is the finding I expected least and it is the most important one in this document.

| | Framer Motion | GSAP | Lottie | Three.js | `<canvas>` | Inline SVG |
|---|---|---|---|---|---|---|
| **Harvey** | ✗ | ✗ | ✗ | ✗ | 0 | 36 |
| **Scale** | ✗ | ✗ | ✗ | ✗ | 0 | 28 |
| **PlacedOn** | ✓ 120 uses | ✓ 34 uses | ✗ | ✓ 13 uses | — | — |

Harvey ships exactly one interaction dependency: `embla` (a carousel). Scale ships none.

**All of their motion is CSS transitions and CSS keyframes**, driven by the token systems
above. Every animation you perceive as premium on those sites is a `transition` on
`transform`/`opacity` with a 150ms duration and one of four bezier curves.

### 1.10 Fonts: custom, and few files

- **Harvey** — `HarveySansDiatypeVariable` (a customized Diatype, variable) + a bespoke
  serif in regular and italic. **3 font files.** The serif is used for editorial accents,
  which is where a lot of their "considered" quality comes from.
- **Scale** — `Aeonik Pro`, **1 file**, Regular weight only on first load.

Both bought or commissioned a typeface. Neither uses a Google font. Neither loads more
than 3 files.

---

## 2. The PlacedOn palette problem, measured

Your current violets against Scale's, in OKLCH at matched lightness:

| Color | L* | Chroma | Hue |
|---|---:|---:|---:|
| PlacedOn `#6922F5` (brand) | 51.0 | **0.273** | 286.9 |
| PlacedOn `#5314C9` (iris-ink) | 43.4 | **0.238** | 286.5 |
| Scale `#5933B2` | 44.6 | **0.188** | 290.4 |
| PlacedOn `#8B54FF` | 60.1 | **0.239** | 292.5 |
| Scale `#9068C2` | 59.6 | **0.138** | 303.0 |

**At L≈44, PlacedOn carries 27% more chroma than Scale. At L≈60, it carries 73% more.**

That gap is the entire "why does mine look less expensive" question, quantified. It is not
layout, spacing, or motion. It is that the violet is turned up too far.

### 2.1 The black is also the problem

| Color | L* | Chroma | Hue |
|---|---:|---:|---:|
| Harvey ink `#0F0E0D` | 16.5 | **0.003** | 67.6 (warm) |
| PlacedOn ink `#0E1020` | 18.0 | **0.033** | 277.1 (cool violet) |

PlacedOn's "black" carries **11× the chroma of Harvey's** and is tinted blue-violet.

A tinted black across large surfaces is the classic tell that a palette is *themed* rather
than *designed*. The violet is already the brand; the black does not also need to be
violet. When both are violet, nothing reads as an accent, and the eye has no rest.

### 2.2 Recommended palette

Two-tier, following §1.3. Hue locked at **287** for all violets (your existing brand hue —
keep it; it is a good hue). Chroma ramped down toward Scale's register. Neutrals given a
**very slight warm bias** to avoid the clinical feel, but nowhere near Harvey's olive.

```css
:root {
  /* ── primitives: neutrals (warm bias, C ≤ 0.006) ─────────────── */
  --pl-white:      oklch(100%  0     0);      /* pure, for text on violet only */
  --pl-paper:      oklch(98.6% 0.002 90);     /* page surface                  */
  --pl-paper-2:    oklch(96.8% 0.003 90);     /* raised surface                */
  --pl-line:       oklch(91%   0.004 90);     /* hairlines                     */
  --pl-line-2:     oklch(84%   0.005 90);     /* stronger dividers             */
  --pl-mute:       oklch(62%   0.006 90);     /* muted text, meets AA on paper */
  --pl-body:       oklch(43%   0.005 90);     /* body copy                     */
  --pl-ink:        oklch(17%   0.004 90);     /* headings, near-neutral warm   */
  --pl-black:      oklch(0%    0     0);      /* reserved, rarely used         */

  /* ── primitives: violet (hue locked 287, chroma disciplined) ──── */
  --pl-violet-50:  oklch(97%   0.014 287);
  --pl-violet-100: oklch(93%   0.032 287);
  --pl-violet-200: oklch(86%   0.062 287);
  --pl-violet-300: oklch(76%   0.098 287);
  --pl-violet-400: oklch(66%   0.135 287);
  --pl-violet-500: oklch(57%   0.170 287);   /* interactive default          */
  --pl-violet-600: oklch(49%   0.180 287);   /* primary action — Scale-register */
  --pl-violet-700: oklch(42%   0.160 287);   /* pressed                      */
  --pl-violet-800: oklch(34%   0.120 287);
  --pl-violet-900: oklch(26%   0.080 287);

  /* ── semantic layer: components reference ONLY these ──────────── */
  --bg-primary:        var(--pl-paper);
  --bg-secondary:      var(--pl-paper-2);
  --bg-inverse:        var(--pl-ink);
  --bg-accent:         var(--pl-violet-600);
  --bg-accent-hover:   var(--pl-violet-500);
  --bg-accent-press:   var(--pl-violet-700);
  --bg-accent-subtle:  var(--pl-violet-50);

  --fg-primary:        var(--pl-ink);
  --fg-secondary:      var(--pl-body);
  --fg-muted:          var(--pl-mute);
  --fg-inverse:        var(--pl-paper);
  --fg-on-accent:      var(--pl-white);
  --fg-accent:         var(--pl-violet-700);   /* violet text on paper: AA */

  --border-primary:    var(--pl-line);
  --border-strong:     var(--pl-line-2);
  --border-focus:      var(--pl-violet-600);

  /* semantic states — the ONLY other saturated colors permitted */
  --fg-success: oklch(58% 0.15 150);
  --fg-warning: oklch(72% 0.16  85);
  --fg-danger:  oklch(58% 0.19  25);
}

[data-theme="dark"] {
  --bg-primary:       oklch(15%   0.004 90);
  --bg-secondary:     oklch(19%   0.005 90);
  --bg-inverse:       var(--pl-paper);
  --bg-accent:        var(--pl-violet-500);
  --bg-accent-hover:  var(--pl-violet-400);
  --bg-accent-press:  var(--pl-violet-600);
  --bg-accent-subtle: oklch(26% 0.055 287);

  --fg-primary:       oklch(96%   0.003 90);
  --fg-secondary:     oklch(78%   0.005 90);
  --fg-muted:         oklch(60%   0.006 90);
  --fg-accent:        var(--pl-violet-300);

  --border-primary:   oklch(27% 0.005 90);
  --border-strong:    oklch(35% 0.006 90);
}
```

### 2.3 The violet budget (the rule that makes it work)

> **Violet may occupy no more than ~5% of any viewport, and only one violet element
> may compete for attention per screen.**

Concretely permitted:
- the primary CTA
- the active nav / active state
- one data accent in a chart
- focus rings
- link text (`--fg-accent`, at 700 for contrast)

Not permitted: violet section backgrounds, violet gradient hero washes, violet card
borders as decoration, violet on violet. When everything is violet, the CTA stops being
findable — which is a conversion problem, not just a taste one.

**White does the work. Black does the structure. Violet does the pointing.**

---

## 3. Motion — resolving the tension in your brief

### 3.1 The tension, stated plainly

You asked for two things that pull against each other:

1. *"a mixture of scale.com and harvey.ai minimum"*
2. *"equal motion graphic, keep all the motion graphic"*

The measured reality of reference (1) is **zero motion libraries and zero canvas**. Your
current build has four animation runtimes and 120 Framer Motion call sites. Those cannot
both be fully satisfied.

I am not going to quietly split the difference and hand you something that is neither.
Here is the resolution I recommend, and the reasoning.

### 3.2 The resolution: keep the motion, change what powers it

**Keep** — motion that *explains the product*. Your brief is right that the capability
graph, the evidence extraction, the conversation-becoming-structure sequence are the
story. That motion is load-bearing and should stay. It is genuinely differentiated and
neither reference has an equivalent.

**Cut** — motion that decorates. Overshoot springs, parallax on non-narrative elements,
3D that carries no information, ambient background drift on every route.

**Change the substrate:**

| Layer | Today | V3 |
|---|---|---|
| Hover, focus, press, dropdowns, accordions, reveals | Framer Motion | **CSS transitions + tokens** |
| Scroll-triggered section reveals | Framer Motion `whileInView` | **CSS `animation-timeline: view()`** with an IntersectionObserver fallback |
| The narrative sequences (capability graph, evidence flow) | Framer / GSAP | **Keep a real library here** — this is where it earns its weight |
| 3D globe | `three` + `cobe` | Reassess. See §3.4. |

This gets you Harvey's *feel* (everything under your finger responds in 150ms with a
crafted curve) while keeping the narrative motion that is actually PlacedOn's argument.

### 3.3 Drop the overshoot curve

Your current `--ease-spring: cubic-bezier(0.34, 1.45, 0.5, 1)` overshoots past its target
by 45%. Neither Harvey nor Scale has any overshoot curve.

Bounce reads as consumer, playful, *toy*. On a product asking a Fortune 500 CHRO to trust
an algorithmic hiring decision, bounce actively undercuts the message. This is the
cheapest single fix in this document: delete the curve, replace usages with `--ease-out`.

### 3.4 Motion token system

```css
:root {
  /* durations — Harvey's register */
  --dur-instant: 100ms;   /* color/opacity only              */
  --dur-fast:    150ms;   /* DEFAULT — hover, focus, press   */
  --dur-normal:  240ms;   /* dropdowns, popovers, tooltips   */
  --dur-slow:    400ms;   /* modals, drawers, sheets         */
  --dur-reveal:  600ms;   /* scroll-triggered section entry  */
  --dur-narrate: 900ms;   /* narrative sequence beats ONLY   */

  /* easing — four curves, no overshoot, ever */
  --ease-out:     cubic-bezier(0, .7, .3, 1);      /* entering, responding */
  --ease-in-out:  cubic-bezier(.7, 0, .3, 1);      /* moving between states */
  --ease-in:      cubic-bezier(.7, 0, 1, 1);       /* exiting */
  --ease-soft:    cubic-bezier(.3, .3, .3, 1);     /* long / ambient */

  --stagger: 60ms;   /* between siblings in a group */
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-instant:1ms; --dur-fast:1ms; --dur-normal:1ms;
          --dur-slow:1ms; --dur-reveal:1ms; --dur-narrate:1ms; --stagger:0ms; }
}
```

That reduced-motion block is deliberately at the token level. It means reduced-motion is
correct *by default everywhere*, including in components nobody remembered to audit —
rather than depending on 120 individual call sites each checking a hook.

### 3.5 Properties

Animate only `transform`, `opacity`, `clip-path`, and `filter` (sparingly), per your own
`web/performance.md`. Never `width`, `height`, `top`, `left`, `margin`, `padding`.
`will-change` goes on immediately before an animation and comes off after.

### 3.6 On 21st.dev MCP for motion graphics

Worth being precise about what that tool is good for, since your brief leans on it.

21st.dev is strongest at **generating React/Tailwind component scaffolds** — navbars,
carousels, testimonial grids, bento layouts. It is a component registry with generation on
top.

It is weaker at producing a *coherent motion system*. Components pulled from it arrive
with their own baked-in durations, easings, and (often) their own Framer Motion
dependency. Pulled naively into PlacedOn, you get exactly the inconsistency this document
is trying to remove — 12 components with 12 different easing curves.

**Recommended usage:** treat 21st.dev output as *structural scaffold only*. Pull the
markup and layout, then strip its animation props and re-express them in the token system
above before the component is allowed into `src/`. This should be a written rule in the
loop (§5), because the default behavior is to paste and move on.

For the narrative SVG illustrations (capability graph, evidence extraction, interview
timeline) — those should be authored by hand against the token system, not generated.
They are the differentiator; they are the one place the effort is justified.

---

## 4. Typography

Both references bought a typeface. That is a real cost and a real part of the effect.

**Recommendation:** a two-family system, ~3 files total.

- **Sans (primary)** — a grotesque with a true variable axis. Candidates: Diatype (what
  Harvey uses, paid), Aeonik (what Scale uses, paid), or from the free tier: **Inter
  Variable** (safe, ubiquitous, slightly anonymous) or **Geist** (Vercel, free, sharper
  personality and pairs well with a violet accent).
- **Serif (editorial accent)** — this is Harvey's quiet weapon and it is under-copied.
  One serif, used only for pull quotes, section eyebrows, and the occasional headline
  word. It does more for "considered" than any amount of motion.

```css
:root {
  --text-xs:   0.8125rem;              /* 13px — labels, captions */
  --text-sm:   0.875rem;               /* 14px — UI, dense tables */
  --text-base: 1rem;                   /* 16px — body            */
  --text-lg:   1.125rem;               /* 18px — lead paragraph  */
  --text-xl:   clamp(1.25rem, 1.15rem + 0.5vw,  1.5rem);
  --text-2xl:  clamp(1.5rem,  1.3rem  + 1vw,    2rem);
  --text-3xl:  clamp(1.875rem,1.5rem  + 1.9vw,  2.75rem);
  --text-4xl:  clamp(2.25rem, 1.6rem  + 3.2vw,  4rem);
  --text-hero: clamp(2.75rem, 1.2rem  + 7.6vw,  7rem);

  --leading-tight:   1.08;   /* hero + display only */
  --leading-snug:    1.25;   /* headings            */
  --leading-normal:  1.55;   /* body                */

  --tracking-hero:  -0.035em;  /* large type needs negative tracking */
  --tracking-head:  -0.02em;
  --tracking-body:   0;
  --tracking-label:  0.06em;   /* uppercase eyebrows only */
}
```

The negative tracking on display sizes is non-optional. Type set at 7rem with default
tracking is the most common reason a hero looks amateur.

### 4.1 Fluid spacing (copying Harvey's §1.4 move)

```css
:root {
  --space-xs:  clamp(0.4375rem, 0.4rem  + 0.15vw, 0.625rem);
  --space-sm:  clamp(0.875rem,  0.8rem  + 0.3vw,  1.25rem);
  --space-md:  clamp(1.75rem,   1.5rem  + 1vw,    2.5rem);
  --space-lg:  clamp(3.5rem,    3rem    + 2vw,    5rem);
  --space-xl:  clamp(7rem,      6rem    + 4vw,    10rem);
  --space-2xl: clamp(8.75rem,   7.5rem  + 5vw,    12.5rem);
}
```

Section vertical rhythm uses `--space-xl` as the default. That single change accounts for
much of the perceived "breathing room" difference against the references.

---

## 5. The design loop

The brief asks for a loop rather than a one-shot redesign. Here is a concrete one.

### 5.1 Loop structure — run per surface, not per site

A "surface" is one coherent thing: the homepage hero, the recruiter dashboard, the
interview room, the onboarding flow. Never batch more than one surface per pass.

```
┌─ 1. AUDIT ──────────────────────────────────────────────────┐
│  Answer, in writing, before touching code:                  │
│    · Why does this surface exist?                           │
│    · What single decision should the user make here?        │
│    · What is the one thing that must be understood in 5s?   │
│    · What currently creates friction?                       │
│  Output: 5–10 numbered findings, each with a severity.      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─ 2. SPEC ───────────────────────────────────────────────────┐
│  Token-level changes only. No prose like "make it cleaner". │
│  Every change names the token it uses. If a change needs a  │
│  token that doesn't exist, that is a system change and gets │
│  escalated to this document first.                          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─ 3. BUILD ──────────────────────────────────────────────────┐
│  Implement. 21st.dev may supply structure; its animation    │
│  props are stripped and re-expressed in tokens (§3.6).      │
│  Read node_modules/next/dist/docs/ before Next.js APIs      │
│  (per AGENTS.md — this Next.js differs from training data). │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─ 4. VERIFY (automated, must pass) ──────────────────────────┐
│  · tsc --noEmit clean                                        │
│  · token-lint: no raw hex / no raw ms / no raw cubic-bezier  │
│    outside globals.css                                       │
│  · screenshots at 320 / 768 / 1024 / 1440, light + dark      │
│  · axe pass, keyboard traversal, reduced-motion snapshot     │
│  · Lighthouse: perf ≥95, a11y 100, best-practices 100        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─ 5. CRITIQUE (judgement, written) ──────────────────────────┐
│  · Is the violet budget (§2.3) respected? Measure it.        │
│  · Does every animation explain something?                   │
│  · Would this be recognisably PlacedOn with the logo removed?│
│  · What would Harvey delete from this screen?                 │
│  If any answer fails → back to 2. Max 3 iterations, then     │
│  escalate to a human decision rather than looping forever.   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 The gate that makes the loop real

Step 4's token-lint is what stops drift. Without a mechanical check, the system decays
within about a week of normal development. Suggested rule: no `#hex`, no bare `123ms`, no
inline `cubic-bezier(...)` anywhere in `src/` except `globals.css`. Enforce it as a
`PostToolUse` hook on Write/Edit so violations surface at authoring time.

### 5.3 Available skills to drive the loop

Installed and relevant: `design-review` (visual QA + fixes), `ui-ux-pro-max` (systems,
palettes, pairings), `redesign-skill` (audits existing surfaces for generic AI patterns),
`emil-design-eng` (polish and micro-detail judgement), `apple-design` (motion physics and
restraint). `browse` / `qa` can drive the screenshot and a11y legs of step 4.

---

## 6. Current-state audit findings

Measured against the above.

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | Violet over-saturated vs reference register | **High** | C 0.273 vs Scale 0.188 at matched L (§2) |
| 2 | "Black" is tinted violet, 11× Harvey's chroma | **High** | `#0E1020` C 0.033 vs `#0F0E0D` C 0.003 |
| 3 | No semantic token layer — components use primitives | **High** | 50 tokens, all single-tier |
| 4 | Overshoot spring curve in the system | **Medium** | `--ease-spring` overshoots 45% |
| 5 | Four animation runtimes vs references' zero | **Medium** | motion 120, gsap 34, three 13, cobe 5 |
| 6 | Zero dynamic imports anywhere in the codebase | **Medium** | nothing code-split |
| 7 | Dead 3D code still in tree and `package.json` | **Low** | `HeroObject3D`, `GlobeLive` unimported |
| 8 | Spacing scale not fluid | **Medium** | fixed values; Harvey's is fluid at 6 steps |
| 9 | 22 distinct hexes in `globals.css` | **Medium** | palette not yet a disciplined ramp |

### 6.1 What is already good — do not regress it

- **Bundle size beats both references.** PlacedOn homepage ships **395KB** of JS across 13
  chunks; Harvey ships **1238KB** across 41; Scale **1197KB** across 29. This is a genuine
  advantage and the single easiest thing to lose in a motion-heavy redesign. Treat 395KB
  as a budget ceiling, not a starting point.
- `three.js` is dead code and correctly tree-shaken — it does **not** reach production.
  Removing it from `package.json` is hygiene, not a performance fix.
- TypeScript is clean (`tsc --noEmit` passes).
- 40 routes and 242 components already exist. This is a re-skin against a token system,
  not a rebuild.

---

## 7. Sequencing

Ordered by leverage per unit of risk. Each step is independently shippable.

| Phase | Work | Why first |
|---|---|---|
| **0** | Land tokens in `globals.css`: semantic layer, violet ramp, neutral ramp, motion tokens, fluid spacing | Everything downstream references these |
| **1** | Token-lint hook + reduced-motion at token level | Stops drift before the surface work starts |
| **2** | Delete `--ease-spring`; migrate hover/focus/press off Framer Motion to CSS | Biggest feel change, smallest diff |
| **3** | Homepage: hero + one narrative section, full loop (§5.1) | Proves the system on the highest-traffic surface |
| **4** | Remaining marketing surfaces | Pattern established |
| **5** | Recruiter dashboard, then candidate surfaces | Densest; benefits most from a settled system |
| **6** | Narrative SVG illustration set, hand-authored | Highest effort, highest differentiation, needs settled tokens |

---

## 8. Decisions taken (2026-07-29)

Nishant delegated these. Recorded here so they are not re-litigated.

1. **Typeface: Geist** (free, variable, Vercel). Replaces **Sora + Inter** — two families
   doing one family's job. Geist's variable axis covers display and body, matching Scale's
   single-sans discipline. Revisit only if a paid face (Diatype/Aeonik register,
   ~$500–2000) is budgeted; it remains the largest single lever this document cannot solve
   with code.
2. **Serif accent: yes — Instrument Serif** (free, normal + italic). Wired as `.serif` /
   `.serif-italic`, reserved for pull quotes, eyebrows, and the occasional headline word.
3. **Dark mode: built but NOT auto-enabled.** The token layer is complete and
   contrast-verified (ink 17.54 · body 9.81 · mute 4.98 · accent-text 8.99 ·
   white-on-accent 4.72, all AA on `#0C0B09`). It is reachable only via
   `<html data-theme="dark">`.

   **Why it is gated:** dark mode is not a token problem on this codebase. Roughly ten
   background components — `SignalField`, `HeroAurora`, `PlasmaVeil`, `AuroraFlow`,
   `AuroraMesh`, `FrostField`, `SectionAurora`, `SignalConfluence`, `MotionBackground`,
   `BeamsField` — paint full-viewport light gradients independently of the theme, and the
   `.glass` primitive assumes a light ground. Wiring it to `prefers-color-scheme` shipped
   light-on-light text on every card and an invisible logo. Two of those components
   (`HeroAurora`, `Hero`) are now tokenized via `--hero-glow` / `--hero-veil`; the
   remaining eight need the same treatment before the media query goes back in.

## 8b. Still open
3. **The globe.** `cobe` is on the homepage in `GlobalReach` and `CTA`. Does it explain
   anything about PlacedOn, or is it decoration? Neither reference has one. My read is it
   is decoration — but it is your call, and it is genuinely nice-looking.
4. **Light-first or dark-first?** Both references are light-first. Your `web/design-quality.md`
   says not to default to dark. The violet/white/black direction reads light-first, and
   this spec assumes that — confirm.
5. **Motion scope.** §3.2 keeps narrative motion and cuts decorative motion. If you want
   *all* current motion kept literally, say so — it is achievable, but it moves the result
   away from the Harvey/Scale reference, and I would rather you make that trade knowingly.
