# Placedon — Design Direction ("Paper")

A reset of the visual system toward calm, typographic, enterprise-grade clarity.
Inspired by the *principles* behind Harvey and Scale — not their look.

## Problems with the current system ("Frost Luxe")
- **Decoration over meaning.** A blue-porcelain gradient ground, ~12 aurora/marquee
  background components, 26px glassmorphism on every surface, violet gradient +
  shimmer headlines, colored-circle icon tiles. It reads "AI template," not "trusted product."
- **Motion for its own sake.** Magnetic buttons, shimmering text, floating orbs — none
  of it helps a visitor understand what we do.
- **Copy sounds generated.** Marquees of buzzwords, fictional testimonials, gimmick stats.
- **Weak hierarchy.** Everything glows equally, so nothing leads.

## Principles (extracted, not copied)
1. **Typography is the design.** Scale contrast and spacing carry hierarchy — not color or effects.
2. **Whitespace is a feature.** Generous, deliberate; let the page breathe.
3. **Flat, honest surfaces.** Paper + hairline borders + barely-there shadow. No glass, no gradients.
4. **One restrained accent.** The brand violet, solid, used in a handful of places — never as a wash.
5. **Calm motion only.** A quiet fade/rise on entrance. Nothing magnetic, nothing shimmering.
6. **Icons earn their place.** No decorative colored-circle icons. Monochrome, and only where they aid scanning.
7. **Copy sounds human.** Short, plain, confident. Grade 7–9. No buzzwords.
8. **The product is the hero.** No fake dashboards, no meaningless illustration.

## Token changes (single source of truth: `globals.css`)
- **Surfaces** → warm paper: `--porcelain #FBFAF9`, raised `#FFFFFF`, muted `#F1F0EC` (blue removed).
- **Ink** → warm near-black neutrals: `#191917 / #56554E / #8B8A80`.
- **Accent** → brand violet demoted to a solid mark; no gradient text, no shimmer.
- **`.glass`** → flat white + hairline + tiny shadow; backdrop-blur removed (de-glasses the whole app).
- **Shadows** → softened to near-flat.
- **Radius** → tighter/enterprise: card 14px, button 10px (was 24/14).
- **Body** → flat paper (three radial gradients removed).
- **`.grad-iris` / `.grad-iris-shimmer`** → solid ink (retired).

Because these are token *values* and shared utilities, every surface in the app calms down
at once — no per-file repaint needed for the foundation.

## Primitives
- **Button** → flat: solid ink primary / hairline secondary. Magnetic motion and glass sheen removed.
- **IconTile** → monochrome ink only (colored `green`/`amber`/`iris` tiles retired).

## Landing IA (rebuilt, copy rewritten)
Nav → **Hero** (one clear promise, two actions, no background art) → **How it works** (3 plain steps)
→ **For candidates / For teams** (dual path) → **Trust** (LL144 / EU-AI-Act — real) → **FAQ** → **CTA** → Footer.
Removed: aurora background, kinetic marquee, fictional testimonials, placeholder company wall,
globe, gimmick stat accordion.

## Scope of this pass
Foundation (tokens + primitives) + the full landing page, production-quality and shipped.
Dashboard-internal surfaces inherit the calmer foundation immediately; each gets a dedicated
follow-up pass (candidate, employer, interview) in subsequent PRs.
