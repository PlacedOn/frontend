# Placedon AI Assistant — System Design

The assistant is Placedon's **core conversational surface** — a claude.ai/new-style
chat that helps each user get exactly what they're looking for, grounded in *their*
real data, never invented and never a score.

## Why a chat is the right core
A hiring product has two anxious users — a candidate ("am I good enough? what do I
fix?") and a hiring team ("who actually fits, and why?"). A blank dashboard makes
them hunt. A conversation lets them **ask in their own words** and get a grounded,
cited answer. That's the whole thesis — evidence over résumés — made interactive.

## Two-sided, one surface
| User | The assistant helps them… | Grounded in |
|---|---|---|
| **Candidate** | fit, top gap, next step, strengths, "what should I do?" | their approved GrowthReport / evidence |
| **Hiring team** | "find backend engineers strong on X", "who's worth an intro?", explain a match | the visibility-scoped candidate pool + Role DNA |

The UI is identical; the **context** and the **tools** differ by role.

## How it understands the user deeply (context pipeline)
Every turn is answered with a **grounded context bundle**, not a blank prompt:
1. **Identity & intent** — role (candidate/employer), target roles, seniority, prefs.
2. **Evidence** — the candidate's approved report-card bands + quotes (or, for HR, the
   role's Role-DNA signals + coverage). *Never the raw transcript.*
3. **State** — where they are in the journey (interviewed? gaps open? matches?).
4. **The question** — mapped to an intent/tool.

Today `matchIntent()` + `answer()` (in `lib/candidate/assistant.ts`) resolve this
deterministically from the `GrowthReport` — a real, grounded stand-in. The LLM swaps
in **behind the same seam**: same context bundle in, same `AssistantAnswer` out.

## Architecture (request path)
```
User message
  → buildContext(role, profile, evidence, state)   // the grounding bundle
  → route to a TOOL (fit · gaps · next · strengths · search · explain-match · help)
  → answer engine: deterministic today → LLM (grounded, cited) tomorrow
  → stream tokens back  (claude-style word-by-word)
  → render: prose + evidence items (band + quote) + a suggested next action
```
The **contract stays stable** across the swap: `answer(intent, context) → { text, items?, note? }`.

## Guardrails (non-negotiable, on-brand)
- **Grounded only** — answers cite the user's own evidence; the model may never invent a trait or a number. Unknown → say so + suggest the interview.
- **No score, ever** — bands/tiers/quotes, not a person-score.
- **Consent-first** — the candidate's assistant never exposes anything an employer would see without approval; the HR assistant only sees visibility-scoped, approved evidence.
- **Bias firewall** — the same pedigree/protected-trait firewall that guards the interview guards the assistant's context.

## Interface (claude.ai/new pattern)
- **Empty state**: centered greeting + one big input + a few suggested prompts (persona-aware). Nothing else competing.
- **Conversation**: user bubbles right, streamed assistant answers left with evidence chips; input pinned to the thumb zone.
- **Calm, quiet motion** — a typing stream, not a spinner.

## Roadmap for the assistant
- **v1 (this PR)**: claude-style chat surface at `/assistant`, grounded by the existing answer engine, streamed responses, suggested prompts. Frontend-only, deployable.
- **v2**: wire the real LLM behind `answer()` with the grounded context bundle + tool-calling (fit/gaps/search/explain-match); server-streamed tokens.
- **v3**: memory across sessions, proactive nudges ("you're one gap from 5 more roles"), and the HR side (candidate search + match explanations) on the same surface.
