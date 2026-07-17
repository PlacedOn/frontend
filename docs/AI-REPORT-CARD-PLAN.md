# PlacedOn — The Two-Card Verification System (CTO Engineering Plan)

Builds on the research in `placedon_ai_report_card_plan.pdf` (O*NET/ESCO, validation
science, fraud data). That doc answers *why* and *what standard*. This one is *how* —
how it plugs into the system we already built (Slices 1–8), where I **sharpen** the
research, and the order I'd build it as your CTO.

---

## 0. The one idea (unchanged from your notebook — it's the right one)

The product is **not** two cards. It's the **measured, cited gap between Claim and
Proof, scored against a public standard.** We replace the resume with a
claim-vs-proof *verification*. Everyone else ships a report; we ship the delta.

**The wedge the research now proves:** 81–85% of employers say they do "skills-based
hiring" and 94% say skills predict performance better than resumes — but almost all
still rely on **self-reported** skills AI can now fake (64% of workers admit
misrepresenting skills; 11% specifically lie about AI skills; Gartner projects 1-in-4
candidate profiles fraudulent by 2028). The market already believes in verifying
skills; the verification infrastructure doesn't exist. Card B *is* that infrastructure,
and **Verification %** measures the fake-able gap. (Sources in §11.)

Three artifacts, named precisely (naming matters legally — see §3):

| | Name | Author | "What it is" | Status in our build |
|---|---|---|---|---|
| **Card A** | **Claim Card** | Candidate | "What I say I can do" — editable self-report | **New** (build it) |
| **Card B** | **Evidence Card** | AI, from the interview | "What I demonstrated" — quoted, banded, candidate-reviewed | **Mostly built** (`report_cards`) |
| **—** | **Verification Report** | Our software (deterministic) | "How much of the claim is proven, against what the role needs" | **New** (the engine) |

---

## 1. Stand on O*NET + ESCO — do NOT invent requirements

The single most important decision, and I fully agree with the research:

- **O*NET** (US Dept. of Labor) — 1,016 occupations → required skills/knowledge/abilities. Free, machine-readable.
- **ESCO** (EU) — 13,939 skills, finer-grained; what LLM skill-matching research uses.
- **WEF Global Skills Taxonomy (2025)** — explicitly designed as a *"universal adapter"*
  between region/industry taxonomies; built from 1,000+ employers across 55 economies.
  Use it as the **crosswalk** so O*NET, ESCO, and an employer's own language reconcile.

Every role requirement carries a **provenance** tag: `onet:2.B.3.a`, `esco:S1.2.1`,
`wef:…`, or `employer` (the Role DNA signal from Slice 1). When a compliance officer asks
"where do these come from?", the card answers **"US Dept. of Labor + the EU standard + the
World Economic Forum taxonomy, plus this employer's stated Role DNA."** That sentence is
the fundability.

**Why this is also our legal spine — content validity.** Under the EEOC *Uniform
Guidelines* (UGESP, 29 CFR 1607), a selection tool that **samples the actual content of
the job** is *content-valid by construction*. Because every card item maps to a
taxonomy-defined job requirement and cites the candidate's own demonstration of it, the
card has content validity **on day one** — we don't have to wait for a multi-year
criterion study to make a defensible validity claim (though we run one too, §7).

---

## 2. Where I SHARPEN the research (real CTO judgment, not echo)

Three changes I'd make to the plan you were handed — each for a concrete legal/fairness reason:

1. **Rename "Role-Fit %" → "Role Coverage %".** "Fit" implies a hiring verdict; a
   verdict that ranks/screens people is an **Automated Employment Decision Tool**
   under NYC LL144 and high-risk under the EU AI Act. "Coverage" is a *transparency*
   metric — *which role requirements have supporting evidence* — that informs a human.
   Same number, defensible framing, and it never auto-rejects.

2. **Rename "Integrity %" → "Consistency %".** Never attach a number to a person's
   *integrity/honesty* — that's a defamation and fairness landmine. What we can
   measure honestly is *claim↔evidence alignment* and *within-interview consistency*.
   A low number means "claims outran the evidence," not "this person is dishonest."

3. **Make Verification % directional and fair.** Proving something you *didn't* claim
   (proven-unclaimed = under-selling) must **never** lower the score — it's a positive
   signal. Only *claimed-but-unproven* counts against verification. This protects
   humble candidates and is the ethical spine of the metric.

**The ban still holds:** there is **no single blended "hireability" score**, ever.
Three separate, cited metrics — never one number that invites "how'd you weight it?"

---

## 3. The three metrics (each 100% traceable to a quote)

Computed **deterministically** from the claim×evidence×requirement matrix. No number appears without the evidence it stands on.

| Metric | Definition | Guards |
|---|---|---|
| **Verification %** | proven claims ÷ claims the candidate made | under-claiming never penalized; each proven claim cites a `report_card_item` |
| **Role Coverage %** | role requirements with supporting evidence ÷ total role requirements | requirements come from O*NET/ESCO + employer; must-haves shown separately; informs, never decides |
| **Consistency %** | claim↔evidence alignment + within-interview consistency | measures alignment, not a person's honesty; low = "claims outran proof" |

For every requirement, the engine assigns one of four states — this matrix *is* the product:

```
                        proven in interview?
                        YES                 NO
claimed?  YES   ✅ Verified          ⚠️ Claimed, not shown
          NO    ➕ Proven (bonus)    ⬜ Gap (evidence to build)
```

---

## 4. Data model — on top of what's already built

```
taxonomy_skills        (id, source onet|esco, code, label, description)          -- cache of the standard
role_requirements      (job_id|role_family, skill_id, source, weight, is_must_have, provenance)
candidate_claims       (candidate_id, skill_id|free_text, self_level, target_role) -- CARD A (new; RLS candidate-owned)
report_cards / report_card_items                                                  -- CARD B (built)
verification_reports   (id, session_id, candidate_id, job_id, taxonomy_version,
                        model_run, verification_pct, coverage_pct, consistency_pct,
                        signature, built_at)                                      -- the comparison
verification_lines     (report_id, skill_id, state ∈ verified|claimed_unproven|
                        proven_unclaimed|gap, band, claim_id?, item_id?)          -- one row per requirement, each citing evidence
```

- Card A and the verification report are **candidate-owned (RLS)**; employers read a
  **visibility-scoped view** (same pattern as Slice 5: approved + not hidden/disputed).
- `signature` = hash of (taxonomy_version + model_run + cited item ids). Tamper-evident →
  this is the literal "trust verification from our company" — a reproducible artifact.

---

## 5. What the card must show HR (the "industry requirements")

The trust fields that make an enterprise/HR/bank say yes:

1. **Skill → taxonomy mapping** with source (O*NET/ESCO/employer) per line.
2. **Evidence provenance** — the candidate's own quote + which interview turn.
3. **Band + confidence** per item (supported/emerging/needs-more) — never a raw score.
4. **The three metrics**, each expandable to the evidence behind it.
5. **Fairness statement** — adverse-impact status; "assessed as text; voice never scored for tone."
6. **Validity claim** — the predictive-validity number from our study (§7), dated.
7. **Reproducibility** — taxonomy + model versions; the signature; "re-runnable."
8. **Consent & scope** — what the candidate approved for this employer; identity withheld until intro.
9. **Authenticity** — session integrity signals (one live session, no paste-dumps) without scoring behavior.

---

## 6. Audience views

- **Candidate:** author/edit **Card A**; review **Card B** (built); see the verification
  matrix as *guidance* — "evidence to build" on the gaps, not a grade.
- **Employer/HR:** Evidence Card + Role Coverage + the verification badge; every number
  expands to its quote; identity withheld until a consented intro (Slice 7).
- **Verifier (3rd party / compliance):** a **signed, reproducible verification page** —
  the artifact that replaces "trust us" with "re-run it yourself."

**Same card, two emphases (big-tech vs startup — research-driven).** The audiences want
different things, so the employer view has two densities of the *same* evidence:

| | **Enterprise / big-tech HR** | **Startup / founder** |
|---|---|---|
| Wants | compliance, defensibility, audit trail | "can they do the job?", speed, signal |
| Surfaces | taxonomy provenance, adverse-impact statement, validity evidence, reproducibility signature | top proven capabilities + the gap, one screen, work-sample-like |
| Default | **Trust panel expanded** | **Signal-first, trust panel collapsed** |

This mirrors how they actually hire: big tech runs structured rubric interviews (Google
re:Work) and needs the paper trail; startups run lightweight work-sample + behavioral
rounds (YC) and need fast, honest signal. One data model, one card, a density toggle.

---

## 7. Validity — position on the method meta-analysis already ranks #1

The 2022 re-analysis (Sackett, Zhang, Berry & Lievens) corrected decades of
range-restriction over-correction and **re-ranked the predictors**. The result is the
best thing that could have happened to us:

- **Structured interviews are now the single highest-validity predictor (r ≈ .42)** —
  above general cognitive ability (revised down to r ≈ .31). Résumé/education screening
  sits near the bottom (education ≈ .10).
- Our AI interview + Role DNA rubric **is a structured, behaviorally-anchored interview
  run at scale** — the exact method Google's re:Work program adopted (planned questions +
  scoring guide + rubric) and the method the science ranks first. We don't claim a novel
  predictor; we **operationalize the best-validated one** and render it as cited evidence.
- The research is also clear that the **most valid processes combine methods** (structured
  interview + work sample + cognitive). So the card is positioned honestly as **one strong,
  calibrated component**, not a silver bullet — "use alongside your judgment," which *builds*
  trust rather than over-claiming.

**Two validity claims, sequenced:**
1. **Content validity — now.** Built in via taxonomy-mapped evidence (§1). Defensible on day one.
2. **Criterion validity — the study.** Correlate card signals with real outcomes from the
   **Slice 8 outcome check-ins (built)**; target the structured-assessment band (~.4). Gate
   everything behind the **four-fifths / 80% adverse-impact rule** (UGESP) with continuous
   monitoring. This is the fundable, enterprise-closing number — instrument for it from day one.

---

## 8. Build order (grounded in what exists; ~5 weeks to a working verified card)

| Phase | Weeks | Deliverable |
|---|---|---|
| **P1** | 2–3 | Taxonomy service (O*NET/ESCO ingest + cache) + `role_requirements` for the top 5 roles (junior backend first). |
| **P2** | 2–3 | **Card A** authoring UI + **Card B** rendering from the *existing* interview engine → both cards live from one real interview. |
| **P3** | 1–2 | The **comparison engine** + the three cited metrics + `verification_reports`/`lines` (deterministic, reproducible). |
| **P4** | 1–2 | Audience views + the **signed verification artifact**. |
| **P5** | ongoing | Validation-study instrumentation (predictive validity + adverse-impact), feeding off Slice 8. |

Start with the **inputs** (taxonomy + a filled Card B), not the comparison — the
comparison is trivial once its two inputs are trustworthy.

---

## 9. Honest dependencies (the floor this stands on)

- The **evidence pipeline** (LLM extract → verify_quote gate → fidelity judge → calibrate)
  that *fills* Card B is still a seam — needs the **hosted backend + keys**. `verify_quote`
  and `gate_items` (built) are where it plugs in.
- This sits directly on the **auth/RLS + evidence-verification** foundations we already
  built. A verification card on unverified evidence or leaky access is **worse than none** —
  those foundations are not separate work; they're the ground floor.

## 10. What I would NOT do

- No single blended score. No scraped/inferred data. No scoring voice/accent/behavior.
- No auto-reject / auto-rank. No invented requirements. No shipping the comparison before
  the taxonomy and a real filled Card B exist.

---

## 11. Research foundation & sources (why this is fundable, not invented)

**A. Validity science — our method is the #1-ranked predictor.**
- Sackett, Zhang, Berry & Lievens (2022) re-analysis: **structured interviews r ≈ .42
  (highest single predictor)**; general cognitive ability revised down to r ≈ .31; most
  prior validities were over-estimated via range-restriction over-correction. Structured
  interview + cognitive composite ≈ .6.
- Google re:Work: structured interviewing (planned questions + rubric + behaviorally-
  anchored scales) "consistently outperforms freeform conversations at every level."
- McKinsey (via skills-hiring reports): skills-based hiring is **5× more predictive than
  education, 2×+ more than experience**; the most valid processes **combine methods**.

**B. The market believes in skills but can't verify them (our wedge).**
- **81–85%** of employers claim skills-based hiring; **94%** say it predicts better than
  resumes; **72%** use skills assessments — yet the implementation gap is huge (some
  reports: ~1 in 700 hires actually affected). Most still trust **self-reported** skills.

**C. Fraud/trust — the timing (our verification angle).**
- **63%** of fraudulent-resume applicants got offers in 2024; **64%** of workers admit
  misrepresenting skills (up from 55% in 2022); **11%** lie specifically about AI skills.
- **59%** of managers suspect candidates use AI to misrepresent; **62%** say candidates
  now fake identity better than teams detect. **Gartner: 25% of candidate profiles
  fraudulent by 2028.** Reported job-fraud losses **$90M → $501M (2020→2024, +457%)**.

**D. Standards to stand on.**
- **O*NET** (US DoL), **ESCO** (EU, 13,939 skills), **WEF Global Skills Taxonomy 2025**
  (universal adapter). **EEOC UGESP** (29 CFR 1607): content/criterion/construct validity;
  **four-fifths (80%) rule** for adverse impact — validation required once adverse impact exists.

**Sources:**
- [Sackett et al. (2022), Revisiting Meta-Analytic Estimates of Validity](https://www.researchgate.net/publication/357440267_Revisiting_meta-analytic_estimates_of_validity_in_personnel_selection_Addressing_systematic_overcorrection_for_restriction_of_range) · [SIOP summary](https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance-new-research-says-its-time-to-think-again/)
- [Google re:Work — Structured Interviewing guide](https://rework.withgoogle.com/intl/en/guides/a-guide-to-structured-interviewing-for-better-hiring-practices)
- [TestGorilla — State of Skills-Based Hiring 2025](https://www.testgorilla.com/skills-based-hiring/state-of-skills-based-hiring-2025/)
- [Resume.org — 6 in 10 Resume Fraudsters Landed a Job in 2024](https://www.resume.org/research/6-in-10-resume-fraudsters-landed-a-job-in-2024/) · [CNBC — deepfake job applicants](https://www.cnbc.com/2025/07/11/how-deepfake-ai-job-applicants-are-stealing-remote-work.html)
- [WEF Future of Jobs 2025 — Skills Outlook](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/) · [WEF Global Skills Taxonomy Adoption Toolkit](https://reports.weforum.org/docs/WEF_Global_Skills_Taxonomy_Adoption_Toolkit_2025.pdf)
- [EEOC Uniform Guidelines (29 CFR 1607)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XIV/part-1607) · [Q&A on UGESP](https://www.eeoc.gov/laws/guidance/questions-and-answers-clarify-and-provide-common-interpretation-uniform-guidelines)
- [O*NET](https://www.onetonline.org/) · [ESCO](https://esco.ec.europa.eu/en/classification/skill_main)
