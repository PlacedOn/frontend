# Deploying the PlacedOn backend (validated 2026-07-08)

Backend lives in `github.com/PlacedOn/Product-Research`, directory `PlacedOn/`.
Once it's running, the frontend flips from mock to live with **two env vars** —
no code change (`isLiveBackend()` in `src/lib/api.ts`).

This recipe was validated by installing + booting the backend locally and
driving every contract the frontend uses (see "Validation" below).

---

## What the backend actually needs

| Dependency | Required? | Notes |
|-----------|-----------|-------|
| Python 3.11+ | ✅ | tested on 3.12 |
| `pip install -r backend/requirements.txt` | ✅ | pulls `torch` + `sentence-transformers` — heavy (~1–2 GB), slow first build |
| **Redis** | ✅ **for the interview** | session state. Set `REDIS_URL`. The in-memory fallback only triggers if the `redis` package is absent, and it's in requirements — so a real Redis is required. |
| `ANTHROPIC_API_KEY` | ❌ **not used** | the codebase contains no Anthropic/OpenAI calls. Question text is templated; drift-check uses local Ollama with a heuristic fallback. |
| Ollama (`localhost:11434`) | ⚪ optional | if absent, `call_ollama` fails fast and the heuristic fallback runs. |
| SBERT model | auto | downloaded on first use by `sentence-transformers` (free, local). |

`/demo/*` endpoints need **neither Redis nor any LLM** — they serve static demo
data the moment the app boots. Only the live interview (`WS /ws/{id}`) needs Redis.

---

## 1. Upstash Redis (free)

Create a free Redis database at upstash.com. Copy the **Redis protocol
connection string** — the `rediss://default:<password>@<host>:<port>` endpoint,
**not** the REST URL + token. That string goes in `REDIS_URL`.

## 2. Render web service

New → Web Service → connect `PlacedOn/Product-Research`:

- **Root directory:** `PlacedOn`
- **Runtime:** Python 3.11
- **Build:** `pip install -r backend/requirements.txt`
- **Start:** `PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Environment:**
  - `REDIS_URL=rediss://default:<password>@<host>:<port>` (from Upstash)
  - `CORS_ALLOW_ORIGINS=https://placedon-web.vercel.app`
  - *(optional)* `STREAM_DELAY_SECONDS=0.03` — token streaming speed

## 3. Point the frontend at it (Vercel)

Set on the `placedon-web` project, then redeploy:

- `NEXT_PUBLIC_API_BASE_URL=https://<your-render-url>` → all `/demo/*` surfaces go live
- `NEXT_PUBLIC_WS_BASE_URL=wss://<your-render-url>` → the interview becomes live

The CSP in `next.config.ts` already allows `https://*.onrender.com` and
`wss://*.onrender.com`, so a default `*.onrender.com` URL works with no CSP
edit. A custom backend domain must be added to `connect-src`.

---

## Validation performed (2026-07-08, locally)

- ✅ `pip install -r backend/requirements.txt` — clean.
- ✅ `PYTHONPATH=. uvicorn backend.app.main:app` — boots.
- ✅ All 8 `/demo/*` endpoints return `200` with the exact shapes the frontend
  adapters map (`dashboard`, `matches`, `hcv`, `applications`, `employer`,
  `candidate`, `interviews`, `settings`).
- ✅ `WS /ws/{id}` — streamed the first question, accepted an answer, streamed
  an adaptive follow-up. No Anthropic key; Ollama down (heuristic fallback);
  Redis provided by a fake for the test.

**Known backend content gap:** the live pipeline currently emits internal-style
question text (e.g. *"Follow-up on block_4_grit…"*). Polishing candidate-facing
wording is a backend task; the frontend renders whatever the WS sends.
