# PlacedOn — System Design and Prioritised Feature Plan

**Written:** 2026-07-29 (session date) · measurements taken live against Supabase
`nfmttckzsbcxzhusczck` and `https://placedon-backend.onrender.com`.

Everything in §1 is **measured**. Where I am inferring or asserting a judgement, I
say so inline. Claims marked *(measured)* were run; claims marked *(assumption)*
were not verified and should be treated as debatable.

---

## 1. What is actually true today

### The row counts (measured, live, this session)

```
interview_sessions     0
interview_turns        0
report_cards           0
report_card_items      0
jobs                   0
companies              0
matches                0
intro_requests         0
product_events        12
```

Supporting counts from the same read: `profiles` 5, `role_requirements` 9,
`taxonomy_skills` 6, `learning_catalog` 4. Every other table in the public schema
is at zero.

The live API exposes **59 paths**, 47 of them under `/v1` — jobs (12), interviews
(7), candidate (6), org (5), intros (4), reports (3), admin (3), employer (2),
passport (2). The backend is ~10,400 lines of Python across 60+ modules, with a
real fairness package, a real eval harness with bootstrap confidence intervals,
and a genuinely well-designed consent state machine.

**So: a large, carefully-built, thoroughly-documented system that has never
processed a single interview.**

### What the 12 product_events actually contain (measured)

All 12 rows were written on 2026-07-31, from 6 distinct anonymous browsers:

| event | n |
|---|---|
| `landing_view` | 6 |
| `interview_topic_opened` | 2 |
| `quick_chip_clicked` | 1 |
| `search_submitted` | 1 |
| `pre_interview_start` | 1 |
| `cta_fork_selected` | 1 |

One browser (`7db121ab…`) walked the entire intended funnel in 22 seconds:
landing → fork "work" → chip "Backend" → search → `/pre-interview` →
`pre_interview_start`. A second browser opened two interview topics
(`when_wrong`, `when_stuck`).

**`pre_interview_start` = 1 and `interview_sessions` = 0.** A real person started
an interview and the product recorded nothing. That gap is not a funnel
conversion problem. It is §2's subject: the interview does not reach the backend
at all.

### What the zeros invalidate

Anything that consumes usage data is not "not yet prioritised" — it is
**unstartable**:

- matching quality, ranking, and any re-ranker
- ICP analysis, segmentation, cohort work
- A/B tests of anything (6 sessions cannot resolve a 10-point difference)
- agentic shortlisting, employer copilot quality tuning
- the calibration loop, the eval harness's real-data mode, band accuracy
- any model trained on candidate approve/contest/revise (see §4 — **zero labels
  exist**)

The `/v1/jobs` surface is the largest single area of the API (12 paths) and
serves 0 jobs and 0 companies. That is the clearest measured signal of effort
allocated ahead of demand.

### What is genuinely good and should not be rewritten

Being fair to what exists: `evidence_state.py` (the seven-state consent machine,
mirrored to `src/lib/evidence.ts` with the client explicitly demoted to
"grey out buttons only"), `reports.verify_quote`/`gate_items` (verbatim-substring
grounding at zero LLM cost), `app/fairness/` (fail-closed firewall), and
`app/eval/confidence.py` (bootstrap CIs that refuse to over-trust a 4-case eval)
are all better than they need to be. The problem is not quality. The problem is
that **nothing calls them.**

---

## 2. The interview engine

### How it works today (measured by reading the code)

There are **three** interview implementations in the tree. They are not
connected to each other.

**(a) The one users actually touch — a client-side demo.**
`src/app/interview/page.tsx` (32 lines) renders `InterviewRoom`.
`grep` for `fetch(`, `API_BASE`, `WebSocket`, `ws://`, `/v1/` across
`src/components/interview/` returns **exactly one hit**, and it is a string in
`ConsentGate.tsx`:

> "Backend not connected — this runs the demo interview and does not store a
> consent record."

`InterviewRoom.tsx`, `InterviewSurface.tsx` and `Whiteboard.tsx` contain **no
network calls whatsoever**. The interview on placedon.com is a front-end
simulation. It creates no session, posts no turn, produces no evidence. This is
the direct cause of `interview_sessions = 0`.

**(b) The AoT engine — real, sophisticated, and reachable only over WebSocket.**
`app/live_runtime.py` wires `aot_layer` (question generator → judge →
controller) to `layer2` (capability adapter, AST evaluator, behavioural
tracker), `layer3` (integrity, bias enforcer, safe-question fallback) and
`layer5` (aggregator, matcher, renderer, `CandidateRepository`).

The adaptive loop is genuine. Per turn: the judge scores the answer
(`backend/llm/judge.evaluate_answer`, a real LLM call), an integrity trust score
discounts confidence (`trust_factor = 0.7 + 0.3 * integrity.trust_score`), the
per-skill `skill_vector` and `sigma2` update, and the controller picks
`probe` / `retry` / advance-skill plus a difficulty. Question text is generated
by an LLM (`backend/llm/generator`) then passed through
`SafeQuestionPipeline.validate` with a `BiasEnforcer` before it is ever shown.

Termination (`should_end_interview`): minimum 10 turns, hard stop at 15, early
exit when `turn_count >= 10 and skill_coverage >= 0.7 and avg_confidence >= 0.7
and at least one `hr_` skill has been asked`.

**(c) A third, fully dead path.** `app/interview_runtime.py` →
`app/interview_orchestrator.py` → `app/reasoning_probe.py` +
`app/process_evidence.py`. This is the *best-designed* of the three — the
probe-selection strategy (`self_explain` → `perturb` → `scaffold`), the
"unowned answers earn no band" rule, whiteboard-gating on problem-solving
threads. **Nothing imports `app.interview_runtime`.** Verified by grep. It is
written, documented, and unreachable.

### Concrete weaknesses

**W1 — `live_runtime.py` crashes on the final turn of every interview.**
This is a live, deterministic bug, not a style point.

In `process_answer`, the terminating branch (`if should_end_interview(...)`)
returns a `performance` dict containing:

```python
"fit": fit.fit_score,
"fit_interpretation": fit.interpretation,
```

at lines 212–213. But `fit` is **only assigned at line 256**, inside the
*non*-terminating path that follows. A comment at lines 170–174 explains that the
old self-comparison fit call was deliberately removed from the terminating
branch (correctly — it compared the candidate's embedding to itself and always
scored ~1.0), and the snapshot was updated to `"fit": None` — but the
`performance` dict below it was not. Every interview that reaches its natural end
raises `UnboundLocalError: cannot access local variable 'fit'`.

Cost of being wrong about this: zero. It is a four-line deletion. Cost of leaving
it: the engine cannot complete a single interview even after (a) is connected.

**W2 — the evidence pipeline does not exist.**
`reports.insert_gated_items()` — the function that turns proposed traits into
`report_card_items` — has **zero callers** in the entire backend (grep-verified).
`reports.finalize_session()` creates the card in status `building` with a
docstring reading "Items are filled by the server-side evidence pipeline
(deferred)". It was deferred and never written.

So even a completed interview yields an **empty report card that can never leave
`building`**. There is no path from a turn to a trait. This is the single missing
link between the engine and the product.

**W3 — two incompatible vocabularies for candidate state, and a broken endpoint.**
Measured: the DB CHECK constraint on `report_card_items.candidate_state` is

```
pending | reviewed | contested | revised | private | approved | shared
```

with default `'pending'` — the `evidence_state.py` vocabulary. Correct.

But `reports.py` declares:

```python
CandidateState = Literal["unreviewed", "accurate", "context_added", "disputed", "hidden"]
```

Consequences, all live in the OpenAPI surface:

- `PATCH /v1/reports/items/{item_id}` **cannot succeed for any input.** Values
  Pydantic accepts (`accurate`, `disputed`, …) violate the DB CHECK → 500.
  Values the DB accepts (`shared`, `approved`) are rejected by Pydantic → 422.
  (The silver lining: Pydantic accidentally blocks what would otherwise be a
  consent bypass, since this route lets the client name a *target state*
  directly — exactly what `evidence_router` was designed to prevent. The route
  should be deleted, not fixed.)
- `reports.can_approve()` tests `candidate_state != "unreviewed"`. Since
  `"unreviewed"` can never appear in the column, **this is vacuously true** — a
  report card can be approved with every single item still `pending`. That
  breaks the product's central promise ("the candidate approves what an employer
  sees") in the one function whose job is to enforce it.
- `reports.summarize().reviewed` counts every `pending` item as reviewed, so the
  UI would display "all reviewed" for a wholly unreviewed card.

W3 has the highest *cost of being wrong* on this page. W1 and W2 cost weeks; a
consent check that passes when it should fail costs the company.

**W4 — confidence is an average, and the band is not calibrated to anything.**
`avg_confidence` is a running mean of the judge's self-reported confidence.
Self-reported LLM confidence is not calibrated by construction, and averaging it
destroys the per-skill uncertainty that `sigma2` is already tracking. Worse,
`should_end_interview` uses `avg_confidence >= 0.7` as a *termination gate* — so
an over-confident judge ends interviews early, and the resulting report is
thinner precisely where the model was most wrong. `sigma2[skill] = 1 - confidence`
is a placeholder, not a variance.

**W5 — trait extraction as designed is per-*skill*, not per-*claim*.**
The AoT engine produces a `skill_vector` — numbers per skill. The report card
needs `ProposedItem(claim, band, quote, turn_id)` — a sentence with a verbatim
span behind it. **These are different data types.** No code converts one to the
other. This is why W2 was "deferred": the extraction step was never specified,
only the gate that would filter its output.

**W6 — `MIN_TURNS = 10` is an untested product assumption.**
15 turns of adaptive interviewing is plausibly 25–40 minutes. With zero completed
interviews there is no evidence anyone will finish. Drop-off at turn 6 would
invalidate the entire report-card design, and you would not currently know,
because no turn is ever persisted.

### What I would change

1. Delete the `fit` reference (W1). Four lines.
2. Delete `PATCH /v1/reports/items/{item_id}` and fix `can_approve` (W3).
3. **Write the extraction step** (W5/W2) as the thin thing it should be: after a
   session completes, for each turn, one LLM call returning
   `{claim, band, quote}` candidates; run them through the *existing*
   `gate_items` (verbatim substring check); insert via the *existing*
   `insert_gated_items`. Both halves already exist and are good. Only the middle
   is missing, and it is maybe 150 lines.
4. Connect `InterviewRoom` to `POST /v1/interviews` + `POST
   /v1/interviews/{id}/turns` (REST, not WebSocket — see §3).
5. Revive path (c) — the probe strategy — as the *policy* layer over the AoT
   engine, rather than leaving the better design dead on disk.
6. Replace `avg_confidence` termination with per-skill `sigma2` thresholds, and
   stop treating judge self-confidence as calibrated until the eval harness has
   real cases to calibrate it against (§4).

---

## 3. System architecture

### What exists

- **Frontend:** Next.js 16 on Vercel, 42 routes, deployed at placedon.com.
  Candidate surface (evidence, growth, matches, passport, report, workshop),
  employer surface (jobs, matches, pipeline, search, team), public surface
  (jobs, companies, trust/*).
- **Backend:** FastAPI on Render, 23 routers, 59 live paths, ~10.4k LOC.
- **Data:** Supabase Postgres, 32 tables, RLS enabled on every one.
- **Auth:** Supabase JWT, RLS-scoped clients throughout (`deps.AuthContext`).
  Service-role key deliberately avoided in candidate paths.
- **Encryption:** interview answers encrypted at rest (`crypto.encrypt_answer`,
  `bytea`), decrypted only for the owning candidate.
- **Telemetry:** `src/lib/track.ts` → PostgREST direct insert, anon-key, RLS
  policy requires `profile_id is null` so events cannot be forged against a real
  user. DNT honoured, opt-out from first commit, closed union of event names.
  This file is exemplary; it is the only reason §1 has any data at all.

### What is missing, and the user count at which each becomes necessary

| Missing piece | Needed at | Why that number |
|---|---|---|
| **Interview → backend wiring** | **1 user** | Nothing else on this table matters until this exists. It is the product. |
| **Evidence extraction step** (W2/W5) | **1 user** | Without it a completed interview produces an empty card. |
| **Session resume** | ~**5 users** | A 15-turn interview *will* be interrupted. Turns are already persisted with a `turn_index`, so resume is mostly a `GET /turns` + replay. Cheap now, painful later. |
| **Interview completion funnel events** | ~**5 users** | You need `interview_turn_completed` and `interview_abandoned` to learn W6 (do people finish?). Zero cost, highest information return. |
| **Job seeding (manual, by hand)** | ~**20 candidates** | Candidates who interview and see 0 matches churn. This is a *sales* task, not an engineering one — do not build a scraper. |
| **Background job queue** | ~**50 concurrent interviews** | Extraction is an LLM call chain; doing it inline in the finalize request will time out on Render. Until 50, a `BackgroundTask` is genuinely fine. |
| **LLM cost controls / rate limits per user** | ~**100 users** | 15 turns × (generate + judge) = ~30 LLM calls per interview. At 100 interviews/day this is the largest line item and the largest abuse surface. |
| **Caching / read replicas** | ~**1,000 users** | Not before. |
| **Vector index (pgvector, not a separate DB)** | ~**5,000 candidates** | Below this, brute-force cosine in Postgres is faster than the operational cost of a vector service. |
| **Sharding, multi-region, service split** | **Never, at any foreseeable number** | Explicitly out of scope. |

### One architectural decision to make now

**Use REST for the interview, not WebSocket.** The three WS routers
(`websocket_router`, `interviews_ws`, `interaction_router`) all instantiate
`LiveInterviewRuntime`, and all three inherit W1. Render's free/starter tiers
sleep and drop long-lived connections; a dropped WS mid-interview loses the
session. `POST /v1/interviews/{id}/turns` already exists, already persists, and
already encrypts. Ship REST turn-by-turn now; add WS later only if measured
latency demands it. *(This is a judgement, not a measurement — but the WS paths
are currently the only ones that can reach the crashing code.)*

---

## 4. The AI model plan

### How many labelled examples exist: **zero**

Measured. `report_card_items` = 0, so no trait has ever been extracted, so no
candidate has ever approved, contested or revised one. Querying `product_events`
for the label events (`trait_approved`, `trait_contested`, `trait_revised`, …)
returns nothing — the 12 rows are all pre-signup acquisition events. There are
also **no `.jsonl` files anywhere in the backend**, so `app/eval/dataset.py`'s
`load_cases` has nothing to load and the harness runs only on its built-in
offline fixtures.

The brief I was given states that approve/contest/revise transitions "are already
recorded to `product_events`." **That is architecturally true and empirically
false.** `evidence_router._emit()` does write a `trait_{to_state}` row on every
accepted transition, with a closed-enum `props` payload and no free text — it is
correctly built. It has simply never fired, because there has never been an item
to transition. The mechanism is ready; the input is absent.

### Therefore the recommendation is not a model

**Get the first fifty labelled examples.** Concretely, fifty requires:

1. §2's fix chain (W1 → W2/W5 → frontend wiring) so an interview produces items.
2. ~**8–10 completed interviews**, assuming ~6 extracted items each. That is a
   concierge exercise, not a growth exercise — recruit them personally, sit with
   the candidate, watch where they hesitate.
3. Each candidate reviewing every item through the *existing*
   `POST /v1/candidate/evidence/{item_id}/state`.

Fifty labels buys exactly one thing, and it is the right thing: a first
measurement of **band agreement** — how often the machine's `supported` /
`emerging` / `needs_more_evidence` matches the candidate's own judgement. That
number is the product's core quality metric and nobody currently knows it, even
approximately.

`app/eval/confidence.py` already flags an interval wider than 0.25 as too
imprecise to ship on. At n=50, expect roughly ±0.13 — informative, not
conclusive. Plan for **~200 labels** before acting on the number, which is ~35
interviews.

### The sequence, with honest gates

| Stage | Labels needed | What you may do |
|---|---|---|
| 0 — now | 0 | Fix the pipeline. Write no model code. |
| 1 | 50 | Measure band agreement. Report it with its CI. Change prompts, not architecture. |
| 2 | 200 | Calibrate band thresholds against real review. Turn on `app/calibration`. Populate the eval JSONL from `labeling.py` Stage B (the code path already exists). |
| 3 | 1,000 + real outcomes | Consider a learned band classifier. Not before. |

**What I would not do at any label count:** train anything that outputs a
per-person score, or use contest-rate as a candidate-quality feature. A candidate
who contests often is exercising the product's central promise, not revealing a
defect. Penalising it would quietly invert the whole thesis. `labeling.py`
already states this invariant — hold it.

**One genuinely underrated asset:** `revise` transitions store *both* the
original claim (`previous_claim`) and the candidate's correction
(`candidate_context`). That (wrong, corrected) pair is worth more than an
approve/reject bit, because it says *how* the machine was wrong. That is a small
supervised-rewriting dataset, and it accrues automatically once §2 is fixed. Nobody
appears to be planning to use it.

---

## 5. Upwork analysis

### What they genuinely do well

1. **Liquidity.** Both sides show up expecting to find the other. This is the
   whole business.
2. **Escrow and dispute resolution.** Boring, expensive, and the actual reason
   people trust an unknown counterparty enough to transact.
3. **Verified work history as reputation.** Their real data moat: outcomes, not
   claims. A profile is a ledger of completed contracts.
4. **A search experience tuned over a decade** against enormous query volume.
5. **Take-rate mechanics** that fund acquisition.

### What is actually copyable

Almost none of it. (1) cannot be copied — it must be built, one manual
introduction at a time. (2) and (5) are only meaningful once money changes hands
on the platform, which is a different business (see §5.3). (4) requires query
volume PlacedOn will not have for years.

The one honestly copyable idea is (3)'s *shape*: **reputation as an accumulating,
verifiable record rather than a self-authored claim.** PlacedOn's version is the
evidence report card — and unlike Upwork's, it does not require a completed
paid contract to exist. That is a real advantage: a candidate can have a
credible record on day one, having never worked through the platform.

**Their moat is liquidity, not technology.** No amount of agent architecture
substitutes for supply and demand being in the same place. Any plan whose
implicit theory is "we will beat Upwork with better AI" is wrong on the
mechanism.

### What PlacedOn can structurally do that Upwork cannot

Not "does not" — *cannot*, given their business model:

- **Interview once, control what is shared.** Upwork's incentive is maximum
  profile visibility to maximise transactions. Candidate-controlled redaction is
  directly against their take-rate. PlacedOn can make it the default.
- **Evidence with a quote behind every claim.** Upwork's reputation is
  outcome-based, so it is silent about anyone without platform history —
  structurally hostile to career-changers, returners, and first jobs. PlacedOn's
  evidence is generated, not accumulated, so it works on day one.
- **Contestability.** A candidate can dispute and correct what the machine says
  about them, with the original retained. No marketplace whose reputation system
  drives its ranking can allow the ranked party to edit their own record. PlacedOn
  can, because it does not rank people.
- **Permanent, portable employment.** Upwork is optimised for gigs; its whole
  apparatus (hourly trackers, milestones, escrow) exists to manage *delivery
  risk on discrete engagements*. That apparatus is irrelevant — and actively
  hostile — to a full-time hire.

### The blueprint assessment: Docker sandboxes, hourly trackers, PR-linked escrow, code-integrity analysis

**These describe a different company.** I want to be plain rather than diplomatic:

- **Hourly trackers** (screenshots, activity monitoring) presume you are billing
  for time on a delivered engagement. PlacedOn does not broker work; it brokers
  *hiring*. There are no hours to track. The feature also directly contradicts
  the surveillance-free stance already written into
  `app/process_evidence.py` ("never at their face, eyes, or keystroke timing").
- **Escrow tied to GitHub PRs** presumes money flowing per unit of delivered
  work. A hiring platform's transaction is a placement fee paid once, off-platform,
  after an offer. There is nothing to hold in escrow.
- **Docker sandboxes for candidate code** is the most defensible of the four, and
  still wrong *now*. It is weeks of infrastructure (isolation, resource limits,
  egress rules, abuse handling) to support a modality — write-and-run code — that
  the interview design deliberately de-emphasises in favour of speak-and-solve
  with an optional whiteboard. `Whiteboard.tsx` already exists. Revisit only if
  measured evidence shows candidates want to run code, which requires §7's first
  action to even become observable.
- **"Code integrity analysis"** is anti-cheat by surveillance. The codebase has
  already chosen a better answer and written it down:
  `interview_orchestrator.decide_next` makes unowned answers *earn no band* — a
  pasted answer simply cannot be defended through `self_explain` → `perturb`.
  That is anti-cheat by design, it is fairer, it requires no new infrastructure,
  and **it is currently dead code**. Reviving it beats building an integrity
  scanner.

Copying a competitor's delivery layer is not differentiation. The interview is.

**What I would build instead of all four:** the extraction step (W2/W5). It is
smaller than any of them, it is the only one on the critical path, and it is the
thing that makes the product exist.

---

## 6. Prioritised feature plan

Sizes are rough engineering estimates: **S** ≈ days, **M** ≈ 1–2 weeks,
**L** ≈ 3+ weeks.

### P0 — the critical path (nothing else counts until these ship)

**P0.1 — Fix the `fit` crash in `live_runtime.py`** · S (hours)
*What:* delete the two `fit.*` references in the terminating branch.
*Helps:* everyone. *Unblocks:* interview completion, at all.
*Needs first:* nothing.

**P0.2 — Fix the consent-state vocabulary** · S
*What:* delete `PATCH /v1/reports/items/{item_id}` (it cannot succeed and it
bypasses the state machine); correct `reports.CandidateState` to the seven real
states; fix `can_approve` to test `!= "pending"`; fix `summarize().reviewed`.
*Helps:* candidates. *Unblocks:* honest approval. *Needs first:* nothing.
*Cost of not doing it:* a report card approvable without review — the one failure
that damages the product's promise rather than its schedule.

**P0.3 — The evidence extraction step** · M
*What:* on finalize, per turn, one LLM call proposing `{claim, band, quote}`;
feed the existing `gate_items` → `insert_gated_items`. Card moves
`building` → `ready_for_review`.
*Helps:* candidates, and every downstream feature.
*Unblocks:* **literally everything else in this document** — report cards,
matching, growth, the entire AI plan.
*Needs first:* P0.1. *This is the highest-leverage item on the page.*

**P0.4 — Connect `InterviewRoom` to the backend** · M
*What:* `POST /v1/interviews` on consent, `POST /v1/interviews/{id}/turns` per
turn, `POST /finalize` at the end. REST, not WebSocket (§3).
*Helps:* candidates. *Unblocks:* every row count in §1.
*Needs first:* P0.1. Can proceed in parallel with P0.3.

**P0.5 — Interview funnel telemetry** · S
*What:* add `interview_turn_completed` (with `turn_index`),
`interview_abandoned`, `interview_finalized`, `trait_*` to the `ProductEvent`
union in `track.ts`.
*Helps:* the team. *Unblocks:* W6 — do people actually finish 10–15 turns?
*Needs first:* P0.4.

### P1 — for candidates (after P0)

**P1.1 — The review-and-approve flow, end to end** · M
The screen where a candidate sees each extracted trait with its quote and
approves / contests / revises it. `src/app/candidate/evidence/page.tsx` is
currently 12 lines. *Unblocks:* the training signal in §4. *Needs:* P0.3.

**P1.2 — Session resume** · S
Interrupted interviews currently vanish. Turns are already persisted with
`turn_index`; this is a `GET /turns` + replay. *Needs:* P0.4.

**P1.3 — Shareable evidence link (`/p/[handle]`)** · M
The candidate's answer to "why did I do this?" — a page they control, showing
only `shared` items, revocable. Route exists; the data does not. *Needs:* P1.1.

### P2 — for employers / HR

**P2.1 — Hand-seed 10 real jobs** · S — *and it is not an engineering task*
`/v1/jobs` is 12 endpoints serving 0 rows. The constraint is demand, not
software. *Needs:* someone to make ten phone calls.

**P2.2 — Manual introductions** · S
Run `intro_requests` by hand — a human reads the report, a human writes the
email. Do this for the first ~50 placements. It is how you learn what the
matching model should have said. *Needs:* P1.1 + P2.1.

**P2.3 — Employer view of an approved card** · M
Only `shared` items, strictly through `isVisibleToEmployers()`.
*Needs:* P1.1.

### P3 — for the AI's own training data

**P3.1 — Label extraction job** · S
`labeling.py` Stage A/B already specify this. Materialise reviewed items to the
JSONL that `eval/dataset.load_cases` wants. *Needs:* ~50 reviewed items.

**P3.2 — Band-agreement dashboard** · S
One number with its bootstrap CI, on `/v1/admin/eval` (the route exists).
*Needs:* P3.1.

**P3.3 — Mine `revise` pairs** · S
`(previous_claim, candidate_context)` as a rewriting dataset (§4).
*Needs:* ~100 revisions. Genuinely later.

### What I would NOT build

| Not building | Why |
|---|---|
| **Docker code sandboxes** | Weeks of infra for a modality the design de-emphasises. §5. |
| **Hourly trackers / activity monitoring** | Wrong business, and contradicts the written surveillance-free stance. §5. |
| **PR-linked escrow** | There is no on-platform transaction to escrow. §5. |
| **"Code integrity analysis"** | Already solved better by the dead probe loop. Revive that instead. §5. |
| **Agentic shortlisting / employer copilot tuning** | Requires matches that require evidence that does not exist. Starting here is the recurring error. |
| **Any ranking or recommendation model** | 0 labels. §4. |
| **A separate vector DB** | Not before ~5,000 candidates. §3. |
| **Job scraping / aggregation** | Fake supply produces fake matches and poisons the first real signal. Hand-seed instead. |
| **WebSocket interview transport** | Adds failure modes on Render; REST already persists correctly. §3. |
| **Anything on `/v1/jobs` beyond the existing 12 paths** | Most over-built surface in the system, 0 rows. |
| **Testimonials, logo walls, invented metrics** | Refused before. Still refused. |
| **A "match score" or overall candidate number** | Product commitment. Non-negotiable. |

---

## 7. The next 5 actions, in order

**1. This week — fix the crash and the consent check, then complete one interview
end to end, by hand.**
P0.1 + P0.2 are hours of work. Then drive one interview through the *backend*
with `curl` or a script — `POST /v1/interviews`, ten `POST /turns`,
`POST /finalize`. Do not touch the frontend yet. Success = `interview_sessions`
reads **1** and `interview_turns` reads **10**. That is the first non-zero row
count this product has ever had, and it is achievable in days.

**2. Write the extraction step (P0.3).**
Turn → `{claim, band, quote}` → existing gate → existing insert. Success =
`report_card_items` > 0. This is the moment PlacedOn becomes the product it
describes.

**3. Connect the frontend interview (P0.4 + P0.5).**
Delete the demo path. Ship the funnel events in the same change, so the very
first real user teaches you whether 15 turns is survivable (W6).

**4. Ship the review flow and run five concierge interviews (P1.1).**
Five real candidates, recruited personally, watched. Target ~30 reviewed traits.
Expect the extraction prompt to be wrong in ways no amount of design predicts —
that is the point of doing five before fifty.

**5. Hand-seed ten jobs and make the first manual introduction (P2.1 + P2.2).**
No matching algorithm. A human reads an approved card and writes an email. The
first placement made this way teaches you more about what to build than the next
ten thousand lines of backend.

---

### The honest summary

PlacedOn has built roughly eighteen months of infrastructure around an interview
that has never run. The fairness firewall, the consent state machine, the quote
grounding, the eval harness with bootstrap CIs — these are better than they need
to be, and they are all downstream of a pipeline with four breaks in it, three of
which are small.

The gap is not ambition, architecture, or AI. It is that
`src/components/interview/InterviewRoom.tsx` does not call the backend, and
`reports.insert_gated_items()` has no callers. Close those two and every number
in §1 starts moving.
