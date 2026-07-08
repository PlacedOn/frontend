# PlacedOn V1 — UI/UX Plan v2

**Refines:** `frontend-ui-ux-v1-plan.md` + `frontend-brand-motion-system-v1.md`.
**Principle:** two moods, one brand. Marketing seduces; the product calms. Both are unmistakably PlacedOn — violet signal, protected candidate, evidence over resume.

---

## 1. Two modes of the same system

| | **Frost Luxe** (marketing) | **Calm Product** (candidate/employer app) |
|---|---|---|
| Where | `/`, `/trust`, `/demo` | `/pre-interview`, `/interview`, `/candidate*`, `/employer*` |
| Feeling | luxurious, airy, confident | quiet, focused, low-pressure |
| Surfaces | glass on porcelain, aurora mesh, depth | flatter, more whitespace, one object per view |
| Color | violet + scarce amber signal | violet for progress only; **no red, no score, no clock** in interview |
| Motion | signature reveals, count-ups | state-explaining only (orient / confirm) |

Both consume the **same tokens** in `globals.css`. Calm Product is Frost Luxe with the decoration turned down, not a different theme.

---

## 2. Motion system — adopt the v1 tokens as canonical

Replace ad-hoc easings with the v1 plan's scale (§7.3). Add to `globals.css`:

```css
--ease-out: cubic-bezier(.16, 1, .3, 1);
--ease-in-out: cubic-bezier(.65, 0, .35, 1);
--d-tap: 90ms;  --d-micro: 150ms; --d-small: 220ms;
--d-panel: 340ms; --d-page: 520ms; --d-story: 760ms; --d-hero: 900ms;
```

Rules (unchanged from v1): exits are 65% of entrances; page load ends by 900ms; loops only in the interview "listening" state; `prefers-reduced-motion` turns all movement into opacity fades.

**Every motion must serve one of four intents** — otherwise it gets cut:
`orient` (where am I / what changed) · `evidence` (proof chain: quote→trait→citation) · `calm` (presence without pressure) · `confirm` (this action succeeded).

### Signature motions & where they live
- **Gateway reveal** — home load, interview start, profile approval. Two violet planes (logo metaphor) open around content. Runs once.
- **Evidence extraction** — hero demo, employer card, profile gen. Quote → violet trace → trait gauge → citation. This is the product's soul; keep it legible.
- **Breathing mark** — interview listening only. 2.8s violet pulse. No spinner, no red.
- **Trust seal** — profile approval / demo success. Small violet seal settles in. No confetti.
- **Shortlist drawer** — employer feed. Detail slides from right; list stays anchored.

---

## 3. Component inventory (v1 §8 → status)

**Exists & reusable:** `Logo`, `GlassCard`/`.glass`, `Reveal`, `TiltCard`, `CountUp`, `DemoDialog` (modal), `RouteHeader`, `RoutePage`, `AuroraMesh`, `InterviewDemo` (signature evidence-extraction animation).

**Build next (Wave 1, no backend):** `DemoRequestForm` + `Select`/`Field` primitives (this build), `NextActionCard` + candidate dashboard state cards, `RoleList`/`CreateRoleDialog`, `ProfileTraitCard` + `EvidenceDrawer`.

**Build in Wave 2/3 (backend-bound):** `InterviewQuestionCard`, `InterviewComposer`, `BreathingMark`, `AutoSaveIndicator`, `ReconnectBanner`, `Toast`/`UndoToast`, `RequestIntroDialog`.

---

## 4. Non-negotiables (checklist, every screen)

- One primary object, one primary action, one visible next step.
- Buttons carry all 8 states (rest/hover/active/focus/loading/success/disabled/error); loading locks width; focus ring always visible.
- Action-specific labels: `Begin interview`, `Request demo`, `Approve profile` — never bare `Submit`.
- Touch targets ≥ 44px; body ≥ 16px on mobile; no horizontal scroll at 375px.
- Contrast ≥ 4.5:1; color is never the only signal; every input has a `<label>`.
- `prefers-reduced-motion` respected; images have dimensions + alt.
- Interview screen: no red, no countdown, no score, no fake typewriter, one question at a time.

---

## 5. `/demo` — first fully-designed Wave 1 surface (this build)

Frost Luxe, editorial, not a boxy form. Left column = the promise ("See PlacedOn on your own roles"), right column = a glass form card. Fields per v1 §15.12: name, work email, company, hiring volume, role type, message. Submit → **trust seal** confirm (`--d-panel`), persists to Supabase `demo_requests`. Full state matrix: empty / focused / valid / error / saving / success. No dead `Book a demo` button remains anywhere.
