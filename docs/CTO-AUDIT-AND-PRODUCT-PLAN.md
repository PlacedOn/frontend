# PlacedOn — CTO Audit & Product / AI Plan

**Author's stance:** written as if I own three hats — CTO, lead engineer, and head of AI/ML.
**Date:** 2026-07-15 · **Live:** https://placedon.com · **Scope:** what exists, what's fake, what to build, and how the AI should actually work.

Companion docs: `PLACEDON_LIVE_INTERVIEW_HR_COPILOT_PLAN.md` (the 8-slice V1 spec), `IMPLEMENTATION_LOG.md` (build state). This doc is the *audit + decisions + AI roadmap* layer on top of that.

---

## Part A — What is actually live today (grounded in code)

| Area | Marketing claim on site | Reality in code | Verdict |
|---|---|---|---|
| Interview | "Voice or text, adaptive" | Real FastAPI engine exists (`pipeline/`, `llm/`, `websocket_router`), but the live frontend has `isLiveBackend()==false` → **scripted mock** (`api.ts`). Feels one-way because it *is* a canned demo. | ⚠️ Prototype, disconnected |
| Voice | "Speak your answers" | **No mic/recorder/STT in the frontend at all.** Backend TTS = macOS `say`; STT path unwired. | ❌ Not a feature |
| Candidate dashboard / matches / applications | Live profile, matches, applications | Labeled "Preview state" / "Sample pipeline · illustrative" → **mock data**, empty shells. | ❌ Mock |
| Report card / passport | "Candidate-controlled evidence" | `TrustPassport.tsx` shows an **"Overall skill score"** (`report.overall`) — a universal score the plan explicitly bans. Sample evidence only. | ❌ Wrong + mock |
| Employer / job posting | "Post a role, find candidates" | **Slice 1 built by us**: DB + RLS + `/v1/jobs`, `/role-dna`, `/reality-card` (real, authenticated). No UI yet. | 🟡 Backend only |
| HR Copilot | "Search candidates in plain English" | Does not exist. | ❌ Not built |
| Introductions / consent gate | "Candidate approves contact" | Does not exist. | ❌ Not built |
| Matching algorithm | "Explained role fit" | Does not exist (mock cards only). | ❌ Not built |

**Three trust-integrity defects to fix before anything else (P0):**
1. **Remove the universal "Overall skill score"** from `TrustPassport.tsx`. It contradicts the entire product thesis (evidence-per-role, no employability score) and is a legal/fairness liability (NYC LL144, EU AI Act treat a single hiring score as high-risk).
2. **Stop the silent demo fallback.** When there's no live backend, the interview must say "This is a scripted preview," not impersonate a real adaptive interview. Silent mock = the "one-way, fake" feeling you flagged.
3. **De-mock the dashboards or clearly gate them** behind "coming soon" so the live site stops advertising features that don't persist anything.

---

## Part B — The product flows that are missing (the "how does it actually work")

Each answers one of your questions with a concrete flow + example.

### B1. Where does a candidate go, apply, and where is data stored?
```
Sign up (Supabase Auth) → profiles row (role=candidate)
 → /candidate: one clear next action (state machine)
 → consent + preferences (candidate_preferences)
 → pick a role direction (junior backend for pilot)
 → adaptive text interview (interview_sessions + interview_turns, answer_encrypted)
 → async report card built (report_cards + report_card_items + trait_evidence)
 → candidate REVIEWS before anyone sees it (accurate / add-context / dispute / hide)
 → approves an Evidence Passport (visibility scope)
 → sees explained matches (matches) → expresses interest
 → employer requests intro (intro_requests) → candidate accepts → contact released
```
**Storage:** all in Supabase Postgres with **Row Level Security** as the source of truth (candidate reads only their own rows; employers read only role-scoped, candidate-approved evidence). Raw transcripts (`answer_encrypted`) are **never** returned to employers.

**Example:** Aditi signs up → consents → picks "junior backend" → 12-min text interview → gets a private report ("Traces assumptions before proposing a fix — supported; no code-review example yet — needs evidence") → hides one item, adds context to another → approves passport for matching. Her raw answers never leave her account.

### B2. Fixing the "one-way, scripted" interview (make it feel like a conversation)
The engine is adaptive; the *experience* isn't wired. Fixes:
- **Connect the real runtime** (`WS /v1/interviews/{id}/live`), retire the mock path.
- Each AI question must **reference the candidate's actual last answer** ("You mentioned normalizing the address first — what would you check next if that passed?"). The `pipeline/` already extracts observations; surface that continuity in the prompt.
- **Acknowledge every answer** ("Saved") + a calm "thinking" status while the next question is generated — no fake typewriter, no dead air.
- **Stop on evidence sufficiency**, not a fixed count (already in the plan) — so it doesn't feel like a form.
- Let the candidate **ask for clarification** or say "can you rephrase" — a two-way affordance.

### B3. How the report card works (and salary / strengths / growth)
Not a verdict — a **candidate-controlled, per-role evidence summary**. Structure:
- **Evidence-supported strengths** (claim + exact quote + role relevance + confidence band `supported / emerging / needs_more_evidence`). **No numeric score.**
- **Growth conditions / missing evidence** — phrased as "no cross-team example was observed," never "weak communication."
- **Role compatibility** — which Role DNA signals are supported vs not-yet-evidenced.
- **Work-environment alignment** — candidate preferences vs the employer's **Job Reality Card** (which carries the **salary range** where allowed — so "what salary can I expect" is answered by the *employer's disclosed range*, not an AI guess).
- **Salary/advantages/disadvantages** are reframed: *advantages* = "strengths supported by evidence for this role"; *disadvantages* = "open questions / conditions to explore" (e.g., "on-site schedule differs from your stated preference"). Never a global "good/bad."

### B4. Matching: which job fits, which role, where to apply
A match is **a list of independent, explained dimensions** — not one hidden score:
| Dimension | Source | Candidate sees | Employer sees |
|---|---|---|---|
| Role evidence | approved items vs Role DNA | "3 of 4 signals supported" | supported / emerging / missing |
| Job constraints | candidate prefs vs Reality Card | "hybrid Bengaluru ✓, salary in range ✓" | relevant approved prefs only |
| Growth | role gaps vs learning prefs | "you'd build code-review evidence here" | suggested human follow-up |
| Availability | candidate state | "explore now?" | can request intro? |

**Retrieval** may use a bounded internal relevance score, but the candidate/employer **always** see the dimension breakdown, never a bare number. "Where should I apply" = the ranked, explained queue on `/candidate/matches`.

### B5. How HR finds a candidate (prompt → results)
```
HR types plain English → LLM parses to TYPED criteria JSON
 → deterministic policy filter (reject protected/proxy/auto-decision)
 → retrieve ONLY role-scoped, candidate-approved evidence (RLS)
 → structured filter + semantic (embedding) retrieval
 → rank by role relevance / evidence strength / consent / prefs
 → templated explanation with EVIDENCE CITATIONS + missing signals
 → HR saves / passes / requests intro (all logged to audit_events)
```
**Example prompt:** "Junior backend candidates who showed structured debugging, open to Bengaluru hybrid, prefer regular feedback." → parsed chips shown, each result cites the exact approved quote, states what's missing, suggests a human follow-up. Unsafe prompts ("young men from top colleges") are **refused or rewritten**.

### B6. How a company posts a job (built at the DB/API layer already)
`/employer/jobs/new` → **Role DNA Builder** (business problem, first-90-day outcome, 3–5 success signals, must-haves vs nice-to-haves, human follow-up) + **Job Reality Card** (work mode, location, **salary range**, team, process, response SLA). A job **cannot enter search** until complete (enforced server-side by `compute_search_ready`). This is Slice 1 — backend done, UI next.

### B7. How the AI guides the candidate after the interview
- "Here are the 3 signals your evidence supports, and 2 that need a human conversation."
- "These 4 roles are worth exploring because … ; here's the salary range each disclosed."
- "To strengthen readiness for X, add a project showing code-review collaboration, or answer one follow-up."
Guidance is **actionable and honest**, never "you will get hired at Company Y."

---

## Part C — The candidate profile decision (simple vs social) — my call

**Recommendation: evidence-first passport, NOT a social network. Do not build feeds, follows, or open DMs in V1.**

Why (CTO reasoning):
- **The moat is trust + evidence, not a social graph.** LinkedIn owns the social graph; competing there is a losing, expensive fight. Our defensible asset is a *candidate-owned, consent-controlled Evidence & Outcome graph* (hard to copy because it needs repeated trust behavior).
- **Social features import huge liabilities**: moderation, harassment, spam, fake accounts, addictive engagement metrics that conflict with a *calm, high-trust* hiring product. It also invites bias (popularity ≠ competence).
- **It dilutes the promise.** The candidate's win is "I'm represented fairly and I control who sees what," not "I got 40 likes."

**What the profile *should* be:**
- A **private-by-default Evidence Passport**: per-role supported strengths (with quotes), growth conditions, preferences, and visibility controls.
- A **shareable link** the candidate can turn on (a credible, evidence-backed page) — light "presence," not a feed.
- **Chat only inside the consented introduction flow** (candidate ↔ employer *after* mutual interest), never open social messaging.
- Later, optional: candidate can attach **work samples** and re-interview to strengthen evidence. That's "engagement" that compounds trust, not vanity.

If you later want community (peer prep, mentorship), run it as a *separate, clearly-bounded* surface — never mixed into the assessment/evidence path.

---

## Part D — AI / ML / "neural network" roadmap (head-of-AI honest take)

You're excited to "train a neural network." As head of AI/ML, my job is to channel that into something that **works, is fair, and won't get us sued** — not a black-box hiring brain.

### D0. The hard rule
**Do NOT train a proprietary model that outputs hiring decisions or a person-score in V1.** Reasons: no data yet, severe bias risk, and hiring AI is legally *high-risk* (NYC LL144 bias audits, EU AI Act, ILO warnings). A model that decides "hire/don't" is the fastest way to a lawsuit and an unfair product. The AI **informs** a human; it never decides.

### D1. What the "AI" actually is in V1 (this is real ML, done right)
1. **Foundation LLMs as constrained components** (Claude). Already prototyped in `llm/` (`generator`, `judge`, `claude_axis`). Rules: strict JSON schemas, low temperature, a **judge** that checks every extracted claim against the source answer, and **deterministic code owns policy/authorization** (never the model).
2. **Sentence embeddings for retrieval** — you already depend on `sentence-transformers`. Use it (or an embedding API) to power **semantic evidence search** for HR Copilot and matching. Store vectors in **pgvector** on Supabase. This is a legitimate neural-net use: an *encoder for retrieval*, not a decision-maker.
3. **Rubric-based, cited, calibrated scoring** — per **Role DNA signal**, with confidence bands, always tied to evidence IDs. Not a universal score.

### D2. The staged ML roadmap (how we actually get "smart")
```
Stage 0 (now): LLM extract → judge → confidence band → candidate review.  Ship this.
Stage 1: Embeddings + pgvector semantic retrieval for HR Copilot + matching. Transparent.
Stage 2: Build the EVALUATION SET — consented, de-identified interview cases with
         expected permitted observations, forbidden observations, evidence IDs,
         and HR-prompt→policy expectations. This is the real asset.
Stage 3: Calibrate the LLM-judge against the eval set (groundedness, fidelity,
         harmful-inference rate). Measure, don't vibe.
Stage 4: ONLY after outcome data (30/90-day check-ins) accumulates → train a
         LEARNED RE-RANKER (gradient-boosted trees or a small MLP) that reorders
         candidate↔role relevance. Features = embeddings + structured Role-DNA
         match + preference alignment. It RE-RANKS for a human; it never rejects.
         Ship it behind a fairness gate (adverse-impact ratio, subgroup metrics).
```
### D3. How we'd train the first model worth training (the re-ranker)
- **Data:** consented, de-identified `(role_dna, approved_evidence, preferences, job_reality) → outcome` rows from `outcome_checkins`. Start with hundreds, not millions — this is small-data, so **gradient-boosted trees (LightGBM) or logistic ranking**, not a deep net. Deep nets need data we won't have and hurt explainability.
- **Features:** evidence-embedding similarity to Role DNA signals, count of supported signals, preference/reality alignment flags, recency. **Explicitly exclude** any protected or proxy feature (college prestige, name, location-as-identity, gaps).
- **Label:** did the intro lead to a useful human outcome (advanced / offer / mutual "worth it")? Never "is this person good."
- **Evaluation:** offline ranking metrics (NDCG) **plus fairness** — adverse-impact ratio and subgroup calibration on any available demographic *audit* set (held separately, never used as a feature).
- **Guardrail:** output is a *bounded relevance bucket* feeding the explained match UI. A red team + bias audit must pass before it's live. If fairness fails, we don't ship it — we keep the transparent retrieval.

### D4. Candidate "profile building" ML (what powers the passport)
Pipeline (mostly Stage 0, already prototyped in `pipeline/`):
```
answer → extract role-relevant observations (LLM, schema'd)
       → judge fidelity vs the exact answer text (reject hallucinated claims)
       → assign confidence band + role relevance
       → candidate review (accurate/context/dispute/hide) = human-in-the-loop label
       → approved items become the passport + retrieval corpus
```
The candidate's disputes/edits are **gold training signal** for Stage 3 calibration — the trust loop *is* the data flywheel.

### D5. Voice (real, not macOS `say`)
- **V1 = text-first** (the plan is right: text is more inclusive, auditable, translatable, and **avoids judging accent/fluency**, which is a fairness landmine).
- **Voice as opt-in fast-follow:** browser `MediaRecorder`/Web Audio → stream over WSS → **production STT** (Deepgram / AssemblyAI / faster-whisper on a GPU worker) → the *same text pipeline*. TTS via **ElevenLabs / Azure / OpenAI**, replacing macOS `say`. The backend already has the `interaction_layer.voice` seam to plug a real provider into.
- **Fairness guardrail:** voice is transcribed to text and assessed **as text only**. We never score tone, accent, filler words, or speed. Store consent + provider + fallback-to-text.

---

## Part E — Prioritized roadmap (what to build, in order)

**P0 — Trust integrity (small, do first):**
1. Remove the universal "Overall skill score" from `TrustPassport.tsx`; replace with per-signal confidence bands.
2. Make the interview honestly label scripted-preview vs live.
3. Gate/label mock dashboards.

**Then the V1 slices** (Slice 1 backend done):
- **Slice 1 (finish):** employer Role DNA + Reality Card **UI** + integration tests. *(in progress)*
- **Slice 2:** candidate consent + preferences + interview creation (real identity + storage).
- **Slice 3:** resilient live text interview wired to the real runtime (retire the mock).
- **Slice 4:** candidate Evidence Report Card (review/hide/dispute, no universal score).
- **Slice 5:** explained matching (dimensions, salary from Reality Card).
- **Slice 6:** HR Copilot (prompt → policy → RLS retrieval → citations).
- **Slice 7:** consent-gated introductions + the only chat surface.
- **Slice 8:** PMF instrumentation + outcome check-ins (feeds the eval set + re-ranker).
- **Fast-follow:** pgvector semantic retrieval (Stage 1), then voice (opt-in), then the re-ranker (Stage 4, gated).

**New features worth adding (post-V1, ranked):**
1. Work-sample attachments (compounds evidence trust).
2. Re-interview to strengthen a specific signal.
3. Candidate "readiness" guidance (what evidence to build, honestly).
4. Employer calibration workspace (consistent Role DNA across managers).
5. Shareable passport link.
6. WhatsApp/Hinglish candidate support (India wedge) — *after* the text model is trusted.

---

## Part F — Backend module map (so we build on it, not around it)

`Code/PlacedOn/backend/app/`:
- `main.py` — FastAPI app, CORS, router mounts. · `config.py` — settings.
- `websocket_router.py` + `live_runtime.py` + `session_manager.py` (Redis) — live interview transport.
- `pipeline/` — `jd_parser`, `planner`, `question_strategy`, `conversation_orchestrator`, `context_builder` — the adaptive engine (reusable for Slice 3).
- `llm/` — `generator`, `judge`, `claude_axis`, provider clients — the constrained-LLM layer.
- `state_compressor.py`, `trust_trigger.py` — state contraction + anomaly signals.
- `interaction_router.py` + `interaction_layer.voice` — **experimental** voice seam (STT factory, audio frames). Replace TTS (`tts_service.py` macOS `say`) + wire real STT here for the voice fast-follow.
- `api_routes.py` (CSV ingest / rating / export) + `analytics_router.py` — **eval/data pipeline**, not product API.
- `waitlist_router.py` — leads.
- **`deps.py` + `jobs.py` + `v1_router.py`** — our new authenticated `/v1` product API (Slice 1).

**Target data model (Supabase):** built = `profiles`, `demo_requests`, `companies`, `organization_members`, `jobs`, `role_dna_signals`, `job_reality_cards`. To build = `candidate_preferences`, `interview_sessions`, `interview_turns`, `report_cards`, `report_card_items`, `trait_evidence`, `trait_reviews`, `matches`, `hr_search_sessions`, `hr_search_results`, `employer_candidate_actions`, `intro_requests`, `outcome_checkins`, `audit_events`, `product_events`, `model_evaluations` — each with RLS. (Full contract in `PLACEDON_LIVE_INTERVIEW_HR_COPILOT_PLAN.md` §10.)

---

## The one-line test for every feature
> Does this help the candidate feel accurately represented and in control, while helping the employer see role-relevant evidence and make a better *human* decision?

If not clearly yes, it doesn't go in V1.
