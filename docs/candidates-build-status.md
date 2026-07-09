# `/candidates` — Build Status & Loop Tracker

**Route:** `/candidates` · **Style:** Frost Luxe (glass on porcelain, iris `#6922F5`)
**Modeled on:** remotestar.io/candidates (structure) · executed in our design system
**Built:** 2026-07-10 · **Status:** ✅ shipped (Phase A, frontend-only, no infra needed)

Verified: `tsc --noEmit` clean · `pnpm build` clean (prerendered static) · no
mobile overflow (375px: body & doc both 375) · all interactions fire · no runtime
console errors (only dev-only CSP `eval()` note).

---

## 1. Sections built (12/12)

| # | Section | Component | Interactive | Status |
|---|---------|-----------|-------------|--------|
| 1 | Hero | `CandidatesHero` | dual CTA, magnetic buttons | ✅ |
| 2 | Trust strip | inline `TrustStrip` | — | ✅ |
| 3 | The invisible problem | `ApplicationInbox` | **tabs** (All/Auto-rejected/No reply) | ✅ |
| 4 | Résumés vs proven | inline `ResumesVsProven` | — | ✅ |
| 5 | Sample Trust Passport | `SampleScorecard` | **per-trait visibility toggle**, animated bars | ✅ |
| 6 | Your 4 steps | `JourneySteps` | **accordion**, step 3 highlighted (our edge) | ✅ |
| 7 | Roles that fit | `RoleMatchCarousel` | **carousel** (prev/next/dots), match% + reason | ✅ |
| 8 | You're in control | inline `InControl` | — | ✅ |
| 9 | Proof | reused `Testimonials` | hover-lift | ✅ |
| 10 | FAQ | `CandidatesFaq` | **accordion** (6 Qs) | ✅ |
| 11 | Final CTA | inline `FinalCta` | working CTAs → `/pre-interview`, `#sample` | ✅ |

> (Recruiter-stat cards from the spec were folded into §3's stat list to avoid a
> repetitive third stat block — tighter narrative, same gut-punch.)

**Nav wired:** "For candidates" → `/candidates` (was `#candidates`).

---

## 2. What works (tested)

- ✅ **No dead buttons.** Every CTA routes: hero + final → `/pre-interview` and `#sample`; nav/footer intact.
- ✅ **Inbox tabs** filter rows (All 148 / Auto-rejected 92 / No reply 56).
- ✅ **Scorecard toggles** hide/show each trait's evidence (the differentiator: candidate control).
- ✅ **Journey accordion** expands; step 3 "Approve what employers see" visually highlighted.
- ✅ **Match carousel** cycles roles with prev/next/dots, shows `%` + "matched on: …" reason.
- ✅ **FAQ accordion** expands.
- ✅ **Responsive:** no horizontal overflow at 375; desktop 1440 clean. (Fixed: carousel flex child needed `min-w-0`.)
- ✅ **Reduced-motion:** every custom component gates `initial` on `useReducedMotion`.
- ✅ **A11y:** `aria-pressed`/`aria-expanded`/`aria-label` on all controls; focus-visible from global tokens; semantic `<section>`/`<h2>`.

---

## 3. Known issues (low priority, non-blocking)

| Sev | Issue | Detail | Fix path |
|-----|-------|--------|----------|
| LOW | Motion hydration warning (dev-only) | For `prefers-reduced-motion` clients only, `initial={reduce ? false : …}` differs SSR vs client → React logs a mismatch that self-heals on next paint. Site-wide existing convention, not `/candidates`-specific. Invisible to users; absent for normal clients. | Add `<MotionConfig reducedMotion="user">` at root layout and drop the `reduce ? false` branches (site-wide refactor — deliberate, later). |
| LOW | `eval()` CSP note (dev-only) | React dev build wants `unsafe-eval`; our CSP omits it. **Production is unaffected** (React never uses eval in prod). | None needed. |
| FLAG | Testimonials not labeled "sample" | Reused homepage `Testimonials` has named quotes (Dana Okafor, etc.) not marked as illustrative. Pre-existing on the homepage too. | Per honesty rule: label as samples OR swap for real quotes when we have them. Shared component — decide once for whole site. |

---

## 4. Not working / not yet wired (needs infra or later phase)

- ⛔ **Live data** — scorecard (§5) and match cards (§7) use realistic sample data. They reuse the `DemoHcvResponse` / `DemoMatch` shapes, so they flip to live with **zero UI change** once the backend is deployed (Upstash + Render — see `API-plan-v1.md`).
- ⛔ **Email signup / magic link** — the final CTA routes to `/pre-interview` (works today). Passwordless email registration is **Phase C** (Supabase Auth, see `entry-registration-plan.md`); shipping a non-functional email box would be a dead control, so it's intentionally deferred.
- ⛔ **Real testimonials / numbers / press** — none invented. Compliance strip (§2) states real posture (LL144 / EU AI Act / bias-audited).

---

## 5. Next features (in priority order)

1. ~~**`/companies`** — employer mirror.~~ ✅ **DONE** (see §7).
2. **Flip live** — deploy backend (Upstash `REDIS_URL` + Render); set `NEXT_PUBLIC_API_BASE_URL`. Scorecard, candidate matches, employer feed go real. *Needs your 20-min infra step.*
3. **Email magic-link entry** — `/candidate/signup` + `/company/signup` (Supabase Auth), then wire the final CTA email field. *Phase C.*
4. **Shareable public Trust Passport** — a candidate-approved public evidence page. *Phase D.*
5. **Label or replace testimonials** — resolve the honesty flag site-wide.
6. **`MotionConfig reducedMotion="user"`** — remove the hydration warning across the site.

---

## 7. `/companies` — employer mirror (Step 1 of the loop) ✅

**Route:** `/companies` · same Frost Luxe system, employer-worded. Positioning:
**"Hire on evidence, not résumés."** North-star kept: *you see approved signal,
never the raw transcript.*

| # | Section | Component | Interactive |
|---|---------|-----------|-------------|
| 1 | Hero | `CompaniesHero` | Book-a-demo (opens dialog) + See-dashboard; sample matched-candidate strip |
| 2 | Trust strip | inline | — |
| 3 | The triage problem | `ResumeTriage` | résumé-pile mockup ("312 · unread"), "300 / 20s / 1" stats |
| 4 | **What you see / never see** | `EvidencePanel` | approved evidence vs **sealed blurred transcript** (the B2B moat) |
| 5 | How it works for teams | `TeamJourneySteps` | accordion, step 3 "Review approved evidence" highlighted |
| 6 | Your shortlist | `CandidateMatchCarousel` | carousel, candidate %match + "why they fit" |
| 7 | Fast to hire, safe to defend | inline `ComplianceBlock` | 3 cards → `/trust#…` |
| 8 | Proof | reused `Testimonials` | — |
| 9 | FAQ | `CompaniesFaq` | accordion (6 employer Qs) |
| 10 | Final CTA | inline `FinalCta` | → `/demo`, `/employer` |

**Verified:** `tsc` clean · `pnpm build` clean (static) · no overflow at 375
(fixed hero grid: `min-w-0` on both columns + truncate name line) · all
interactions fire · no runtime errors. Evidence panel confirmed rendering
(approved traits + sealed transcript). **Nav + Footer "For teams" → `/companies`.**

Files added:
```
src/app/companies/page.tsx
src/components/companies/{CompaniesHero,ResumeTriage,EvidencePanel,TeamJourneySteps,CandidateMatchCarousel,CompaniesFaq}.tsx
```
Edited: `Nav.tsx` + `Footer.tsx` ("For teams" → `/companies`, "For candidates" → `/candidates`).

### Loop status
- ✅ **Step 1 — `/companies`** (frontend-only): DONE, deployed.
- ⛔ **Step 2 — backend live** (Upstash + Render): blocked on your infra step (~20 min). Recipe in `API-plan-v1.md` / `DEPLOY-backend.md`.
- ⛔ **Step 3 — email magic-link signup** (Supabase Auth): Phase C, plan in `entry-registration-plan.md`.

---

## 6. Files added

```
src/app/candidates/page.tsx                     (composition + 4 inline static sections)
src/components/candidates/CandidatesHero.tsx
src/components/candidates/ApplicationInbox.tsx
src/components/candidates/SampleScorecard.tsx
src/components/candidates/JourneySteps.tsx
src/components/candidates/RoleMatchCarousel.tsx
src/components/candidates/CandidatesFaq.tsx
```
Edited: `src/components/sections/Nav.tsx` ("For candidates" → `/candidates`).
```
```
