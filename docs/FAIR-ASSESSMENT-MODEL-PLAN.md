# PlacedOn — Fair Assessment Model: Understanding a Human Without Encoding Bias

The goal you set: a model that understands a person across many criteria and produces a
report — built for India first. The trap we just stepped around: scoring people on college
tier / environment / "psychology." This plan builds the version that is powerful **and**
that catches the talent pedigree-hiring misses — which is the whole business.

---

## 0. The one principle everything hangs on

> **Context is a confounder you control FOR (to be fair). It is never a feature you score people ON.**

You capture environment/opportunity only to (a) recognize *achievement relative to
opportunity* and (b) *audit your own pipeline* for bias. You never use it to down-rank the
under-resourced or up-rank the pedigreed. Assessment judges **demonstrated evidence** — what
the person showed they can do — full stop.

**Why this is also the moat:** if you score up IIT/pedigree, you've rebuilt the resume filter
every recruiter already has, and PlacedOn has no reason to exist. The differentiated, fundable
product is the one that surfaces the capable Tier-2/Tier-3 candidate the pedigree filter drops.
Fair *is* the wedge.

---

## 1. What the research actually says (grounding, not vibes)

- **The bias is real and measurable in India.** A Chennai resume-audit field experiment found
  low-caste applicants must send ~**20% more resumes** than high-caste applicants for the same
  callback — and it's taste-based, not "statistical." *Implication: our pipeline must be
  continuously tested that it does not reproduce this gap.*
- **The fair way to use context = "distance travelled."** UK contextual admissions judge
  achievement *relative to opportunity* — the same grade means more from someone who reached it
  with less scaffolding. Context widens access; it is not a bonus for the advantaged. *This is
  the only sanctioned use of environment.*
- **The cautionary tale: never boil context into one number.** The College Board's "adversity
  score" (Environmental Context Dashboard) was withdrawn after backlash; even its CEO admitted
  reducing a person's circumstances to a single score was "problematic." The replacement
  (Landscape) shows *contextual data*, never a composite person-score. *We take the lesson:
  no environmental score attached to a person, ever.*
- **The #1 fair predictor is a structured interview** (Sackett et al. 2022, structured
  interviews ≈ the strongest single validity, and lower adverse impact than unstructured
  judgment or pedigree). *This is exactly what we already built — evidence from structured
  questioning. We lean into it.*

---

## 2. Architecture — extend the pipeline, don't bolt on a "talent net"

There is **no** monolithic neural net that reads a person and outputs a talent number. There
is a chain of small, auditable estimators plus a fairness loop wrapped around all of it.

```
INPUT: structured-interview evidence (built) — what the person demonstrated
  │
  ▼
1. Evidence measurement      LLM extractor + verify_quote gate + fidelity judge  (built)
2. Skill encoder             SBERT → taxonomy skill, with similarity  (built, Growth Phase 1)
3. Skill estimation ★        evidence → posterior belief over each skill (band + UNCERTAINTY)
4. Coverage / readiness      evidenced vs public role requirements  (built)
   ─────────────────────────────────────────────────────────────────────
5. Opportunity-context ▲     OPTIONAL, consented, coarse. Used ONLY for:
                               (a) distance-travelled recognition (to the candidate)
                               (b) fairness stratification (never a talent input)
6. Adverse-impact monitor ▲  continuous loop: impact ratios across risk axes, ≥0.80 gate
                             (college-tier is a MONITORED axis — we watch that we don't favor it)
  │
  ▼
OUTPUT: evidence report (employer) + growth report (candidate), both bias-audited
```

★ new math. ▲ new fairness subsystem. Everything else already exists.

---

## 3. The math / statistics / probability — done correctly

**a) Skill as estimation-with-uncertainty, not a verdict.** Each evidence item updates a belief
about a skill. Model it Bayesian: prior over skill level → each verified quote is an
observation → posterior gives a band **and a confidence interval**. We report the uncertainty,
never a false-precision point score. Thin evidence → wide interval → "needs more evidence,"
not a low score.

**b) Coverage / readiness** = severity-weighted fraction of a role's *public* requirements
evidenced (already built). Per-role, never a person rank.

**c) Fairness metrics (the real statistics):**
- **Impact ratio / four-fifths rule:** selection-rate(group) / selection-rate(reference) ≥ 0.80.
- **Selection-rate parity** across each risk axis; **calibration-within-groups** (a given band
  means the same skill regardless of group).
- **Significance:** two-proportion z-test / Fisher's exact for small samples before we act on a gap.
- **Matched-pair probing:** identical evidence, varied only on a proxy (name, college tier) →
  outputs must be identical. This is the India audit methodology turned inward on ourselves.

**d) "Distance travelled" — modeled as confounder control, not a score.** Opportunity context
is a *stratification variable*: when auditing, we compare outcomes *within* opportunity strata
so we can see if equal evidence yields equal treatment. For the candidate, it produces a
*recognition annotation* ("you built this self-taught") — never a number added to a person and
never shown to an employer as a ranking. **We do not run any regression predicting talent from
environment.** That regression is the discrimination engine; it does not get built.

---

## 4. The opportunity-context module (fairness-only, India-aware)

- **Captured:** optional, consented, coarse, candidate-owned — e.g. first-generation graduate,
  self-taught vs. formal training, access-to-resources band. **Never** caste, religion, region,
  or mother tongue as direct inputs.
- **Used for exactly two things:** distance-travelled recognition (candidate-facing), and
  fairness stratification (internal audit).
- **Hard rules:** never a talent/assessment input · never in the employer's view as a ranking
  signal · never a single composite "context score" (the College Board lesson) · deletable by
  the candidate.

---

## 5. The fairness loop + sub-agent system (runtime and build)

**Runtime loop** (the "loop system" you asked for): a continuous **adverse-impact monitor** that,
on every batch of reports/matches, computes impact ratios across the monitored risk axes —
**including college tier, which we watch as a red flag, not reward** — flags drift, and enforces
a **fairness gate (≥0.80)** that any ranking surface must pass before it ships to an employer.
A human reviews any flagged drift; the system never silently "corrects" people.

**Sub-agents (how we build and keep it honest):**
- `firewall-agent` — the banned-signal guard (strips pedigree + protected proxies from ever
  entering assessment; extends the copilot pedigree-strip already in the code).
- `monitor-agent` — computes the impact-ratio dashboard + significance tests.
- `bias-probe-agent` — red-teams the pipeline with matched-pair inputs (Indian-name / college-tier
  swaps) and fails the build if outputs diverge.
- `calibration-agent` — checks band-means are equal across groups.
Same build loop we just used for the Growth Report: plan → spawn component agents → verify
green → **pass the fairness gate** → integrate.

---

## 6. India-first design rules

- **Banned as talent signals (hard firewall):** caste, religion, region, mother tongue,
  college tier/name, gender, age, photo.
- **The wedge:** prove we surface Tier-2/Tier-3 talent that pedigree hiring misses — and prove,
  via matched-pair audits, that we do **not** reproduce the ~20% caste callback gap.
- **Language fairness:** assess content in the candidate's language; English fluency ≠ competence
  (this is why voice is transcribed and assessed as text only — accent/fluency are never scored).
- **Transparency:** every report line traces to the candidate's own words; no hidden features.

---

## 7. The first step (buildable now, no hosting needed)

Ship the **fairness foundation first** — because it's what makes the whole model credible, and
it's the thing a pedigree model can never show:

1. **`fairness/firewall.py`** — deterministic banned-signal guard: pedigree + protected proxies
   can never enter the assessment path. Fail-closed. Unit-tested with Indian-context inputs.
2. **`fairness/impact.py`** — the adverse-impact monitor: impact ratio, selection-rate parity,
   four-fifths gate, two-proportion test — with **college tier as a monitored axis**.
3. **`fairness/matched_pairs.py`** — a bias-probe harness: identical evidence, swapped only on
   name/college tier → asserts identical output. This is your proof of fairness.

Deliverable: a **fairness report** you can show any candidate, employer, or investor — "here is
evidence our pipeline does not reward pedigree." That artifact is a moat a resume-scorer cannot copy.

---

## 8. What we do NOT build (guardrails, restated)

No talent-from-environment regression · no environmental/adversity composite score on a person ·
no college-tier reward · no protected-class or caste inference · no Reddit-scraped "psychology"
features (unrepresentative, unvalidated — it would bake internet stereotypes into hiring) ·
no single blended person-score anywhere · the AI informs, a human decides.

---

## 8b. Research-updated techniques (beyond the four-fifths rule)

- **Counterfactual fairness (Kusner et al. 2017)** — a decision is fair if unchanged in a
  counterfactual world where the person's group differs; the method is *use only
  non-descendants of the protected attribute.* College tier / region / name are descendants
  of caste/SES → excluded **by principle**. This is the firewall's formal spine.
- **Individual fairness through awareness (Dwork et al. 2012)** — similar individuals treated
  similarly → operationalized as the **matched-pair probe** (identical evidence must yield
  identical output; swap only a proxy).
- **Fair ranking under disparate uncertainty** — minority/less-resourced candidates get
  higher-variance estimates (less data about them), and naive ranking buries them. So the
  monitor checks **uncertainty parity** (are our confidence bands systematically wider for a
  group?), not just selection-rate parity. Ties directly to the Bayesian band+CI estimation (§3a).
- **Stand on Aequitas / Fairlearn** (Aequitas built for high-stakes *employment* decisions,
  with a "fairness tree" to choose the right metric) — used as an optional richer layer; core
  metrics implemented natively so nothing hard-depends on them.

## 9. Sources

- Caste-based hiring discrimination, Chennai audit (~20% callback gap): Siddique / Thorat &
  Attewell — https://docs.iza.org/dp3737.pdf ·
  https://www.sciencedirect.com/science/article/abs/pii/S0927537111000807
- Contextual admissions & "distance travelled": Office for Students —
  https://www.officeforstudents.org.uk/publications/contextual-admissions-promoting-fairness-and-rethinking-merit/
  · HEPI — https://www.hepi.ac.uk/2020/05/07/above-and-beyond-predictions-no-exams-presents-an-opportunity-for-innovation-in-contextual-admissions/
  · Monash "achievement relative to opportunity" — https://www.monash.edu/about/who/equity-diversity-inclusion/staff/equitable-decision-making/achievement-relative-to-opportunity
- College Board adversity-score withdrawal (never a single context score): NBC News —
  https://www.nbcnews.com/news/us-news/college-board-replaces-plan-sat-student-adversity-score-n1046976
  · Higher Ed Dive — https://www.highereddive.com/news/college-board-drops-adversity-score-and-shares-its-methods/561871/
- Structured-interview validity & lower adverse impact: Sackett et al. (2022), *Journal of
  Applied Psychology* — revised validity estimates for selection methods.
