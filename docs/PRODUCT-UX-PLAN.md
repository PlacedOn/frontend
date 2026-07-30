# PlacedOn — Product UX Plan

**Status:** Plan. Nothing built.
**Date:** 2026-07-30
**Scope:** the two journeys that make or break the product. Not the homepage.

---

## 0. The mistake this plan corrects

Six redesigns went into the marketing homepage. Zero went into the thing that
decides whether PlacedOn works: **can a candidate find a job, and can an
employer find a person, quickly.**

Audited on the current tree:

```
src/app/employer/jobs/new           employer creates a role
src/app/employer/jobs/[id]/matches  employer sees candidates
src/app/employer/jobs/[id]/pipeline employer moves candidates
src/app/employer/search             employer searches CANDIDATES

candidate-facing job search:        DOES NOT EXIST
candidate-facing job browse:        DOES NOT EXIST
```

**A candidate cannot see a single job on this product.** There is no route.

And the hero search I shipped makes it worse: the "I'm looking for work" tab
routes to `/pre-interview`. A job seeker types what they want and is sent to a
22-minute interview before being shown one role. That is asking for the sale
before showing the product.

Everything below follows from fixing that.

---

## 1. What PlacedOn actually promises

> Take one honest interview. Get matched to roles you're genuinely right for,
> without applying to a hundred places.

That promise has a specific consequence for design, and it is the whole thing:

**The interview is the product's cost to the candidate, and its value to the
employer.** Every design decision is about lowering that cost and proving that
value.

### The asymmetry that makes this work

| | Traditional | PlacedOn |
|---|---|---|
| Candidate effort | apply 100×, tailor CV each time | **interview once** |
| Employer wait | post → wait → screen → phone screen | **candidates are pre-interviewed** |
| Time to shortlist | 2–4 weeks | **minutes** |

The employer side is fast *because* the candidate did the work once. That is the
product. The UX has to make both halves of that legible.

---

## 2. Questioning my own solution

Asked to critique what I built, honestly:

| What I built | Verdict |
|---|---|
| Six-section marketing homepage | **Wrong priority.** It is a brochure for a product nobody can use. It matters, but it is maybe 5% of the value and it got 100% of the effort. |
| Search hero, "I'm looking for work" → `/pre-interview` | **Actively wrong.** Sends a job seeker to an interview before showing a job. Backwards. |
| Search hero, "I want to hire" → `/employer/jobs/new` | **Right.** An employer describing a role *is* creating one. |
| Design tokens + 10 primitives | **Keep.** This is the only work that survives unchanged — it is what makes every screen below cheap to build. |
| Dark inset hero card | **Keep as a pattern**, but it belongs on marketing pages, not product surfaces. Product needs light, dense, fast. |
| Deleting the fake testimonial and the borrowed logos | **Right.** Do not walk that back. |

The primitives were the right instinct applied to the wrong surface. They should
have been built for the dashboard first, where density and consistency actually
determine whether someone can work.

---

## 3. The candidate journey

### 3.1 The core insight

A cold candidate will not spend 22 minutes on a promise. They will spend 30
seconds deciding whether this place has jobs worth their time.

So the order is: **jobs first to earn the interview, interview-first forever
after.**

```
   Land → See real roles → Find one worth wanting → "To be considered,
   take one 22-min interview" → Interview → Matched to THAT role and
   every other role → Intro → Hired
                                    │
                                    └── from here on, never apply again
```

The interview is asked for at the moment of desire, not before it.

### 3.2 The route that does not exist and must

**`/jobs`** — candidate-facing role discovery. This is the single most important
missing surface in the product.

```
┌──────────────────────────────────────────────────────────────┐
│  Search: "backend engineer"          [Remote ▾] [Full-time ▾] │
│  ──────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Backend Engineer            GrowthCart · Bengaluru      │  │
│  │ ₹28–42L · Hybrid · Posted 2 days ago                    │  │
│  │                                                          │  │
│  │ What they're actually looking for:                      │  │
│  │ • Systems thinking under load                           │  │
│  │ • Owns problems end to end                              │  │
│  │                                          [See the role] │  │
│  └────────────────────────────────────────────────────────┘  │
│  … more roles …                                              │
└──────────────────────────────────────────────────────────────┘
```

**What makes this different from every job board:** it does not show a wall of
requirements. It shows *what the role actually needs* — the role-DNA signals the
employer defined. A candidate can tell in five seconds whether they are right for
it, which is the thing job boards are worst at.

**Route:** `/jobs`, `/jobs/[id]`. Public — no login to browse. Login only to act.

### 3.3 Speed targets, measured

| Step | Target | Why it matters |
|---|---|---|
| Land → first relevant role visible | **< 5s** | if they scroll and see nothing relevant, they leave |
| Role → understand fit | **< 15s** | role-DNA signals, not a requirements wall |
| Decide → interview started | **< 60s** | consent + mic check, nothing else |
| Interview | **22 min** | the one real cost |
| Interview end → first matches | **< 30s** | must feel instant or the promise breaks |
| Match → intro requested | **1 tap** | |

**The critical number is interview-end → matches.** If a candidate finishes and
sees a spinner or an empty page, the entire value proposition collapses in the
one moment it has to land. This is the highest-stakes screen in the product and
it currently does not exist with real data.

### 3.4 Screens, in journey order

| # | Route | Job | State today |
|---|---|---|---|
| 1 | `/jobs` | browse real roles, no login | **missing entirely** |
| 2 | `/jobs/[id]` | one role, what it needs, apply CTA | **missing entirely** |
| 3 | `/pre-interview` | consent, mic check, what to expect | exists |
| 4 | `/interview` | the conversation | exists, WS wired |
| 5 | **`/interview/complete`** | "here's what we heard" + first matches | **missing — the highest-stakes screen** |
| 6 | `/candidate` | home: matches, applications, next action | exists, mock |
| 7 | `/candidate/matches` | ranked roles with reasons | exists, mock |
| 8 | `/candidate/report/[id]` | own evidence report | exists, mock |
| 9 | `/intros` | employer wants to talk | exists, mock |

Two missing screens, and one of them is the moment the product either proves
itself or doesn't.

### 3.5 Interview reconnect — the harm that exists today

A candidate drops connection at minute 18 of 22. Today the frontend sets an
error state and the answer is gone. The backend already supports reconnect and
idempotency; only the UI is missing.

This is the cruellest bug in the product. It wastes eighteen minutes of a real
person's effort, and they will not come back. Autosave the in-flight answer to
`localStorage` on every keystroke, show a reconnect banner, restore on
reconnect.

---

## 4. The employer journey

### 4.1 The core insight

The employer's "wow" is opening a role and finding candidates **already
interviewed**. No screening backlog, no phone screens. That moment has to be
immediate and it has to be obviously evidence-backed, or it reads as another
resume database with extra steps.

```
   Describe the role → Role DNA generated → Candidates who already
   interviewed appear, ranked with reasons → Read the evidence →
   Request intro → Candidate accepts → Talk
```

### 4.2 Speed targets

| Step | Target |
|---|---|
| Describe role → role live | **< 5 min** |
| Role live → first ranked candidates | **instant** — they are already interviewed |
| Candidate card → why they ranked | **1 click**, no page load |
| Decide → intro sent | **1 tap** |

### 4.3 The screen that carries the product

**`/employer/jobs/[id]/matches`** — this is where an employer decides whether
PlacedOn is real.

Each candidate row must answer three things without a page load:

1. **Why is this person here?** — the matched role-DNA signals
2. **What is the evidence?** — the transcript moment behind each signal
3. **How confident is this?** — a band with its counts, never a bare score

Evidence opens in a **drawer, not a new page.** Comparing four candidates means
opening and closing four times; a route change per candidate makes that
unusable. This is the single most important interaction in the employer product.

### 4.4 What must never appear

- A single overall "candidate score" — the fairness model forbids ranking people
  on one number, and it is the thing that gets hiring tools sued
- Any demographic proxy — school tier, name, photo, age, gender
- A raw transcript — the candidate approved specific evidence, not everything

These are product constraints, not style preferences. They are in
`docs/FAIR-ASSESSMENT-MODEL-PLAN.md` and the UI has to enforce them.

---

## 5. What "feels advanced" actually means here

Not animation. Not 3D. Three things:

**1. It knows why.** Every match shows its reasoning. "Ranked 2nd" is a database.
"Ranked 2nd because they described debugging a cascading failure under load,
which is your top signal" is intelligence. The reasoning is already computed —
`layer5/scorer.py` produces it — it just is not surfaced.

**2. It is fast where it matters.** Instant matches after the interview. Instant
candidates after posting. Everything else can take a beat.

**3. It admits what it does not know.** "Not enough data yet" beside a confidence
band reads as more advanced than a confident wrong number, because it shows the
system is calibrated. `TeamOperate` already does this and it is the most
credible thing on the site.

Advanced is *legible reasoning*, not motion.

---

## 6. System architecture

### 6.1 The blocking chain

Each of these blocks everything below it. This is why no design work has felt
real.

```
1. SESSION      dashboard renders logged-out; authFetch throws at v1.ts:650
                before any request is made.  → 0 network calls, ever
2. DATA         jobs 0 · companies 0 · matches 0 · interview_sessions 0
                → even authenticated, every screen renders empty
3. WRITES       no endpoint for save / pass / mark-done / request-intro
                → every dashboard control is local state that resets on reload
4. SURFACE      no /jobs route → candidates cannot enter the funnel at all
```

Fixing 4 without 1–3 gives a job board with no jobs. The order matters.

### 6.2 Data flow the UI depends on

```
  employer describes role
        └─► POST /v1/jobs  ──► role_dna/generate ──► role_requirements
                                                          │
  candidate interviews                                    │
        └─► WS /ws/{id} ──► interview_turns ──► layer2 (SBERT capability)
                                                   │
                                                   ▼
                                            layer5 aggregate + score
                                                   │
                                    matching_router  ◄──┘
                                                   │
                            ┌──────────────────────┴────────────────────┐
                            ▼                                          ▼
              /candidate/matches (their view)        /employer/jobs/[id]/matches
```

Every box exists in the backend. The joins between them are what is not wired.

### 6.3 Endpoints the UI implies but does not have

| Action in UI | Endpoint | Exists |
|---|---|---|
| Browse jobs (candidate) | `GET /v1/jobs/public` | **no** |
| Save a candidate | `POST /v1/jobs/{id}/matches/{cid}/save` | **no** |
| Pass on a candidate | `POST …/pass` | **no** |
| Mark queue item done | `POST /v1/employer/actions/{id}/done` | **no** |
| Express interest in a role | `POST /v1/candidate/matches/{id}/interest` | **no** |

Five endpoints. Each turns a fake control into a real one.

---

## 7. Build order

Sequenced so every step produces something a real person can use.

### Phase 1 — make one thing real *(no new UI)*
1. Merge the LLM spend ceiling (PR open — live financial exposure)
2. Verify a session reaches the dashboard; fix `authFetch` if Render points at the wrong Supabase project
3. Seed: 1 company, 3 roles with real role-DNA, 5 interviewed candidates

**Done when:** `/employer` shows real numbers from the API, not `SAMPLE`.

### Phase 2 — the missing candidate entrance
4. `GET /v1/jobs/public` + `/jobs` and `/jobs/[id]`
5. Rewire the hero's "I'm looking for work" to `/jobs?q=`, **not** `/pre-interview`

**Done when:** a stranger can find a relevant role in under 5 seconds without logging in.

### Phase 3 — the highest-stakes screen
6. `/interview/complete` — what we heard, plus first matches, inside 30s
7. Interview reconnect + autosave

**Done when:** finishing an interview immediately shows matched roles.

### Phase 4 — make the employer side act
8. The five write endpoints
9. Evidence drawer on `/employer/jobs/[id]/matches` — no page load
10. Retire `src/lib/mock/` (9 modules)

**Done when:** save / pass / intro persist across reload.

### Phase 5 — polish, using the primitives already built
11. Apply tokens + primitives to product surfaces (dashboard first, marketing last)
12. Six-section marketing homepage from `FRONTEND-REBUILD-SPEC.md`

Marketing is **last**, deliberately. It is the only part that does not block
anyone.

---

## 8. How we will know it worked

Not "does it look good". These:

| Question | Measure |
|---|---|
| Can a stranger find a relevant job? | time from `/jobs` to opening a role, target < 30s |
| Is the interview worth taking? | % who start an interview after viewing a role |
| Does the promise land? | % who see matches within 30s of finishing |
| Is the employer side credible? | time from role posted to first intro requested |
| Do people finish? | interview completion rate; drop-off by minute |

Instrument these before optimising anything. Right now nothing is measured —
the analytics loop is the only row still at L0 in `V1-closed-loop-plan.md`.

---

## 9. Open questions I cannot answer for you

1. **Is PlacedOn jobs-first or interview-first for a cold candidate?** This plan
   argues jobs-first to earn the interview. If you believe the interview should
   come first, `/jobs` changes from a browse surface to a teaser and the whole
   funnel changes shape.
2. **Do candidates apply to specific roles, or only get matched?** The schema has
   both `applications` and `matches`. Two different products.
3. **Can an employer see a candidate before an intro is accepted?** Fairness
   posture says approved evidence only. Confirm the boundary.
4. **Real data for the seed** — synthetic demo tenant, or hold for the 5-user
   concierge test in `VALIDATION-KIT.md`? The plan assumes synthetic so the
   product can be exercised.
