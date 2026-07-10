# PlacedOn — Interview Experience & Shareable HCV Report — Redesign Plan (v1)

**Goal:** redesign the *product* UI/UX (not marketing pages) — the **interview
session** and the **shareable candidate report** — to RemoteStar-grade polish,
executed better, built on our real differentiators. Reference share link:
`share.remotestar.io/interview?interviewId=…` (a portable, public interview report).

**This is the plan (iteration 1 of the loop).** Nothing built yet. Build order in §9.

---

## 0. Why this doc exists

We shipped `/candidates` + `/companies` (marketing) and wired the backend live —
but the **actual product surfaces** (interview, profile/report) were untouched,
so it *looks* unchanged where it matters. This plan fixes that: it redesigns the
three surfaces a RemoteStar share link shows off, and it does it around data the
backend **already produces**.

---

## 1. RemoteStar share page — teardown

The share link is a **public, portable interview report** (client-rendered SPA).
Structure (from the page + our earlier teardown):

| Zone | RemoteStar |
|------|-----------|
| Header | Candidate name, role (e.g. "Andrzej Kozak · Senior Android Developer"), RemoteStar brand |
| Hero verdict | Overall recommendation + headline score |
| Media | **Video of the candidate** answering (their core format) |
| Competencies | Technical + Communication + Role-fit, each a score/bar |
| AI summary | Prose summary of strengths/risks |
| Skills detail | Per-skill ratings |
| CTA | "Contact / shortlist this candidate" (recruiter-facing) |

**Their model:** *the recruiter is the audience; the candidate is on display.*
Video + flat scores. Portable = a video link.

## 2. The comparison → our design principles

From your table — every row is a design instruction, not just a difference:

| Axis | RemoteStar | PlacedOn | UI/UX consequence |
|------|-----------|----------|-------------------|
| Interview format | Video (on camera) | **Text-first (Yr 1)** | Design a calm, low-pressure, low-bandwidth **text session** as a *feature* (tier-2/3 India, any device), not an apology. No webcam anxiety. |
| Assessment | tech + comms + role-fit | **HCV** (behavioral + cognitive, → 64-dim) | Show a **multi-dimensional fingerprint**, not 3 bars. |
| Scoring depth | video report + scorecard | **Kalman-calibrated confidence per skill** | The signature: each score carries a **confidence band** (score ± uncertainty). We show *how sure we are* — RemoteStar can't. |
| Focus | global remote tech | **India-first, tier-2/3 students** | Language clarity, mobile-first, low data, accessible; aspirational-but-honest sample data. |
| Portable profile | video link | **HCV vector** | A shareable **HCV report page** = our share link, candidate-controlled. |
| Control | recruiter sees all | **candidate approves + vetoes** | The public report shows only approved dimensions; raw transcript sealed. |

**North-star:** *RemoteStar shows a recruiter a video. PlacedOn hands the candidate a
calibrated, evidence-backed fingerprint they own and control.*

## 3. What the backend already gives us (the underused goldmine)

`GET /demo/hcv` (verified live today) returns, per dimension:

```
{ id, dimension, label, score (0–100),
  confidence (0–1), uncertainty (0–1),
  evidence_snippets: [ "candidate's own words…" ] }
+ summary, embedding_metadata { model: all-MiniLM-L6-v2, dimension_count: 384 }
```

4 dimensions today: **Frontend execution (86, conf .86, unc .14)**, **Ownership
under ambiguity (82/.81/.19)**, **Collaborative clarity (88/.89/.11)**, **Learning
velocity (79/.76/.24)**. (384 = SBERT embedding dim; "64-dim HCV" is the roadmap —
same shape, more dimensions.)

**Gap:** `TrustPassport.tsx` reads `@/lib/mock/profile` and renders a *categorical*
pill (`review`/ok), **ignoring `confidence`/`uncertainty` entirely.** The
differentiator is computed and discarded. Fix #1 is to wire the UI to this data.

Interview: `WS /ws/{id}` (verified live) — streams questions, accepts answers,
adapts. Redesign is UI-only over the existing `useInterviewSession` hook.

## 4. The three surfaces we redesign

| Surface | Route | Audience | RemoteStar analog |
|---------|-------|----------|-------------------|
| **A. Interview session** | `/interview` | candidate | the interview being taken |
| **B. HCV Report / Trust Passport** | `/candidate/profile` | candidate (review + approve) | the private scorecard |
| **C. Public shareable profile** | `/p/[token]` *(new)* | employer / anyone with link | **the share link** |

## 5. Signature UI concepts (what makes us look better *and* different)

1. **The Confidence Band** — the hero interaction. Each skill renders as a score
   with a **calibrated band** (e.g. `86` with a shaded interval ±uncertainty).
   Tight band = high confidence; wide = "still forming." Honest, novel, defensible.
   RemoteStar shows a flat number; we show a *calibrated estimate*.
2. **HCV Vector Fingerprint** — a radar/spider (4 → 64 dims) rendering the whole
   vector as a recognizable "shape." This *is* the portable HCV, made visual.
3. **Evidence-on-tap** — every dimension expands to the candidate's own quote
   (`evidence_snippets`). Proof, not assertion.
4. **Candidate veto** — on the public report, per-dimension visibility toggles;
   raw transcript never present. Trust as a design element.
5. **Calm text session** — the interview as a focused, one-question-at-a-time
   conversation with a live "thinking" presence, progress, and a supportive tone.

## 6. UI/UX spec per surface (Frost Luxe: glass on porcelain, iris #6922F5)

### A. Interview session (`/interview`) — "the calm assessment"
- **Layout:** centered single-column conversation, max ~720px. Left rail (desktop)
  = progress: dimensions being assessed lighting up as evidence accrues.
- **Top bar:** live interviewer presence (pulse + "listening"), elapsed / est.
  remaining, "pause" + accommodations.
- **Question card:** large, calm typography; streaming tokens with a caret; one
  question at a time. Answer composer with Enter-to-send, character breathing room.
- **After each answer:** a subtle "signal captured" micro-moment — a dimension chip
  ticks up (ties the session to the fingerprint being built).
- **End:** graceful wrap → "Building your HCV…" transition into surface B.
- **Motion:** compositor-only, reduced-motion gated. Reuse `useInterviewSession`.
- **Mobile-first:** full-width, big tap targets, low-data (no video).

### B. HCV Report / Trust Passport (`/candidate/profile`) — "review & approve"
- **Header:** candidate, target role, "Verified via interview" seal, overall
  summary label.
- **The Fingerprint:** HCV radar (hero), animated draw-in.
- **Confidence Bands list:** each dimension → label · score · **confidence band** ·
  evidence quote · **visibility toggle** · "contest" affordance.
- **Strength + readiness:** overall calibrated readiness, "what would raise it."
- **Approve & publish** seal → mints the public link (surface C).
- Wire to `DemoHcvResponse` (score/confidence/uncertainty/evidence) — retire the
  categorical pill.

### C. Public shareable profile (`/p/[token]`) — "the portable HCV" *(new route)*
- **Our share link.** Clean, credible, employer-readable, **no dashboard chrome**.
- **Header:** name, role, location, "Verified via PlacedOn interview" + date.
- **Verdict + Fingerprint:** overall calibrated readiness + HCV radar.
- **Confidence Bands:** only candidate-approved dimensions; each with evidence.
- **Trust footer:** "Bias-audited · LL144 / EU AI Act · candidate-approved · raw
  transcript never shared" + "how scoring works" link.
- **Employer CTA:** "Request an intro" (opt-in, mutual).
- **Meta:** OG image = the fingerprint + name (shareable preview).
- **Honesty:** clearly-labeled sample until real; no invented numbers.

## 7. System design + backend integration

```
Interview:   Browser ⇄ WS /ws/{id}  (live now) ──▶ Redis session + SBERT + templates
Report (B):  Browser → GET /demo/hcv (live now) ──▶ score/confidence/uncertainty/evidence
Public (C):  Browser → GET /profile/{token}  (NEW) ──▶ approved HCV subset only
Intro CTA:   Browser → POST /api/intro-request → Supabase (opt-in leads)
```

- **B is a pure frontend rewire** — data already exists. No backend change.
- **C needs a share mechanism.** Two-phase:
  - *Demo/v1:* `/p/[slug]` renders `/demo/hcv` (or a static approved snapshot) — ships
    now, no backend change, gives a real shareable-looking link.
  - *Real:* backend `POST /profile/publish` → returns a `share_token`; `GET
    /profile/{token}` returns only approved dimensions; Supabase stores token↔candidate
    + visibility choices (RLS). Raw transcript never in the payload (security invariant).
- **Security invariants (unchanged):** employer never sees raw transcript; public
  payload contains only approved dimensions; no PII/keys client-side; share tokens
  are unguessable + revocable.

## 8. Backend gaps to close (small, well-scoped)

1. **(none for B)** — wire frontend to existing `/demo/hcv`.
2. **Public report contract** — add `GET /profile/{token}` returning `{ candidate,
   role, verified_at, summary, dimensions[approved], trust_meta }` (no transcript).
3. **Publish + token** — `POST /profile/publish` (approved dimension ids →
   token); store in Supabase with RLS + revoke.
4. **Intro request** — `POST /api/intro-request` (Next route → Supabase), opt-in.
5. *(Backend content, separate)* — humanize live question wording (currently
   "block_4_grit…"); frontend renders whatever WS sends.

## 9. Build loop (phased — each phase: build → screenshot 375/1440 → fix → deploy)

- **Phase 1 — Confidence Band + Fingerprint components** (design system pieces):
  `ConfidenceBand`, `HcvRadar`, `EvidenceRow`. Storybook-style test page.
- **Phase 2 — Surface B rewire** (`/candidate/profile`): use real `/demo/hcv`,
  drop categorical pill, add fingerprint + bands + approve.
- **Phase 3 — Surface C** (`/p/[slug]`, new): public report from approved HCV +
  OG image + intro CTA. (Demo-token first.)
- **Phase 4 — Surface A** (`/interview` redesign): calm session + live fingerprint
  build, over existing `useInterviewSession`.
- **Phase 5 — Backend contracts** (publish/token/intro) → flip C to real tokens.
- **Phase 6 — Polish:** motion, a11y, mobile, Lighthouse; label/replace samples.

## 10. Open decisions (for you)

1. **Fingerprint shape:** radar/spider vs horizontal "bands stack" vs both
   (radar hero + bands below). *Recommend: both.*
2. **Public link style:** ultra-minimal (credibility) vs rich (marketing-y).
   *Recommend: minimal, employer-trust first.*
3. **Build first:** Surface B (report — highest visible payoff, no backend work) vs
   Surface A (interview). *Recommend: B → C → A.*
4. Confirm "64-dim" is roadmap (ship 4 rich dims now, architecture ready for 64).

---

### Loop status
- ✅ Research done (RemoteStar teardown, backend HCV data, current UI gap).
- ▶ **This doc = plan v1.** Refine §10 decisions, then Phase 1.
- Interview WS + `/demo/hcv` already live (tested today) — build is UI-led, low backend risk.
