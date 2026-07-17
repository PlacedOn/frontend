# PlacedOn `/candidates` — Detailed Build Spec
### (RemoteStar teardown → PlacedOn implementation)

Reference: https://remotestar.io/candidates — full 17-section teardown below,
mapped to a better PlacedOn build. **This is a build spec; nothing built yet.**

---

## 0. Key finding — identical stack

RemoteStar is **Next.js + Tailwind + Radix/Headless UI + Embla/Swiper carousel on
Vercel** (from `/_next/image`, optimized images, accessible accordions). That is
**exactly PlacedOn's stack.** Every pattern ports 1:1 into our Frost Luxe system —
no framework friction, no rewrite. We just execute it more premium.

---

## 1. RemoteStar's 17 sections → our decision

| # | RemoteStar section | Decision | PlacedOn version |
|---|--------------------|----------|------------------|
| 1 | Nav (For Companies/Candidates/Jobs/Login) | keep | our nav + "For candidates" → `/candidates` |
| 2 | Hero "Skip the Screening, Get Hired 10x Faster" + avatar cards | **adapt** | pain+promise, our control angle, avatar proof strip |
| 3 | "As Featured In" press logos | **replace** | compliance strip (LL144 · EU AI Act · bias-audited) until real press |
| 4 | Problem + **inbox mockup** (127 sent / 0 read, tabs) | **steal** | our inbox mockup — the gut-punch |
| 5 | Recruiter problem "300 vs 1" stat cards | **steal** | "300 resumes, 20s each" |
| 6 | Candidate example card (Maya, 94%) | merge into §7 | — |
| 7 | Belief "Resumes don't prove skills" comparison | **steal** | claims vs proven, 2-col |
| 8 | The Shift + **interview scorecard mockup** | **steal + upgrade** | our **Trust Passport scorecard** with control |
| 9 | **4-step Journey** stepper (accordion) | **steal + differentiate** | step 3 = "Approve what employers see" |
| 10 | Profile / LinkedIn+resume cards | **adapt** | shareable Trust Passport link (Phase D) |
| 11 | **AI Job Match** cards carousel (%, salary, tags) | **steal** | "Roles that fit your evidence" + reasons |
| 12 | Featured jobs grid | **adapt** | live roles (backend) |
| 13 | Viral moment / CEO reel | **drop for now** | (no equivalent asset; revisit) |
| 14 | Press coverage carousel | **defer** | until real press |
| 15 | **Testimonials carousel** | **steal** | labeled real-or-sample |
| 16 | **FAQ accordion** | **steal** | our 6 Qs |
| 17 | Footer | keep | already have it |

---

## 2. PlacedOn `/candidates` — final section list (what we build)

| # | Section | Component | Layout | Data | Motion | 21st.dev ref |
|---|---------|-----------|--------|------|--------|--------------|
| 1 | Hero | headline + dual CTA + avatar strip | 2-col | static | rise-in | — |
| 2 | Trust strip | compliance badges | row | static | fade | — |
| 3 | The invisible problem | **inbox mockup** (tabbed) + 3 stat cards | 2-col | static/mock | tab-switch, scroll-reveal | — |
| 4 | Recruiter reality | 3 stat cards + avatar cluster | 3-col | static | count-up | — |
| 5 | Resumes vs proven | 2-col comparison | 2-col | static | reveal | — |
| 6 | **Sample Trust Passport** | scorecard w/ traits+evidence+visibility toggles | card | reuse `/demo/hcv` shape | bar-fill, toggle | — |
| 7 | **Your 4 steps** | accordion stepper | vertical | static | expand | — |
| 8 | **Roles that fit** | match-card carousel (%, salary, reason) | carousel | `/demo/matches` shape | auto-rotate | **JobCard #7085** |
| 9 | You're in control | consent/visibility explainer | 3-up | static | lock anim | — |
| 10 | Proof | testimonial carousel | carousel | labeled samples | auto-rotate | **#5632 / #1570** |
| 11 | FAQ | accordion | vertical | static | expand | — |
| 12 | Final CTA + email | email signup (magic link) | centered | Supabase (Phase C) | — | — |

---

## 3. Custom component specs (the complex ones)

### 3a. Inbox mockup (§3) — the gut-punch
- Header: "Your application inbox · **0 / 148 read**"
- Tabs: `All 148` · `Auto-rejected 92` · `No reply 56` (tab switch, only active shown)
- Rows (6 visible): role · company · "14d ago" · status pill (red "Auto-rejected" / gray "No reply")
- Footer row: "+ 142 more — into the void"
- Note beneath: "You're not unqualified. You're **unread**."

### 3b. Sample Trust Passport scorecard (§6) — our upgrade over their scorecard
- Candidate: "Sample profile · ML Engineer" + "Verified via interview" badge
- Overall: 2 bars — Technical depth, Communication (animated fill)
- 4 trait rows: label · % · **the candidate's own quote** · **[Employer-visible ▸ tap to hide]** toggle
- Caption: "Every score links to your own words — and you decide what employers see." ← RemoteStar can't say this.

### 3c. 4-step journey (§7)
Steps: **1** Take the interview · **2** Review your evidence · **3** **Approve what employers see** · **4** Get matched.
Accordion: click to expand detail + 3 bullets + inline CTA. Step 3 visually highlighted (our differentiator).

### 3d. Match-card carousel (§8)
Card fields (port JobCard #7085 → Frost Luxe): LIVE badge · role · salary band · 2 tags · **`92% match`** · **"matched on: structured debugging, ambiguity"** (the *reason* — evidence-linked, not opaque). "+ N more today".

---

## 4. Data plan

- **Static:** hero, trust strip, recruiter stats, belief, control, FAQ.
- **Mock now → live later:** scorecard (reuse `DemoHcvResponse`), match cards (reuse `DemoMatch`), so they flip to real data with the backend — no rework.
- **Testimonials:** labeled sample data until real ones exist. **No fake press logos.**

## 5. 21st.dev components to port

| Section | 21st.dev | id | How we adapt |
|---------|----------|----|--------------|
| Match cards | JobCard | 7085 | restyle to Frost Luxe glass, add match% + reason |
| Testimonials | Profile Card Testimonial Carousel | 5632 | our tokens, reduced-motion aware |
| Testimonials (alt) | Testimonial Carousel | 1570 | fallback |

(Port the *design*, not raw shadcn install — our Tailwind 4 + tokens differ.)

## 6. Copy bank (PlacedOn — honest, differentiated)

- Hero: **"Skip the resume pile. Get hired for how you actually work."** / *"Prove your skill in one conversation. Then decide exactly what employers see."*
- Problem: **"You're not unqualified. You're unread."**
- Belief: **"Resumes list claims. One conversation proves them."**
- Control: **"You approve every trait. Employers never see your raw interview."**
- Positioning north-star: **"RemoteStar scores you. PlacedOn hands you the mic — and the veto."**

## 7. Build order (Phase A — no infra needed)

1. Route `/candidates` + section scaffolding (Frost Luxe).
2. Sections 1–5 (static) → build + screenshot.
3. Sections 6–8 (scorecard, journey, match carousel — reuse existing mock shapes).
4. Sections 9–12 (control, testimonials, FAQ, email CTA).
5. Wire nav "For candidates" → `/candidates`; mobile 375px pass; deploy.
6. Mirror `/companies` (employer-facing) after.

Estimate: the candidate landing is ~1 focused build pass.

## 8. What I need from you

1. **Approve** the section list + positioning.
2. Any **real testimonials / numbers / press**? (else labeled samples.)
3. **21st.dev API key** (optional — for exact component code; else I port from previews).
4. Infra step (Upstash + Render) later, to flip §6/§8 to live data.

**Recommendation:** approve → I build Phase A (`/candidates`) now. It needs nothing from you and gives you a RemoteStar-grade page to show today.
