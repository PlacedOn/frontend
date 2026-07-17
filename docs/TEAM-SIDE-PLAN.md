# PlacedOn — Team (Employer) Side: Plan & Approach

You asked how the team makes an account, how their dashboard looks, how they post a role,
how they "prompt their need" and the AI searches — and for a detailed plan and approach. The
key finding: **most of the team side is already built.** So this plan *extends* what exists,
fixes one real problem, and fills the true gaps (onboarding + surfacing the search).

---

## 0. What already exists (so we don't rebuild it)

- **Org model + RLS** (`0001`): `companies`, `organization_members` (auth user ↔ company),
  `jobs`, `role_dna_signals`, `job_reality_cards`. Everything is scoped by `is_org_member`.
- **Dashboard**: `EmployerDashboard` (live RLS board / labeled sample), roles grid, evidence
  pipeline with save/pass/undo.
- **Post a role**: `JobSetup` = **Role DNA** (success signals / must-haves / nice-to-haves) +
  **Reality Card** (comp, mode, location, response SLA).
- **Prompt-your-need search**: the **Copilot** — `copilot.py` + `/employer/search`. A
  deterministic policy gate **refuses** protected-class criteria and **strips** pedigree
  proxies, then returns **citation-backed** candidates. This is the AI-search feature, and it's
  already fairness-gated.
- **Report + matches + consented intros**: candidate report pages, `MatchList`, the intro flow.

---

## 1. Fix first: the employer report still shows "scores"

`ScoreBreakdown` and "scores" copy in the report **predate and contradict** our locked
no-person-score rule. **Job #1:** replace the blended score with **evidence bands**
(Supported / Emerging / Needs-more-evidence), each linked to a quoted transcript moment — the
same model the candidate side already uses. This is correctness, not polish; ship it before
anything new.

---

## 2. How the team makes an account (the real gap)

The DB supports orgs; the UI onboarding flow is thin. Approach — **get to first value fast**:

1. **Sign up** with a work email (verify domain → helps auto-group teammates later).
2. **Create the company** → a `companies` row + insert the creator into `organization_members`
   as **owner** (via a `create_org` RPC so RLS stays airtight — never the service-role key).
3. **Guided first role** in the same flow (title + Reality Card + a generated Role DNA draft) so
   they leave onboarding with a live role, not an empty dashboard.
4. **Invite teammates** with **roles**: `owner` / `recruiter` / `hiring_manager` (add a `role`
   column to `organization_members`; gate write actions by role).

---

## 3. How the dashboard looks — the command center

One RLS-scoped board (unify the live/mock split) with four zones:

- **Your roles** — status (draft/active/paused), match counts, quick "review candidates".
- **Describe who you need** — a prominent search bar that opens the Copilot (§5). This is the
  primary action, not buried.
- **Evidence pipeline** — candidate cards (bands + quoted evidence, **no score**), save / pass /
  request-intro.
- **Introductions** — the consented conversations inbox (the only place contact happens).
- A quiet **fairness strip**: "protected-class filters are refused; pedigree is ignored" — trust,
  stated.

Design stays on the existing system (iris/glass, motion, the candidate-side language).

---

## 4. How they post / update a role opening

Extend `JobSetup`:
- **Reality Card** (honest job facts: comp range, work mode, location, response SLA).
- **Role DNA** signals — and make **"Generate signals from a description"** real: HR pastes a
  plain-language role description → an LLM (constrained, schema-bound) proposes Role DNA signals
  → **human edits/approves**. The generator is firewalled: it can never emit pedigree/protected
  signals (college tier, "IIT", age, gender…).
- **Activate** → role goes live, matching runs against **verified evidence**.
- Status controls: pause / close / duplicate.

---

## 5. The "prompt your need → AI searches" model (the core AI piece)

This is the Copilot. The approach is **LLM-as-a-constrained-component behind a deterministic
gate** — the AI never decides who's hireable; it explains fit by evidence.

```
HR types a plain-language need
   │  "senior backend eng who's debugged payments at scale, remote, ships fast"
   ▼
1. POLICY GATE (deterministic, BUILT)
     • REFUSE protected-class criteria (gender/caste/religion/age…) — search blocked, category named
     • STRIP pedigree/prestige proxies (IIT / tier-1 / "top college") — HR sees what was removed & why
   ▼
2. PARSE to criteria (LLM seam; KeywordCriteriaParser now → embeddings later)
     • role signals · skills · seniority · work-mode  (never demographics)
   ▼
3. MATCH against VERIFIED EVIDENCE (Card B), not résumés
     • rank by how much of the stated need the candidate's evidence COVERS
     • every result CITED to the quoted moment + the gaps  ·  NO person-score, NO blended rank
   ▼
4. RESULT → candidate evidence card → CONSENTED INTRO  (never direct contact / cold outreach)
```

**How it "gets better":** upgrade the parser/match from keyword → **sentence-embeddings +
pgvector** (semantic need→evidence match), and feed the **calibration/active-learning loop** —
all staged and run through the adverse-impact gate. Never a learned hire-predictor.

---

## 6. Team roles, seats & audit

`owner` (billing, invites, delete) · `recruiter` (post roles, search, request intros) ·
`hiring_manager` (review evidence, decide). Every search + intro is logged (auditable), which is
also what feeds the fairness monitor.

---

## 7. Guardrails (non-negotiable, same as everywhere)

No protected-class filtering (refused) · no pedigree (stripped) · **evidence, not résumés** ·
**no person-score / blended rank** shown to employers · contact **only** via consented intros ·
org RLS is the source of truth, `/v1` uses anon key + JWT (never service-role) · **a human
decides** — the AI informs.

---

## 8. Build order

| Phase | What |
|---|---|
| **P1** | **Reconcile the employer report: scores → evidence bands** (correctness; do first) |
| **P2** | Employer onboarding: `create_org` RPC + roles + invite + guided first role; unify the dashboard |
| **P3** | Role posting: real Role-DNA generation from a description (firewalled), status controls |
| **P4** | Surface the Copilot search prominently; wire results → evidence card → consented intro |
| **P5** | Semantic search upgrade (pgvector) + calibration loop, fairness-gated |

---

## 9. My recommendation

Start with **P1** (fix the score contradiction — it's a real integrity issue in shipped code)
and **P2** (onboarding — the genuine gap: today there's no clean "create your company" flow).
Everything else (search, role posting, report) largely exists and needs surfacing + polish, not
invention. The team side is closer to done than it looks — the work is *onboarding + honesty
(bands not scores) + making the fairness-gated search the front door.*
