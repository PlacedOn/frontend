# PlacedOn V1 — API & Integration Plan

**The definitive answer to "what APIs do we need for the first version."**
Verified by running the backend locally and auditing both codebases.

---

## TL;DR

You sign up for **2 free services**. **No AI/LLM API key.** Supabase is already wired.

| Service | Role | Status | Cost |
|---------|------|--------|------|
| **Upstash Redis** | interview session memory | ⛔ create | Free |
| **Render** (or Cloud Run) | hosts the FastAPI backend | ⛔ create | Free → ~$25/mo for 2GB |
| Supabase | demo-request leads | ✅ done | Free |
| Vercel | hosts the frontend | ✅ done | Free |

**Not needed:** Anthropic / OpenAI (no LLM code exists), Ollama (optional, heuristic fallback), Memorystore, any payment gateway.

---

## 1. The three API surfaces in play

### A. Frontend → its own Next.js API route (already live)
| Endpoint | Method | Purpose | Backing store |
|----------|--------|---------|---------------|
| `/api/demo-requests` | POST | capture employer demo leads | **Supabase** (server-side; keys never in browser) |

Guarded by rate-limit + honeypot. This is the only write path live today.

### B. Frontend → FastAPI backend (REST, read-only) — flips on when deployed
Base: `NEXT_PUBLIC_API_BASE_URL`. Every surface maps a contract in `src/lib/api.ts`.

| Endpoint | Feeds | Frontend adapter |
|----------|-------|------------------|
| `GET /demo/dashboard` | candidate dashboard (next action) | `src/lib/mock/candidate.ts` |
| `GET /demo/matches` | candidate matches | `src/lib/mock/matches.ts` |
| `GET /demo/hcv` | profile / Trust Passport traits | `src/lib/mock/profile.ts` |
| `GET /demo/applications` | applications + intros pipeline | `src/lib/mock/applications.ts` |
| `GET /demo/employer` | employer roles + candidate feed | `src/lib/mock/employer.ts` |
| `GET /demo/candidate` `/interviews` `/settings` | supporting data | `src/lib/api.ts` |
| `POST /rating` | interview rating (green/yellow/red) | `src/lib/api.ts` |
| `POST /ingest/csv` `/export/jsonl` | data ops (admin) | — |

Pattern: `isLiveBackend()` → fetch + map → else mock. **Zero UI change** to go live.

### C. Frontend → FastAPI backend (WebSocket) — the live interview
Base: `NEXT_PUBLIC_WS_BASE_URL`.

| Channel | Direction | Messages |
|---------|-----------|----------|
| `WS /ws/{interview_id}` | server→client | `question_token` (stream) · `question` · `error` · `duplicate` |
| | client→server | `{ type:"answer", message_id, content }` |

`interview_id` is generated client-side (no REST session-create). Handled in
`src/lib/interview/useInterviewSession.ts` with auto-reconnect + resend de-dupe.

---

## 2. Backend dependencies (what the FastAPI app actually needs)

| Dependency | Required? | Notes |
|-----------|-----------|-------|
| **Redis** (`REDIS_URL`) | ✅ for the interview | session state. Upstash `rediss://…` connection string (NOT the REST url/token). `/demo/*` don't touch it. |
| Python 3.11+ + `backend/requirements.txt` | ✅ | pulls torch + sentence-transformers (needs ~2GB RAM to load) |
| SBERT model | auto | free HuggingFace download on first use |
| Ollama (`localhost:11434`) | ⚪ optional | drift-check; heuristic fallback if absent |
| Anthropic / OpenAI | ❌ | **none in the codebase** — questions are templated |

---

## 3. Environment variables (the complete list)

**Backend (Render):**
```
REDIS_URL=rediss://default:<pw>@<host>:6379         # from Upstash
CORS_ALLOW_ORIGINS=https://placedon-web.vercel.app
# optional: STREAM_DELAY_SECONDS=0.03
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_BASE_URL=https://<render-url>        # public — /demo/* live
NEXT_PUBLIC_WS_BASE_URL=wss://<render-url>            # public — interview live
SUPABASE_URL=…                                        # server-only, already set
SUPABASE_PUBLISHABLE_KEY=…                            # server-only, already set
```

CSP (`next.config.ts`) already allows `https://*.onrender.com` + `wss://*.onrender.com`.

---

## 4. Data flow

```
Browser ──(POST /api/demo-requests)──▶ Next.js route ──▶ Supabase   (leads, live now)
Browser ──(GET  /demo/*)────────────▶ FastAPI ────────▶ static demo data
Browser ──(WS   /ws/{id})───────────▶ FastAPI ────────▶ Redis (session) + SBERT + templates
```

Security invariants (enforced): frontend never calls an LLM; employer never
sees the raw transcript; PII/keys stay server-side; nothing shared before
candidate approval.

---

## 5. Go-live sequence

1. **Upstash** → free Redis → copy `rediss://…`.
2. **Render** → connect `PlacedOn/Product-Research`, root `PlacedOn`, build
   `pip install -r backend/requirements.txt`, start
   `PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`,
   env `REDIS_URL` + `CORS_ALLOW_ORIGINS`. (Bump to 2GB if the model OOMs.)
3. **Vercel** → set `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_WS_BASE_URL`, redeploy.
4. Every `/demo/*` surface + the interview go live. Rollback = remove the two
   Vercel vars (falls back to mock).

Validated locally: all 8 `/demo/*` → 200 with exact adapter shapes; WS streamed
Q → answer → adaptive Q. See `DEPLOY-backend.md`.
