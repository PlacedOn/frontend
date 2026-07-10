# PlacedOn — System Architecture & Design Plan

**Purpose:** describe how PlacedOn is built today, and how it should evolve into a
production-grade system. Written to be the single reference for engineering
decisions across the frontend, the backend interview engine, and the data layer.

**Product in one line:** PlacedOn runs one adaptive interview, turns it into a
calibrated, evidence-backed profile (the HCV), and lets the candidate control
exactly what employers see.

---

## 1. Design principles

1. **The candidate owns their data.** Nothing reaches an employer until the
   candidate approves it. The raw transcript is never shared — only approved,
   evidence-backed dimensions.
2. **Every score is explainable.** Each dimension links to the candidate's own
   words and carries a calibrated confidence, so decisions are defensible and
   contestable (LL144, EU AI Act).
3. **The frontend never holds a secret.** All model inference, scoring, and
   privileged data access happen on the backend. Nothing named `NEXT_PUBLIC_*`
   ever holds a secret.
4. **Stateless services, external state.** Application servers hold no session
   state in memory; session state lives in Redis so any instance can serve any
   request and the system scales horizontally.
5. **Graceful degradation.** The frontend runs against live data when the backend
   is configured, and falls back to clearly-labeled sample data otherwise — with
   no change to the UI.

---

## 2. Current architecture (as-is)

### 2.1 High-level topology

```
                         ┌──────────────────────────────┐
   Browser ──────────────▶  Next.js 16 frontend (Vercel) │
     │  HTTPS / WSS       │  - marketing + product UI     │
     │                    │  - live-or-mock data adapter  │
     │                    └───────────┬──────────────────┘
     │                                │  NEXT_PUBLIC_API_BASE_URL / WS_BASE_URL
     │                                ▼
     │                    ┌──────────────────────────────┐
     │  (leads only)      │  FastAPI backend (Cloud Run)  │
     ├───────────────────▶│  - REST /demo/*  (read)       │
     │                    │  - WS /ws/{id}   (interview)  │
     │                    │  - HCV pipeline (layers)      │
     │                    └───────┬───────────────┬──────┘
     ▼                            ▼               ▼
┌──────────────┐          ┌─────────────┐  ┌──────────────┐
│  Supabase    │          │  Redis      │  │  SBERT model │
│  (Postgres)  │          │  (Upstash)  │  │ all-MiniLM   │
│  leads, auth │          │  session    │  │  (in-process)│
└──────────────┘          └─────────────┘  └──────────────┘
```

### 2.2 Frontend (Next.js 16, React 19, Tailwind 4, Vercel)

- **App Router**, Turbopack, `motion/react` for animation, `lucide-react` icons.
- **Surfaces:** marketing (`/`, `/candidates`, `/companies`, `/trust`, `/contact`,
  `/demo`) and product (`/candidate*`, `/employer`, `/pre-interview`, `/interview`).
- **Data access:** one adapter layer (`src/lib/api.ts` + `src/lib/mock/*`).
  `isLiveBackend()` decides between a real `fetch` (mapped to typed contracts) and
  local mock data. Every surface consumes the adapter, never the network directly.
- **Interview client:** `useInterviewSession` manages the WebSocket, streaming
  tokens, answer submission, and automatic reconnect with de-duplication.
- **Security headers:** CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` set in `next.config.ts`.

### 2.3 Backend (FastAPI — the interview engine)

The backend is organized as a pipeline of layers (repository: `Product-Research/PlacedOn`):

| Layer | Responsibility |
|-------|----------------|
| `backend/app` | FastAPI app, WebSocket router, REST routes, session manager, live runtime |
| `aot_layer` | Atom-of-Thought orchestration — decides the next question (skill, difficulty, mode) |
| `layer2` | Capability extraction — SBERT embeddings (`all-MiniLM-L6-v2`, 384-dim) + adapter |
| `layer3` | Bias guard — screens every question for adverse impact; safe-question fallback |
| `layer5` | Aggregation, fit-matching, and profile rendering |
| `interaction_layer` | Real-time voice/session/turn management (future: voice mode) |
| `skill_taxonomy.py` | Central registry: 7 behavioral HCV blocks + technical skills, human labels |

### 2.4 The HCV pipeline (the core IP)

1. **Interview** — the AOT layer selects the next question by skill and mode
   (`new` / `probe` / `retry`); every question passes the layer3 bias guard.
2. **Embedding** — each answer is embedded with SBERT (384-dim, CPU, cached).
3. **Judgement** — answers are scored against skill concepts; evidence snippets
   (the candidate's own words) are captured.
4. **Calibration** — per-dimension **confidence and uncertainty** are maintained
   (Kalman-style), so each score is an estimate with an honest error band, not a
   flat number.
5. **Aggregation** — dimensions roll up into the HCV: `{ score, confidence,
   uncertainty, evidence }` per dimension, plus an overall readiness and summary.
6. **Control + render** — the candidate reviews, hides, or contests dimensions;
   only approved dimensions are ever exposed.

### 2.5 Data stores

- **Redis (Upstash)** — interview session state, keyed by `interview:{id}`, TTL-bounded.
- **Supabase (Postgres)** — demo-request leads today; auth + profiles next.
- **SBERT model** — loaded in-process, cached; baked into the container image so
  cold starts do not re-download it.

### 2.6 API surface

| Channel | Endpoint | Purpose |
|---------|----------|---------|
| REST (read) | `GET /demo/{dashboard,hcv,matches,applications,employer,candidate,interviews,settings}` | feed each product surface |
| REST (ops) | `POST /ingest/csv`, `POST /rating`, `POST /export/jsonl` | admin/data pipeline |
| WebSocket | `WS /ws/{interview_id}` | the live interview (server streams `question_token`/`question`; client sends `{type:"answer", …}`) |
| Frontend route | `POST /api/demo-requests` | employer lead capture → Supabase (server-side keys) |
| Health | `GET /health` | liveness/readiness |

---

## 3. Target architecture (to-be, production)

### 3.1 Hosting topology

| Tier | Service | Why |
|------|---------|-----|
| Frontend | **Vercel** | Next.js-native, global edge, preview deploys |
| Backend | **Google Cloud Run** | runs a long-lived container with WebSockets + a ~2 GB ML model; autoscales; scale-to-zero to conserve cost |
| Session | **Upstash Redis** | serverless Redis, TLS, pay-per-use |
| Database | **Supabase (Postgres + pgvector)** | relational data, auth, RLS, vector search for matching |
| Secrets | Cloud Run env + Vercel env (server-only) | no secret in the client bundle |

> Vercel cannot host the backend: it does not support a long-lived WebSocket
> server, and the ML model exceeds serverless function size limits. Cloud Run is
> the correct home; the frontend stays on Vercel.

### 3.2 Request/data flow (production)

```
Interview:   Browser ⇄ WSS /ws/{id}  ─▶ Cloud Run ─▶ Redis session + SBERT + AOT + bias guard
Read views:  Browser → HTTPS /demo/* ─▶ Cloud Run ─▶ (later) Postgres-backed profile data
Public link: Browser → HTTPS /p/{token} ─▶ Cloud Run ─▶ approved HCV subset only (no transcript)
Leads:       Browser → /api/demo-requests ─▶ Next.js route ─▶ Supabase (server-side keys)
Auth:        Browser → Supabase Auth (magic link) ─▶ httpOnly session cookie
```

### 3.3 Identity & auth (planned)

- **Supabase Auth**, passwordless magic link. Sessions in httpOnly cookies (never
  `localStorage`). Two front doors: `/candidate/signup`, `/company/signup`.
- **`profiles` table** (`id`, `role`, `email`, `full_name`, `company`, `job_title`)
  with row-level security: a user can read/write only their own row.
- The FastAPI backend does **no auth** — Supabase owns identity; the backend stays
  focused on the interview and data. Route-gating in the UI is convenience only;
  **RLS is the real enforcement** on data.

### 3.4 The portable profile (planned)

- `POST /profile/publish` — the candidate publishes an approved subset; returns an
  unguessable, revocable `share_token`.
- `GET /profile/{token}` — returns only approved dimensions + trust metadata; the
  raw transcript is never in the payload.
- Backed by Supabase (token ↔ candidate + visibility choices, RLS-protected).

---

## 4. Security & compliance architecture

**Invariants (must always hold):**

1. The frontend never calls an LLM or embedding model directly.
2. The employer never receives the raw transcript — only candidate-approved evidence.
3. No secret is exposed to the browser; `SUPABASE_SERVICE_ROLE_KEY` is backend-only.
4. Production CORS is restricted to known origins; no wildcard credentials.
5. All PII sits behind the API/database with row-level security.

**Compliance:**

- Every trait model is tested for adverse impact across protected groups before
  release and re-audited on a fixed cadence (LL144).
- Every score links to the exact transcript moment behind it — results are
  documented and contestable, not asserted (EU AI Act: transparency + oversight).
- The bias guard (layer3) screens every generated question before it is asked.

---

## 5. Scalability & reliability

- **Stateless app servers.** All session state is in Redis, so Cloud Run can scale
  instances horizontally; any instance serves any WebSocket or request.
- **Cold starts.** The SBERT model is baked into the image, so a cold start is a
  container boot plus a disk load (~15–25 s), not a model download. For latency-
  sensitive periods, set `min-instances ≥ 1`.
- **Backpressure.** Token streaming is rate-shaped (`STREAM_DELAY_SECONDS`); the
  WebSocket handles reconnect + de-duplication on the client.
- **Graceful failure.** If the backend is unreachable, the frontend renders
  labeled sample data rather than breaking.
- **Observability (to add):** structured request logs, WebSocket lifecycle metrics,
  per-dimension calibration drift monitoring, and error tracking (e.g. Sentry) with
  source maps kept out of the public bundle.

---

## 6. Known gaps & technical debt

| Item | Impact | Fix |
|------|--------|-----|
| Hardcoded absolute path in `aot_layer/mock_llm.py` gold-data read | dead code path (always excepts) | remove or make path-relative/config-driven |
| `/demo/*` serve static sample data | not yet per-candidate | back with Postgres once auth lands |
| No `/profile/{token}` contract | public share link is demo-only | add publish + token endpoints (§3.4) |
| Session store is the only external dependency for the interview | Redis is a hard dependency | acceptable; document + monitor |
| Interview question content | was leaking internal IDs (now fixed) | keep templates human; expand skill labels |

---

## 7. Roadmap (phased evolution)

**Phase 1 — Make it real (infra).** Deploy the backend to Cloud Run; wire Upstash
Redis; point Vercel at it. All `/demo/*` surfaces and the live interview go live.

**Phase 2 — Identity.** Supabase Auth (magic link), `profiles` + RLS, session
gating, two signup front doors.

**Phase 3 — Persistence.** Move `/demo/*` from static to per-candidate data in
Postgres; store real HCV results; add pgvector-backed matching.

**Phase 4 — Portable profile.** `POST /profile/publish` + `GET /profile/{token}`;
public, candidate-controlled HCV report with an OG preview image.

**Phase 5 — Depth.** Voice interview mode (interaction_layer), analytics/learning
loop, real role matching, and richer HCV (expand from 4 rich dimensions toward the
64-dimension vision — same shape, more dimensions).

**Phase 6 — Hardening.** Observability, load testing, rate limiting, per-request
CSP nonces, and a formal bias-audit publication cadence.

---

## 8. Technology summary

| Concern | Choice |
|---------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4, Motion, Vercel |
| Backend | FastAPI (Python 3.12), Uvicorn, Google Cloud Run |
| ML | sentence-transformers `all-MiniLM-L6-v2` (384-dim, CPU), Kalman-style calibration |
| Session | Redis (Upstash) |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth (magic link, httpOnly cookies) |
| CI/CD | GitHub → Vercel (frontend); `gcloud run deploy` (backend) |
