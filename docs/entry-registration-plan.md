# PlacedOn — First-Page Entry & Email Registration Plan (v1)

**Question:** what should the first page be for a **candidate** vs a **company/HR**,
and how do they register with email?

**Core recommendation:** two audiences with opposite goals must never share the
same first screen. Split the path early, then use **one email field** (passwordless
magic link via Supabase Auth) as the single entry action. Low friction wins.

---

## 1. The decision: one landing, two front doors

The marketing homepage stays as-is (it already has a hero + "For teams" / "For
candidates" sections). We add a clear **role gateway** and role-specific signup:

```
                     placedon-web.vercel.app  (marketing)
                                 │
                 ┌───────────────┴────────────────┐
        "For candidates / Take an interview"   "I'm hiring / Book a demo"
                 │                                  │
        /candidate/signup                   /company/signup
        (candidate email)                   (work email)
                 │                                  │
        magic link → name                  magic link → company + role
                 │                                  │
        /pre-interview → interview          /employer → create first role
```

**Why split, not one generic form:** a candidate wants reassurance ("this won't
expose me"); an employer wants proof ("this saves me résumé triage"). Different
copy, different next step, same 1-field email start.

---

## 2. Email registration mechanism — **Supabase Auth, magic link (passwordless)**

We already run Supabase. Use **Supabase Auth** — no new service, no passwords to
manage, secure by default.

| Choice | Recommendation | Why |
|--------|----------------|-----|
| Method | **Magic link / email OTP** (passwordless) | zero password friction; ideal for candidates and first-touch HR |
| Passwords | defer to later | fewer support issues, faster signup |
| SSO (Google/Microsoft) | phase 2 | nice for HR, not needed for v1 |
| Session storage | Supabase httpOnly cookies (`@supabase/ssr`) | never localStorage (XSS-safe) |

**Flow:** enter email → Supabase emails a magic link → click → authenticated
session → role-based redirect. One field, one click.

### Data model (Supabase, with RLS)
```
profiles
  id           uuid  (= auth.users.id)   PK
  role         text  'candidate' | 'employer'
  email        text
  full_name    text
  company      text        -- employers only
  job_title    text        -- employers only
  created_at   timestamptz default now()
```
RLS: a user can read/update **only their own row** (`auth.uid() = id`). Role is
set at signup and drives every redirect.

---

## 3. Candidate first page (`/candidate/signup`)

**Goal:** get them into the interview with the least possible friction, while
making them feel safe.

**What they see first (above the fold):**
- Headline: *"Your interview. Your terms."*
- One line of trust: *"No résumé. You review and approve everything before any employer sees it."*
- **One field: email → "Continue with email"** (magic link)
- Small print: takes 30–40 min, works on mobile, accommodations available.

**After the magic link:**
1. Optional: first name (one field) — skippable.
2. Straight to `/pre-interview` (the consent screen that already exists) → interview.

**Principle:** never ask a candidate for anything you don't need yet. No résumé
upload, no long form. Email → interview.

---

## 4. Company / HR first page (`/company/signup`)

**Goal:** self-serve start with a work email, land them on a role.

**What they see first:**
- Headline: *"Hire on evidence, not résumés."*
- Proof line: *"Every candidate has interviewed. You see approved signals — never a raw transcript."*
- **One field: work email → "Get started"** (magic link)
- Secondary: *"Prefer a walkthrough? Book a demo"* → existing `/demo`.

**After the magic link:**
1. Two fields: **company name** + **your role/title**.
2. Land on `/employer` → prompt: *"Create your first role."* (the Add-role dialog already exists).

**Optional gate (your call):**
- **Self-serve (recommended for v1):** anyone with a work email starts immediately — faster growth, more pilots.
- **Gated:** signup creates a "pending" employer; you approve access. More control, more friction. Keep `/demo` as the high-touch path either way.
- Light guard: block obvious free-mail domains (gmail/yahoo) on the company path, nudge them to "Book a demo" instead.

---

## 5. How it fits the existing app

- **Marketing homepage** unchanged; its CTAs now point at the two signup pages.
- **`/demo`** stays as the high-touch "book a demo" path (already saves to Supabase).
- **Dashboards** (`/candidate`, `/employer`) become **session-gated**: no session → redirect to the matching signup.
- **FastAPI backend does no auth** — Supabase Auth owns identity; the backend stays about interview/data. The frontend passes the candidate/employer identity as needed.
- **Live-or-mock** data pattern is untouched.

---

## 6. Implementation plan (phased)

| Phase | Work | Output |
|-------|------|--------|
| 1 | Supabase Auth: enable email magic link; create `profiles` table + RLS; add `@supabase/ssr` client + middleware | auth backbone |
| 2 | `/candidate/signup` + `/company/signup` pages (1-field email, role copy) | two front doors |
| 3 | `/auth/callback` route: exchange code → set session → role-based redirect | working login |
| 4 | Post-signup capture: candidate name; company name + role | profiles filled |
| 5 | Session-gate `/candidate` + `/employer`; wire homepage CTAs + nav "Dashboard"/"Sign in" to real auth | closed loop |
| 6 | Polish: magic-link "check your email" states, error/expired-link handling, resend | production-ready |

**New env (frontend, Supabase — publishable, safe):**
```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…      # publishable anon key (safe in browser)
```
(The service-role key stays server-only and out of the web app.)

---

## 7. Security

- Passwordless → no password breaches; magic links are single-use + expiring.
- Sessions in Supabase httpOnly cookies — never localStorage.
- RLS so a user only ever reads their own profile.
- Route-gating is UX only; **Supabase RLS is the real enforcement** on data.
- Work-email hygiene on the company path (optional domain check + honeypot).

---

## 8. My recommendation in one line

**Two front doors, one email field each, passwordless via Supabase Auth,
self-serve for both roles — candidate goes email→interview, company goes
email→first role.** Ship that; add passwords/SSO/gating only if a real need shows up.

### Decisions I need from you to build it
1. **Passwordless magic link** (recommended) or classic email+password?
2. **Company path: self-serve** (recommended) or gated/approval?
3. Should candidate signup ask for **name up front**, or skip straight to the interview?
