# Evidence Event Stream + Trait Approval — implementation plan

Written 2026-07-31. Everything in the "measured" sections was verified by running
it, not inferred. Start here rather than re-deriving it.

---

## What already exists (do not rebuild)

**Trait approval state machine — BUILT.** `src/lib/evidence/state.ts` on branch
`feat/design-system`. Seven states (`pending | reviewed | contested | revised |
private | approved | shared`), a guard table, a pure `transition()`, and
`isVisibleToEmployers()` returning true only for `shared`. 14 assertions pass.
There is a working review UI at `src/components/evidence/EvidenceReview.tsx` and
a route at `/candidate/evidence`. Local state only — no write endpoint.

This is item 2 of the priority list ("trait approval pipeline"). It needs
persistence, not design.

**Anonymous event capture — DB READY, NOT WIRED.** Migration
`product_events_allow_anonymous` is applied to Supabase project
`nfmttckzsbcxzhusczck`. `product_events` now has:

    id uuid pk · profile_id uuid NULL · anon_id text · event text
    props jsonb · path text · created_at timestamptz
    check (profile_id is not null or anon_id is not null)
    index (event, created_at desc) · index (anon_id) where anon_id is not null

RLS verified by running both cases in a rolled-back transaction:
- anon inserting its own funnel event → **succeeds**
- anon inserting with someone else's `profile_id` → **`42501` refused**

`anon` has INSERT only. There is deliberately **no** anon SELECT policy —
writing your own events is safe, reading everyone's is a leak.

**Why it was 0 rows before:** `profile_id` was `NOT NULL`, and every acquisition
event happens before signup. The table was structurally incapable of holding its
own input. That is the whole reason the "collect training data" plan had nothing
to collect.

---

## Measured state of the data (2026-07-31)

    product_events        0        demo_requests         0
    interview_sessions    0        interview_turns       0
    jobs                  0        companies             0
    matches               0        audit_events          0

Non-zero tables are seeded reference data only:
`role_requirements` 9 · `taxonomy_skills` 6 · `profiles` 5 · `learning_catalog` 4

**No analytics exists in the frontend.** No GA, PostHog, Mixpanel, Segment,
Plausible or `@vercel/analytics`. No `track()` helper. Nothing writes to
`product_events`.

Consequence for the agent plan: the ICP Agent has no customers to profile, the
Analytics Agent has no conversions to measure, and any recommender has no clicks
to train on. A loop whose step 4 is `wait_for_user_data()` will hang forever, or
worse, invent a number. **Instrumentation is the only unblocked step.**

---

## Step 1 — the `track()` helper (next task, ~1 session)

Smallest thing that makes the loop's feedback step real.

    src/lib/track.ts

- `anon_id`: `crypto.randomUUID()` stored in `localStorage` under `pl_anon`.
  Generate once, reuse. This is what stitches a pre-signup funnel together.
- POST directly to Supabase REST (`/rest/v1/product_events`) with the anon key.
  That key is already public in the bundle; RLS is the control, not secrecy.
- Fire-and-forget: `keepalive: true`, never await, never block a click, never
  throw into the UI. A failed analytics write must not break a CTA.
- Respect Do-Not-Track and a `pl_no_track` localStorage flag. Ship this from the
  first commit, not later — retrofitting consent is how teams end up with data
  they cannot legally use.

Five calls, in this order (they are the funnel that exists today):

    landing_view        path
    cta_fork_selected   { side: "hire" | "work" }
    quick_chip_clicked  { label }
    search_submitted    { side, has_text }
    pre_interview_start —

**Definition of done:** click through the funnel on production, then
`select event, count(*) from product_events group by 1` returns five non-zero
rows. Verify by querying, not by reading the code.

---

## Step 2 — persist the trait state machine

The state machine is pure and tested; it just has nowhere to write.

- `POST /v1/candidate/evidence/{trait_id}/state` taking an action from the
  existing `EvidenceAction` union.
- Server re-runs `transition()` server-side. **Never trust a client-supplied
  next state** — the guard table is the security boundary, not a UI hint.
- Write a row to `product_events` per transition:
  `trait_reviewed`, `trait_contested`, `trait_revised`, `trait_approved`,
  `trait_shared`. These are the supervised labels; the transition IS the label.
- `revised` must preserve `previous` (already in the type) — the original signal
  plus the candidate's correction is worth more than either alone.

---

## Step 3 — evidence → outcome linking

The highest-value training target, and it needs steps 1–2 first.

Join `ExtractedTrait → TraitApproval → IntroRequest → RoleOutcome` so you can ask
"which approved traits preceded a positive outcome". Until an intro or a hire
exists in the database, this table has nothing to join, so do not start it early.

---

## Hard constraints (from earlier decisions in this project)

- **Never a bare overall candidate score.** `docs/FAIR-ASSESSMENT-MODEL-PLAN.md`
  forbids ranking a person on one number.
- **No demographic proxies** — school, name, photo, age, gender — as model
  inputs or as features derived from events.
- **Never export a raw transcript.** Candidate-approved evidence snippets only.
- **Consent-gated.** Only `shared` traits may leave the system. The state machine
  already enforces this via `isVisibleToEmployers()`; the export endpoint must
  reuse that function rather than re-implementing the check.

---

## Sequencing note

The pasted plan's Phase 1 is "add event logging, add trait state machine, add
consent tracking". Two of those three are done or DB-ready. The gap is
persistence and the `track()` helper — both small, both verifiable by query.

Do not start the multi-agent marketing loop until step 1 lands. Every agent in
that design reads from `product_events`.
