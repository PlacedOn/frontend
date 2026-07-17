# PlacedOn — The Candidate Understanding Model
### How the profile is built, how the AI understands a person, and how the model improves — safely

You asked: research how the best products collect user data + train/improve the model, and
design the *deep algorithm* by which a candidate builds a profile through questions, the AI
understands them from profile + resume + interview, and then connects them to employers. Here
it is, grounded in the real methods — and deliberately diverging from the leaders where their
approach would rebuild the resume we're replacing.

---

## 0. The contrast that defines us: **validation, not inference**

- **Eightfold** (the state of the art): a deep model trained on **1.6B career profiles**; RNNs
  ingest your sequence of titles/companies and predict your *next title* and *next company* as
  embeddings. It infers skills from **career trajectory**.
- **LinkedIn**: skills inference over the self-reported profile graph — limited to "what people
  choose to put on their profile," and it "lags actual hiring."
- **PlacedOn**: we do **skills validation**. The profile/resume are *claims*; a structured
  interview *verifies* them into quoted evidence. We never predict ability from trajectory or
  pedigree — that's the exact bias (and the exact resume) we exist to remove.

> Inference asks "who does your history say you are?" Validation asks "what can you show you can
> do?" The first rewards the advantaged. The second is our moat.

We still *use* inference — but only to generate **claims to verify**, never as a score.

---

## 1. The adaptive profile-building algorithm (IRT / CAT)

A profile shouldn't be a dumb 30-field form. It should be an **adaptive questionnaire** that
asks the *most informative next question* and stops when it knows enough to route the interview.
This is exactly **Computerized Adaptive Testing (CAT)** built on **Item Response Theory (IRT)** —
the method behind the GRE/GMAT.

**The loop (per question):**
1. Maintain a belief over a latent state θ — here θ is not "talent," it is **role-direction +
   claim-uncertainty**: which role families fit, and which claims still need verification.
2. From the question bank, pick the item with **maximum information** at the current θ — the
   question whose answer we can least predict (≈ 50/50), because that reduces uncertainty most.
3. Record the answer, re-estimate θ, repeat.
4. **Stop** when θ is precise enough to (a) route the interview to the right Role DNA and (b)
   seed it with the specific claims to probe. Fewer, sharper questions — not a long form.

**Cold-start** (the known CAT weakness) is solved here for free: the resume + a couple of
intent questions give strong **priors**, so we start informed, not blank.

**Critical framing:** θ is a *routing/seeding* estimate to make the interview efficient. **It is
never a talent score, never shown as a number, never used to rank the person.** The interview —
not the questionnaire — produces evidence.

---

## 2. Resume / LinkedIn ingestion → Card A claims (firewall-redacted)

When a candidate attaches a resume, we parse it — **but as a claim source, never a score source**:
1. **Structured extraction** (NER + sectioning): pull skills, projects, responsibilities, tools.
2. **Demographic/pedigree redaction** (the fairness firewall we built): name, gender, age,
   location, **and institution/college** are stripped before anything enters assessment — the
   research consensus is that fair pipelines *don't extract* these as ranking signals.
3. **Map to Card A claims:** each extracted skill becomes a claimed skill with a "verify this"
   flag. The resume's job is to *seed the interview*, not to be believed.

So "attach resume → AI understands you" = resume becomes **claims + priors** that make the
adaptive interview start smart. The understanding comes from *verifying* them, not from trusting them.

---

## 3. The end-to-end understanding pipeline

```
  Profile (adaptive Q&A, §1)  ┐
  Resume/LinkedIn (§2)        ┘→  CARD A: claims + intent + priors   (stated, unverified)
                                        │  routes + seeds
                                        ▼
  Adaptive interview (info-gain loop; basic → deeper)  →  CARD B: quoted, verified evidence
                                        │  verify_quote + fidelity judge + skill encoder
                                        ▼
  Understanding = Card B + (Card A × Card B delta)
     • Readiness per role (coverage of public requirements — not odds)
     • Gaps + growth roadmap
     • Calibration: where the person under/over-claimed (private feedback, never a public score)
                                        │
                                        ▼
  Matched openings (readiness + top gap, work-type aware)
                                        │  candidate consents
                                        ▼
  Consented introduction  →  the ONLY place employer contact happens (no auto-connect, no spam)
```

Every arrow is auditable; the fairness firewall (§2) guards the Card A→assessment seam so
pedigree can never leak in.

---

## 4. Teaching & improving the model — safely (HITL active learning)

"Improve the model to do more great" — done within our staged-ML rule (no learned
hire-predictor in V1). The engine is **human-in-the-loop active learning**:

- **Signals we already collect:** candidate review of each report line (accurate / add-context /
  dispute), employer reactions, and **outcome check-ins** (Slice 8). These are the human labels.
- **Uncertainty + diversity sampling:** surface the cases nearest a decision boundary or out of
  distribution to humans first — the highest-value things to learn from.
- **What improves:** band-calibration thresholds, the skill-encoder mapping, the question bank's
  item parameters (IRT difficulty/information), and the fabrication/fidelity gates. Measurement
  gets sharper; the *definition of fair evidence* does not drift.
- **Bias monitoring in the loop:** every improvement pass runs through the adverse-impact +
  matched-pair gate — if a change starts favoring pedigree, it fails.
- **Only later, behind the fairness gate:** a small **LightGBM re-ranker** on real outcome data
  that *re-orders for a human* and never rejects. Not a deep trajectory net.

**We explicitly do NOT** build Eightfold's next-title/next-company trajectory predictor — it
learns pedigree, and it's the opposite of validation.

---

## 5. Data: what we collect, where, how it helps

| Data | Where | How it helps | Guardrail |
|---|---|---|---|
| Profile claims + intent (Card A) | Supabase, RLS candidate-owned | routes + seeds the interview | claims, never a score |
| Resume text | parsed → claims, raw stored candidate-owned | fast profile fill, priors | pedigree redacted before assessment |
| Interview turns (Card B) | encrypted at rest (AES-GCM) | the actual evidence | verify_quote-gated |
| Preferences / work-type | Supabase, RLS | matching + interview depth | preference, not a signal |
| Reviews / outcomes | Supabase | model calibration (HITL) | never trains a hire-predictor |

---

## 6. What we deliberately don't do

Trajectory/pedigree prediction (Eightfold-style) · institution/college as a signal · a talent or
"likelihood-to-be-hired" score · auto-connecting candidates to employers or cold outreach ·
believing the resume instead of verifying it · any single blended person-score.

---

## 7. India + fairness

The adaptive questionnaire and resume parser both run through the firewall: caste, religion,
region, mother-tongue, college-tier, gender, age, photo are never collected as assessment
inputs. The wedge is unchanged — surface the Tier-2/Tier-3 candidate whose *validated evidence*
the pedigree-inference incumbents miss.

---

## 8. Status

- **Building now (Fable):** the profile-builder UI + interview→report→fit integration.
- **This document adds the algorithm layer:** IRT/CAT adaptive intake, resume→Card A ingestion,
  the HITL improvement loop. Next build steps: the adaptive question bank + selection function,
  the resume parser with firewall redaction, and the calibration/active-learning job.

---

## 9. Sources

- Computerized Adaptive Testing / IRT (next item = max information at current θ): Wikipedia —
  https://en.wikipedia.org/wiki/Computerized_adaptive_testing · CAT for a health-professions exam
  (PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10624130/ · cold-start —
  https://arxiv.org/pdf/2411.12182
- Eightfold talent-matching (1.6B profiles, RNN next-title/next-company): engineering blog —
  https://eightfold.ai/engineering-blog/ai-powered-talent-matching-the-tech-behind-smarter-and-fairer-hiring/
- Skills validation vs. skills inference —
  https://blog.udder.rocks/the-udder-blog/skills-validation-vs-skills-inference-why-your-skills-based-hiring-strategy-needs-both
- Resume parsing + demographic redaction / fairness: Smart-Hiring explainable CV pipeline —
  https://arxiv.org/html/2511.02537 · NLP-for-HR survey — https://arxiv.org/pdf/2410.16498 ·
  LLM hiring bias — https://arxiv.org/pdf/2508.16673
- Human-in-the-loop active learning (uncertainty/diversity sampling, calibration): framework —
  https://arxiv.org/html/2501.00277
