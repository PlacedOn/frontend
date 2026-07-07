# PlacedOn — Web (Frontend)

Marketing site + product surfaces for **PlacedOn** — hire for how people actually think.
One adaptive interview, real signal instead of résumés.

**Design direction:** "Frost Luxe" — light, airy luxury glassmorphism, brand violet `#6922F5`,
living gradient-mesh motion, and a single warm signal accent.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** with design tokens as the single source of truth (`src/app/globals.css`)
- **Motion** (Framer Motion) for animation
- Deployed on **Vercel** → https://placedon-web.vercel.app

## Getting started

```bash
pnpm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the backend
pnpm dev                     # http://localhost:3000
```

Build and run production:

```bash
pnpm build
pnpm start
```

## Routes

| Route            | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `/`              | Marketing landing (hero, how-it-works, stats, testimonials, CTA) |
| `/trust`         | Trust & fairness (LL144, EU AI Act, contestable traits) |
| `/pre-interview` | Readiness, consent, accommodations              |
| `/interview`     | Live interview room (WebSocket-backed)          |
| `/employer`      | Candidate discovery (typed to backend contract) |
| `/candidate`     | Candidate matches (typed to backend contract)   |

## Backend integration

The typed client in `src/lib/api.ts` mirrors the FastAPI backend
(`PlacedOn/Product-Research → PlacedOn/backend`). It is env-driven:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Data contracts live in `src/lib/types.ts` (CandidateProfile, JobProfile,
InterviewState, CandidateMatch, EmployerCandidate) and match the backend's
`data-contracts.md` so responses map without translation.

## Project structure

```
src/
├── app/                 # routes (App Router) + globals.css (design tokens)
├── components/
│   ├── brand/           # animated logo
│   ├── background/      # AuroraMesh living-gradient backdrop
│   ├── ui/              # Button, Reveal, CountUp, TiltCard
│   ├── demo/            # DemoDialogProvider (Book a demo modal)
│   ├── layout/          # RouteHeader, RoutePage
│   └── sections/        # Nav, Hero, HowItWorks, Stats, Testimonials, CTA, Footer
└── lib/                 # api client, types, cn
```

## Deploy

```bash
pnpm exec vercel --prod --yes
```
