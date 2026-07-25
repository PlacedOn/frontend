# Placedon — Feature Roadmap

Organized by area. **S** = small (days) · **B** = big (weeks). "(exists/partial)" notes what's already in the codebase.

## 1. The interview — core differentiator
- **Voice mode** — STT/TTS pipeline is stubbed — **B**
- **Whiteboard / code sandbox** for technical roles ("show your work" anti-cheat) — whiteboard component exists, not wired — **B**
- **Practice / mock interview** (low-stakes warm-up) — **S** ← _in progress_
- **Resumable / async interview** (pause & continue) — **S**
- **Multi-language interviews** (i18n) — **B**
- **Accommodations mode** (extra time, format flex — no questions asked) — **S**

## 2. Evidence & trust — the moat
- **Bias-audit compliance dashboard** (LL144 / EU-AI-Act export, four-fifths, scheduling) — **B**, sellable
- **Model card / methodology page** — partial (`/trust/model-health`) — **S**
- **Evidence Passport 2.0** (verifiable QR/link, expiry, revoke, "Verified by Placedon" badge) — passport exists — **S/B**
- **Per-question explainability** (why the AI asked this → the role signal) — signal binding half-built — **S**
- **Self-serve data export / deletion** (GDPR/DPDP) — **S**

## 3. Candidate experience
- **Growth paths** (gaps → curated learning → re-interview) — growth surface exists — **B**
- **Re-interview / refresh evidence** — **S**
- **Proof-of-work imports** beyond GitHub (Kaggle, publications, Behance) — **S**
- **Notifications** (intro, match, report ready) — bell exists, unwired — **S**
- **Mobile PWA** — **B**
- **Completeness + gaps-to-close** — DONE

## 4. Employer / HR experience
- **Compare candidates side-by-side** — **S**
- **Team collaboration** (shared shortlists, comments, decision trail, permissions) — **B**
- **Calibration loop** (HR agrees/disagrees with AI bands → improves model) — calibration.py exists — **S/B**
- **Interview kit export** for the human final round — **S**
- **Employer analytics** (funnel, time-to-intro, diversity-of-slate) — **B**
- **"What the AI will ask" preview** — DONE
- **"Where the evidence is lighter" gap view** — DONE

## 5. Matching & discovery
- **Real job board + live apply** — half-built (PRs open) — **B**
- **Saved searches + alerts** (both sides) — **S**
- **Company profiles** (revealed post-consent) — **S**
- **Team-fit matching** (candidate evidence vs a team's gaps) — **B**, novel

## 6. Platform / infra
- **Notifications + transactional email** — **B**
- **ATS integrations** (Greenhouse, Lever, Ashby) — **B**, enterprise
- **Payments / subscriptions / usage billing** — **B**
- **SSO / SCIM, API + webhooks, audit logs** — **B**

## 7. Novel bets
- **Interview-once, apply-everywhere passport** as a portable credential — the whole thesis.
- **Public fairness badge** — show pipeline four-fifths compliance to candidates.
- **Growth flywheel** — close a gap → re-interview → new matches (retention + data moat).
- **Anonymized benchmarking** — "candidates with your evidence match X roles at Y comp."

## Suggested sequence
1. **Now** (quick, on-brand, deployable): practice mode, notifications, saved/bookmark jobs, re-interview, model-card polish.
2. **Next** (revenue/enterprise): real apply loop → billing → ATS integrations.
3. **Moat bets**: bias-audit compliance dashboard, growth flywheel, public fairness badge.
