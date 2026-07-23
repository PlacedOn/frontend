# PlacedOn — Candidate Experience & Interview Plan

> Canonical plan for the candidate journey and the interview. Supersedes the
> older `project_placedon_social_direction.md` (posts/follows/likes), which is
> abandoned — see §7 Do-Not-Build. Written 2026-07-23.

## 0. The one sentence

A portal where a candidate turns what they've actually done into **verified
evidence**, sees honestly which real jobs their evidence **covers**, is told the
**exact next step** to close the gap, and reaches employers with that proof —
with zero resume theater and zero "who you know."

We do **not** promise "a job for sure." We promise: *seen fairly, told exactly
what to do next, reached to real employers with proof.* That is a stronger,
truthful promise for a first-gen, tier-2/3-city candidate than any competitor's.

## 1. The spine that resolves every tension

The unit of value is the **specimen** (shipped work / demonstrated skill), never
the impression, the like, or the connection. A follower/connection count is a
pedigree proxy — it launders "who you already know" into a score, rebuilding the
exact inequality the product exists to remove. So: **no follow graph, ever.**

## 2. The journey — small login → deep use

```
Arrive → Small login → Seed (3 taps) → INTERVIEW → Report card (peak)
   → See job fit → Close a gap (delta) → Apply with proof → Consented intro
```

- **Stage 0 — Arrive (no account):** marketing → one CTA: "See what your work says."
- **Stage 1 — Small login:** phone OTP + first name. India-first; one screen.
  Gates anonymous LLM cost/abuse. (Progressive profiling — the profile deepens
  through use, never a giant upfront form.)
- **Stage 2 — Seed, not profile:** role-family chips + a first-class **"Not sure
  — help me figure it out"** path for candidates without the vocabulary. Built at
  `/start` (`CandidateOnboarding`). Routes into the real `/interview/consent?role=`.
- **Stage 3 — The interview IS onboarding:** calm, adaptive, 25–30 min, **voice or
  text**, no timer, pause anytime, resumable. Produces evidence AND teaches the
  product's value in one motion. See §4.
- **Stage 4 — The report card (peak + the "second, verified report card"):**
  - **Card A** = self-stated claims (unverified; `completeness` is engagement
    momentum, never a score).
  - **Card B** = the verified report from the interview: traits with **verbatim
    quotes** + per-role **coverage**, band-capped by verification. Built at
    `/candidate/report/[id]` (`ReportCardReview`) — consent-gated, no single score.
- **Stage 5 — "How does this job fit me" (honest AI-fit):** show **coverage of the
  role's stated requirements** with the gap named — *"asks for A,B,C,D; you've
  shown A,B; here's how to show C,D."* Never a match score, never hire odds.
- **Stage 6 — Apply / express interest / delta interview:** applying to a specific
  job asks only the **delta** (requirements not yet covered) — a short 5-min
  top-up, not a full re-interview. Applying requires evidence coverage or a delta,
  so you **apply with proof**, never one-click-spray.
- **Stage 7 — Consented intro:** identity revealed only when both sides agree.
  "Success" = **intro delivered** (the only thing we control).

## 3. Dashboard IA — calm, 4 daily doors

Candidate sidebar is split (done): **Home · Workshop · Matches · Passport** (the
four doors) + a "More" group (Growth, Applications, Network, Profile, Preferences).
Everything one click away, nothing hidden. The "job updates" surface is **not** a
news ticker — it's one calm, dismissible next-move card on Home ("3 new roles match
your evidence" / "one facet from Platform-ready"), never a red-badge anxiety engine.

## 4. The interview — speech + text (architecture)

The backend interview pipeline is **text-only**: `process_answer(state, answer:
str)`. There is no STT/TTS/audio in the backend. Therefore:

- **Speech is a pure frontend capability.** The browser transcribes speech →
  sends the same TEXT `answer` to the existing pipeline. Reading questions aloud
  is browser TTS. **No backend change required.**
- **Voice input:** Web Speech API (`SpeechRecognition`) → live transcript into the
  answer draft → candidate reviews/edits → sends. Graceful, honest fallback where
  unsupported (Safari/Firefox partial): fall back to typing, never break.
- **Voice output (optional, off by default):** `speechSynthesis` reads the
  interviewer's question aloud — for candidates less comfortable reading English.
- **Mode is the candidate's choice, switchable mid-interview.** Type is always
  available; speak is additive. Reduced-motion + a11y throughout.
- **Comfort features (small, high-impact — all matter):** resume after a dropped
  connection; "skip / no example" without penalty; pause anytime; no timer; a
  calm progress indicator (not a countdown); whiteboard to "show your work."
- **Vernacular (flagged, needs a spike):** accept Hinglish/regional answers,
  assessed fairly — potentially the biggest accessibility moat. LLM quality/cost
  unknown; spike a tiny Hindi test before committing.

### Interview page redesign goals
Calm, single-focus, first-impression craft. The conversation is the hero. Clear
"Speak ↔ Type" control. Live transcript while speaking. A "listening" state that
feels alive (apple-design spring, pointer-down response, reduced-motion safe).
Reassurance always visible: "your raw answers stay yours."

## 5. Backend plan (analysis-based — NOT buildable/verifiable from this env)

The FastAPI backend (`~/PlacedOn/Code/PlacedOn/backend`) needs live Redis +
Supabase to run; this environment has neither, so backend integration cannot be
built-and-verified here without a wired env. When that exists, the ordered gaps:

1. **The live round trip end-to-end:** `/interview/consent` → `createInterview` →
   WS `process_answer` → `finalizeInterview` → report → Workshop shelf. Every
   frontend surface is verified to the auth boundary, never *through* it.
2. **Public-read-by-handle + visibility enforcement:** `/p/[handle]` is private by
   default in the UI; the server must honor `CandidatePreferences.visibility`
   (off/matched_only/searchable) and expose a public read only when published.
3. **Share instrumentation:** measure whether candidates share their Passport link
   (the growth-loop signal from §6).
4. **Delta interviews** (short per-role top-ups) + **evidence-gated apply**.
5. **Speech:** none needed server-side (see §4) unless we later add server-side
   transcription for vernacular quality — a separate spike.

## 6. Business + CTO lenses

- Employers pay; candidate-social is retention, not revenue — don't spend
  engineering where the money isn't.
- Growth loop = the **shareable Passport link**, not a feed. Cheapest test: make
  `/p/[handle]` real and measure whether one candidate sends it to one human.
- Do **not** split the datastore again (two seam bugs already this month). Social
  lives in Supabase behind RLS. No ranking algorithm (can't pitch "the algorithm
  is the problem" then ship one). Chronological, circle-scoped.
- Two things gate any public writing: report/block, and real visibility controls
  (safety — users are often employed while looking).

## 7. Do NOT build

Follower/connection counts · a global feed · a ranking algorithm · free-text
posts · one-click apply · connection requests · a news ticker. Each recreates the
thing we differentiate against.

## 8. Open forks (recommendations)

1. **Vernacular interview** — spike a tiny Hindi test; may be the biggest unlock.
2. **Passport default visibility** — private-by-default (done in UI).
3. **"Success" definition** — intro delivered (the only thing we control).

## 9. Status (2026-07-23)

Done & verified (frontend, screenshot-checked): onboarding `/start`; report-card
review with preview + reveal; Home-dashboard fabrication removed; public
`/p/[handle]` private-by-default; preferences/passport graceful preview; sidebar
calm-down. Fabrication bug cleared from every candidate surface. Private-by-default
real in the UI.

In progress: interview speech+text format & page redesign (this plan, §4).
Blocked on a wired env: everything in §5.
