# PlacedOn V3 — System Architecture & Feature Reconciliation

**Status:** Loop iteration 1 — audit + spec. Nothing implemented.
**Date:** 2026-07-29
**Scope:** frontend + backend + the older `bubblebee1408/Placeon.-` lineage

Companion to `DESIGN-SYSTEM-V3.md` (which covers tokens, motion, and visual language).

---

## 0. Repo topology — read this first

Four repos. **Two of them share no git history at all**, which is the single most
important fact for anyone doing backend work here.

| Repo | Local path | Role | Commits |
|---|---|---|---|
| `PlacedOn/frontend` | `~/PlacedOn/placedon-web` | Live placedon.com (Next.js 16, Vercel) | — |
| `PlacedOn/Code` | `~/PlacedOn/Code` | **Deployed backend** (FastAPI, Render) | 28 |
| `bubblebee1408/Placeon.-` | — | Older research lineage | 78 |
| `PlacedOn/Product-Research`, `PlacedOn/Coded` | — | Superseded | — |

`PlacedOn/Code` and `bubblebee1408/Placeon.-` have **zero commits in common**. They are
independent lineages, not fork and upstream. You cannot merge, rebase, or cherry-pick
between them — porting means deliberate file copies.

Note the repo name is `Placeon.-` (trailing dot-hyphen). `Placeon.` and `PlacedOn` both 404.

---

## 1. Current architecture, as measured

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                            │
│  placedon.com — Next.js 16 / React 19 · 40 routes · 242 components  │
│  395 KB JS (13 chunks) · zero dynamic imports                      │
└───────────┬──────────────────────────────────┬──────────────────────┘
            │ Supabase JS (auth)               │ fetch + WS
            ▼                                  ▼
┌───────────────────────────┐   ┌──────────────────────────────────────┐
│  SUPABASE                 │   │  RENDER — placedon-backend           │
│  nfmttckzsbcxzhusczck     │   │  FastAPI · 23 routers · 57 routes    │
│  ap-south-1 ACTIVE_HEALTHY│   │                                      │
│  32 tables, RLS on all    │◄──┤  deps.py: validates Supabase JWT,    │
│  ~empty (see §3)          │   │  returns RLS-scoped anon client      │
└───────────────────────────┘   │  (never service-role — RLS is truth) │
                                └──────────┬───────────────────────────┘
                                           │
        ┌──────────────────────────────────┼───────────────────────────┐
        ▼                ▼                 ▼               ▼           ▼
   ┌─────────┐    ┌────────────┐   ┌────────────┐  ┌───────────┐ ┌─────────┐
   │ layer2  │    │  layer3    │   │  layer5    │  │ aot_layer │ │interact-│
   │ capab-  │    │ bias guard │   │ aggregate  │  │ atom-of-  │ │ion_layer│
   │ ility   │    │ + integrity│   │ match      │  │ thought   │ │ voice / │
   │ SBERT   │    │            │   │ score      │  │ interview │ │ session │
   │ 384-dim │    │            │   │ render     │  │ orchestr. │ │ turn    │
   └─────────┘    └────────────┘   └────────────┘  └───────────┘ └─────────┘
```

**Health, verified live:** placedon.com 200 (1.39s TTFB) · backend `/health` 200 ·
CORS correctly scoped to placedon.com · all 6 Vercel prod env vars set · Supabase
`ACTIVE_HEALTHY`. The old project `bzgeczcmbctrpukhzijv` is `INACTIVE` and unreferenced.

---

## 2. Feature reconciliation — old lineage vs. deployed backend

I compared every module in both trees. The result is much better than expected: **the
layer stack was ported completely and is byte-for-byte equivalent in structure.**

### 2.1 Fully ported — no action needed

| Subsystem | Modules | Status |
|---|---|---|
| `aot_layer` | config, controller, decomposer, generator, judge, main, mock_llm, models, orchestrator | ✅ identical |
| `layer2` (capability / SBERT) | adapter, ast_evaluator, behavioral, config, embedding, main, models | ✅ identical |
| `layer3` (bias + integrity) | bias_classifier, config, fallback, integrity, main, models | ✅ identical |
| `layer5` (aggregate / match / score) | aggregator, config, exporter, main, matcher, models, renderer, scorer, storage | ✅ identical |
| `interview_system` | main, models, orchestrator | ✅ identical |
| `interaction_layer` | communication/, error_handling/, monitoring/, persona/, session/, turn/, voice/ | ✅ **complete**, incl. all 7 subpackages + 6 test files |
| `training`, `simulation` | data_adapter, evaluator, train_pipeline, meta_learner, … | ✅ identical |

The deployed backend is a **strict superset** for product surface: 70 modules in
`backend/app/` vs the old lineage's 20. It added the entire `/v1` product API — jobs,
matching, intros, growth, passport, pipeline, readiness, notifications, copilot, orgs,
admin, fairness — none of which exist in the old repo.

### 2.2 Genuine gaps — only two

| # | Gap | What it is | Impact |
|---|---|---|---|
| **G1** | `whisper_service/` | Standalone Dockerized STT/TTS microservice: `Dockerfile`, `config.py`, `main.py`, `transcriber.py`, **`piper_tts.py`**, `requirements.txt` | Self-hosted voice never ported |
| **G2** | `app/usage_tracker.py` | Per-session voice cost metering — TTS char counts, STT durations, fallback events. Carries real cost math (OpenAI `tts-1` ≈ $0.015/1k chars) | **No cost ceiling anywhere in the system** |

Two things I initially flagged as gaps and then disproved, recorded so nobody re-raises them:

- `app/auth.py` — *not* a gap. `app/deps.py` is the evolved replacement and is better:
  it validates the Supabase JWT and returns an RLS-scoped anon client, explicitly refusing
  the service-role key so Row Level Security stays the single source of tenant truth.
- `app/voice_router.py` — *not* a gap. `app/interaction_router.py` serves the equivalent
  routes (`/tts/voices` at :336, `/tts/speak` at :347) and is registered in `main.py:60`.

### 2.3 The finding that matters most: voice is a mock

`interaction_layer/voice/tts.py` defines **`class MockTTS`**. `voice/factory.py` wires
exactly one backend — `WhisperSTT` — and no real TTS provider. There is no ElevenLabs,
OpenAI TTS, Piper, Deepgram, or Azure integration anywhere in the deployed backend.

Meanwhile the real TTS implementation (`piper_tts.py`) lives in `whisper_service/`, which
was never ported (G1).

So the live chain is: `/tts/speak` → `interaction_router` → `MockTTS` → nothing.

This is consistent with the frontend, where interview speech runs on the browser's Web
Speech API with no backend involvement. **Server-side voice does not exist today.** The
scaffolding is complete and well-factored; the provider is absent.

---

## 3. The blocker that outranks all feature work

The schema is fully deployed — 32 tables, RLS enabled on every one — and essentially
empty:

```
jobs 0 · companies 0 · matches 0 · interview_sessions 0 · interview_turns 0
intro_requests 0 · report_cards 0 · artifacts 0 · evidence_links 0
coverage_snapshots 0 · role_dna_signals 0 · vouches 0 · product_events 0
─────────────────────────────────────────────────────────────────────────
profiles 5 · role_requirements 9 · taxonomy_skills 6 · learning_catalog 4
```

Every employer and candidate surface has nothing real to render. This is why 20 frontend
files still carry mock data and `src/lib/mock/` holds 9 modules (hcv, employer, profile,
growthReport, candidateProfile, reportCard, applications, resumeParse, teamOperate).

**No amount of design system work changes this.** A perfectly-tokenized dashboard
rendering `MOCK_CANDIDATES` is still a demo. Seeding real data is the highest-leverage
action available and it is not a design task.

---

## 4. Architectural defects to fix

| # | Defect | Severity | Evidence |
|---|---|---|---|
| **A1** | DB empty — product has no data to render | **Critical** | §3 |
| **A2** | No cost ceiling on LLM/TTS/STT spend | **Critical** | G2; no quota/budget/rate-limit module in `backend/app/` |
| **A3** | Voice TTS is `MockTTS` — no provider | **High** | `interaction_layer/voice/tts.py` |
| **A4** | Zero dynamic imports in 242-component frontend | **Medium** | nothing code-split |
| **A5** | Dead 3D code in tree + `package.json` | **Low** | `HeroObject3D`, `GlobeLive` unimported; `three` tree-shaken, never ships |
| **A6** | Render env vars are `sync: false` (hand-entered) | **Medium** | `render.yaml` documents the right Supabase project but cannot enforce it |
| **A7** | No contract tests between frontend `lib/v1.ts` and backend schemas | **Medium** | drift is silent |

### 4.1 On A2 — why it is Critical, not Medium

The system calls an LLM per interview turn, plus TTS per response, plus SBERT embeddings.
There is no per-session cap, no per-org quota, no daily budget, and no circuit breaker. A
single runaway interview loop — or one motivated abuser hitting `/v1/interviews` — bills
directly to the founder with no ceiling.

`usage_tracker.py` already exists in the old lineage with the correct cost model. Porting
it is a small, well-scoped job that closes a real financial exposure. It should land
before any public traffic, and certainly before voice goes real (A3), which multiplies the
per-turn cost.

### 4.2 On A6 — the unresolved auth question

`render.yaml` documents `SUPABASE_URL: https://nfmttckzsbcxzhusczck.supabase.co` in a
comment, but the var is `sync: false` — entered by hand in the Render dashboard. The
committed file cannot prove what production actually holds.

Testing with a bogus token returns 401, which is *correct behavior and proves nothing*.
Confirming requires a real logged-in session hitting `/v1/employer/dashboard`. If the
dashboard value still points at the retired `bzgeczcmbctrpukhzijv` project, every
authenticated call fails regardless of what else is built. **Resolve this before A1** —
seeding data into a database the API cannot authenticate against wastes the effort.

---

## 5. Target architecture

Changes from current are marked ▲.

```
┌──────────────────────────────────────────────────────────────────────┐
│  BROWSER — Next.js 16                                                │
│  ▲ route-level dynamic import for narrative motion + charts          │
│  ▲ semantic design tokens (DESIGN-SYSTEM-V3 §2.2)                    │
│  ▲ lib/mock/ deleted; all surfaces read lib/v1.ts                    │
└───────────┬───────────────────────────────────┬──────────────────────┘
            │ Supabase JWT                      │ REST + WS
            ▼                                   ▼
┌────────────────────────┐   ┌─────────────────────────────────────────┐
│  SUPABASE (RLS-first)  │   │  FastAPI                                │
│  ▲ seeded reference +  │◄──┤  deps.py → RLS-scoped client            │
│    demo tenant data    │   │  ▲ usage_tracker: per-session meter     │
└────────────────────────┘   │  ▲ budget guard: org quota + breaker    │
                             └───────┬─────────────────────────────────┘
                                     │
        ┌────────────────────────────┼──────────────────────────┐
        ▼                            ▼                          ▼
   ┌─────────────────┐    ┌──────────────────┐      ┌──────────────────┐
   │ Assessment core │    │ Fairness         │      │ ▲ Voice service  │
   │ layer2 SBERT    │    │ layer3 bias      │      │  STT: Whisper    │
   │ layer5 aggregate│    │ app/fairness/    │      │  TTS: real prov. │
   │ aot orchestrate │    │ firewall+impact  │      │  ▲ metered       │
   └─────────────────┘    └──────────────────┘      └──────────────────┘
```

### 5.1 Voice decision required (G1 / A3)

Two viable paths. This is a cost-vs-latency trade and needs your call:

| | **Port `whisper_service`** (self-host) | **Managed provider** (OpenAI / ElevenLabs) |
|---|---|---|
| Marginal cost | ~zero after hosting | ~$0.015/1k chars TTS + STT/min |
| Fixed cost | Render instance w/ RAM for Whisper + Piper | none |
| Latency | higher cold-start; Piper is fast warm | low, consistent |
| Quality | Piper: decent, clearly synthetic | ElevenLabs: near-human |
| Effort | port 6 files + Dockerfile + provision | implement one provider behind existing `factory.py` |
| Fits existing code | `whisper_stt.py` already present | `factory.py` is already an abstraction seam |

The `voice/factory.py` + `voice/base.py` abstraction means either choice is a contained
change. My read: **start managed** (fastest to real, and `usage_tracker` makes the cost
visible before it is dangerous), keep `whisper_service` as the escape hatch if unit
economics demand it later. But quality expectations for an interview product may justify
ElevenLabs regardless.

### 5.2 Contracts to formalize (A7)

Currently the frontend's `lib/v1.ts` mirrors backend Pydantic schemas by hand. Nothing
detects drift. Options, cheapest first:

1. Generate TS types from the live `/openapi.json` in CI, fail on diff. **Recommended** —
   the backend already serves a complete OpenAPI doc with all 57 routes.
2. Contract tests per router.
3. Shared schema package. Heaviest; not justified at this size.

---

## 6. Sequencing

Ordered by leverage, with the dependency reasoning made explicit.

| Phase | Work | Depends on | Why here |
|---|---|---|---|
| **0** | Verify prod auth end-to-end (A6) | — | Gates everything; cheap to check |
| **1** | Port `usage_tracker` + add org budget guard (A2) | — | Closes unbounded financial exposure |
| **2** | Seed reference + demo tenant data (A1) | 0 | Turns the shell into a product |
| **3** | Land design tokens (`DESIGN-SYSTEM-V3` §2.2, §3.4) | — | Parallel-safe; blocks all UI work |
| **4** | Retire `lib/mock/` → live `lib/v1.ts` | 2, 3 | Needs real data *and* tokens |
| **5** | OpenAPI→TS codegen in CI (A7) | 2 | Locks the contract once data is real |
| **6** | Voice provider decision + implementation (A3/G1) | 1 | Must be metered before it is real |
| **7** | Code-split narrative motion (A4); drop dead 3D (A5) | 3 | Protect the 395 KB advantage |

Phases 0–2 are backend/data and 3 is frontend tokens — **they can run in parallel.** The
loop should not serialize them.

---

## 7. Open decisions

1. **Voice: self-hosted Piper or managed provider?** (§5.1)
2. **Seed strategy for A1** — synthetic demo tenant, or wait for the 5-user concierge
   validation test in `docs/VALIDATION-KIT.md`? These imply very different products at
   launch, and the validation-first strategy already recorded argues against faking it.
3. **Emotion-as-signal** — the brief proposes treating emotion as an auxiliary feature,
   never a displayed score, citing the EU AI Act ban on workplace emotion inference. That
   is the right call and matches the existing fairness posture. Confirm it stays *off by
   default* and never surfaces in the candidate report.
4. **Does the interview need server-side voice at all for V1?** Browser Web Speech works
   today at zero cost. Server voice buys consistency and quality; it also adds the single
   largest recurring cost line. Worth deciding deliberately rather than by momentum.

---

## 8. Loop state

**Iteration 1 complete** — architecture audited, lineage reconciled, gaps identified.

Corrections made during this iteration, recorded so they are not re-derived:
- `interaction_layer` is complete in the deployed backend, not gutted (an early `ls`
  missed the subpackages).
- `auth.py` and `voice_router.py` are not gaps — `deps.py` and `interaction_router.py`
  supersede them.
- PlacedOn's bundle is **leaner** than both design references (395 KB vs 1238/1197 KB),
  inverting the assumption that it is bloated.

**Next iteration candidates**, highest leverage first:
1. Resolve A6 (prod auth) — unblocks everything, smallest effort
2. Spec the `usage_tracker` + budget-guard contract (A2)
3. Spec the seed dataset shape for A1
4. Begin design-token implementation (Phase 3), parallel to the above
