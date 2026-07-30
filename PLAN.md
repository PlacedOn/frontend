# Placedon UI/UX Overhaul — Benchmark Analysis + Feature Plan

Confidence note: scale.com and go-lifted.com/contingent-workforce-platform were analyzed from live
page structure (text/DOM/content, no rendered screenshots — browser tool was unavailable this
session). upwork.com is analyzed from general product knowledge, not a fresh fetch. Placedon's
prior analysis was copy-only for the same reason. Treat exact colors/pixel values below as
directional, not measured — re-run with Claude in Chrome connected for a pixel-accurate pass.

---

## 1. What each reference site actually does well (patterns to steal)

### Scale.com — "big, serious, minimal"
- **One accent, one voice.** Near-black base (`#000000` is literally the theme-color meta tag),
  everything else is neutral gray/white. Zero decorative color. All visual weight comes from
  scale/contrast/typography, not hue.
- **Video, not illustration.** The hero and closing CTA both use looping `.mp4` background video
  instead of static art or stock illustration — reads as "real system," not "marketing deck."
- **Kinetic word-list section.** A scroll-driven list (Artificial Intelligence → Research → Life
  Science → Medicine → Energy → ...) cycles through the breadth of what the product touches. This
  is a *motion* technique, not a color technique — it communicates range without adding visual
  noise.
- **Outcome-first proof tiles.** Every customer logo is paired with one sentence describing the
  *outcome*, not the relationship ("Reducing physician cognitive load by turning complex patient
  records into clinical intelligence" — not "Mayo Clinic uses Scale").
- **Numbers as texture.** "90% of the world's leading generative AI model builders," "10 years,"
  "25% have advanced degrees" — stat-driven, monospace-feeling proof blocks used like punctuation
  between sections.

### go-lifted.com — "screenshots as trust, not illustration as decoration"
- **Sticky lifecycle stepper**: Source → Classify → Onboard → Manage → Pay. This single component
  is reused as primary in-page navigation *and* the mental model for the whole product. A visitor
  always knows "where in the lifecycle am I looking right now."
- **Real product screenshots, not abstract shapes.** Every feature claim is backed by an actual UI
  screenshot (contract with a real signature, onboarding checklist with green checkmarks, invoice
  dashboard) — this is the single biggest trust lever on the page and the thing Placedon's
  homepage is currently missing entirely.
- **Alternating image/copy rhythm** (image-left-text-right, then flipped) keeps a long page from
  feeling like a wall of the same block repeated.
- **Workflow-engine diagram**: literally shows "Trigger: Talent applies to project → Action: Send
  documents" as a visual, not a sentence. Turns an abstract "automation" claim into something you
  can see running.
- **Case-study cards = one big stat + one quote + a real photo.** ("4 days average time-to-hire" /
  quote / photo of coworkers) — consistent card template repeated with different content, not
  reinvented per section.

### Upwork.com — "reduce the decision, show the trust badge"
- **Category grid with icon + label** as the primary navigation into a huge catalog — lets a
  visitor self-select in one click instead of reading paragraphs.
- **Trust badges baked into the object itself**: "Top Rated," "Payment Verified," job-success
  score sit directly on the profile/job card, not on a separate "trust" page.
- **Skill tags as pills** — scannable, filterable, and doubles as the visual vocabulary used
  everywhere (profile, job post, search filters) so the UI never introduces a new pattern for the
  same concept.
- **Progressive onboarding with a visible progress bar** (skills → rate → portfolio → payment) —
  breaks a long form into a sequence with constant "how much is left" feedback.
- **Escrow/milestone flow made visible**, not just described — money and status are shown as a
  live ledger, which is exactly the "trust the number" problem Placedon's scoring page is trying
  to solve with words instead of a widget.

---

## 2. Where Placedon is losing people today

1. **No real product screenshots anywhere on the public site.** The homepage describes an
   interview, a "Trust Passport," and an employer view entirely in prose and small illustrative
   snippets — there is no actual rendered UI to look at. Every competitor above leads with real
   screens. This is very likely a large part of the "feels AI-generated" impression: text-heavy
   marketing pages with no product truth underneath read as generic regardless of copy quality.
2. **Jargon introduced without a safety net.** "Trust Passport," "HCV/trait," "confidence band,"
   "evidence-linked" are all precise and defensible concepts — but nothing on the page lets a
   confused visitor tap a "?" and get a one-line plain-language definition inline. Right now the
   trust/scoring subpage is the *only* place any of this is explained, and a visitor has to
   already trust the homepage enough to click through to it.
3. **No visual system for "where am I in the process."** Both audiences (candidate, employer) are
   told the 4-step process in text ("Talk once / See the real strengths / Match to any role /
   Fair and easy to defend") but there's no persistent, reusable stepper component like go-lifted's
   Source→Classify→Onboard→Manage→Pay bar that a candidate can see progress against once they're
   actually inside the product.
4. **The confidence-band idea — the strongest, most differentiated concept on the whole site — is
   explained only in words** ("A trait shown as 82 with a tight band means..."). This is exactly
   the kind of concept that needs to be a live, draggable, visual component, the way Upwork makes
   escrow a visible ledger rather than a paragraph.
5. **Two audiences, one undifferentiated visual language.** "I want to hire" and "I'm looking for
   work" are both first-class CTAs, but everything after that click still uses the same palette,
   iconography and card style — nothing signals "you're now in candidate-land" vs "you're now in
   employer-land." That flattening is a common source of a color/UI feeling "mismatched" — it's
   not that the hues clash, it's that one palette is being asked to do two jobs with no semantic
   rule for when to use what.
6. **Icon/illustration inconsistency risk.** Several homepage stat-chips ("9 never used," "1
   quote/trait," "0 resumes") are strong copy but weak as *visual* objects — they read as text
   with a number bolted on, not as a designed component with a consistent icon language. This is
   the other classic "feels AI-generated" tell: icons that look pulled from different sets/weights
   with no single stroke width, corner radius, or fill rule.

---

## 3. Concrete features to build

### A. Design system fixes (do this first — it's the root cause, not a symptom)
- **One token file.** Define `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`,
  `--color-accent` (single accent, used only for interactive/primary elements — never decorative),
  `--color-success`, `--color-warning`, `--color-danger`, plus a 5–7 step neutral gray scale. No
  color is allowed on the page that isn't one of these tokens.
- **One icon set, one stroke width, one corner radius.** Pick a single icon library (e.g.
  lucide-react) and ban mixing in any other icon source. This single rule fixes most of the
  "looks AI-generated" feeling on its own.
- **One accent-per-audience rule**, not one-accent-for-everything: base palette stays identical,
  but candidate-facing surfaces use accent A, employer-facing surfaces use accent B, both drawn
  from the same token system so it reads as "one product, two modes" rather than two different
  sites.

### B. New homepage/product features
1. **Live scoring widget** — an interactive component (drag a fake transcript excerpt, watch a
   trait score + confidence band render in real time). Turns the site's best idea from a paragraph
   into something you play with in 10 seconds.
2. **Candidate journey stepper** — persistent 4–5 step bar (Apply → Interview → Trust Passport →
   Matched → Hired) reused identically on marketing pages and inside the real product, so the
   mental model never resets.
3. **Real screenshots / short product-tour video** replacing the current abstract quote-card
   mockups — even 3 honest screenshots of the actual interview UI and dashboard will out-perform
   perfect copy.
4. **Inline glossary tooltips** — every jargon term (Trust Passport, confidence band, HCV) gets a
   small "?" that opens a one-sentence plain-language explanation without leaving the page.
5. **Rotating-role kinetic strip** (Scale-style) — a scroll-triggered list of role types Placedon
   already interviews for (Backend engineer, Product designer, Data engineer, Applied AI, ...)
   cycling as a motion element instead of a static list of 4 buttons.
6. **Trust badges on the object itself** — a candidate's Trust Passport card shows "Verified
   company," "Contested & resolved," "88% match" directly on the card (Upwork pattern), not on a
   separate trust page.

---

## 4. How this gets built: Claude Code multi-agent system

See the accompanying `.claude/` folder — it wires up a `/loop` command plus five sub-agents:

| Agent | Responsibility |
|---|---|
| `planner` | Breaks this plan into a prioritized, dependency-ordered task backlog |
| `ui-designer` | Implements design-system tokens + components + pages (frontend) |
| `ml-engineer` | Builds/wires anything ML/LLM-backed (scoring widget backend, trait matching) |
| `qa-tester` | Writes/runs tests, visual checks, and flags regressions before merge |
| `code-reviewer` | Reviews diffs for quality, consistency with design tokens, and scope creep |

Running `/loop` repeatedly cycles: **plan → build → test → review → fix → repeat** until the
backlog is empty or a max-iteration cap is hit, so you can leave it running unattended for a work
session and check back in.

See `KICKOFF_PROMPT.md` for the exact message to paste into Claude Code to start.
