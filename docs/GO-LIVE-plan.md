# PlacedOn — Go-Live Plan

**Goal:** take the site from "mock data" to "fully live" — real `/demo/*` data
and a real AI interview — by standing up the backend and flipping two env vars.

**Status of the build:** the entire frontend is done and deployed. Every
candidate + employer surface already runs on a `mock-or-live` adapter, so
**no frontend code changes are needed to go live** — only configuration.

**Validated:** the backend was installed and booted locally with the exact
commands below; all 8 `/demo/*` endpoints and the interview WebSocket were
confirmed working (see `DEPLOY-backend.md`).

---

## 1. What you need (the complete list)

### Accounts / services
| # | Service | Why | You have it? | Cost |
|---|---------|-----|--------------|------|
| 1 | **Upstash** account | free Redis for interview sessions | ⛔ create | Free |
| 2 | **Render** account | hosts the FastAPI backend | ⛔ create | Free tier |
| 3 | Vercel | hosts the frontend | ✅ already | Free |
| 4 | Supabase | demo-request leads (frontend only) | ✅ already | Free |
| 5 | GitHub | both repos live here | ✅ already | Free |

### Credentials / values to collect
| Value | Where it comes from | Goes into |
|-------|--------------------|-----------|
| `REDIS_URL` (`rediss://…`) | Upstash → database → **connection string** (not REST) | Render env |
| Render service URL (`https://…onrender.com`) | after you create the Render service | Vercel env |

### NOT needed (verified — no code uses them)
- ❌ Anthropic / OpenAI / any LLM API key
- ❌ Any new Supabase setup
- ❌ Ollama (optional; has a heuristic fallback)
- ❌ Any payment beyond free tiers

---

## 2. The plan, phase by phase

Legend: **[You]** = only you can do it · **[Me]** = I'll do it once you unblock me.

### Phase 0 — Decision (2 min) **[You]**
Choose how interview questions are generated for launch:
- **(A) Template questions** — works today, free, no LLM. *Recommended for first launch.*
- **(B) Claude-written questions** — smarter wording; requires an `ANTHROPIC_API_KEY`
  and a backend build task **before** deploying. We can do this after A is live.

👉 Tell me **A or B**. The steps below assume **A**.

### Phase 1 — Upstash Redis (5 min) **[You]**
1. upstash.com → sign in (GitHub) → **Create Database** → Redis → region near India → Free.
2. Copy the **`rediss://default:…@…:6379`** connection string (NOT the REST URL/token).
3. **Paste it to me** (or keep it for Phase 2 — your call).

### Phase 2 — Render backend (10 min + ~8 min build) **[You]**
New → Web Service → connect **`PlacedOn/Product-Research`**:
- Root Directory: `PlacedOn`
- Runtime: Python 3
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `REDIS_URL` = your Upstash string
  - `CORS_ALLOW_ORIGINS` = `https://placedon-web.vercel.app`
- Create. First build is slow (installs torch). When it's live, open
  `https://<your-url>.onrender.com/health` → should say `{"status":"ok"}`.

👉 **Paste me the Render URL** (or the build log if it fails).

### Phase 3 — Wire the frontend (2 min) **[Me]**
I set on Vercel and redeploy:
- `NEXT_PUBLIC_API_BASE_URL=https://<render-url>`
- `NEXT_PUBLIC_WS_BASE_URL=wss://<render-url>`

### Phase 4 — Verify live (5 min) **[Me]**
- `/candidate`, `/candidate/matches`, `/candidate/profile`, `/candidate/applications`,
  `/employer` all show **"Live · from backend"** and real data.
- `/interview` streams a real question → I answer → adaptive follow-up.
- Report back with confirmation + screenshots.

### Phase 5 — (Optional) polish & upgrades **[Me, later]**
- **(B) Claude questions** if you chose that path.
- Backend question wording is currently internal-style (*"Follow-up on
  block_4_grit…"*) — polishing that is a backend content task.
- Custom domain `placedon.com` (Squarespace DNS → Vercel).
- Basic uptime monitoring on the Render service (it sleeps on free tier;
  a paid instance or a cron ping keeps it warm).

---

## 3. Verification checklist (Phase 4)
- [ ] `GET https://<render>/health` → 200
- [ ] `/candidate` shows live next-best-action
- [ ] `/candidate/matches` lists real matches
- [ ] `/candidate/profile` shows real HCV traits
- [ ] `/candidate/applications` shows real pipeline
- [ ] `/employer` shows real jobs + discovery feed
- [ ] `/interview` completes a real question → answer → question turn

## 4. Rollback (instant, zero risk)
If anything misbehaves, **remove `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_WS_BASE_URL`
on Vercel and redeploy.** Every surface falls back to mock data — the site keeps
working exactly as it does today. No data loss (mock has no writes).

## 5. Cost
Everything above is **$0** on free tiers. The only reasons to pay later:
- Render paid instance (~$7/mo) so the backend doesn't cold-start/sleep.
- Anthropic usage if you pick path (B).

---

## 6. What I need from you to proceed (summary)
1. **A or B** for interview questions (Phase 0).
2. The **`rediss://…`** string from Upstash (Phase 1).
3. The **Render URL** once the service is up (Phase 2).

That's the entire critical path. Do Phase 1 whenever you're ready and paste me
the string — I'll guide each step and take over from Phase 3.
