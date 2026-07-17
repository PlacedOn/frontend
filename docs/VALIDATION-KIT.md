# PlacedOn — 5-User Validation Kit (concierge / no-deploy)

Goal: get decision-useful signal from **3 candidates + 2 hiring managers** this week,
without deploying the backend. You play the AI (Wizard-of-Oz); the report is real.

---

## The 3 hypotheses you're trying to FALSIFY

Write down a real prediction for each *before* the calls. If you can't be surprised, it's not a test.

1. **Candidate desirability** — Candidates would rather do a 20-min AI interview to get an
   evidence report than send a resume. *Kill signal:* "why would I do this instead of just applying?"
2. **Employer wedge** — A hiring manager would take an intro / first-round based on the
   Evidence Card, and trusts quoted-evidence-with-no-score more than a resume screen.
   *Kill signal:* "I'd still want the resume / where's the overall score?"
3. **Output trust** — People believe the report is *about them* and fair (readiness = coverage,
   not a verdict). *Kill signal:* "this feels like it's judging/ranking me."

You need **2 of 3 surviving** to keep pushing the current shape. If #1 or #2 dies, that's a pivot, not a bug.

---

## Who to recruit (5 total — friends-of-friends is fine)

- 3 candidates: mid-level engineers or new grads actively-or-passively job-looking. Not close friends (too polite).
- 2 hiring managers / people who've screened resumes recently (eng leads, founders, recruiters).

### Outreach you can send today

**Candidate DM:**
> Hey — I'm building something that replaces the resume with a short AI interview that turns
> what you can actually *do* into a verified report (strengths, gaps, a growth roadmap). Can I
> steal 30 min this week? You do a 20-min interview, I show you your report, you tell me if it's
> BS or not. No prep, nothing to install. Genuinely just want your honest read.

**Hiring-manager DM:**
> Quick one — I'm testing a hiring tool that shows you *verified, quoted evidence* of a
> candidate's skills instead of a resume (deliberately no overall "score"). Could I show you one
> real candidate's report for 20 min and get your gut reaction on whether you'd take the intro?

---

## The concierge interview (you = the AI, ~20 min)

Run it like the adaptive loop: pick the role's signals, ask a base question, then go **deeper**
on the thinnest evidence. Keep it text-or-voice, but you assess *content only* — never tone/accent.

**Frame (30s):** "I'll ask about real things you've done. No trick questions — I'm looking for
specifics, not buzzwords. There are no wrong answers."

**Per signal: base → deeper.** Start open, then probe the gap:
- Base: "Tell me about a time you [debugged something hard / shipped under pressure / designed a schema]."
- Deeper (pick based on what's thin): "What did you check *first*?" · "How did you know that was the cause?"
  · "What would you do differently?" · "Walk me through the exact steps." · "What broke, and how did you find it?"
- Stop a thread when you have a concrete, quotable moment; move to the least-covered signal.

**Capture verbatim quotes as they speak** — you'll need real substrings for the report (the
quote must be something they actually said; that's the anti-fabrication rule).

Cover ~4–6 signals in 20 min. Don't rescue weak answers — a gap is data.

---

## Building the report by hand (after the call, ~20 min)

For each signal, write: the **claim**, a **verbatim quote**, and a **band**
(supported / emerging / needs-more-evidence). Then:
- **Evidence Card** (for the employer test): claims + quotes + bands. No score. No selection odds.
- **Growth Report** (for the candidate): readiness = *how much of the role's public requirements
  they evidenced*, the 2–3 edges, the top gaps with a concrete next step, a 3-phase roadmap.
- Use the live demo UI (`/candidate/growth`) once it lands, or a one-pager. Frame every % as
  "coverage of what the role asks for — not a chance you'll be selected."

---

## Feedback capture (same script every time — comparability is the point)

Don't ask "did you like it." Ask for behavior and specifics.

**Candidate, after seeing their report:**
1. First gut reaction — one sentence.
2. Is anything here *wrong* or unfair about you? (tests trust)
3. Would you share this with a hiring manager? Would you post it? (tests desirability — the real vote)
4. Would you do this instead of sending a resume? Why / why not?
5. What's missing that would make it a yes?
6. 1–10: how *seen* did you feel? (and why that number)

**Hiring manager, after seeing an Evidence Card:**
1. Reading this, would you take a first-round / intro? Yes/no + why.
2. Do you trust it more or less than a resume? What specifically?
3. The lack of an overall score — helpful or frustrating? (tests the core bet)
4. What would you *not* trust here?
5. Would you pay for a pipeline of these? (rough vote on the wedge)

**Log per session:** name, role, the 3 hypothesis votes (survived/killed), the single most
surprising quote, and one thing you'd change. Five rows in a table is enough.

---

## What to do with it

- After all 5: which hypotheses survived? What was the most common objection?
- If desirability + wedge survive → deploy is now clearly worth it (real loop, real users).
- If the report content drew the strongest reactions → that tells you exactly where to invest.
- If people kept asking for a score/resume → the positioning (not the tech) needs work first.

The output of this week is **not** more product — it's a one-paragraph "what we learned + what we'll
do next," backed by 5 real reactions.
