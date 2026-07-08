# PlacedOn V1 — Build Plan v2 (Next.js-adapted)

**Refines:** `v1-live-frontend-backend-build-plan.md` (the uploaded plan).
**Author's lens:** developer inheriting a strong spec — keep the discipline, reconcile with reality, re-sequence, ship.
**Design lens:** Jony Ive — the product should feel inevitable, quiet, precise. Motion explains state; it never decorates.

The v1 plan is excellent and its philosophy stands unchanged:
> Prove ONE loop — calm interview → evidence profile → candidate review → employer evidence → consented intro. Do not build LinkedIn + Naukri + HireVue at once.

This v2 only changes **how** it maps onto the code that already exists and is live.

---

## 1. The one reconciliation that matters: stack

The v1 plan assumes **React/Vite**. The live product is **Next.js 16 (App Router)**, deployed on Vercel, pushed to `github.com/PlacedOn/frontend`. That is not a mistake to undo — for a marketing surface that people search for, SSR + built-in SEO + route handlers are strictly better than a Vite SPA. The v1 plan even permits this ("consider Next.js later if SEO matters"). **Decision: stay on Next.js 16.** Every Vite-specific instruction is translated below.

### 1.1 Env var translation

| v1 plan (Vite) | v2 (Next.js) | Exposure |
|---|---|---|
| `VITE_API_BASE_URL` | `NEXT_PUBLIC_API_BASE_URL` | public (browser) — FastAPI base |
| `VITE_WS_BASE_URL` | `NEXT_PUBLIC_WS_BASE_URL` | public — WebSocket base |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | public — only when we add Supabase **Auth** |
| — | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | **server-only** — used by our route handlers to write PII |
| — | `SUPABASE_SERVICE_ROLE_KEY` | **server-only, backend (FastAPI) only** — never in the web app |

Rule unchanged from v1 §9.4 / §15.9: **the frontend never calls Anthropic**, and no secret is ever `NEXT_PUBLIC_*`.

### 1.2 Two server surfaces, not one

The v1 plan proposes `src/lib/api/*` fetch modules (fine) plus a FastAPI backend. In Next we get a third, cleaner option we should use deliberately:

- **Next route handlers** (`src/app/api/*`) — our own server code that needs a secret or light validation but not Python. First user: `POST /api/demo-requests` (done). Good future fits: Supabase Auth callbacks, webhook receivers, contact form.
- **Typed FastAPI client** (`src/lib/api.ts`) — everything that needs the Python pipeline: interview session create, WebSocket, profile generation, employer feed, matching. Base URL env-driven.
- **WebSocket client** (`src/lib/ws/interviewSocket.ts`, to build) — the live interview, straight to FastAPI `/ws/{interview_id}`.

Litmus test: *needs Redis/SBERT/Anthropic/bias-guard?* → FastAPI. *Just needs a secret + a DB write?* → Next route handler. *Pure UI/derived state?* → neither.

---

## 2. Honest status vs the v1 route matrix (§15.5)

| Route | v1 target | Today | Gap to close |
|---|---|---|---|
| `/` | L5 | L4 | analytics events, final a11y/mobile audit |
| `/demo` | L5 | **L5 (this build)** | dedicated route + full field set + persist ✅ |
| `/trust` | L4 | L3 | wire "Contest a trait" to review flow |
| `/pre-interview` | L4 | L2 | consent gate → real `POST /api/interviews` |
| `/interview/:sessionId` | L4 | L1 | WebSocket, reconnect, autosave (needs backend live) |
| `/candidate` | L4 | L2 | dashboard **state machine** (mock adapter first) |
| `/candidate/profile/review` | L4 | L0 | build from playbook §15.15 |
| `/candidate/matches` | L3 | L2 | interest action persists |
| `/employer` | L4 | L2 | role list + create-role dialog |
| `/employer/jobs/:jobId/candidates` | L4 | L2 | feed + evidence drawer + save/pass/intro |

**Already banked (before this build):** typed FastAPI client, normalized `ApiError`, Supabase project `placedon` + `demo_requests` table (RLS insert-only), `POST /api/demo-requests` verified live, working demo modal, all landing CTAs routed.

---

## 3. Re-sequenced backlog (adapts v1 §15.24 "First 30 Tickets")

Ordered by *value now, without blocking on infra I don't control*. Items needing the founder's accounts (Render, Anthropic key, Upstash) are marked ⛔BLOCKED and deferred, not skipped.

**Wave 1 — Make the marketing + entry real (frontend + Supabase only)**
1. ✅ API client + normalized errors
2. ✅ `POST /api/demo-requests` + Supabase table
3. ✅ **`/demo` dedicated route** with full field set (this build)
4. ✅ Every "Book a demo" reaches a working flow (modal for in-page CTAs, `/demo` for direct/footer)
5. Candidate dashboard `/candidate` **state machine** behind a mock adapter (L2→ demoable)
6. Employer `/employer` role list + create-role dialog behind mock adapter
7. `/candidate/profile/review` static→mocked from playbook §15.15
8. Wire `/trust` "Contest a trait" routing

**Wave 2 — Backend live (⛔ needs founder infra)**
9. Deploy FastAPI to Render + Upstash Redis; set CORS to our Vercel origins
10. `POST /api/interviews` → `Begin interview` creates a real session
11. `/interview/:sessionId` + `interviewSocket.ts`: first question, send answer, `ai_thinking`, autosave, reconnect, complete
12. Profile generation (mock response first, then Sonnet) → `/candidate/profile/review` persists

**Wave 3 — Employer loop + polish**
13. Employer feed + evidence drawer + save/pass/request-intro (optimistic + undo)
14. Intro request loop (candidate consent gate)
15. Analytics events across the funnel (§18), reduced-motion + 375px audit, QA worksheet per route (§15.23)

**V1 completion gate:** unchanged — the 20 end-to-end checks in v1 §15.10.

---

## 4. What I kept verbatim from v1 (do not re-litigate)

- Feature Readiness Levels L0–L5 and the honesty they enforce.
- The five nested loops (Product / UI-UX / Motion / API / QA) and the Button Completion Loop.
- Every hard interview rule: **no red dot, no countdown, no score, no fake typewriter**, one question at a time.
- Trust rules: raw transcript never employer-visible; employer sees only candidate-approved evidence; missing signal is amber, never red.
- Model routing: Haiku for live turns, Sonnet for profile/judge/bias (`claude-haiku-4-5` / `claude-sonnet-5`).
- The Feature Work Packet (§15.11) as the gate before any feature starts.
- Motion tokens (§7.3) — adopted as the canonical motion scale (see UI/UX plan v2).

---

## 5. Infra the founder must provision for Wave 2 (blockers)

| Need | Purpose | Where |
|---|---|---|
| Render (or Railway/Fly) web service | host FastAPI + WebSockets | render.com |
| `ANTHROPIC_API_KEY` | live turns (Haiku) + profile (Sonnet) | Anthropic console |
| Upstash Redis URL | interview session state | upstash.com (free) |

Until these exist, Wave 1 (frontend + Supabase) proceeds to full completion.
