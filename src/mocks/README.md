# src/mocks — fixtures only

Everything in this directory is **invented sample data**. None of it came from a
real interview, a real candidate, or the database.

## Why it exists

Measured 2026-08-01 against the production Supabase project:

```
interview_sessions  = 0
report_card_items   = 0
```

There is no real scoring data yet. These fixtures exist so the scoring
components can be built, reviewed, and regression-tested before the interview
pipeline produces anything.

## Rules

1. **Never render a fixture without a visible "Sample data" marker.** A screen
   that presents invented findings as real is the single worst failure mode this
   product has — it is a fabricated assessment of a human being.
2. **No named people.** Fixtures describe traits and quotes, never a person.
   There is no `name`, `photo`, `email`, or `candidateId` pointing at anyone.
   A plausible-looking fake candidate is exactly what gets screenshotted into a
   deck and mistaken for a real result.

   **The one exception, and its conditions.** `pipelineIdentities.ts` carries
   names and contact handles, because the product releases identity at
   shortlist and a pipeline surface that released nothing would be untestable
   theatre. It is allowed only because it cannot be mistaken for a person:
   the names are literally "Fixture Candidate One", and the addresses use the
   RFC 2606 `.invalid` TLD, which can never resolve. There are still no
   photographs — `photo` is banned at every stage, post-shortlist included, and
   the ban is enforced by there being no such field. Identity is reachable only
   through `releaseIdentity(id, shortlistedIds)`, which returns `null` for
   anyone not shortlisted; the map itself is not exported.
3. **No demographic fields**, in fixtures or anywhere else — school, college,
   employer prestige, age, gender, caste, region. See the invariants in
   `src/types/scoring.ts`.
4. **Delete this directory when real data lands.** Fixtures that outlive their
   purpose become a second source of truth.
