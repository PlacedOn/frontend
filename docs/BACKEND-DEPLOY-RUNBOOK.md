# Backend deploy runbook — make the real interview live

> Goal: deploy the FastAPI backend so a real candidate can complete an interview
> on placedon.com and get a populated, verified report. The frontend is already
> live; this is the last mile. Written 2026-07-23.
>
> **What's already proven** (locally, against the live `placedon` Supabase):
> `python -m pytest` → 342 passed; `uvicorn backend.app.main:app` boots; and the
> full round trip works — auth, preferences (visibility "off" by default),
> interview session, WebSocket turns with encrypted persistence, report finalize,
> growth/coverage, Workshop artifact write+read. Nothing here is untested logic —
> it's deployment + wiring only.

## The repos
- **Backend:** `github.com/PlacedOn/Code`, service code in `PlacedOn/backend`,
  blueprint at repo-root `render.yaml`.
- **Frontend:** `github.com/PlacedOn/frontend` → Vercel `placedon-web` → placedon.com.
- **Database:** Supabase project `placedon` (`nfmttckzsbcxzhusczck`, ap-south-1) —
  **schema already applied + seeded**, nothing to migrate.

---

## Step 1 — Redis (interview session state)
The interview runtime needs Redis. Cheapest reliable option: **Upstash** (free tier).
1. Create an Upstash Redis DB (any region near ap-south-1).
2. Copy its `rediss://default:<password>@<host>:<port>` URL → this is `REDIS_URL`.

(Render also offers "Key Value" Redis; either works. `REDIS_URL` defaults to
`redis://localhost:6379/0`, so it MUST be overridden in prod.)

---

## Step 2 — Deploy the backend on Render
1. Render → **New → Blueprint** → connect `github.com/PlacedOn/Code`.
   It reads `render.yaml`: service `placedon-backend`, `rootDir: PlacedOn`,
   build `pip install -r backend/requirements.txt`,
   start `PYTHONPATH=.:backend uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`,
   health `/health`, plan `starter`.
2. Render will prompt for the `sync:false` secrets — set them per Step 3.

> **RAM note (in render.yaml):** torch + sentence-transformers load lazily on the
> first live interview. The `/v1` API boots on `starter`, but the live interview
> runtime may OOM on small tiers — bump the plan if `/v1/candidate/growth` or a
> WS interview crashes with an OOM.

---

## Step 3 — Environment variables (authoritative)
`render.yaml` covers most, **but is missing the LLM key** — the interview cannot
generate questions without it. Set all of these in the Render dashboard:

| Key | Value | Notes |
|---|---|---|
| `REDIS_URL` | `rediss://…` (Step 1) | required — no default in prod |
| `SUPABASE_URL` | `https://nfmttckzsbcxzhusczck.supabase.co` | the `placedon` project |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/publishable key | **never** the service-role key |
| `SUPABASE_KEY` | same anon key | covers `database.py`'s code path |
| `TURN_ENCRYPTION_KEY` | *(minted — see chat, or regenerate below)* | AES-256-GCM; backend refuses to store answers without it |
| `PASSPORT_SIGNING_KEY` | *(minted — see chat, or regenerate below)* | HMAC secret for signed evidence passports |
| **`ANTHROPIC_API_KEY`** | **your Anthropic key** | ⚠️ **not in render.yaml — add it** |
| `LLM_PROVIDER` | `anthropic` | default, but set it explicitly |
| `LLM_MODEL` | `claude-sonnet-5` | optional override |
| `CORS_ALLOW_ORIGINS` | *(already in render.yaml — includes placedon.com)* | |
| `STREAM_DELAY_SECONDS` | `0.03` | already in render.yaml |

Regenerate the two minted keys any time:
```bash
# from ~/PlacedOn/Code/PlacedOn, with the backend venv active + PYTHONPATH=.:backend
python -c "from backend.app.crypto import generate_key; print(generate_key())"   # TURN_ENCRYPTION_KEY
python -c "import secrets; print(secrets.token_urlsafe(48))"                      # PASSPORT_SIGNING_KEY
```

**Recommended `render.yaml` patch** (so the LLM key is part of the blueprint):
```yaml
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: LLM_PROVIDER
        value: anthropic
```

---

## Step 4 — Verify the backend
Once deployed, Render gives a URL like `https://placedon-backend.onrender.com`.
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://placedon-backend.onrender.com/health          # → 200
curl -s -o /dev/null -w "%{http_code}\n" https://placedon-backend.onrender.com/v1/candidate/preferences  # → 401 (auth works)
```
`200` health + `401` on an authed route (no token) = the service is up and
enforcing auth correctly.

---

## Step 5 — Point the frontend at the backend
The frontend runs in preview/mock mode until these point at the live backend.
Update Vercel **production** env, then redeploy:
```bash
cd ~/PlacedOn/placedon-web
# set (or update) both, production scope:
printf 'https://placedon-backend.onrender.com' | pnpm dlx vercel env add NEXT_PUBLIC_API_BASE_URL production
printf 'wss://placedon-backend.onrender.com'   | pnpm dlx vercel env add NEXT_PUBLIC_WS_BASE_URL production
# (if they already exist, `vercel env rm <name> production` first, then add)
pnpm dlx vercel --prod --yes    # rebuild so NEXT_PUBLIC_* re-inline
```

---

## Step 6 — Verify the round trip on the live site
1. placedon.com → sign up as a candidate (email confirm is ON — click the email,
   or confirm via Supabase for a test user).
2. `/start` → pick a role → consent → **complete** an interview (answer to the end
   so it reaches `session_complete`).
3. Check the **report card** populates with items, and the **Workshop** shows the
   evidence. That's the whole loop, live.

---

## Gotchas (learned the hard way)
- **No LLM key = no questions.** The #1 gap. Default provider is `anthropic`.
- **`TURN_ENCRYPTION_KEY` is required** — the backend *refuses* to persist answers
  without it (good design; don't skip it).
- **PYTHONPATH must be `.:backend`** (already in `render.yaml`) — sibling packages
  `aot_layer/layer2/3/5` resolve at the `PlacedOn` root.
- **Report items need a *completed* interview** — finalizing a half-finished
  session yields an empty report. Answer to the end.
- **Email confirmation is ON** — decide whether to keep it or switch to phone OTP
  (the plan calls for OTP) before real users sign up.
- **`SUPABASE_KEY` = the anon key**, never service-role. Auth is per-request JWT.
```
