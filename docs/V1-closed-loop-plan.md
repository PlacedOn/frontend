# PlacedOn V1 — Closed Loop Plan (Next.js edition)

**Adapted:** July 9, 2026 · **Canonical repo:** `PlacedOn/frontend` (this repo)

This is the [V1 Closed Loop plan] reconciled to the **actual** implementation.
The original plan targeted a separate Vite/React-Router repo
(`bubblebee1408/Placeon.-`). We chose the **live Next.js app** as the source of
truth, so this file carries the plan's *discipline* — the seven loops, the state
machine, the L0–L7 completion levels, the no-dead-end rule, the loop gates, and
the PR/issue templates — applied here.

**Core rule (unchanged):** a feature is complete when the user can finish the
action, the backend records the right state, failure is recoverable, and the
next loop gets stronger — not when the screen looks good.

---

## Stack reality

| | This repo |
|---|---|
| Frontend | **Next.js 16** (App Router, Turbopack, React 19), Tailwind 4, `motion`, lucide |
| Package manager | pnpm |
| Backend | **FastAPI** in `PlacedOn/Product-Research` (`PlacedOn/`), WS interview, Redis sessions |
| Live | `placedon-web.vercel.app` (Vercel) · leads → Supabase |
| Live-data switch | `isLiveBackend()` in `src/lib/api.ts` — every surface is mock-or-live; set `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_WS_BASE_URL` to flip (see `GO-LIVE-plan.md`) |

Backend contracts are canonical and mapped in `src/lib/api.ts`; deploy recipe in
`DEPLOY-backend.md`.

---

## Route mapping (plan → this app)

| Plan route | This app | Note |
|---|---|---|
| `/candidate` | `/candidate` | state-driven CTA |
| `/candidate/pre-interview` | `/pre-interview` | consent gate |
| `/interview/:sessionId` | `/interview?id=` | WS `/ws/{id}`, client-generated id (no REST create) |
| `/candidate/profile/review` | `/candidate/profile` | review actions live on the profile |
| `/candidate/matches` | `/candidate/matches` | interest/dismiss + undo |
| `/candidate/intro-requests` | `/candidate/applications` | intro + pipeline consolidated |
| `/employer/jobs/new` · `/jobs/:id/candidates` · `/saved` | `/employer` | one dashboard: roles + add-role dialog + evidence feed + drawer |
| `/demo` · `/trust` · `/` | same | — |

Consolidations are intentional (KISS) — the *outcome* each plan route requires is
satisfied. Split later only if a route earns its own page.

---

## The seven loops & the state machine

Kept verbatim from the plan (stack-agnostic): Product Intent, UX Pattern, Design
System, Frontend, Backend/Data, Verification, GitHub/Learning. The candidate and
employer **state machines** drive every dashboard's single primary CTA — this is
already how `src/lib/mock/candidate.ts` derives the next action.

Non-negotiable privacy gates (enforced in UI today):
- Employer never sees the raw transcript — only candidate-approved evidence.
- No trait is employer-visible until the candidate approves it.
- Intro contact details unlock only after the candidate accepts.
- Frontend never calls an LLM; the backend owns model/keys.

---

## Honest completion dashboard (L0–L7)

Truth over green. Most loops are **L4 (built + wired to mock-or-live adapters)**;
they reach **L5/L6 only once the backend is deployed** (the current blocker).

| Loop | Route / contract | Built? | Level | Gap to next level |
|---|---|---|---|---|
| Design foundation | tokens + shell + core components | ✅ | **L6** | — |
| Demo loop | `/demo` → `POST /api/demo-requests` → Supabase | ✅ | **L6** | real persistence + verified |
| Candidate dashboard | `/candidate` ← `/demo/dashboard` | ✅ | **L4** | L5 needs live backend (persisted state) |
| Pre-interview consent | `/pre-interview` | ✅ | **L4** | consent isn't persisted yet |
| Interview | `/interview` ← `WS /ws/{id}` | ✅ | **L4** | **reconnect/autosave UX missing**; L6 needs live WS |
| Profile review | `/candidate/profile` ← `/demo/hcv` | ✅ | **L4** | approve/hide are optimistic; L5 needs backend write |
| Matches | `/candidate/matches` ← `/demo/matches` | ✅ | **L4** | interest/dismiss optimistic; L5 needs backend write |
| Applications / intros | `/candidate/applications` ← `/demo/applications` | ✅ | **L4** | accept/decline not persisted |
| Employer evidence | `/employer` ← `/demo/employer` | ✅ | **L4** | save/pass/intro optimistic; L5 needs backend write |
| Learning / analytics | events + feedback | ❌ | **L0** | not started |

Status vocabulary: `Open → In progress → Blocked → Verifying → Complete → Learning`.
No row is `Complete` without build + browser + mobile + button-audit proof.

---

## Real gaps to close (prioritized backlog)

1. **Deploy the backend** (Upstash `REDIS_URL` + Render) → flips 6 loops from L4→L6 with zero UI change. *Blocks everything below persistence.* See `GO-LIVE-plan.md`.
2. **Interview reconnect/autosave UX** — on WS drop, show a reconnect banner and preserve the in-flight answer (backend already supports reconnect + idempotency; frontend only sets an error state today).
3. **Learning/analytics loop (L0→L4)** — emit product events (`interview_created`, `profile_trait_approved`, `employer_intro_requested`…) + a feedback capture.
4. **Per-route state audit** — confirm every route has explicit loading/empty/error/success (most do; audit and fill gaps).
5. **Optional split** of `/employer` into the plan's sub-routes if the single dashboard gets heavy.

---

## GitHub delivery loop (Phase 0 — done in this repo)

- `.github/workflows/ci.yml` — pnpm install → `tsc --noEmit` → `pnpm build`.
- `.github/pull_request_template.md` — loop, completion level, gates, verification.
- `.github/ISSUE_TEMPLATE/v1-closed-loop-feature.yml` — outcome/route/API/states/privacy/target-level.
- Labels: `v1`, `area:*`, `loop:*`, `risk:*`, `blocked`, `ready-for-review`.
- Milestones: `V1.0 Design Foundation` … `V1.5 Pilot Readiness`.

Branch naming: `v1/<loop>-<feature>` (e.g. `v1/interview-reconnect`).

---

## The build-until-complete rule

Pick the highest-leverage gap from the backlog above → spec the one-sentence
outcome → build static → wire adapter → (backend) → motion → verify
(build/mobile/reduced-motion/button audit) → PR with proof → merge → update this
dashboard → create the next issue from what you learned. Stop only when every
core loop is L6 and one loop has reached L7.
