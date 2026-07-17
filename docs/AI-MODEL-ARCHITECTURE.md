# PlacedOn — The Report Model: Algorithm, ML/NN Architecture, and the Two Reports

You asked for a "deep thinking model" that, after the AI interview, produces a report
with company fit, selection %, AI recommendation, pros/cons, what to improve, skills to
develop, and a roadmap (courses / exams / colleges) — plus the ML/NN + LLM that runs
*during* the interview. This is my CTO thinking on how to build it **so it's powerful and
survives a compliance review**, not just impressive in a demo.

---

## 0. The reframe that makes all of this work

Your wishlist is actually **two reports for two different people**:

| | **Employer Evidence Card** (built) | **Candidate Growth Report** (new) |
|---|---|---|
| Owner | shared *by the candidate's consent* | candidate-owned, candidate-facing |
| Answers | "what did they *prove*?" | "where do I fit, what's my edge, what do I fix, what's my path?" |
| Contains | verified, quoted evidence · no score | fit, strengths, gaps, roadmap, courses/exams |
| Decision | **the human decides** | **guidance to the candidate** |

Almost everything new you listed — company fit, advantages/disadvantages, what to improve,
skills to develop, the roadmap — **belongs to the Candidate Growth Report**, because it's
*advice to the candidate*, not a verdict on them. That single split is what lets us build
the ambitious version safely.

---

## 1. Two red lines I will not cross — and the honest substitute for each

**Red line 1 — "% chance you'll be selected at Company X."** I will **not** build a
selection-probability number, for three reasons:
- **It's not honestly computable.** Real selection depends on the applicant pool, the
  recruiter's mood, headcount, budget, timing — none of which we observe. Any number is fiction.
- **It's legally radioactive.** A model predicting a hiring outcome is an Automated
  Employment Decision Tool (NYC LL144, EU AI Act high-risk).
- **A wrong number does real harm** — false hope or false discouragement to a real person.

> **Honest substitute → "Evidence-Fit / Readiness %"**: how much of a role's *public*
> requirements (O*NET/ESCO + the company's Role DNA if public) your evidence covers, with
> the exact gaps named. It answers *"Am I ready? What's missing?"* — never *"Will they pick me?"*

**Red line 2 — "the AI recommends and will select."** The AI **never** selects. It
recommends *to the candidate* which roles their evidence fits best (career guidance) and
*informs* the employer with cited evidence. **The human always decides.** This is not
timidity — it's the entire trust proposition.

Everything else you asked for is not just allowed; it's the strongest, most defensible,
most *candidate-loving* part of the product.

---

## 2. The Candidate Growth Report — your wishlist, mapped

| You asked for | We build (defensible form) |
|---|---|
| Company fit / which company to apply | **Evidence-Fit % per role family** + specific roles/companies whose Role DNA your evidence matches, ranked by coverage — each with its gaps. "Apply here; here's what's strong; here's what to shore up first." |
| "% selection" | **Readiness %** (coverage of public requirements), never selection odds. |
| AI recommendation | "Your evidence fits these role families best" — guidance, not a decision. |
| Advantages | Your **Supported** items that clear the role's typical bar or are rare in the taxonomy. |
| Disadvantages | Reframed as **growth gaps**: required skills with weak/no evidence. |
| What to improve | For each gap: the **specific next evidence to build** + a suggested project/behavior. |
| Skills to develop | **Taxonomy-adjacent skills** (O*NET "related skills" graph) that unlock more roles. |
| Roadmap: courses / exams / colleges | **Sequenced plan** from a *curated, cited catalog* mapped to skills — courses, certifications/exams, and formal programs. **Never hallucinated by the LLM.** |

Plus: it's **reproducible, candidate-owned**, and the candidate can **re-interview to
upgrade a band** — the growth loop that creates stickiness without any social feed.

---

## 3. The "deep thinking model" is a PIPELINE, not one monolith

A single giant neural net that "reads the interview and outputs a hireability score" is
exactly the thing we must not build (§4). The real system is a chain of small, inspectable
models — each doing one job, each auditable.

```
INTERVIEW-TIME (real-time, adaptive)                         ── mostly built ──
  Adaptive questioner (LLM generator + planner/question_strategy)
     │  asks a base question → scores which Role DNA signals still lack evidence
     │  → an INFORMATION-GAIN loop picks the next probe = "basic → deeper"
     │  ("deep connection" = a running evidence-coverage state per signal;
     │   the next question is the one that reduces the biggest uncertainty)
     ▼
  Turn compressor + trust triggers  (built)

POST-INTERVIEW (report generation)                           ── the new stack ──
  1. Extractor            LLM, schema-constrained: transcript → {claim, quote span, skill}
  2. Fabrication gate     verify_quote (deterministic, BUILT): quote must be verbatim
  3. Fidelity judge       cross-provider LLM: does the quote entail the claim?
                          faithful < 0.8 → drop · harmful_inference → drop + alert
  4. Skill encoder ★      SBERT embeds each observation + each O*NET/ESCO/WEF skill;
                          cosine similarity maps observation → skill (pgvector)
                          ★ this is the real neural network — a transparent ENCODER, not a decider
  5. Band calibration     deterministic thresholds tuned against candidate reviews (trust loop)
  6. Coverage + gaps      deterministic: evidenced skills vs role requirements → Fit % + gaps
  7. Growth synthesis     retrieval + templates over a CITED catalog → roadmap/courses/exams
  8. Reproducibility      pin model/prompt/taxonomy versions + signature
```

Every arrow is inspectable; every number traces to a quote or a taxonomy edge.

---

## 4. The neural network — and why NOT one big hiring net (holding your own decision #3)

**The legitimate neural network is the skill encoder (step 4): SBERT sentence-embeddings**
(you already depend on `sentence-transformers`) + **pgvector** retrieval. It maps a
candidate's demonstrated behavior to standard skills by *meaning*, not keywords — so
"I checked the idempotency keys" maps to *Troubleshooting* even without the word. It's a
neural net used as an **encoder** (transparent, every match has a similarity score you can
show), never as a hidden decider.

**Why we do NOT train a proprietary hire/score neural net in V1** (this was your call, and it's right):
- **No labels.** You can't train a hire-predictor without a history of hires + outcomes.
- **Small data + deep nets = overfitting** and the death of explainability — and explainability *is* the moat.
- **Legal.** A learned accept/reject model is a high-risk AEDT.

**The responsible ML path (staged):**
1. **Now:** foundation LLMs as *constrained components* (extractor, judge, question-gen) + deterministic gates.
2. **Now/next:** the **SBERT encoder + pgvector** — the real, transparent NN.
3. **Later, only after outcome data** accrues from the **Slice 8 outcome check-ins**: a
   **LightGBM re-ranker** (gradient-boosted trees — the *right* tool for small tabular data,
   not a deep net) that **re-orders candidates for a human**, behind an **adverse-impact ≥ 0.80
   gate**, and **never rejects**. That is the "ML that supports the AI," built when it's honest.

---

## 5. How the interview gets "deeper" (the active-learning loop, concretely)

1. Role DNA defines the target signals (Slice 1). Each starts at *evidence = none*.
2. The questioner asks a base, open question for the highest-priority signal.
3. The candidate answers in text (or voice→text). The extractor + judge score *how much
   evidence* that answer gave for which signals.
4. The loop picks the **next question to maximize information gain** — probe the signal with
   the weakest evidence, or go **deeper** on a promising-but-thin one ("you said you rolled
   back — what did you check first?").
5. Stop when coverage is sufficient or the turn budget is hit (existing `should_end_interview`).

That's the "deep connection": the model is continuously deciding *what it still doesn't
know about this candidate's fit* and asking exactly that. It's real, it's mostly built, and
it needs the hosted LLM to run live.

---

## 6. What else to add (research-informed) + my recommendation

- **Confidence/uncertainty on every number**, not just a point value — honesty compounds trust.
- **Re-interview to upgrade a band** — the growth/engagement loop (no social feed).
- **Percentile framing only within a role family, coverage-based** — never a person-vs-person rank.
- **Evidence freshness** — skills decay; WEF says **39% of skills change by 2030** — show recency.
- **Adverse-impact dashboard** from day one; **model/version logging** so any report is reproducible.
- **Do NOT**: scrape social, infer protected attributes, predict selection odds, let the AI reject.

---

## 7. Phasing (extends the report-card plan)

| Phase | Adds |
|---|---|
| 1 | Taxonomy service (O*NET/ESCO/WEF) + role requirements + Card A schema (from the report-card plan) |
| 2 | Card B rendering + **SBERT encoder + pgvector** skill mapping (the NN) |
| 3 | Comparison engine + **Candidate Growth Report** (fit, gaps, roadmap) + **curated course/exam catalog** |
| 4 | Audience views (enterprise/startup densities) + signed verification artifact |
| 5 | Validation study + **LightGBM re-ranker** (gated by adverse impact; informs, never decides) |

**Hard dependency:** steps 1–3 and the live active-learning loop need the **hosted backend +
model keys**. The structure is deterministic and buildable now; the model-driven content is
the seam — which is why the deploy is still the critical path.

---

## 8. My one-paragraph recommendation

Build the **Candidate Growth Report** as a first-class, candidate-owned product — that's
where "fit, strengths, gaps, roadmap, courses" live, and it's genuinely novel and lovable.
Keep the **employer** side to verified evidence with **no score and no selection odds**.
Use the **SBERT encoder + pgvector** as the neural network now; defer any learned ranker
until the outcome data exists and can pass a fairness gate. Do the two things that are
uninferable-and-unethical (selection %, AI-decides) as their **honest substitutes**
(readiness %, guidance). That's the version that's both more impressive *and* fundable.
