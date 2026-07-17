# PlacedOn V1 — Implementation Log

Canonical build log for `PLACEDON_LIVE_INTERVIEW_HR_COPILOT_PLAN.md`. One entry per slice.
Two-repo build: **frontend** = `PlacedOn/frontend` (`~/PlacedOn/placedon-web`, Next.js 16, Vercel) · **backend** = `PlacedOn/Code/PlacedOn/backend` (FastAPI) · **DB** = Supabase `placedon` (`nfmttckzsbcxzhusczck`).

Owner decisions (2026-07-14): pilot role family = **junior backend** · migrations applied to **live `placedon`** · product `/v1` API in **FastAPI backend**.

---

## P0 — Trust-integrity fixes 🟢 (frontend done; 1 backend follow-up)
- ✅ **Universal score removed** — the banned single person-score, in **two** places: candidate `TrustPassport.tsx` ("Overall skill score" → honest counts: skills evidenced / shared) and employer `ReportHeader.tsx` (`OverallRing` "fit" number → "N role-relevant signals assessed, no single score"). Per-signal confidence bands remain. Typecheck + build green.
- ✅ **Interview honesty** — already present: `InterviewRoom` labels "Demo mode" vs "Live · adaptive" and explains scripted-preview.
- ✅ **Mock dashboards** — already labeled "Preview state" / "Sample pipeline · illustrative".
- ⏳ **Backend `fit_score`** (`live_runtime.py` layer5) — same universal-score smell; not surfaced today (frontend on mock) but MUST be suppressed from candidate/employer output when the real runtime connects (Slice 3 / M1 dependency).
- Not deployed yet (gated boundary).

## Gate 0 — Source of truth ✅
- Frontend deploy source: `PlacedOn/frontend` @ main → Vercel `placedon-web` → placedon.com (Next.js 16). Authoritative.
- Backend: `PlacedOn/Code/PlacedOn/backend/app` (FastAPI) inside the `Code` monorepo (also holds the AI interview engine). Cloned to `~/PlacedOn/Code`.
- Not deploy sources: `~/PlacedOn/app` (old Vite SPA), `Code/PlacedOn/frontend` (old copy), `PlacedOn/Coded` (empty).
- Canonical live WS endpoint (frontend expects): `WS /ws/{interview_id}` (`api.ts` + `useInterviewSession.ts`). Will migrate to `/v1/interviews/{id}/live` in Slice 3.
- Pre-existing DB tables: `profiles` (id == auth.users.id, role candidate|employer, RLS own-row), `demo_requests` (RLS anon-insert).

---

## Slice 1 — Role DNA + Job Reality Card 🟡 in progress

**Status:** DB + backend `/v1` API done & verified. **Frontend UI built & build-green.** Integration tests + browser-smoke against a running backend pending.

### Done
- **Frontend `/v1` UI** (`placedon-web`): typed JWT-authed client `src/lib/v1.ts` (mirrors backend schemas; `authFetch` attaches Supabase Bearer token, parses error envelope) + two routes:
  - `/employer/jobs/new` (`NewJobForm`) — create a role → routes to setup. First job bootstraps the company.
  - `/employer/jobs/[id]/setup` (`JobSetup`) — Role DNA builder (business problem, first-90-day outcome, dynamic signals with kind/text/required-evidence, human follow-up) + Job Reality Card (work mode, SLA, location, comp, team, process) + a **readiness panel** that mirrors the server completeness gate (≥3 success signals + outcome + work_mode & SLA) and an **Activate** button (calls `updateStatus('active')`, surfaces the 422 policy message).
  - Honest "backend not connected" state when `NEXT_PUBLIC_API_BASE_URL` is unset/localhost (`isLiveBackend()` false) — no silent failures. Typecheck + `pnpm build` green; both routes register.

- **Migration** `supabase/migrations/0001_slice1_role_dna_reality.sql` (at `Code` repo root — NOT inside the backend package; see bug note) — **applied to live `placedon`** (verified: 5 new tables, all `rls_enabled`).
- **Backend `/v1` API** (`Code/PlacedOn/backend/app/`): `deps.py` (JWT → RLS-scoped client via anon key + `postgrest.auth`), `jobs.py` (schemas + ops + `compute_search_ready` policy), `v1_router.py` (8 routes), wired into `main.py`.
  - Verified: all 8 `/v1` routes register; `deps`/`jobs`/`v1_router` import clean; **policy unit tests 6/6 green** (`tests/test_v1_jobs.py`).
  - Installed declared dep `supabase>=2.0.0` (was missing locally).
- **Bug found & fixed:** the migration was first written to `backend/supabase/migrations/`, which created a `supabase/` dir that **shadowed the pip `supabase` package** (`ImportError: cannot import name 'Client'`). Moved migrations to the `Code` repo root `supabase/`. Also made `jobs.py`'s `Client` import `TYPE_CHECKING`-only so the pure policy is testable without the SDK.
  - Tables: `companies`, `organization_members`, `jobs` (carries Role DNA header + `role_dna_version`), `role_dna_signals` (kind = success_signal|must_have|nice_to_have), `job_reality_cards`.
  - `is_org_member(company)` SECURITY DEFINER helper (avoids RLS recursion); all product tables scoped to company membership via RLS.
- Security advisor run. **Known WARN (low risk, tracked):** `is_org_member` exposed as RPC (boolean membership probe on caller's own uid). Fix before slice sign-off = relocate helper to a non-exposed `private` schema (revoking EXECUTE breaks RLS, so schema-move is the correct fix).

### Next (this slice)
1. Backend auth: `deps.py` — verify Supabase JWT → RLS-scoped per-request Supabase client + `user_id`. (Current routers use a shared key with no JWT → RLS never engages; product `/v1` must fix this.)
2. `schemas/` — Pydantic: JobCreate/Out, RoleDnaSignalIn, RoleDnaOut, RealityCardIn/Out, completeness.
3. `v1_jobs_router.py` — `POST/PATCH /v1/jobs`, `/v1/jobs/{id}/role-dna`, `/v1/jobs/{id}/reality-card`, `GET /v1/employer/dashboard`; deterministic completeness gate (a job can only go `active`/enter search with ≥3 success signals + first_90_day_outcome + reality card work_mode + response_sla).
4. Frontend: typed `/v1` client + `/employer/jobs/new`, `/employer/jobs/:id/setup` (Role DNA builder + Job Reality Card), completion state.
5. Tests: RLS org isolation; incomplete job can't activate/enter search; Role DNA versioned. Browser-smoke: employer creates one junior-backend role → completion state.

### Definition of Done (from plan §4.1 / §15)
- [x] Schema + RLS for jobs / role DNA / reality card
- [x] Role owner can edit success signals, non-negotiables, follow-up rubric (`JobSetup` Role DNA builder)
- [x] Reality card: work mode, location, comp range, team/manager, process, response SLA (`JobSetup` reality card)
- [x] Role DNA versioned (backend bumps `role_dna_version`); incomplete jobs cannot activate (server 422 + client readiness gate). ⏳ Org-isolation **integration** test still needs two Supabase test users.
- [x] Browser build: employer create → setup flow renders a clear readiness/completion state. ⏳ End-to-end browser-smoke needs a reachable backend (backend not deployed yet).

**No commit/deploy yet** (gated loop — awaiting approval at slice completion).

---

## Slice 2 — Candidate consent + preferences + interview creation 🟡 built, build-green

**Status:** DB + backend `/v1` API + frontend UI done & build-green. Integration/browser-smoke against a running backend pending (backend not deployed).

### Done
- **Migration** `supabase/migrations/0002_interviews.sql` (at `Code` repo root) — **applied to live `placedon`** (verified: 4 new tables, all `rls_enabled`). Tables: `candidate_preferences` (visibility off/matched_only/searchable, `research_consent` default OFF), `interview_sessions` (candidate owns row), `interview_turns` (candidate-only; `answer_text_encrypted bytea`; **no employer policy at all** → answers structurally unreadable outside the candidate's account), `interview_consents` (candidate-only, **append-only** = select+insert policies, no update/delete). `owns_session()` SECURITY DEFINER helper (avoids RLS recursion).
- **Backend `/v1` API** (`Code/PlacedOn/backend/app/`): `interviews.py` (schemas + ops + `validate_consent` deterministic policy) + `interviews_router.py` (5 routes: GET/PUT `/v1/candidate/preferences`, POST `/v1/interviews`, GET `/v1/interviews/{id}`, POST `/v1/interviews/{id}/consent`), wired into `main.py`.
  - Consent policy (pure, testable): audio retention must be `none`; voice consent requires an allow-listed STT provider (`deepgram_nova3`/`whisper_offline`); TTS allow-list (`elevenlabs_flash`); every record pins `CONSENT_POLICY_VERSION = 2026-07-15.v1`.
  - Verified: full app boots with **13 `/v1` routes** (8 Slice 1 + 5 Slice 2); **consent policy unit tests 6/6 green** (`tests/test_v1_interviews.py`). (Local pre-existing gap: `email-validator` wasn't installed — unrelated to Slice 2; installed to boot the app.)
- **Frontend** (`placedon-web`): extended `src/lib/v1.ts` (interview + preferences types & methods) + two surfaces:
  - `/interview/consent` (`ConsentGate`) — real pre-interview gate: enumerated terms (what's recorded, **assessed as text only — never accent/tone/speed**, nothing shared by default, audio never stored), explicit agree checkbox pinned to the policy version, then **creates a real `interview_session` + append-only consent record** and hands off to `/interview?session=<id>`. Pre-interview CTAs now route here. Honest demo fallback when backend unset (no fake consent stored).
  - `/candidate/preferences` (`CandidatePreferences`) — role families, locations, work modes, salary, feedback style, **visibility (off default)**, and optional off-by-default research consent.
  - Typecheck + `pnpm build` green; both routes register.

### Definition of Done (plan §4.2)
- [x] Schema + RLS: sessions/turns candidate-owned; turns have **no** employer policy; consents append-only
- [x] Candidate consents before any session exists (server creates session only after `validate_consent`)
- [x] Candidate preferences with candidate-controlled visibility (off by default) + off-by-default research consent
- [x] Build-green create-consent flow + preferences editor. ⏳ RLS candidate-isolation **integration** test needs two Supabase test users. ⏳ End-to-end browser-smoke needs a reachable backend.

**No commit/deploy yet** (gated loop — awaiting approval).

---

## Backend deploy — prep done, hosting handed to owner 🟡
- **Pushed** Slice 1+2 backend + migrations + `render.yaml` to `github.com/PlacedOn/Code` branch **`slice-1-2-backend`** (PR ready). Backend was previously local-only.
- **`requirements.txt`** fixed: added `supabase`, `email-validator`, `cryptography` (build boot-failed without the first two).
- **`render.yaml`** blueprint at repo root (rootDir `PlacedOn`, health `/health`, secrets `REDIS_URL`/`SUPABASE_URL`/`SUPABASE_ANON_KEY` as `sync:false`, CORS baked for placedon.com + Vercel).
- **Owner runbook** delivered (merge PR → Upstash Redis → Render Blueprint w/ exact Supabase values → hand back the Render URL). Then agent flips Vercel `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_WS_BASE_URL` + redeploys + verifies `/health` + a `/v1` route.

---

## Slice 3 — Live interview runtime + persistence 🟡 groundwork built (awaiting hosted backend to verify)

**Status:** backend transport + persistence + encryption built & test-green; frontend authed transport wired. End-to-end verification blocked on the hosted backend (needs Redis + the running runtime).

### Done (non-hosting groundwork)
- **At-rest answer encryption** `app/crypto.py` — AES-256-GCM (`nonce||ciphertext`), key from `TURN_ENCRYPTION_KEY` **env only** (never in DB), **fail-closed** if the key is missing. `generate_key()` helper. Defence-in-depth on top of RLS (which is the real row-access guarantee — turns have no employer policy).
- **Turn persistence** (`interviews.py`): `TurnIn`/`TurnOut`, pure `next_turn_index`, bytea `\x`-hex codec, `record_turn` (encrypts + moves session to `in_progress`), `list_turns` (decrypts for the owning candidate), `update_session_status` (stamps started/completed).
- **Authed live WS** `app/interviews_ws.py` + route `WS /v1/interviews/{id}/live`: JWT via `?token=` (or first `auth` message) validated **before** the answer loop; RLS ownership check; ports the proven `websocket_router` flow (bootstrap → stream → adaptive follow-up) keyed on the real session; persists each answered turn; `should_end_interview` → session `complete`; versioned `"v":1` protocol (`answer_text` now; `mode_switch`/`clarify_request` stubbed for voice fast-follow). `deps.auth_from_token` extracted so HTTP + WS share one auth path. REST reconnect fallback `POST /v1/interviews/{id}/turns`.
- Verified: full app boots with **16 HTTP + 1 WS `/v1` routes**; **pure tests 22/22 green** (6 jobs + 6 consent + 10 turns/crypto).
- **Frontend authed transport** (`placedon-web`): `liveInterviewSocketUrl` + `useLiveInterview` hook (versioned protocol, **honest failure — no scripted mock**, ≤3 reconnects then REST fallback via `v1.addTurn`). `InterviewRoom` refactored into a **selector** (`InterviewSurface` presentational shell + `DemoRoom`/`LiveRoom` siblings — hooks stay unconditional); a real `?session=` + live backend runs the authed room, else the demo. Interview page reads `?session=`; `v1` client gains `addTurn`/`listTurns`/`updateInterviewStatus`. Build-green.

### Blocked on hosted backend (the "retire the mock" acceptance)
- Live WS smoke (Chrome/Safari/Firefox), turn persistence + decryption round-trip against real Redis, sufficiency-stop, reconnect→REST fallback. Once the Render URL is live + `TURN_ENCRYPTION_KEY` set, flip the demo off for authed sessions and run the acceptance.

**No commit/deploy of the frontend yet** (gated loop — awaiting the Render URL, then the Vercel env flip + redeploy).

---

## Slice 4 — Candidate Evidence Report Card 🟡 groundwork built (LLM evidence pipeline deferred)

**Status:** DB + backend trust policy + review-loop UI built & test-green. The LLM extractor/judge that *fills* the card is deferred (needs the hosted stack); the deterministic trust primitives + the candidate review loop are done and locked.

**Embodies the owner's decisions (2026-07-15):** the review/dispute loop IS the consented data flywheel (decision #3); no universal score anywhere (decision #3 + founder's bar); evidence-passport, not social (decision #2).

### Done (non-LLM groundwork)
- **Migration** `0003_report_cards.sql` — **applied to live `placedon`**: `report_cards` (status building/ready_for_review/approved/superseded) + `report_card_items` (band supported/emerging/needs_more_evidence, `quote`, `turn_id`, `candidate_state` unreviewed/accurate/context_added/disputed/hidden, `candidate_context`). **No aggregate score column exists.** Candidate-owned RLS via `owns_report()`; **no employer policy** (employer read is a visibility-scoped VIEW in the matching slice).
- **Backend `reports.py` + `reports_router.py`** (wired into `main.py`): the deterministic trust primitives —
  - `verify_quote` = **layer-1 anti-hallucination gate**: a quote must be a verbatim substring of the candidate's actual answer or it's dropped at zero LLM cost (judge = layers 2–3, candidate review = layer 4).
  - `gate_items` (also drops a 'supported' claim with no quote), `can_approve` (all items reviewed), `summarize` (band **counts, never a score**).
  - Ops: `finalize_session` (creates the card in 'building'), `insert_gated_items` (pipeline-only), `review_item`, `approve_report`. **Evidence is pipeline-produced, never accepted from the client** (a candidate can't inject fabricated "supported" claims).
  - Routes: GET `/v1/reports/{id}`, GET `/v1/interviews/{id}/report`, POST `/v1/interviews/{id}/finalize`, PATCH `/v1/reports/items/{id}`, POST `/v1/reports/{id}/approve`.
  - Verified: full app boots with **21 HTTP + 1 WS `/v1` routes**; **pure tests 33/33 green** (adds 11 report tests incl. fabricated-quote-dies + no-score invariant).
- **Frontend `ReportCardReview` + `/candidate/report/[id]`**: honest band-count summary (no score), per-item review (accurate / add context / dispute / hide), quoted evidence in the candidate's own words, approve-gated-on-all-reviewed. Interview completion CTA now routes authed sessions to their report. Build-green.

### Deferred to the evidence-pipeline slice (needs hosted backend + LLM)
- `pipeline/evidence_builder.py` (extract → gate → fidelity judge → calibrate per turn) writing `report_card_items` async on session completion; embeddings/pgvector for retrieval; dispute-reprocess worker. `verify_quote`/`gate_items` are the ready seams it plugs into.

**No frontend commit/deploy yet** (gated).

---

## Voice fast-follow — plan + groundwork 🟡 (audio flows only when hosted + keys)

**Status:** deterministic voice policy + firewall + provider layer built & test-green; full plan doc written. No audio flows anywhere yet (V2 needs the hosted backend + Deepgram/ElevenLabs keys). Honors decision #1: **text-first; voice assessed as text only; never score accent/tone/pace.**

### Done (deterministic groundwork)
- **Plan** `docs/VOICE-STACK-PLAN.md` — full architecture (client MediaRecorder → WSS → STT → same text pipeline → TTS), two-way conversation design (turn-taking/barge-in/endpointing/mode-switch/clarify), the fairness firewall, provider comparison (Deepgram Nova-3 rec.), consent/data model, candidate↔employer report-card path, cost/latency budgets, V0–V3 rollout + acceptance, code map.
- **Backend `app/voice/`**: `policy.py` (single-source STT/TTS allow-lists, `audio_retention='none'`, `FORBIDDEN_ACOUSTIC_FEATURES`), `firewall.py` (`SttResult` with **no acoustic fields**, `to_assessable_text`, `assert_text_only` fail-closed), `providers.py` (STT/TTS protocols, policy-checked factory, `SilentTts` default that **replaces macOS `say`**, fail-closed `UnconfiguredStt`, Deepgram/ElevenLabs stubs). Slice 2 consent now sources its allow-lists from `voice.policy` (DRY).
- Verified: **44/44 pure tests green** (adds 11 voice — firewall blocks acoustics, spoken≡typed downstream, no-macOS-`say` default, fail-closed STT); app boots. Committed + pushed to the deploy branch.

### Wire in V2 (hosted + keys)
- Real Deepgram streaming + ElevenLabs Flash in `providers.py`; route binary frames through `build_stt().transcribe → to_assessable_text` in `interviews_ws.py` (barge_in/audio_end/mode_switch currently acked stubs); frontend `useVoiceCapture` + mic-check + captions; ConsentGate voice copy; retire `tts_service.py` + fold in `interaction_layer`.

---

## Slices 5–8 — matching · HR Copilot · intros · PMF 🟡 built, green (Fable 5 subagent + orchestrator)

**Status:** all four slices' DB + backend + frontend built; **78 backend pure tests green, 32 HTTP + 1 WS `/v1` routes; `pnpm build` green.** Migrations 0004–0007 applied to live `placedon`. LLM copilot parser + evidence pipeline remain deterministic seams. A Fable 5 subagent built Slice 5 + the copilot/matching logic + the full frontend `v1` client, then hit its session limit mid–Slice 6; the orchestrator finished 6, built 7 + 8, applied migrations, closed the loop.

- **Slice 5 — Explained matching** (`matching.py` + router, `0004_matching.sql`): per-dimension match (role_dna signals ↔ approved report evidence → supported/emerging/missing) + salary fit from Reality Card vs preferences. **No overall score.** Employer read path = two **visibility-scoped views** (`employer_candidate_pool`, `employer_report_card_items`): approved + searchable/matched + `hidden/disputed` excluded + **no identity join**. Frontend: `MatchList` + `/employer/jobs/[id]/matches`.
- **Slice 6 — HR Copilot** (`copilot.py` + router, `0005_hr_search.sql`): prompt → **deterministic policy gate** (refuses protected-class — gender pattern hardened to catch non-adjacent phrasing; strips pedigree proxies) → keyword parser (**LLM seam**) → RLS retrieval over the Slice-5 views → **cited** results + templated follow-up. Append-only audit trail. Frontend: `CopilotSearch` + `/employer/search`.
- **Slice 7 — Consent-gated intros** (`intros.py` + router, `0006_intros.sql`): the **only** chat. Match-before-intro authz; candidate approves before any messaging (RLS `intro_participant`); **company identity revealed only on approval** (snapshot columns + viewer-aware serializer). Frontend: `IntroInbox` + `/intros`; employer `RequestIntroButton`.
- **Slice 8 — PMF** (`pmf.py`, `0007_pmf.sql`): `product_events` + `outcome_checkins` (30d/90d) + `audit_events`, append-only, RLS-scoped. Frontend: outcome check-in in the intro thread; `trackEvent` helper.
- **Step 0 wiring:** employer dashboard → real `v1.employerDashboard` (`LiveEmployerBoard`).

### Security advisor (post-0004–0007) — tracked, intentional
- **ERROR `security_definer_view`** on both `employer_*` views — **intentional/correct**: predicate spans candidate-owned tables the employer can't see under RLS, so a definer view with an airtight `WHERE` (verified) is the right pattern; `auth.uid()` still resolves to the querying employer.
- **WARN** ownership helpers RPC-executable — same low-risk boolean-probe pattern already tracked; remediation = relocate to a `private` schema before go-live.

**Backend committed + pushed to `slice-1-2-backend`. Frontend build-green, local, gated (awaiting the Render URL → Vercel env flip).**
