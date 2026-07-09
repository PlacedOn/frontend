# PlacedOn — Candidate Platform Plan (benchmarked vs RemoteStar)

**Goal:** rebuild the candidate experience to match RemoteStar's conversion power
— and beat it — while keeping PlacedOn's real edge: candidate control, evidence,
and compliance. Reference: https://remotestar.io/candidates.

**First: this is the plan.** Nothing is built yet. Build order in §6.

---

## 1. What RemoteStar does well (what we steal)

Same thesis as us (skills > résumés, AI interview, verified profile, job match),
but they win on **story and conversion**:

1. **Pain-point hero** — "You're not unqualified. You're just invisible."
2. **The failure visual** — an application inbox: *127 sent · 0 callbacks · 81 ATS-rejected*. Instantly relatable.
3. **Sample scorecard** — a real AI-interview report as the product demo.
4. **A 4-step candidate journey** — interview → profile → fast-track → jobs.
5. **AI job matcher** — "1,000+ jobs scanned daily", %-match cards.
6. **Stacked social proof** — press logos, viral moment, rotating testimonials.
7. **FAQ accordion** + **free-credits hook** (low-friction entry).

## 2. Where PlacedOn already beats them (what we lean into)

RemoteStar is a black box that scores you. **PlacedOn gives the candidate control** —
that's our moat and our story:

| PlacedOn edge | RemoteStar |
|---------------|-----------|
| **You approve every trait before employers see it** | scores you, you don't control it |
| **Employers never see your raw transcript** — only approved evidence | full report exposed |
| **Every trait links to your own words** (evidence, not a black-box %) | opaque scoring |
| **LL144 + EU AI Act compliance, bias-audited, contestable** | not emphasized |
| **Premium "Liquid Glass" design** (skill-confirmed) | plainer, template-ish |

**Positioning line:** *RemoteStar scores you. PlacedOn hands you the mic — and the veto.*

## 3. Design direction (skill + 21st.dev)

- **Landing structure (ui-ux-pro-max):** Hero → Problem → Solution → Testimonials (social proof) → CTA. Social proof *before* the final CTA.
- **Style:** keep **Liquid Glass / Frost Luxe** (violet `#6922F5`, glassmorphism) — the skill's recommended style for premium SaaS. Cleaner and more premium than RemoteStar.
- **21st.dev components to port** (adapt to our tokens, not raw shadcn install):
  - Testimonial carousel — *Profile Card Testimonial Carousel* (#5632) / *Testimonial Carousel* (#1570)
  - Job match cards — *JobCard* (#7085)
- Keep our motion discipline (reduced-motion, compositor-only).

---

## 4. The new candidate landing (`/candidates`) — section by section

Modeled on RemoteStar, executed better. (New route `/candidates`; homepage stays the dual-audience gateway.)

| # | Section | Copy direction | Why it beats RemoteStar |
|---|---------|----------------|-------------------------|
| 1 | **Hero** | "Skip the résumé pile. Get hired for how you actually work." · CTA: *Take your interview — free* + *See a sample profile* | control + evidence framing, premium look |
| 2 | **The invisible problem** | "You're not unqualified. You're unread." + an **application-inbox visual** (sent / no reply / auto-rejected) | same gut-punch, our brand |
| 3 | **The shift** | "Résumés list claims. One conversation proves them." | ties to our thesis |
| 4 | **Sample Trust Passport** | a real evidence-backed profile: traits + the candidate's own quote + "employer-visible" toggles | **shows candidate control** — RemoteStar can't |
| 5 | **Your 4 steps** | Interview → Review your evidence → **Approve what employers see** → Get matched | step 3 (approve) is our differentiator |
| 6 | **Roles that fit your evidence** | %-match cards with the *reason* ("matched on: structured debugging") | evidence-linked, not opaque |
| 7 | **You're in control** | consent/visibility explainer: raw transcript never shared, contest any trait | our moat, front-and-center |
| 8 | **Proof** | testimonials carousel + compliance badges (LL144 / EU AI Act) + press (when real) | compliance = B2B credibility |
| 9 | **FAQ** | accordion: is it free, how long, who sees it, can I retake, can I contest | objection handling |
| 10 | **Final CTA + email signup** | "Your interview. Your terms." → email (magic link) | ties to the entry/registration plan |

**Honesty rule:** no fake press logos, no invented testimonials, no fabricated
"10,000 hired" stats. Use real numbers or aspirational-but-clearly-illustrative
sample data, labeled as samples.

---

## 5. The operational product (features from our GitHub loops)

A landing is the front; these make it a real product. Status today:

| Loop | Route | Status | To reach "operational" |
|------|-------|--------|------------------------|
| Candidate dashboard | `/candidate` | built (mock-or-live) | backend live |
| Interview (adaptive, streaming) | `/interview` | built + reconnect | backend live (WS) |
| Trust Passport (review/approve/hide) | `/candidate/profile` | built | backend `/demo/hcv` live |
| Matches (why-this-fits) | `/candidate/matches` | built | real matching engine |
| Applications / intros | `/candidate/applications` | built | backend live |
| Employer evidence dashboard | `/employer` | built | backend live |
| **Auth / email registration** | `/candidate/signup` `/company/signup` | **planned** (Supabase magic link) | build it |
| **Analytics / learning** | — | **not built** (#3) | build it |

So "operational with all the features" = **new candidate landing** + **the 8 loops
above wired to a live backend + real auth**.

---

## 6. Build order (phased)

**Phase A — Landing (frontend-only, no infra needed):**
1. `/candidates` page — sections 1–10 above (Frost Luxe, ported 21st.dev carousel + job cards).
2. Homepage gateway points here; nav "For candidates" → `/candidates`.
3. Employer counterpart `/companies` (mirror, evidence-first).

**Phase B — Make it real (needs your 20-min infra step):**
4. Deploy backend (Upstash + Render) → all loops flip to live data + real interview.

**Phase C — Front door:**
5. Supabase Auth (magic link) + `/candidate/signup` + `/company/signup` + session-gating (per `entry-registration-plan.md`).

**Phase D — Operational depth:**
6. Real job/role matching, analytics loop (#3), candidate profile share link (like RemoteStar's shareable profile — a public, candidate-approved evidence page).

---

## 7. What I need from you

1. **Approve this plan / tweak the positioning** ("scores you vs hands you the mic").
2. For real launch data: any **real testimonials, press, or numbers**? (else I use clearly-labeled samples.)
3. The **infra step** (Upstash + Render) whenever you're ready — unblocks Phase B.
4. A **21st.dev API key** if you want me to pull the exact component code (else I port from the previews to our design system).

**My recommendation:** approve, and I start **Phase A (the new `/candidates` landing)** now — it's high-impact, needs nothing from you, and gives you the RemoteStar-grade page to show people. Backend + auth follow.
