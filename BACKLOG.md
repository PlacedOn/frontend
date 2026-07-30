# Backlog

Scope of this run: **design tokens only** (`/loop 2 design tokens only`). This is a narrow proving
run for the planner → ui-designer → qa-tester → code-reviewer round-trip, not the full plan.
Everything below was verified by reading `src/`, not inferred from PLAN.md / FRONTEND_PLAN.md —
several token tasks those documents imply are already done and are recorded under **Done** so the
loop does not re-schedule them.

Stack fact all owners must respect: Next.js 16.2.10 / React 19.2.4 / Tailwind v4 / `motion` v12 /
lucide-react v1.23. Import motion as `from "motion/react"`. No Vite, no framer-motion.

---

## In Progress

_(none — loop has not started)_

## Needs QA

_(none)_

## Ready for Review

- [ ] **TOK-02** — Apply the audience scope at the three entry points that already know the audience. (owner: ui-designer) — depends on: TOK-01 ✅ **UNBLOCKED 2026-07-30** — TOK-01 approved on `53b53b6`; the token layer is settled and inert. **Do not touch any `--v-*` value or the `[data-audience]` blocks; TOK-02 only sets the attribute.**
  — **DoD:**
  1. `data-audience` is set in exactly three places, all of which already carry the distinction: `src/components/dashboard/DashboardShell.tsx` (has `role: DashboardRole`, consumed by `src/app/candidate/layout.tsx` and `src/app/employer/layout.tsx`), `src/app/candidates/page.tsx`, `src/app/companies/page.tsx`.
  2. ~~Mechanical check (qa-tester): computed `color` of a `var(--iris-ink)` element on `/candidate` ≠ on `/employer`, and both resolved values are members of the ramp set in `scripts/color-lint.mjs:18-22`.~~ **AMENDED 2026-07-30 by code-reviewer — see clause 2′.**
  2′. **(replaces clause 2)** Mechanical check (qa-tester), **three parts, all required**:
      **(a) Inequality + membership** — as before: computed `color` of a `var(--iris-ink)` element on `/candidate` ≠ on `/employer`, both members of `scripts/color-lint.mjs:18-22`.
      **(b) Adjacency — the part that was missing.** Employer's resolved `--accent-ink` must be the ramp step **immediately** below employer's resolved `--accent`, exactly as candidate's is (`v-600` → `v-700`). Today that is `v-700` → `v-800`.
      **(c) Paired-state parity.** Employer's Button rest→hover ΔL\* must be within **±25%** of candidate's. Today: candidate **8.19**, employer **8.04**, ratio **0.98**.
      *Why this amendment exists:* clause 2 as originally written is a **mechanism** test with no **fitness** test, and it is what produced this task's only real defect. `--v-900` satisfied it perfectly — v-900 ≠ v-700 and v-900 is in `RAMP_HEX` — while making employer's hover **2.39×** candidate's, and the entry at `TOK-01` even records that v-900 was chosen *"because that is what makes TOK-02's `--iris-ink` inequality check pass."* **The DoD steered the defect.** Clauses (b) and (c) each reject v-900 on their own, and (b) needs no colorimetry.
  3. `/` and `/trust/*` are unchanged — computed accent there still equals `--v-600`.
  4. `node scripts/color-lint.mjs` exits 0; `pnpm build` succeeds **with zero warnings** — not merely exit 0. (Cycle 3 of TOK-01 lost a round to a "clean build" that still emitted two CSS warnings, and TOK-03's whole DoD is reading build output.)
  5. No `.tsx` file gains a hex value.
  6. **NEW — the register-blind inventory is recorded, not silently left behind.** The scope reaches only alias-layer reads (`--accent*` / `--iris*`, 785 occurrences). **45 sites across 18 files read the ramp layer directly** — 25 `var(--v-NNN)` and 20 hardcoded on-ramp hexes — and will **not** switch. `color-lint` permits them because it enforces ramp membership, not token indirection, so nothing in the toolchain will ever flag them. Two are inside this task's own entry points: `src/app/candidates/page.tsx:132` and `src/app/companies/page.tsx:91` both paint their hero gradient from `var(--v-400)`/`var(--v-500)` and will look **identical** on both audiences after this lands. `src/components/employer/skillIcons.ts:51` hardcodes `#5E1EDC` — *candidate's* accent — inside the employer product. **TOK-02 does not have to fix these** — that is a separate follow-up for `planner` ("re-point ramp-layer reads onto the alias layer, or document each as deliberately register-blind") — but it must (i) enumerate them in its completion note and (ii) not claim "employer surfaces read one step deeper" without the exception list, because that claim is measurably false for those 45 sites.
  — **Self-report (ui-designer, 2026-07-30):** the three entry points now set `data-audience`; the TOK-01 scopes are live. **No `--v-*` value and no `[data-audience]` block was touched** — `git diff --stat` is three `.tsx` files, `globals.css` untouched.
  - **What changed.** Each entry point wraps its subtree in `<div data-audience=… className="contents">`. `display: contents` is deliberate: the wrapper generates **no box**, so it cannot become a containing block for the fixed-position chrome each of these three surfaces owns (`AuroraMesh`, `BeamsField`, `PlasmaVeil`) — the stacking-context trap this repo has already been bitten by. Custom properties still inherit through it; verified in a real browser, `scopeDisplay: "contents"` with the tokens switching. `DashboardShell.tsx` passes `role` straight through (`DashboardRole` is already the literal union `"candidate" | "employer"`, i.e. exactly the two scope keys), so `/candidate/**` and `/employer/**` inherit from their layouts. `/candidates` → `candidate` and `/companies` → `employer` follow each page's primary CTA ("Take your interview, free" vs "Book a demo").
  - **How to verify visually.** `/companies` and every `/employer/**` page: primary Button rest is now `#4914AF` (was `#5E1EDC`) and its hover `#340F82`; chips/ghosts deepen `--v-50`→`--v-100`, hairlines `--v-200`→`--v-300`. `/candidates`, `/candidate/**`, `/` and `/trust/*` must look **exactly** as before.
  - **Observed output, all re-run from a clean tree (`rm -rf ./.next`), not reported from memory:**
    - `node scripts/color-lint.mjs` → `color-lint: clean — 298 files, every violet on the ramp`, exit **0**.
    - `pnpm build` → exit **0**, `✓ Compiled successfully in 7.6s`, 40 routes. `grep -inE "warn|deprecat|error"` over the whole build log matches **nothing** (grep exit 1). **Zero warnings**, per amended clause 4.
    - Built CSS `.next/static/chunks/2tidnouqx436i.css` ships both scopes and `.contents{display:contents}`.
    - Rendered markup: `/candidates` → 1× `data-audience="candidate"`, `/companies` → 1× `"employer"`, `/candidate` → 1× `"candidate"`, `/employer` → 1× `"employer"`; `/`, `/trust`, `/trust/{scoring,contest,ll144,eu-ai-act,model-health}`, `/jobs`, `/demo`, `/contact`, `/pre-interview`, `/passport/verify` → **0** occurrences.
  - **Clause 2′, measured — not asserted.** Real computed values, headless Chromium against `pnpm start`:
    - **(a) Inequality + membership.** `var(--iris-ink)` element: `/candidate` + `/candidates` → `rgb(73, 20, 175)` = `#4914AF`; `/employer` + `/companies` → `rgb(52, 15, 130)` = `#340F82`. Unequal; both in `RAMP_HEX` (`scripts/color-lint.mjs:18-22`) as `--v-700` and `--v-800`.
    - **(b) Adjacency.** Employer `--accent` resolves `#4914af` (`--v-700`), `--accent-ink` `#340f82` (`--v-800`) — the step **immediately** below, with nothing between them on the ramp. Candidate: `#5e1edc` (`--v-600`) → `#4914af` (`--v-700`), same relationship. **Holds.**
    - **(c) Paired-state parity.** CIELAB L\* recomputed from the hexes (sRGB→linear→Y→L\*): v-600 **34.9522**, v-700 **26.7669**, v-800 **18.7272**. Button rest→hover ΔL\* = candidate **8.1852**, employer **8.0398**, ratio **0.9822** — inside ±25%. (For the record: `--v-900` L\* **7.1886** would have given employer **19.5783**, ratio **2.3919**.) Confirmed by paint, not just arithmetic: the primary Button (`bg-[var(--accent)]` → `hover:bg-[var(--accent-ink)]`) measures rest `rgb(94,30,220)` → hover `rgb(73,20,175)` on `/candidates`, and rest `rgb(73,20,175)` → hover `rgb(52,15,130)` on `/companies`.
  - **Clause 3.** `/`, `/trust`, `/trust/scoring` carry no `[data-audience]` ancestor; computed `--accent` on each is `#5e1edc` = `--v-600`, `--accent-ink` `#4914af`. Unchanged.
  - **Clause 5.** No `.tsx` file gained a hex: `git diff -U0 | grep '^+' | grep -E '#[0-9a-fA-F]{3,8}'` returns nothing (exit 1). The `#fff` at `candidates/page.tsx:145` and `companies/page.tsx:104` are pre-existing and untouched.
  - **Clause 6 — the register-blind inventory, enumerated. The claim "employer surfaces read one step deeper" is FALSE for all 45 sites below;** they read the ramp layer directly and render byte-identically on both audiences. Not fixed here — planner follow-up. **25 direct `var(--v-NNN)` reads:** `src/app/candidates/page.tsx:132` (×3: `--v-400`, `--v-500`, `--v-500`) · `src/app/companies/page.tsx:91` (×3: same) — *both inside this task's own scopes; the two CTA panels stay identical* · `src/components/brand/GradientSocialMenu.tsx:26` (×2), `:37`, `:48`, `:59` (×2) — *reached via `Footer`, so it is register-blind on `/candidates` and `/companies` alike* · `src/components/candidate/profile/public/PublicProfileShell.tsx:42`, `:206` · `src/components/candidate/TrustPassportCard.tsx:23`, `:24` · `src/components/employer/report/GithubInsight.tsx:24` (`var(--v-600)` — *candidate's accent, on `/employer/candidate/[id]`*) · `src/components/fit/FitCheckCard.tsx:24` (*rendered in both products — `candidate/LiveCandidateRecs` and `employer/matches/MatchList` — so it is identical in both by construction*) · `src/components/pre-interview/PreInterviewBody.tsx:68` (×2), `:389` · `src/components/pre-interview/VoiceTextMorph.tsx:36`, `:37` · `src/components/sections/GlobalReach.tsx:57` · `src/components/sections/SignalAccordion.tsx:25`. **20 hardcoded on-ramp hexes:** `src/components/background/HeroObject3D.tsx:53` · `src/components/brand/GradientSocialMenu.tsx:37`, `:48` · `src/components/candidate/growth/EdgeStrip.tsx:22` (×2) · `src/components/candidate/growth/SkillConstellation.tsx:28`, `:29` · `src/components/employer/CandidateAvatar.tsx:12` (×2 — *employer product*) · `src/components/employer/skillIcons.ts:51` (`#5E1EDC` — ***candidate's accent, hardcoded inside the employer product***) · `src/components/pre-interview/CalmField.tsx:56`, `:57` · `src/components/pre-interview/PreInterviewBody.tsx:389` · `src/components/sections/FeaturedSurfaces.tsx:56` (×2), `:98` · `src/components/sections/GlobalReach.tsx:84`, `:104` (×2) · `src/components/sections/SignalAccordion.tsx:25`. Totals re-derived independently: **25 + 20 = 45 across 18 distinct files**, matching TOK-01's handoff exactly.
  - **⚠️ NEW finding the DoD does not cover — a 4th leak class, and it is not a ramp-layer read.** Clause 6 says the scope "reaches only alias-layer reads." **It does not reach alias-layer reads that leave the subtree through a React portal.** `createPortal(children, document.body)` mounts outside `[data-audience]`, and custom properties inherit down the **DOM**, so portaled overlays resolve through `:root` — i.e. **the candidate register, inside the employer product**. Measured on `/employer`: a probe inside the scope gets `--iris: #4914af`, the same probe appended to `document.body` gets `--iris: #5e1edc`. **8 alias reads are affected today, all employer:** `src/components/employer/EmployerDashboard.tsx:209` (toast, `var(--iris)`), `:266`, `:272` (×2), `:277` (×2) (job dialog) and `src/app/employer/candidate/[id]/page.tsx:106` (×2) (intro dialog). Candidate-side portals (`src/components/candidate/CandidateMatches.tsx`, `src/components/workshop/{InstrumentRegister,OnboardingPeak}.tsx`) are latent, not visible, because the candidate register is byte-identical to `:root` today. **Not fixable inside this DoD** — clause 1 fixes the attribute at exactly three places, and the fix is either portaling into the scope element instead of `document.body`, or hoisting the attribute to `<html>` from a route-aware place. Handing to `planner` with the ramp-layer follow-up.
  — ✅ **QA PASS — 2026-07-30, on `f9ca51b`. All six amended DoD clauses verified independently from a clean tree; nothing below is taken from the self-report.** Two findings escalated to `code-reviewer` that are **outside** the DoD and that QA does **not** waive — see ⚠️ A and ⚠️ B at the end.

    | Clause | Verdict | Evidence |
    |---|---|---|
    | 1 — attribute at exactly 3 entry points | **PASS** | `grep -rn data-audience src/` → 3 sites that *set* it (`candidates/page.tsx:185`, `companies/page.tsx:143`, `DashboardShell.tsx:30`); the other 6 hits are `globals.css` selectors/comments. Prerendered HTML: `/candidates` 1×`candidate`, `/companies` 1×`employer`; `index/trust/trust-scoring/jobs/demo/contact/pre-interview/passport-verify` → **0**. Live scan of 17 routes: `n=1` on `/candidates /companies /candidate /candidate/matches /employer /employer/candidate/[id]`, `n=0` on the other 11. No nesting anywhere (`n` never exceeds 1). |
    | 2′(a) inequality + membership | **PASS** | `var(--iris-ink)` probe **painted**, prod build: `/candidate` + `/candidates` → `rgb(73,20,175)` `#4914af`; `/employer` + `/companies` → `rgb(52,15,130)` `#340f82`. Unequal. Both present in `RAMP_HEX` at `scripts/color-lint.mjs:18-22` (read the file: `…"#5E1EDC", "#4914AF", "#340F82",…`). |
    | 2′(b) adjacency | **PASS** | Full alias chain read per audience. candidate `accent v-600 #5e1edc → ink v-700 #4914af`; employer `accent v-700 #4914af → ink v-800 #340f82`. Nothing on the ramp lies between either pair, so **both** inks are the step immediately below their accent — the same relationship on both sides. |
    | 2′(c) paired-state parity | **PASS** | Real `<Button variant="primary">` paint with the pointer parked off-element first (my first run mismeasured because Playwright's mouse persists across `goto` — re-run with `mouse.move(1439,899)` before the rest read, then hover, then un-hover to confirm reversion). `/candidates` rest `#5e1edc` → hover `#4914af`, L\* 34.9542 → 26.7687, **ΔL\* 8.1855**. `/companies` rest `#4914af` → hover `#340f82`, L\* 26.7687 → 18.7286, **ΔL\* 8.0401**. **Ratio 0.9822**, inside ±25% (0.75–1.25). Own CIELAB transform (sRGB→linear→Y→L\*), matches the self-report to 4 dp. |
    | 3 — `/` and `/trust/*` unchanged | **PASS** | All 7 unscoped routes (`/`, `/trust`, `/trust/{scoring,contest,ll144,eu-ai-act,model-health}`) plus `/jobs /demo /contact /pre-interview`: `n=0` audience ancestors, `--accent` `#5e1edc` = v-600, `--accent-ink` `#4914af` = v-700, `--iris-ink` paints `#4914af`. Verified on both dev and the production build. |
    | 4 — clean build, **zero** warnings | **PASS** | Ran it myself, not on report: `rm -rf ./.next && pnpm build` from a clean tree (`git status --porcelain` empty). Exit **0**. `prebuild` → `color-lint: clean — 298 files, every violet on the ramp`. `✓ Compiled successfully in 7.3s`, TypeScript 9.8s, 40/40 static pages. `grep -inE "warn\|deprecat\|error\|Delim\|Unexpected"` over the whole 77-line log → **no match (exit 1)**. The `Delim` class that survived a claimed fix last cycle is genuinely gone. Built CSS `.next/static/chunks/2tidnouqx436i.css` carries `[data-audience=candidate]`, `[data-audience=employer]`, `.contents{display:contents}` and `#340f82`. |
    | 5 — no `.tsx` gains a hex | **PASS** | `git show f9ca51b -- '*.tsx' \| grep '^+' \| grep -E '#[0-9a-fA-F]{3,8}'` → no match (exit 1). The 7 hexes in the commit's added lines are all in `BACKLOG.md`. |
    | 6 — register-blind inventory accurate | **PASS** | **Re-derived from scratch, not checked against the list.** `grep -rnoE 'var\(--v-[0-9]+\)' src/ --exclude=globals.css` → **25** occurrences in 11 files. `grep -rnoiE '#(F3F2FF\|E3DFFF\|CBC1FF\|AB95FF\|8E64FF\|7336FF\|5E1EDC\|4914AF\|340F82\|1A0B3D\|6922F5)' src/ --exclude=globals.css` → **20** occurrences in 11 files. Union of the two file sets = **18** (4 files appear in both: `GradientSocialMenu`, `PreInterviewBody`, `GlobalReach`, `SignalAccordion`). **25 + 20 = 45 across 18 files — the count is exactly right, and so is every per-line multiplicity I checked.** Spot-checked **8** references by reading the lines: `candidates/page.tsx:132` and `companies/page.tsx:91` are byte-identical `linear-gradient(118deg, var(--v-400) 0%, var(--v-500) 46%, var(--v-500) 108%)`; `skillIcons.ts:51` is `"color": "#5E1EDC"`; `GithubInsight.tsx:24` is `HCL: "var(--v-600)"`; `CandidateAvatar.tsx:12` is `const SHIRT = ["#7336FF", …, "#8E64FF"]`; `FitCheckCard.tsx:24`, `TrustPassportCard.tsx:23`, `GradientSocialMenu.tsx:26` all say what is claimed. |
    — *Nit inherited from the amended clause-6 text, not the implementer's error:* clause 6 calls `candidates:132` / `companies:91` the **hero** gradient. Both are in `FinalCta()` — the bottom CTA panel, not the hero. The implementer's own note ("the two CTA panels stay identical") has it right.
    — **Regression sweep.** Fixed-position chrome measured on every scoped route at 1440/768/390: `/candidates` BeamsField `[0,0,1440×900]`, `/companies` PlasmaVeil `[0,0,1440×900]`, `/candidate` + `/employer` AuroraMesh `[0,0,1440×900]` — all exactly viewport, identical to unscoped `/`. No horizontal overflow at any width. Dashboard `aside` `[0,0,252×900]`, mobile `header [12,12,366×62]` / `nav [0,771,390×73]` all correct.
    — ✅ **The `display: contents` reasoning holds — verified, not accepted.** The wrapper returns `getClientRects().length === 0`, i.e. it generates no box at all, so it cannot be a containing block by construction. Independently I walked **every** ancestor of **every** `position: fixed` element on `/candidates`, `/companies`, `/candidate`, `/employer` looking for `transform` / `perspective` / `filter` / `backdrop-filter` / `will-change` / `contain` / `container-type`: **zero** containing-block ancestors on all four, identical to the unscoped `/` baseline. The stacking-context trap the implementer was avoiding is genuinely avoided.
    — ✅ **No accessibility-tree disturbance.** The wrapper carries `role=null` and no `aria-*`. Landmark order on `/candidates` and `/companies` is `header nav main footer` — same as `/`. Direct proof: took an aria snapshot, then unwrapped the div in the live DOM (spliced its children into its parent and removed it) and took a second snapshot — **byte-identical** on all three tested routes (`/candidates` 320 nodes, `/companies` 280, `/employer` 200). `display:contents` erasing semantics is a real hazard for elements with implicit roles (list/table/button); a plain `div` has none to lose, and this confirms it empirically rather than by argument.

    — ⚠️ **FINDING A (for `code-reviewer` — severity ruling, not QA's call): the portal leak is REAL, USER-VISIBLE TODAY, and reachable in two clicks on the employer's main dashboard.** The self-report disclosed it as a mechanism; I confirmed it as **paint**, on the production build, with a screenshot showing both registers on screen at once.
      - **The 8 claimed reads verify.** `EmployerDashboard.tsx:209` (`--iris` on the Undo pill), `:266` (`--iris-ink`), `:272` (`--iris-ghost` + `--iris-ink`), `:277` (`--iris-soft` + `--iris`), `app/employer/candidate/[id]/page.tsx:106` (`--iris-soft` + `--iris`). All sit inside `<Portal>` → `createPortal(children, document.body)`. Confirmed `document.querySelector('[role=dialog]').closest('[data-audience]')` → **null**; parent chain is `div < body < html`.
      - **What an employer actually sees.** On `/employer`, clicking **Add role** opens the dialog and its **Save role** button paints `linear-gradient(135deg, rgb(142,100,255), rgb(94,30,220))` = **v-400 → v-600, the candidate register** — while the **Add role** and **Post a role** buttons still on screen behind it, written from the *identical* token expression, paint `rgb(115,54,255) → rgb(73,20,175)` = v-500 → v-700, employer. Two buttons, one source expression, two different violets, simultaneously visible. Screenshot: `<scratchpad>/leak-sidebyside.png`. Also in that dialog: "Generate signals" is `#4914af` (should be employer ink `#340f82`) and the signal chips are `--iris-ghost` `#f3f2ff` v-50 (should be `#e3dfff` v-100).
      - Clicking **Pass on candidate** raises the Undo toast: the Undo pill paints `#5e1edc` — **candidate v-600 — at rect x=750 y=831, 63×34px, on screen.** On `/employer/candidate/[id]`, **Request intro** → **Send request** paints the same v-400→v-600 candidate gradient.
      - **The "latent only on candidate" claim verifies:** `/candidate/matches` probes `--iris #5e1edc` both in-scope and on `body` — identical, so its portals cannot leak while candidate === `:root`. Stronger than claimed, in fact: `workshop/InstrumentRegister.tsx` and `workshop/OnboardingPeak.tsx` (the two `OverlayPortal` consumers) have **zero** consumers anywhere in `src/` — they do not render at all today.
      - **The count of 8 is correct, and I tried to break it.** `EmployerDashboard.tsx:241` is a 9th alias read inside the portal (`focus:border-[var(--iris)]` on the three dialog inputs) — but it never paints: the same elements carry an inline `borderColor: "var(--glass-line-hi)"`, which wins. Measured a focused input: `rgb(220,220,220)`. So 8 *painting* reads is right.
      - **Attribution.** Not a pre-existing bug — before `f9ca51b` every register was `:root`, so there was one register and nothing to leak. This commit is what makes the employer product visibly mix two. It is also **not fixable under clause 1** ("exactly three places"). QA's read: this is a planner-level gap in the DoD, not an implementation defect, and the implementer found and disclosed it unprompted — but "outside the DoD" and "not visible" are different claims, and only the first one is true. **Recommendation (reviewer decides): approve TOK-02 and schedule the portal fix as the immediate next task, ahead of TOK-03** — hoisting `data-audience` to `<html>` from a route-aware place fixes all 8 at once and also closes the latent candidate-side class before candidate ever diverges from `:root`.

    — ⚠️ **FINDING B (for `code-reviewer`): `src/app/globals.css:214-216` now ships a false statement.** It reads *"Definition only — nothing sets `[data-audience]` yet, so every page still resolves through `:root` and renders byte-identically. The three entry points get wired separately."* As of this commit all three are wired and four route families no longer resolve through `:root`. This is the exact defect class that bounced TOK-01 through three review cycles ("a claim in the repo that is not true"). **QA is not waiving it, and QA is also not failing the task on it**, because the task instruction was explicit — *"Do not touch any `--v-*` value or the `[data-audience]` blocks"* — and that comment is the header of the `[data-audience]` block, so the implementer following the instruction and leaving it is defensible. It is a 3-line comment edit either way. Reviewer's call whether it lands here or as a planner follow-up.

    — **Verification environment, for reproduction:** production build served by `pnpm start` on `:3002` (all colour/paint/portal/a11y numbers above) plus a dev server on `:3001` for the first pass — the two agree exactly. Headless chromium via Playwright 1.62, viewport 1440×900 unless noted. Probe scripts kept in the session scratchpad: `qa-tok02.mjs` (route scan + alias chain), `qa-hover.mjs` (rest→hover ΔL\*), `qa-fixed.mjs` (fixed-position + containing-block ancestors), `qa-mobile.mjs` (390/768), `qa-portal.mjs` + `qa-portal2.mjs` (leak), `qa-a11y.mjs` (aria snapshot diff). **I deleted `./.next` and rebuilt, then restarted the dev server on :3001** — it is up again.

## Ready

- [ ] **TOK-03** — Collapse the two competing motion scales in `globals.css` into one by re-pointing the legacy names. (owner: ui-designer)
  — **DoD:**
  1. Verified problem: two independent scales ship today with *different* values — SYSTEM v1 `--dur-fast/normal/slow/reveal` = 150/240/400/600ms (globals.css:107) and legacy `--d-micro/std/sig` = 160/320/620ms (globals.css:165-167), plus two easing sets (`--ease-in-out-sys`/`--ease-in-sys`/`--ease-soft` at :109-111 vs `--ease-out`/`--ease-spring` at :168-169). Usage is inverted from intent: `--d-micro` 32 sites, `--d-std` 13, vs `--dur-fast` 2 and `--dur-normal`/`--dur-slow`/`--dur-reveal` 0.
  2. After the change, `--d-micro`, `--d-std`, `--d-sig`, `--ease-out`, `--ease-spring` contain **only** `var(--dur-*)` / `var(--ease-*)` references — grep for a bare `ms` or `cubic-bezier(` inside the legacy block returns nothing.
  3. Exactly one set of duration literals and one set of easing literals remains in `globals.css`.
  4. Zero `.tsx` files edited — the 45 existing `duration-[var(--d…)]` call sites keep working untouched. `git diff --stat` touches `globals.css` only.
  5. The `prefers-reduced-motion` block (globals.css:345-356) still neutralizes every duration token by name, including the re-pointed legacy ones.
  6. `pnpm build` succeeds.

- [ ] **TOK-04** — Give scores and stats one tabular-numeral mechanism instead of three. (owner: ui-designer)
  — **DoD:**
  1. Verified problem: 11 call sites use three different mechanisms — Tailwind `tabular-nums` class, inline `style={{ fontVariantNumeric: "tabular-nums" }}`, and `fontFamily: "var(--font-mono)"` layered on top (e.g. `src/components/employer/EmployerStats.tsx:53`, `src/components/fit/FitCheckCard.tsx:74`, `src/components/ui/CountUp.tsx:46`).
  2. `globals.css` gains one utility (e.g. `.num`) in the shared utility layer that sets `font-variant-numeric: tabular-nums` + `font-feature-settings` and nothing else — it must not set colour, size, or weight.
  3. All 11 existing sites use it; grep for `fontVariantNumeric` and the bare `tabular-nums` class in `src/` returns 0 outside `globals.css`.
  4. No visual regression: qa-tester confirms the score digits on `/employer` and `/candidate` render at the same size/weight/colour as before.
  5. `pnpm build` succeeds.

## Blocked

- [ ] **TOK-05** — Reconcile FRONTEND_PLAN §2.3 (spacing + radius) with the scale actually shipping — blocked by: **the plan contradicts the codebase and only a human can pick.** Flagging rather than silently accommodating, per planner.md.
  - *Spacing:* §2.3 mandates a fixed px scale `4/8/12/16/24/32/48/64/96`. `globals.css:22-27` ships a **fluid `clamp()`** scale (`--space-2xs … --space-xl`) with `--space-xl` documented as "THE section padding". These are not reconcilable — one is fixed, one is viewport-responsive. Separately, the shipped scale is barely adopted: **4 call sites total** across all of `src/`, so almost every padding/margin in the app is a raw Tailwind value bypassing tokens either way. Adopting §2.3 literally means discarding the fluid scale *and* rewriting hundreds of call sites — far beyond a design-token task and far beyond this proving run.
  - *Radius:* §2.3 mandates `6 / 12 / 20px`. `globals.css:114` ships `--r-sm/md/lg = 8/12/16px` and `globals.css:172-174` ships legacy `--r-card 24px / --r-btn 14px / --r-chip 999px`. So there are **six** radius values, not three. But usage is entirely on the legacy names (`--r-card` 178 sites, `--r-btn` 149, `--r-chip` 13) versus `--r-sm` 0, `--r-md` 1, `--r-lg` 0. Collapsing is a one-file re-point like TOK-03 — but only *after* someone decides whether the target is the plan's 6/12/20 or the shipped 8/12/16, and whether `--r-card`'s 24px look survives being re-pointed to 16px across 178 components. Recommendation: keep the shipped 8/12/16, treat `--r-chip: 999px` as a documented pill exception, and amend §2.3 — a 2px difference is not worth re-rendering 340 call sites.
  - Unblock by: a decision on each of the two bullets above, then this splits into TOK-05a (radius re-point, ~TOK-03 shape) and TOK-05b (spacing adoption, its own multi-task epic).

## Done

_Closed on verification, not completed by this loop — recorded here so the loop does not
re-schedule work that already shipped. A reviewer should confirm before trusting these._

- [x] **TOK-00a** — One violet ramp + build-time enforcement — verified 2026-07-30.
  `--v-50 … --v-900`, `--brand-mark`, `--ok/--warn/--bad` + `-bg` tints all exist at `src/app/globals.css:65-88`. `scripts/color-lint.mjs` derives every violet-ish value in `src/` from scratch and checks ramp membership; it is wired as `prebuild` in `package.json:10`, so an off-ramp violet fails the build. This is FRONTEND_PLAN §2.1 and build-order step 1, already done.
- [x] **TOK-00b** — Single icon source — verified 2026-07-30, **no migration needed.**
  `lucide-react` is the only icon dependency in `package.json`; there is no `react-icons`, `@heroicons`, `@tabler`, phosphor, or feather anywhere. 84 files import from `lucide-react`; the 43 components in `src/components/ui/icons/` are `motion/react` animation wrappers over lucide's own 24×24 geometry, not a second icon set. FRONTEND_PLAN build-order step 2 ("icon migration to lucide-react only") is closed. **Residual, deliberately not scheduled this run:** stroke width is *not* unified — 8 distinct values ship (`strokeWidth={2}` ×43, `{3}` ×9, `{1.75}` ×6, `{1}` ×3, `{1.5}` ×2, `{1.8}`, `{1.4}`, `{0.6}`) against §2.5's "one stroke width, 1.5". That is real and worth doing, but it touches ~65 call sites plus the `IconWrapper` default at `src/components/ui/icons/icon.tsx:213` — too large for a proving run. Schedule it first in the next cycle.
- [x] **TOK-00c** — Dark `#0B0C0E` / `#6C8CFF` / `#33D6C0` palette — **rejected, do not build** — recorded 2026-07-30.
  FRONTEND_PLAN §2.1 was rewritten to reject it explicitly. Ground stays light (`--paper #FFFFFF`), the brand violet is kept, and per-audience accents derive from the existing ramp. Any future task proposing that palette should be refused, not planned.
- [x] **TOK-01** — Per-audience accent tokens defined in `src/app/globals.css` — **APPROVED 2026-07-30** by code-reviewer on `53b53b6` (third review).
  Ships `--v-800: #340F82` — a *generated* ramp step, not the `--v-900` ground — plus `[data-audience="candidate"]` / `[data-audience="employer"]` scopes that redeclare the **entire** `--accent*`/`--iris*` alias chain; employer runs one step deeper (`700 / 800 / 100 / 500 / 300`). **Re-verified independently, from a clean tree, not on report:** `python3 scripts/ramp.py` reproduces all eight original steps byte-for-byte and emits `#340F82` (13.67:1 on white); my own CIELAB transform gives Button rest→hover ΔL\* **8.19** candidate / **8.04** employer (ratio **0.98**, was 2.39 under v-900); `rm -rf .next && pnpm build` → `Compiled successfully`, **zero** warnings of any kind; `node scripts/color-lint.mjs` → exit 0 (`clean — 298 files`); `data-audience` still has **zero** consumers in `src/`, so no page renders differently. **The value is settled — do not re-derive it.**
  — **Both cycle-3 blockers closed.** The tie-break prose was removed rather than corrected — three cycles produced three false sentences, all in prose, while the code was right from cycle 2 — and `globals.css:256-261` now points at `scripts/ramp.py`, which is **tracked** and carries the shipped parameters at `scripts/ramp.py:35`, so the deletion lost no information and left nothing that can go stale. Every number still in the block was recomputed and is true (`11.5`, `~8`, `19.6`, `8.2`, `2.4x`, `8.0`, `8.2`, and the `(0,1,0)` specificity claim). The `Delim` build warnings are genuinely gone, and the *class* is closed, not just the three instances: a repo-wide scan finds no other Tailwind-scannable arbitrary-value string containing a non-ident character in any tracked markdown.
  — **⚠️ Handoff finding for TOK-02 — not a TOK-01 defect.** The audience switch only reaches consumers that read the **alias** layer (`--accent*` / `--iris*`, 785 occurrences in `src/`). **45 sites across 18 files are register-blind by construction:** 25 direct `var(--v-NNN)` ramp-layer reads and 20 hardcoded on-ramp hexes, all of which `scripts/color-lint.mjs` legitimately permits because it enforces *ramp membership*, not *token indirection*. Two sit inside TOK-02's own entry points — `src/app/candidates/page.tsx:132` and `src/app/companies/page.tsx:91` each paint their hero gradient from `var(--v-400)`/`var(--v-500)` and will render **byte-identically** after the scope lands. `src/components/employer/skillIcons.ts:51` hardcodes `#5E1EDC`, *candidate's* accent, inside the employer product. TOK-02 DoD clause 2 cannot see any of this — see the amendment recorded on TOK-02.

  <details><summary>Three-cycle review history (all findings resolved — kept for provenance)</summary>


  — ❌ **CHANGES REQUESTED — 2026-07-30 (code-reviewer), on `fc09115`.**
  **My original objection is resolved. `#340F82` is right, ships, and is not to be re-derived
  again by anyone.** Two blocking defects remain, both one-line text edits, both of the same class
  this task has now been bounced for twice: *a claim in the repo that is not true.*

  **Verified independently — recomputed from scratch with my own colorimetry, not QA's numbers and
  not the implementer's script:**
  - `python3 scripts/ramp.py` runs and emits `#F3F2FF #E3DFFF #CBC1FF #AB95FF #8E64FF #7336FF
    #5E1EDC #4914AF` — **all eight shipped steps byte-for-byte** — then `--v-800: #340F82`,
    13.67 on white. The derivation is now executable and checkable. This was the right remediation.
  - L\* ladder, my own transform: 95.91 / 90.01 / 80.77 / 67.56 / 54.12 / 43.51 / 34.95 / 26.77 /
    **18.73** / 7.19. Dark-end taper **8.56 / 8.19 / 8.04**; v-900 sits **11.54** below v-800,
    **1.435×** the local step. `globals.css:76-80` and `:250` are now both true and now agree.
  - **The original objection, closed on two independent paired states, not one.** `Button.tsx:45`
    is the one I raised: rest→hover ΔL\* candidate **8.19** / employer **8.04** — ratio **0.98**,
    was 2.39. `active:` is `scale` only, so there is no second colour delta to check on Button.
    I then checked the pattern that actually dominates the token's ~253 call sites — ghost chip,
    `background: --iris-ghost; color: --iris-ink`: candidate `#4914AF` on `#F3F2FF` = **9.47:1**,
    employer `#340F82` on `#E3DFFF` = **10.58:1** (ratio 1.12; under v-900 it was 14.03, ratio
    1.48). Both paired states now read as one product in two modes — PLAN.md:108 holds.
  - Scope is clean: `git diff --stat ca9788b~1..HEAD` → `BACKLOG.md`, `scripts/color-lint.mjs`,
    `scripts/ramp.py`, `src/app/globals.css`. **Zero `.tsx`.** Working tree clean. `color-lint`
    exit 0 (`clean — 298 files`). Both `RAMP_HEX` and `RAMP_RGB` carry the step; the failure help
    text now lists `--v-800`.

  **BLOCKER 1 — `globals.css:259` prints a false number, and that number inverts the paragraph's
  own conclusion.** The comment reads `#340C82 (dL* 8.19)`. Measured, `#340C82` is L\* 18.386, so
  its rest→hover delta from v-700 is **8.38** — and `ramp800.py`, the script cited as that value's
  provenance, **prints `dL* 8.4` itself**. `8.19` is *candidate's* delta (v-600→v-700 = 8.186),
  transcribed off the wrong row. The damage is not cosmetic: `:259-261` then says `#340F82` was
  kept *"because … its delta sits closest to candidate's."* With `8.19` on the page, the **rejected**
  value is exactly candidate's and the shipped one is farther away — so the paragraph as written
  argues the reader should switch to `#340C82`, which is the precise "correction" the paragraph
  exists to prevent. With the true numbers the tie-break survives, narrowly: |8.04−8.19| = 0.146
  vs |8.38−8.19| = 0.197. **Fix: `globals.css:259`, `8.19` → `8.38`. Nothing else in that
  paragraph changes.** (Third instance in this task of a comment whose arithmetic refutes its own
  conclusion — and it is inside the sentence written to fix the first instance. The bar does not
  get lower because we are three cycles in.)

  **BLOCKER 2 — the `BACKLOG.md` escape does not work, and `fc09115`'s message says it does.**
  `rm -rf .next && pnpm build` from clean, just now: **still 2 warnings.** They did not go away —
  they changed identity, `Delim('*')` → `Delim('<')`:
  `.duration-\[var\(--d-\<name\>\)\] { --tw-duration: var(--d-<name>) }` … `^-- Unexpected token
  Delim('<')`. Tailwind v4 still lifts the string into a real generated class; `<` is no more a
  valid CSS ident character than `*` was. The fix I specified last cycle — `--d-…` with the
  ellipsis — works because U+2026 *is* a valid ident character; `<name>` was substituted for it and
  is not. Live at **`BACKLOG.md:288`, `:311`, `:329`**. **Fix: use `…`, or split the token across
  backticks so it is not a scannable candidate. Re-run a clean build and confirm zero warnings
  before handing back — do not assert it.**
  - **My previous build-warning ruling is hereby withdrawn, not reaffirmed.** It said "does not
    block" and rested *explicitly* on `BACKLOG.md` being untracked and invisible to CI. `git
    ls-files` now returns it. The warnings ship to every clone and every CI build, and TOK-03's
    entire DoD is "read the build output." It blocks now — and it would have blocked as a bare
    regression even without the false claim in the commit message.

  **Non-blocking, fold into the same edit:**
  - `globals.css:260` — *"its two-decimal chroma scalar matches the table above"*: there is no
    chroma table above it in `globals.css`. The scalar table (`.16 .34 .55 .78 .95 1.00 .92 .78
    .62`) lives in `scripts/ramp.py`. Point the reference at the file.
  - `globals.css:256` — *"disagree in the last digit"*: `0C` vs `0F` is the 4th of 6 hex digits.
  - Nothing keeps `scripts/ramp.py` in sync with the `--v-*` declarations; it can drift silently
    and would then "prove" a ramp we do not ship. Making the generator's output diff against
    `globals.css` in `prebuild` would turn the derivation from self-asserting into self-verifying.
    **New backlog item for `planner`, not part of TOK-01.**

  **Settled, will not be re-litigated on the next pass:** the value `#340F82`, the generation
  method, `scripts/ramp.py` landing in `scripts/`, both `color-lint` sets, the help text, the
  alias-chain repetition, the specificity argument, and the freeze property. Re-review is limited
  to `globals.css:259` (+ the two nits) and the three `BACKLOG.md` lines. **Next: `ui-designer`.**

  — ❌ **QA FAIL — 2026-07-30, re-implementation `ca9788b`.** First independent pass (the
  implementing agent was killed by a session limit and did no self-check, so nothing here was
  taken on report). **Every functional and numeric claim verifies. The failure is narrow and
  cheap: three sentences of shipped comment in `globals.css` state things that are not true.**
  That is the same defect class this task was bounced for last round — the reviewer wrote *"that
  sentence becomes false and must not be left in the file"* — so it does not get a pass this time
  either. **Do not change `#340F82`, do not touch any CSS value, do not re-derive the step.**
  Three comment edits and this is done.

  **What I verified independently (all PASS — recomputed from scratch, own colorimetry, not the
  implementer's script):**
  - The generation method is real. Fed the ramp's OKLab transform the brand hue
    (`#6922F5` → L 0.5096, C 0.2729, h −73.13°) and the step table, and it reproduces **all eight
    shipped steps byte-for-byte** — `#F3F2FF #E3DFFF #CBC1FF #AB95FF #8E64FF #7336FF #5E1EDC
    #4914AF`. Extending it with L 0.320 / chroma ×0.62 emits **`#340F82`** exactly. The method
    is sound and the shipped hex is what it produces.
  - CIE L\* ladder, measured: 50 **95.90** · 100 **90.01** · 200 **80.77** · 300 **67.56** ·
    400 **54.12** · 500 **43.51** · 600 **34.95** · 700 **26.77** · 800 **18.73** · 900 **7.19**.
    Dark-end deltas **8.56 / 8.19 / 8.04** for 500→600→700→800 — even, as claimed. v-900 sits
    **11.54** below v-800.
  - The actual defect is fixed. `src/components/ui/Button.tsx:45` confirmed as accent background →
    accent-ink on hover. Candidate rest→hover ΔL\* **8.19**; employer **8.04** (was **19.58**).
    The 2.4× asymmetry is gone and employer is now marginally *tighter* than candidate.
  - Contrast `#340F82` on `#FFFFFF` = **13.67 : 1** — AA and AAA. Against body ink `#12100E` =
    1.39, so it stays a violet, not a black.
  - `scripts/color-lint.mjs` carries the step in **both** sets — `RAMP_HEX` has `#340F82`,
    `RAMP_RGB` has `52,15,130`. Proven load-bearing rather than eyeballed: ran a copy of the
    linter in a scratch tree against a probe file containing `#340F82`, `rgb(52, 15, 130)` and
    `#340C82` — the first two pass, the near-miss is rejected with exit 1. `isViolet(52,15,130)`
    is true, so both entries are genuinely required.
  - `node scripts/color-lint.mjs` → **exit 0** (`clean — 298 files, every violet on the ramp`).
    `pnpm build` → **exit 0**.
  - Zero consumers. `data-audience` appears **only** in `globals.css` (6 hits, 2 of them the scope
    selectors); zero hits in any `.tsx`/`.ts`. No page renders differently.
  - `git show --stat ca9788b` → `scripts/color-lint.mjs | 4 ++--`, `src/app/globals.css | 27 ++++---`.
    Two files, zero `.tsx`, working tree clean.
  - **Freeze re-proven in the browser**, against the real production-built
    `.next/static/chunks/*.css` in headless chromium via `getComputedStyle`. Unscoped `:root` still
    resolves accent `#5e1edc` / accent-ink `#4914af` / all 8 tokens unchanged; the candidate scope
    is byte-identical to `:root`; the employer scope moves **all 8**; employer accent-ink and
    iris-ink both resolve `#340f82` and paint `rgb(52, 15, 130)`; accent ≠ ink so the hover
    survives. Built CSS contains `#340F82` and does **not** contain `#340C82`.
  - Employer's other tokens are untouched — diffed the whole scope block against `382a891`: only
    `--accent-ink` changed, the other seven are byte-identical, and the candidate block is
    byte-identical too. Alias chain still fully redeclared in both scopes (`--accent` is consumed
    inside a custom-property declaration at `globals.css:146` and `:148` only; both are redeclared
    at `:262`/`:264` and `:274`/`:276`). Nothing stranded.

  **FAIL 1 — `globals.css:253` asserts a provenance that the evidence contradicts.** The comment
  ships the sentence *"a hand-typed near-miss (#340C82 vs #340F82) is exactly the drift this ramp
  exists to stop."* `#340C82` was **not** hand-typed. The interrupted agent's generator is still on
  disk in the session scratchpad as `ramp800.py` (written 19:38, ~2h before the commit), and it
  *derives* `#340C82` from two explicitly stated rules — rule 1: continue the mean dark-end OKLab
  L step (`0.395 − 0.0765` → L 0.319); rule 2: hold chroma at the constant C/Cmax fraction measured
  on v-600 and v-700 (0.930 → cs 0.627). Running it prints `--v-800: #340C82`. So the file
  permanently accuses a principled derivation of being the exact sloppiness the ramp exists to
  prevent. **Fix: delete or restate that clause.** The honest version is that two derivations of
  the same rule disagree in the last step, and this one was chosen — not that someone typed a hex.
  Reproduce with: `python3 <scratchpad>/ramp800.py`.
  - *Neutral note for code-reviewer, explicitly not a QA decision:* the two derivations are both
    defensible and the reviewer may want to rule on which is "the ramp's own method." `ramp800.py`
    → L 0.319 / cs 0.627 → `#340C82`, ΔL\* 8.4. Shipped → L 0.320 / cs 0.62 → `#340F82`,
    ΔL\* 8.04. The shipped one is closer to candidate's 8.19 and its two-decimal chroma scalar
    matches the existing step table's own convention (`.16 .34 .55 .78 .95 1.00 .92 .78`), so I
    read it as the better of the two. **But its parameters exist nowhere executable** — only as
    prose in the commit message. `ramp.py` in the scratchpad stops at v-700 and has no 800 row, so
    nobody can re-derive `#340F82` without being told the two numbers first. Given the reviewer's
    "do not hand-pick a hex" instruction, the only durable proof is a recorded derivation. Worth
    landing the 800 row in a generator (or the numbers in the comment) so the next agent can check
    it instead of trusting it.

  **FAIL 2 — `globals.css:239` "No new hex, no new hue" is now false.** This diff adds a new hex
  (`--v-800: #340F82` at `:75`). The sentence was true in the previously-reviewed version, which
  used only pre-existing steps. It now sits four lines above `:243` "Employer's `--accent-ink` is
  v-800, **a step generated for this purpose**" — the block announces a new value and denies one in
  the same breath. **Fix: "no new hue" is still true; drop or qualify "no new hex."**

  **FAIL 3 — `globals.css:77-78` contains an argument that refutes itself, and contradicts
  `:248`.** It reads *"NOT a ramp step: at L\* 7.2 it sits 11 below 800, where the ramp's own
  interior spacing is 8-13."* Measured, the 800→900 gap is **11.54** — which is *inside* 8-13. As
  written the sentence cites a range that contains the value it is calling an outlier, so it argues
  the opposite of its conclusion. `:248` states the same fact correctly against the *local* dark-end
  spacing (*"11.5 L\* below v-800 where the interior spacing is ~8"*) — and 11.54 against the
  8.56/8.19/8.04 taper genuinely is a break. Two comments, one fact, incompatible bases. **Fix:
  make `:77-78` use the dark-end taper like `:248` does.** (For reference the true full-ramp
  interior range is 5.89–13.44, so "8-13" is itself approximate.)

  **Non-blocking observations, no action required for this task:**
  - `scripts/color-lint.mjs` role list printed on failure (the "Pick a ramp step by role instead"
    help text) still goes `--v-700 pressed · --v-900 dark ground` — `--v-800` is missing from the
    guidance a developer sees when the lint trips. One line, worth folding into the same edit.
  - `#340C82` now lives permanently in `src/app/globals.css:253` as a raw non-ramp violet literal.
    Harmless today only because the linter deliberately skips `globals.css` — but it is an off-ramp
    violet inside the one file the linter is blind to. Removing it falls out of FAIL 1 anyway.
  - **Correction to the reviewer's build-warning ruling: `BACKLOG.md` is now TRACKED**
    (`git ls-files` confirms; working tree clean). The ruling rested on it being untracked and
    therefore invisible to CI. That is no longer true — the 2 `Delim('*')` warnings from the
    literal Tailwind arbitrary-value string in TOK-03's DoD now ship to every clone and every CI
    build. Still not a TOK-01 defect; attribution re-confirmed from the build log (the warning
    context is the generated duration class, not `globals.css`). Raises the priority of the
    escape fix for **planner**.

  — ❌ **CHANGES REQUESTED — 2026-07-30 (code-reviewer).** The mechanism is right and the freeze
  property is real; **one value is wrong.** Everything else in this diff is approved as written —
  the alias-chain repetition, the source-order specificity argument, the comment block, and the
  candidate scope all stand. Do not rework them.

  **The defect: `globals.css:256` — employer `--accent-ink: var(--v-900)`. Replace with a real
  ramp step.**

  1. **`--v-900` is not the next step down; it is an outlier the ramp deliberately excludes.**
     The ramp is documented at `globals.css:41-45` as "evenly spaced in perceptual lightness."
     Measured L\*: v-100 90.0 → v-200 80.8 → v-300 67.6 → v-400 54.1 → v-500 43.5 → v-600 35.0 →
     v-700 26.8. Interior steps are 8-13 L\*. `--v-900` sits at L\* **7.2** — a **19.6** gap, about
     twice the largest interior step. The missing `800` in the name is the ramp telling you the
     step you want does not exist. `globals.css:73` names it a *ground*; `globals.css:237-239`
     reasons about it as if it were a step. Taking "the only step beneath it" is arithmetic on
     names, not on the perceptual scale the ramp is actually built from.
  2. **The real regression is the interaction delta, not static contrast.** QA is right that
     18.12:1 is not the risk. The risk is `src/components/ui/Button.tsx:45` —
     `bg-[var(--accent)] … hover:bg-[var(--accent-ink)]`. At `:root`/candidate that hover is
     v-600 → v-700, **ΔL\* 8.2**, a controlled deepen. Under `[data-audience="employer"]` it
     becomes v-700 → v-900, **ΔL\* 19.6** — 2.4× the perceptual magnitude of the identical
     interaction on candidate surfaces. The employer primary button will visibly black out on
     hover while the candidate one merely deepens. PLAN.md:108 asks for "one product, two modes";
     two modes whose primary button hovers at 2.4× different magnitudes read as two products.
  3. **At the sizes `--iris-ink` is actually used, L\* 7.2 stops reading as an accent.** ΔE76 ≈ 37
     against `--ink` is computed for large patches; chromatic discrimination collapses at low
     luminance and small subtense. The live call sites are 11-13px labels and chips —
     `src/components/employer/EmployerStats.tsx:49`, `src/components/employer/CopilotSearch.tsx:273`,
     `src/components/employer/HrCommandDeck.tsx:174` — plus the single most prominent accented
     number on the employer surface, the 26px extrabold match score at
     `src/components/employer/CopilotSearch.tsx:251`. All of those go from clearly-violet #4914AF
     to effectively-black. `--iris-ink` has 251 call sites, 65 of them under
     `src/components/employer/` + `src/app/employer/`, so this is not a corner case.

  **Do NOT take the "amend TOK-02's differ-check" option.** It looks like the cheap fix and it is
  a trap: dropping the constraint means employer `--accent-ink` collapses to `--accent` (v-700 ===
  v-700), which silently **kills** the `Button.tsx:45` primary hover and every
  `hover:text-[var(--iris-ink)]` affordance on employer surfaces
  (`CopilotSearch.tsx:108`, `:166`, `HrCommandDeck.tsx:194`). That trades a design-semantics
  problem for a functional one. The implementer's stated constraint — "ink must stay
  distinguishable from accent for pressed and hover" — is **correct and must be preserved.**

  **Do this instead: add the missing `--v-800` step to the ramp, then point employer ink at it.**
  - Generate it with the *same method that generated the ramp* — same OKLCH hue (h = -73.1deg),
    target **L\* ≈ 17** (midway between v-700's 26.8 and v-900's 7.2), chroma tapered consistently
    with the ramp's dark end. **Do not hand-pick a hex.** A hand-picked violet is precisely the
    failure mode `scripts/color-lint.mjs` exists to prevent; adding one by hand while extending the
    ramp would be the twenty-seventh violet.
  - Add it to `globals.css` in ramp order between `--v-700` (`:71`) and `--v-900` (`:74`), and
    extend the `globals.css:41-64` ramp comment's role list so `800` has a documented role
    ("deepest accent ink" / pressed on light) — same discipline as every other step.
  - Add the new value to **both** hardcoded sets in `scripts/color-lint.mjs` — `RAMP_HEX`
    (`:18-22`) *and* `RAMP_RGB` (`:23-26`). Missing either fails `prebuild`.
  - Set `globals.css:256` → `--accent-ink: var(--v-800);` and update the rationale comment at
    `globals.css:237-239`, which currently asserts "v-900 is the only step beneath it" — that
    sentence becomes false and must not be left in the file.
  - Expected result: employer hover ΔL\* ≈ 10, in family with candidate's 8.2 and with every other
    ramp step; contrast on `--paper` ≈ 14:1 (AAA, ample); TOK-02's clause-2 inequality passes on
    its own merits rather than because a ground token was conscripted.

  **Approved as-is, do not change (verified independently by me, not taken from QA):**
  - Alias-chain completeness. `var(--accent…)`/`var(--iris…)` is consumed inside `:root` at exactly
    `globals.css:140` and `:142`; both are redeclared in both scopes. Nothing is stranded. The
    later reads at `:284` (`::selection`), `:372-376` (gradient) and `:413` (focus ring) are inside
    rule bodies, not custom-property declarations, so they resolve per-element and switch correctly.
  - Focus ring safety: `globals.css:413` `outline: 2px solid var(--iris)` becomes v-700 under
    employer = 10.49:1 on white. Improves; no a11y regression.
  - Freeze: `data-audience` appears **0** times in `src/` outside `globals.css`. Confirmed.
  - `node scripts/color-lint.mjs` → exit 0 (`clean — 298 files`). Confirmed.
  - `--accent-candidate` / `--accent-employer` at `globals.css:102-103` match FRONTEND_PLAN §2.1's
    spec (`v-600` / `v-700`) byte for byte. Correct.
  - The `--iris-soft` 400→500 shift is fine and in fact **fixes** a latent AA failure on employer:
    the `linear-gradient(135deg, var(--iris-soft), var(--iris))` CTA carries white text over a light
    end of v-400 = **3.88:1** today (fails AA for 14-15px bold); under employer that end becomes
    v-500 = **5.67:1** and passes. Note this the other way round too — the byte-identical candidate
    scope *preserves* that existing failure. Not TOK-01's job to fix; logged for planner as its own
    task (~14 gradient-CTA call sites, e.g. `src/components/candidate/CandidateHub.tsx:88`,
    `src/components/candidate/CandidateApplications.tsx:133`).

  — **On the candidate scope being a byte-identical no-op: keep it. It is the right call for
  TOK-01, and it is *not* sufficient for the plan's goal — those are two separate findings.**
  Keeping it is correct because (a) a definition-only task should carry zero visual risk, and (b) it
  is the anchor a future candidate differentiation lands on without touching `:root`, which is the
  house default shared with `/` and `/trust/*`. But label it in the comment as a deliberate
  placeholder rather than a decision. Separately: **one ramp step does not achieve PLAN.md:86**
  ("nothing signals you're now in candidate-land vs employer-land"). Candidate v-600 L\* 35.0 vs
  employer v-700 L\* 26.8 is ΔL\* 8.2, same hue, same chroma family. Juxtaposed that is visible;
  **sequentially it is not**, and sequential is the only way a user ever experiences it — nobody
  sees `/candidate` and `/employer` at once. Remembered-colour discrimination is roughly an order of
  magnitude worse than juxtaposed. FRONTEND_PLAN §2.1's `v-600`/`v-700` pair is a *hue-safety* rule
  — it correctly guarantees the two cannot clash — and it should not be read as a sufficiency
  argument, because it never was one. Colour alone is the wrong instrument for a register switch.
  The system already ships the right instrument and it is unused for this: the
  `--instrument` / `--specimen` register grounds at `globals.css:150-158`, documented as
  "register-switch = meaning". Real differentiation that survives sequential viewing is
  ground + density + one structural motif. **Action for planner: schedule that as its own task.
  TOK-01 + TOK-02 should not be recorded as satisfying PLAN.md:86 — they satisfy the token
  plumbing for it.**

  — **Process ruling (missing DoD): QA's pass was legitimate on substance, but the gap is real and
  must be closed — and it demonstrably cost us here.** The problem is not that the self-authored
  clauses were wrong; QA re-derived each independently and I re-verified the load-bearing ones
  above. The problem is that a self-authored DoD can only test what its author already thought of,
  and that is exactly what happened: every clause the implementer wrote tests **mechanism** (does
  the chain switch, does lint pass, does the build pass) and none tests **fitness** (is this the
  right value). A planner-authored DoD for a colour task would near-certainly have carried a clause
  like *"every value is a member of the ramp used in its documented role"* — and that single clause
  catches this defect at the ui-designer stage. So the missing DoD did not cause a false pass, but
  it did let the defect through both upstream gates undetected. Fix, and it is cheap:
  **(a)** planner emits a `**DoD:**` block for every task before it leaves `## Ready`;
  **(b)** no agent may edit a DoD it is implementing against — self-reports append beneath under
  `**Self-report:**`; **(c)** qa-tester **hard-fails** a task that arrives with no planner DoD and
  bounces it to planner, rather than soft-flagging. QA's soft-flag was the generous read; the
  correct behaviour is a bounce, because verifying against criteria the author wrote is
  co-signing, not verifying. One cheap round-trip beats one expensive one.

  — **Build-warning ruling: does not block TOK-01, but planner should fix it now, not wait for
  TOK-03.** QA's attribution is sound and I accept it — isolated both ways (stash-out, file-move).
  The string is not in `src/`, not in the diff, and not shipped: `BACKLOG.md` is untracked, so the
  warnings do not exist for CI or any other clone. But two warnings on every local build is exactly
  the ambient noise that trains agents and humans to stop reading build output — and **TOK-03's
  entire DoD hinges on reading build output.** Cheap fix: break the glob so Tailwind v4's
  auto-content-detection cannot lift it. It now occurs at **`BACKLOG.md:48`, `:71` and `:91`** (QA's
  "lines 23 and 41" was true when written; the file has since grown — target current lines). Write
  it as `duration-[var(--d-…)]` with an ellipsis, or split the token. One character each. Standing
  lesson: any future backlog entry quoting a Tailwind arbitrary-value class carries this same
  hazard.

  — **Re-review scope when this comes back:** only the `--v-800` generation + the four edit points
  listed above. `git diff --stat` should show `src/app/globals.css` and `scripts/color-lint.mjs`
  and nothing else. Zero `.tsx`. Everything under "Approved as-is" is settled and will not be
  re-litigated.

  — ✅ **QA PASS — 2026-07-30.** Independently re-verified, not taken on the self-report.
  `node scripts/color-lint.mjs` → exit 0 (`clean — 298 files, every violet on the ramp`).
  `pnpm build` → exit 0. `git diff --stat` → `src/app/globals.css | 73 +`, zero `.tsx`/`.ts` touched.
  No colour value added — the single `#5E1EDC` in the added lines is inside a comment and is a ramp member.
  — **Freeze claim proven, not assumed.** Ran the real `globals.css` *and* the production-built
  `.next/static/chunks/*.css` in headless chromium and read `getComputedStyle`. Against a control
  scope that redeclares **only** `--accent` (the "simplification" the reviewer note warns about):
  that scope moves `--accent` to `#4914AF` but leaves `--iris` `#5E1EDC` and `--iris-ink` `#4914AF`
  **unchanged** — confirmed no-op, exactly as claimed. The shipped `[data-audience="employer"]`
  block moves all 8 tokens, and `color: var(--iris-ink)` actually paints `rgb(26,11,61)`. All 8
  employer values are members of the `RAMP_HEX` set at `scripts/color-lint.mjs:18-22`, so TOK-02's
  clause 2 will be satisfiable. Also verified the comment's edge case: `data-audience` on `<html>`
  itself (same element matches `:root` and the scope) still resolves to the employer chain — source
  order wins, and both blocks are unlayered and survive minification in the emitted order.
  — **Zero rendered change confirmed.** `data-audience` appears nowhere outside `globals.css` in the
  whole repo, and in the built CSS an unscoped element still resolves `--accent` `#5E1EDC` /
  `--iris-ink` `#4914AF`. The scopes are genuinely inert. Alias-chain completeness double-checked:
  `var(--accent…)`/`var(--iris…)` is consumed inside `:root` at only lines 140 and 142, both of
  which are redeclared in both scopes — nothing is left stranded.
  — **Build-warning attribution verified, and the label is wrong.** The 2 `Delim('*')` warnings are
  **not** caused by `globals.css` — confirmed both ways: with TOK-01 stashed the warnings still
  appear; with `BACKLOG.md` moved out of the tree the build is warning-free. So the source really is
  Tailwind v4 auto-content-detection scanning this markdown file and lifting the literal
  `` `duration-[var(--d…)]` `` out of TOK-03's DoD text (lines 23 and 41) into a real generated
  class. **But "pre-existing" is inaccurate** — `BACKLOG.md` is untracked and was created by this
  loop, so these warnings are new to the repo as of this run and will fire on every build until
  TOK-03 lands or the string is escaped. Not a TOK-01 defect; flagging to `planner` as a
  self-inflicted artifact of our own planning doc.
  — **For code-reviewer (measured, not decided here):** employer `--accent-ink`/`--iris-ink` =
  `--v-900` `#1A0B3D`, documented in `globals.css:73` as a *"dark violet ground for register-switch
  sections"*, not as text ink. Contrast on `--paper #FFFFFF` = **18.12 : 1** — passes WCAG AA body
  (4.5) and AAA body (7.0) with room to spare. Contrast is *not* the risk. The reusing-a-ground-token
  -as-ink semantics is: `#1A0B3D` sits at 1.05 : 1 against body `--ink #12100E` (near-identical
  lightness, ΔE76 ≈ 37 so it still reads as violet, not black). Judgement call is yours, not QA's.
  — **⚠️ Process flag to `planner`:** this entry carries no `**DoD:**` block — unlike TOK-02/03/04.
  The implementer rewrote the task into *What changed / Values / How to verify*, so the acceptance
  criteria I verified against were authored by the agent being verified. The clauses were concrete
  and I verified each independently plus the freeze property they exist to protect, so this passes
  on substance — but future tasks should keep the planner's DoD intact and append the self-report
  beneath it.

  <details>
  <summary><b>ui-designer's original self-report (retained verbatim for the reviewer)</b></summary>

  — **What changed:** `+73 lines, one file.` `:root` gains `--accent-candidate: var(--v-600)` / `--accent-employer: var(--v-700)`; two new scope blocks `[data-audience="candidate"]` and `[data-audience="employer"]` sit immediately after `:root` and each redeclare the *entire* alias chain (`--accent`, `--accent-ink`, `--accent-weak`, `--iris`, `--iris-soft`, `--iris-ink`, `--iris-ghost`, `--iris-line`), with a long comment explaining that a custom property's `var()`s are substituted where the property is *declared*, so overriding `--accent` alone would move only the 34 `--accent*` reads and none of the 759 `--iris*` ones.
  — **Values (all existing ramp steps, no new hex):** candidate = 600/700/50/400/200 — byte-identical to `:root`, so candidate surfaces will look unchanged; employer = 700/900/100/500/300, i.e. the same chain shifted one step deeper. Employer's `--accent-ink` is `--v-900` because `--v-700` is already the ramp's strongest text step and ink must stay distinguishable from accent for pressed/hover — this is also what makes TOK-02's `--iris-ink` inequality check pass.
  — **How to verify:** `node scripts/color-lint.mjs` → exit 0 (observed: `clean — 298 files`). `pnpm build` → exit 0 (observed; the two `Delim('*')` CSS warnings are pre-existing and come from Tailwind v4 scanning the literal `duration-[var(--d…)]` string in this file's TOK-03 entry, not from `globals.css`). `git diff --stat` → `src/app/globals.css | 73 +` and nothing else. Visually: **no page may change**, because nothing sets `data-audience` yet — that is TOK-02. To eyeball the scopes early, add `data-audience="employer"` to any wrapper in devtools and confirm accented elements deepen from `#5E1EDC` to `#4914AF`.
  — **Reviewer note:** the repetition in the two scope blocks is load-bearing, not redundancy. Collapsing them to a single `--accent` override compiles, lints and builds clean while silently doing nothing.

  </details>

  </details>


---

## Ordering rationale

1. **TOK-01 → TOK-02 before anything else.** Per planner.md, accent-per-audience is P0 and every
   later visual task depends on it. It is split in two because the hard part (the alias-chain
   substitution problem) is independent of the wiring, and a failure in either half should be
   attributable to one of them. TOK-01 is deliberately consumer-free so it can be reviewed as a
   pure token diff.
2. **TOK-03 next.** FRONTEND_PLAN §2.4 says "every transition references these three durations and
   this one easing curve." Today there are two duration scales with different values and two easing
   sets, and the *unused* one is the one the plan describes. Any component task that lands before
   this collapse will pick a scale at random and be right either way — which is exactly how 26
   violets happened. Collapse it before component work starts, not after.
3. **TOK-04 last of the actionable set.** Lowest risk, purely additive, and it is the token half of
   FRONTEND_PLAN §2.2's "numbers as texture" — the `<ScoreCard>` / `<ConfidenceBand>` work in
   build-order step 3 will consume the utility immediately, so having it defined first prevents a
   fourth mechanism from appearing.
4. **TOK-05 stays blocked.** It is a plan-vs-code contradiction, not a task. Handing it to an agent
   would force that agent to make a product decision silently.
5. Nothing is marked Done by this loop. The three `TOK-00*` entries are pre-existing state recorded
   to prevent re-scheduling, and are labelled as such.
