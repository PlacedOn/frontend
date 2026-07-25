# Placedon — Feature Roadmap

Organized by area. **S** = small (days) · **B** = big (weeks). "(exists/partial)" notes what's already in the codebase; "DONE" ships in an open PR.

## 1. The interview — core differentiator
- **Voice mode** — STT/TTS pipeline stubbed — **B**
- **Whiteboard / code sandbox** (anti-cheat "show your work") — component exists, unwired — **B**
- **Practice / mock interview** — DONE (PR #12)
- **Accommodations mode** — DONE (PR #13)
- **Resumable / async interview** — DONE (PR #14)
- **Multi-language interviews** (i18n) — **B**

## 2. Evidence & trust — the moat
- **Bias-audit compliance dashboard** (LL144 / EU-AI-Act export) — **B**, sellable
- **Model card / methodology** — partial (`/trust/model-health`) — **S**
- **Evidence Passport 2.0** (verifiable QR/link, expiry, revoke, badge) — **S/B**
- **Per-question explainability** — signal binding half-built — **S**
- **Self-serve data export / deletion** — **S**

## 3. Candidate experience
- **Growth paths** (gaps → learning → re-interview) — **B**
- **Re-interview / refresh evidence** — **S**
- **Proof-of-work imports** (Kaggle, publications, Behance) — **S**
- **Notifications** (intro, match, report ready) — bell exists, unwired — **S**
- **Completeness + gaps-to-close** — DONE (PR #11)
- **Resume PDF** (client-side, privacy-safe) — DONE (PR #10)

## 4. Employer / HR experience
- **Compare candidates side-by-side** — **S**
- **Team collaboration** (shortlists, comments, decision trail) — **B**
- **Calibration loop** — calibration.py exists — **S/B**
- **Interview kit export** — **S**
- **Employer analytics** (funnel, diversity-of-slate) — **B**
- **"What the AI will ask" preview** — DONE (PR #9)
- **"Where the evidence is lighter" gap view** — DONE (candidate-view branch)

## 5. Matching & discovery
- **Real job board + live apply** — half-built (PRs #5/#8) — **B**
- **Saved searches + alerts** — **S**
- **Company profiles** (post-consent reveal) — **S**
- **Team-fit matching** — **B**, novel

## 6. Platform / infra
- **Notifications + transactional email** — **B**
- **ATS integrations** (Greenhouse, Lever, Ashby) — **B**
- **Payments / subscriptions / billing** — **B**
- **SSO / SCIM, API + webhooks, audit logs** — **B**

## 7. Novel bets
- **Interview-once, apply-everywhere passport** as a portable credential.
- **Public fairness badge** — pipeline four-fifths compliance shown to candidates.
- **Growth flywheel** — close a gap → re-interview → new matches.
- **Anonymized benchmarking** — "evidence like yours matches X roles at Y comp."

## 8. Activation & onboarding
- **First-run onboarding checklist** ("get interview-ready") — **S** ← _in progress_
- **Guided empty states** (each surface teaches its purpose) — **S**
- **Sample report preview** (see the outcome before interviewing) — **S**

## 9. Delight & navigation
- **Command palette (⌘K)** — quick nav + actions — **S**
- **In-app toasts / notification center** — **S**
- **Milestone moments** (profile complete, first match — a beat of delight, no score) — **S**

## 10. Sharing & virality
- **Shareable "Verified by Placedon" badge** (link + OG image) — **S**
- **Refer a friend** — **S**
- **Public profile OG images** — **S**

## 11. Content & trust (SEO)
- **Help center / FAQ hub** — **S**
- **Guides** ("how AI interviews work", "your rights under LL144 / EU-AI-Act") — **S**
- **Changelog / what's new** — **S**

## 12. Regional (India-first, naukri-adjacent)
- **INR-native comp inputs + ranges** — **S**
- **Regional role / skill taxonomy** — **S/B**
- **Hindi + regional languages** — **B** (i18n)

## 13. Settings & control
- **Notification preferences** — **S**
- **Privacy dashboard** (what's shared, with whom) — **S**
- **Saved / bookmark jobs + recently viewed** — **S**

## Suggested sequence
1. **Now** (quick, on-brand, deployable): onboarding checklist, command palette, saved jobs, shareable badge, notifications.
2. **Next** (revenue/enterprise): real apply loop → billing → ATS integrations.
3. **Moat bets**: bias-audit compliance dashboard, growth flywheel, public fairness badge.
