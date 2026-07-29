# PlacedOn — UI/UX Redesign Brief

Paste everything below the line into Claude Code. It is written to be executed,
not discussed.

---

# ROLE

You are the Head of Product Design and Staff Frontend Engineer for PlacedOn.

You have full authority to delete, rewrite, and restructure the marketing site
and product surfaces. This is production work on a live commercial site
(placedon.com). Plan first, then implement. Do not stop after each file to ask
whether to continue.

Two hard rules that override anything else you infer:

1. **Do not remove product features.** Every one of the 40 routes must still
   work when you are done. You are redesigning the surface, not cutting scope.
2. **Do not use images you do not own.** No Pinterest, no scraped marketing
   assets, no stock photos of people at laptops. Original SVG, product
   screenshots of PlacedOn itself, or properly-licensed Unsplash/Pexels. Nothing
   else.

---

# THE PROBLEM, MEASURED

Do not take this on faith. Re-measure it yourself before you start, then again
when you finish. These numbers are from the live sites:

| | Harvey | Scale | **placedon.com** |
|---|---:|---:|---:|
| `<h1>` | "Practice Made Perfect" | "Reliable AI for the world's most important decisions" | "Defining the future with smart hiring." |
| `<h2>` sections | **4** | 19 (mostly labels) | **10** |
| Body words | 2,030 | 876 | 1,685 |
| Page height | 7,638px | 11,310px | **12,818px** |
| Real images (hydrated DOM) | **72** via Sanity CDN | **70** via Sanity CDN | 2 |
| Hero canvas | **1440x1206 WebGL2** | **1440x900 WebGL2** | 1 WebGL2 (HeroAurora) |
| Three.js on window | no | **yes** | in deps, tree-shaken out |

Three conclusions follow, and they are not negotiable:

**1. The page says one thing ten times.** The current `<h2>` list reads:

> "The whole signal, in one conversation." · "An interview that reads
> judgment — and the human signal underneath." · "A resume tells you where
> someone has been." · "One honest conversation tells you more than any
> resume." · "Three surfaces. One honest signal." · "Signal people can stand
> behind." · "See the skill, not the resume."

That is seven different ways to say *we look past the resume*. A visitor who
reads the first one learns nothing from the other six. Harvey's entire homepage
is four sections: what it is, who uses it, proof it worked, security.

**2. The headline says nothing.** "Defining the future with smart hiring" could
be pasted onto any HR startup on earth. Compare "Practice Made Perfect" — three
words, unmistakably about legal practice. A visitor must know what PlacedOn does
in five seconds. Right now they do not.

**3. Both references run a full-viewport WebGL hero.** Harvey renders a
1440x1206 webgl2 canvas; Scale renders 1440x900 and exposes THREE on window.
Both also serve ~70 real images from a CMS. Keep PlacedOn's `HeroAurora`
fragment shader — it is the same move, already built, and it is good. What
PlacedOn lacks is not motion; it is imagery and structure.

Their *UI* motion is still restrained CSS at ~150ms on four hand-tuned curves.
The split is: one ambient WebGL piece in the hero, plain CSS everywhere else.
Do not add Framer Motion or GSAP to components.

---

# WHAT TO BUILD

## Structure — cut 13 sections to 6

The homepage becomes, in order:

1. **Hero** — what PlacedOn is, in one sentence a hiring manager would say out
   loud. One primary action.
2. **The problem** — why hiring on resumes fails. Stated once. Never repeated.
3. **How it works** — three steps, shown not described. This is the only place
   the product mechanism is explained.
4. **Who uses it** — company logos, and a real quote from a real person if you
   have one. If you do not have one, build the slot and leave it out rather than
   inventing a testimonial.
5. **Trust** — LL144, EU AI Act, how scoring works, how to contest a result.
   This is a hiring product; this section is load-bearing, not boilerplate.
6. **Close** — one action, repeated from the hero.

Anything that does not fit these six is deleted from the homepage. Some of it
belongs on `/candidates`, `/companies`, or `/trust` instead. Move it there.
Target page height under 8,000px.

## Companies section — build this properly

The user specifically wants a companies/customers section. Do it the way Harvey
does, not the way most startups do:

- Logos in a single restrained row, grayscale or single-tone, no carousel unless
  there are genuinely more than eight.
- A heading that says what the logos mean, not just "Trusted by" — Harvey uses
  "The top legal teams use Harvey for", which frames the logos as evidence of
  *use case*, not just name recognition.
- **If PlacedOn has no customers yet, say so honestly rather than faking it.**
  "We're working with our first hiring teams now — talk to us" builds more trust
  than a wall of logos the company doesn't have. Fake logos are the single
  fastest way to lose an enterprise buyer.

## Copy — rewrite all of it

The current copy reads as machine-written. Specific tells to remove:

- Em-dash-heavy compound sentences that stack three ideas ("An interview that
  reads judgment — and the human signal underneath.")
- Abstract nouns doing the work of verbs ("signal", "surfaces", "judgment")
- Portentous fragments as headings ("Three surfaces. One honest signal.")

Rules:

- **Grade 7–9 reading level.** Check it.
- **Contractions.** "doesn't", "won't", "here's". Every time.
- Sentences under 20 words. Most under 12.
- One idea per sentence. One idea per section.
- Say the concrete thing. "22-minute conversation" beats "adaptive interview
  experience".
- Banned: revolutionary, cutting-edge, next-generation, world-class, unlock,
  leverage, synergy, empower, seamless, transform, elevate, journey.
- Also banned: "signal" as a noun where you mean "evidence" or "what they
  showed". It's used 7 times on the current page and it means nothing to a
  recruiter.

Rewrite examples, using the site's actual current copy:

| Now | Better |
|---|---|
| "Defining the future with smart hiring." | "See how someone actually works, before you hire them." |
| "One honest, adaptive conversation shows how a candidate actually thinks, decides and holds up under pressure — every trait traced back to something they said." | "A 22-minute conversation, then a report you can check line by line." |
| "Three surfaces. One honest signal." | Delete. It says nothing. |
| "Signal people can stand behind." | "You can see why we said it." |

Write like someone explaining their product to a friend who works in HR. Read
every sentence out loud. If you would not say it out loud, rewrite it.

## Design system

A token system already exists in `src/app/globals.css`. Keep the architecture
(primitives → semantic), keep the contrast ratios, and re-check every value
against these measured references:

- **Harvey's neutrals are warm, not grey**: `#fafaf9` ivory → `#0f0e0d` ink, and
  every step in between carries a warm bias. They never use `#fff` or `#000` as
  page surfaces.
- **Harvey's accents are nearly colourless.** Saturated colour appears only in
  semantic states (success/warning/error). Nothing decorative is saturated.
- **Harvey's spacing scale is fluid**, not just its type — six steps, each with a
  responsive range, section rhythm at 7–12.5rem.
- **Four easing curves, zero overshoot.** No bounce anywhere. Bounce reads as
  consumer software.
- **Radii stay small.** 16px maximum for normal UI.

Then apply the discipline that is currently missing:

- **One accent colour, ≤5% of any viewport.** Right now violet is everywhere, so
  nothing reads as an accent and the primary action does not stand out.
- **No glass, no backdrop-filter, no decorative gradients.** The current site has
  ten `backdrop-filter` instances. Remove them.
- **Typography carries the hierarchy**, not colour and not shadows.

## Motion

Keep the WebGL hero. Remove per-component animation libraries.

- Hover/focus/press: 150ms, ease-out, `transform` and `opacity` only.
- Scroll reveals: fade + 8px rise, 600ms, staggered 60ms. Nothing else.
- No parallax. No cursor-following. No floating cards. No ambient drift.
- The hero keeps its WebGL shader. One diagram may animate if it explains the
  product. Everything else is static.
- `prefers-reduced-motion` collapses durations at the token level, not per
  component.

## Features — preserve every one

Do not delete routes. The full set that must still work:

```
/ · /candidates · /companies · /contact · /demo · /start · /login · /trust/*
/candidate · /candidate/{applications,assistant,growth,matches,network,
  passport,preferences,profile,workshop,report/[id]}
/employer · /employer/{search,team,join,candidate/[id],jobs/new,
  jobs/[id]/{setup,matches,pipeline}}
/interview · /interview/consent · /pre-interview · /intros · /p/[handle]
/passport/verify · /api/demo-requests
```

If a feature's UI is confusing, redesign it. Do not remove it.

---

# ARCHITECTURE

- Next.js 16, App Router, React 19. **Read `node_modules/next/dist/docs/` before
  using any Next.js API** — this version differs from your training data.
- Server Components by default. `"use client"` only for state, effects, or
  browser APIs.
- No hardcoded colours, durations, or easings outside `globals.css`. A lint
  script exists at `scripts/token-lint.mjs` — keep it passing.
- Files under 400 lines. Components do one thing.
- Delete dead code as you find it (`HeroObject3D` and `GlobeLive` are already
  unimported).
- Data comes from `src/lib/v1.ts`. The `src/lib/mock/` directory is technical
  debt — do not add to it.

---

# DEFINITION OF DONE

Every one of these must be true. Verify, don't assume:

- [ ] `<h2>` count on the homepage ≤ 6, each making a distinct point
- [ ] Page height under 8,000px at 1440
- [ ] No sentence over 25 words; reading level Grade 7–9
- [ ] Zero `backdrop-filter` in `src/`
- [ ] No Framer Motion / GSAP in component code (the WebGL hero stays)
- [ ] `token-lint` exits 0
- [ ] `tsc --noEmit` clean, `pnpm build` clean
- [ ] All 40 routes return 200
- [ ] Screenshots at 320 / 768 / 1024 / 1440 with no horizontal overflow
- [ ] Keyboard-navigable; visible focus on every interactive element
- [ ] Contrast AA on all text, verified numerically not by eye
- [ ] `prefers-reduced-motion` produces a static, complete page
- [ ] Lighthouse: performance ≥ 90, accessibility 100

---

# HOW TO WORK

Work surface by surface. Homepage first, then `/candidates` and `/companies`,
then the candidate dashboard, then the employer dashboard.

For each surface:

1. Screenshot what exists now.
2. Write down what the page is for and what one decision the visitor makes.
3. Delete everything that does not serve that decision.
4. Rewrite the copy out loud.
5. Rebuild the layout on the token system.
6. Verify against the checklist above.
7. Move to the next surface.

After each surface, ask: *what would Harvey delete from this?* Then delete it.

Do not ask for approval between surfaces. Report what you did and keep going.
Stop and ask only if you would have to remove a feature to proceed.
