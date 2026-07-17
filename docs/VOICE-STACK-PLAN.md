# PlacedOn Voice Stack — Two-Way Speech, Assessed as Text Only

**Owner decision (2026-07-15):** V1 stays **text-first**. Voice ships as an
**opt-in fast-follow** on a real production stack. The non-negotiable rule:
**a spoken answer is transcribed and assessed as text only — we never score
accent, tone, fluency, pace, or filler.** This is a fairness and legal position
(LL144 / EU AI Act / ILO), not a technical limitation.

This document is the buildable plan. The deterministic, testable parts are
**already built** (see §11); the parts that need API keys + the hosted GPU/edge
path are specified for the fast-follow.

---

## 1. Why voice is hard here (and why the rule exists)

Speech assessment tools routinely score *how* someone talks. For hiring that is a
disparate-impact machine: accent, cadence, and disfluency correlate with national
origin, class, disability, and neurodivergence. Scoring them is both unfair and,
under NYC LL144 / the EU AI Act's high-risk regime, legally radioactive.

So we split the two things vendors conflate:
- **Transport** (getting the words): speech → text. Allowed.
- **Assessment** (judging the person): must operate on **words only**.

The firewall (§4) makes "words only" a structural guarantee — a transcribed
answer and a typed answer of the same words are *the same object* downstream.

---

## 2. Architecture — the whole path

```
 CANDIDATE                          BACKEND (/v1)                        AI / TEXT PIPELINE
 ─────────                          ─────────────                        ──────────────────
 mic ─ MediaRecorder/AudioWorklet
   │  PCM/Opus frames (binary)
   ▼
 WSS  ──────────────►  /v1/interviews/{id}/live
                          │  (JWT validated before loop)
                          ▼
                       STT provider (Deepgram Nova-3 streaming)
                          │  speech_started / partial / final
                          ▼
                   ┌──  FIREWALL: to_assessable_text()  ──┐   ← ONLY the transcript string
                   │    (drops timing, prosody, accent)   │      crosses this line
                   └──────────────────┬───────────────────┘
                                      ▼
                        SAME text interview pipeline  ◄── identical to typed answers
                        (planner · question_strategy · judge · evidence_builder)
                                      │  question text
                          ┌───────────┴───────────┐
                          ▼                        ▼
                    persist turn            TTS provider (ElevenLabs Flash)
                 (answer_text_encrypted)         │  audio chunks (binary)
                                                 ▼
                                          WSS ──► candidate hears the question
                                                 (and reads it as captions)
```

Text answers skip the top two boxes and enter the *same* pipeline. Voice is a
transport adapter bolted to the front — nothing about assessment changes.

---

## 3. Two-way conversation design

A real conversation, not walkie-talkie. Reused from the versioned WS protocol
(`"v":1`) already defined for `/v1/interviews/{id}/live`:

| Concern | Mechanism |
|---|---|
| **AI speaks** | `question` text → TTS → binary `tts_chunk` frames → `tts_end`. Rendered as captions simultaneously (deaf/HoH + noisy-environment support). |
| **Candidate speaks** | binary PCM frames → STT → `stt_partial` (live captions) → `stt_final`. |
| **Turn-taking** | Deepgram `speech_started` + endpointing events drive "you're talking / we're listening / thinking". No fixed timers. |
| **Barge-in** | `{type:"barge_in"}` — candidate starts talking over TTS → stop playback, switch to listening. |
| **Push-to-talk fallback** | `{type:"audio_end"}` for noisy environments / when VAD is unreliable. |
| **Ack** | `{type:"ack"}` renders "Saved ✓" <150 ms after the final transcript — the candidate sees their words landed. |
| **Thinking** | `{type:"status","state":"thinking"}` shimmer while the next question forms. |
| **Two-way clarify** | `{type:"clarify_request"}` — the candidate can ask *the AI* to rephrase (the audit's missing affordance). |
| **Mode switch** | `{type:"mode_switch","mode":"text"}` — drop to typing mid-interview with zero friction; the report card later shows quotes from both halves, indistinguishable. |
| **Reconnect** | 3 failed WS retries → "continue in text via HTTPS" (`POST /v1/interviews/{id}/turns`, same pipeline). In-flight answer preserved. |

---

## 4. The fairness firewall (the crux, already coded)

`app/voice/firewall.py`:

```python
@dataclass(frozen=True)
class SttResult:
    transcript: str
    is_final: bool = True
    confidence: float | None = None   # transport quality only — offer a re-say;
                                      # NEVER an assessment input

def to_assessable_text(result: SttResult) -> str:
    return result.transcript.strip()   # the ONLY sanctioned speech→pipeline path

def assert_text_only(payload) -> None:
    # fail-closed if any of {accent, tone, fluency, pace, pitch, filler, ...}
    # rides alongside a transcript
```

Guarantees, enforced by tests (`test_voice.py`):
- `SttResult` has **no** acoustic fields — the type itself excludes pitch/pace/accent.
- Spoken and typed answers of the same words produce byte-identical pipeline input.
- `assert_text_only` raises if any forbidden acoustic feature leaks toward assessment.

---

## 5. Providers — comparison and recommendation

**STT (the decision that matters):**

| | Deepgram Nova-3 ✅ | AssemblyAI Universal | faster-whisper (self-host GPU) |
|---|---|---|---|
| Streaming partial latency | ~200–300 ms | ~300–500 ms | 1–3 s (chunked) |
| Endpointing / VAD | built-in (`speech_started`) → feeds barge-in + turn-taking | basic | DIY (silero-vad) |
| Hinglish / en-hi code-switch | strong (India wedge) | English-centric | decent but slow |
| Price | ~$0.46/hr | ~$0.15–0.47/hr | T4 ≈ $0.35/hr + ops |
| Ops burden | zero | zero | a whole GPU subsystem |

**Recommendation: Deepgram Nova-3 streaming** for live. Keep `whisper_offline` in
the factory as the batch re-transcription path for eval reprocessing (where
self-hosted Whisper earns its keep — not live).

**TTS: ElevenLabs Flash** (low-latency streaming) primary, **Azure Neural** fallback.
**macOS `say` is removed from the product path** — the default product TTS is
`SilentTts` (captions-only) until a keyed provider is configured.

---

## 6. Consent + data model (already built — Slice 2)

- `interview_consents(kind='voice', stt_provider, tts_provider, audio_retention, policy_version)` — append-only, candidate-only RLS.
- `validate_consent`: voice consent **requires** an allow-listed STT provider and forces `audio_retention='none'`.
- **Audio retention = none by default.** Frames stream to STT and are dropped. The
  column exists so a future explicit re-listen opt-in is a schema change, not a
  silent default.
- ConsentGate copy (candidate-facing): *"You can speak or type. If you speak, we
  transcribe your words and assess only the words — never your accent or how fast
  you talk. Audio is not stored. Powered by Deepgram. Switch to typing anytime."*

---

## 7. Candidate ↔ employer — how voice reaches the report card

Voice changes the candidate's *input method*, nothing else on the employer side:

```
candidate speaks ─► STT ─► transcript ─► SAME evidence pipeline
                                             │ extract → gate → judge → calibrate
                                             ▼
                                   report_card_items (banded, QUOTED)
                                             │  candidate reviews / disputes / hides
                                             ▼  (approve)
              employer sees ◄── visibility-scoped VIEW: banded, quoted TEXT evidence
                                (candidate_state NOT IN ('hidden','disputed'))
```

- The employer **never** receives audio and never sees a voice signal. They see
  the same banded, quoted text evidence a typed interview produces.
- The quote in a report card item is the candidate's transcribed words — and
  `verify_quote` (already built) checks it's a verbatim substring of the stored
  answer, so voice can't smuggle in a fabricated quote either.
- **No universal score** — voice or text, the card is counts + bands, never a number.

---

## 8. Cost + latency budgets (prototype scale, <2k interviews/mo)

| Leg | Target | Notes |
|---|---|---|
| Mic → first partial caption | < 400 ms | Deepgram streaming |
| Final transcript → "Saved ✓" | < 150 ms | ack on `stt_final` |
| Answer → next question audio starts | < 1.5 s | pipeline + TTS first chunk |
| STT cost / interview (~12 min) | ~$0.09 | Deepgram |
| TTS cost / interview | ~$0.05–0.10 | ElevenLabs Flash |
| Evidence build / report | ≤ $0.15 | (existing pipeline target) |

---

## 9. Rollout phases

- **Phase V0 (done, text):** live text interview on `/v1/interviews/{id}/live`,
  encrypted turn persistence, report card. **Voice OFF.**
- **Phase V1 (this plan's groundwork, done):** voice policy + firewall + provider
  factory + consent + protocol seams. No audio flows yet.
- **Phase V2 (hosted, opt-in beta):** wire Deepgram + ElevenLabs behind keys;
  client `useVoiceCapture` (MediaRecorder + mic-check + captions); barge-in +
  endpointing; mode-switch. Ship to a small opt-in cohort.
- **Phase V3:** Azure TTS fallback, Hinglish tuning, offline Whisper re-transcription
  for eval, accessibility pass (captions, keyboard, reduced-motion).

**Acceptance (V2, from the plan):** consent + mic-check complete; transcript
editable before submit; `answer_mode='voice'` recorded; works on Chrome/Safari/
Firefox at 320 px; declining the mic lands in text with zero friction; report card
shows quotes from voice + text halves, indistinguishable.

---

## 10. Code map

**Built now (`Code/PlacedOn/backend/app/voice/`):**
- `policy.py` — allow-lists (STT/TTS), `audio_retention='none'`, `FORBIDDEN_ACOUSTIC_FEATURES`. Single source; Slice 2 consent imports it.
- `firewall.py` — `SttResult`, `to_assessable_text`, `assert_text_only`.
- `providers.py` — `SttProvider`/`TtsProvider` protocols, policy-checked `build_stt`/`build_tts`, `SilentTts` (default — kills macOS `say`), `UnconfiguredStt` (fail-closed), Deepgram/ElevenLabs stubs.
- `tests/test_voice.py` — 11 tests: allow-lists, firewall, factory defaults.

**Wire in V2 (hosted + keys):**
- `voice/providers.py` — real Deepgram streaming session + ElevenLabs Flash synth.
- `interviews_ws.py` — route binary frames → `build_stt().transcribe` → `to_assessable_text` → existing loop; `build_tts().synthesize` → `tts_chunk`; handle `barge_in`/`audio_end`/`mode_switch` (currently acked stubs).
- Frontend `useVoiceCapture` hook + mic-check UI in the interview room; `ConsentGate` voice copy + provider name.
- Retire `app/tts_service.py` (macOS `say`) and fold the experimental `interaction_layer` into the product path.

---

## 11. What changed in code this pass

- New `app/voice/` package (policy + firewall + providers) — deterministic, 11 tests green.
- `interviews.py` consent now sources allow-lists from `voice.policy` (DRY, single source of truth).
- Product default TTS is `SilentTts`; STT is fail-closed `UnconfiguredStt` — no dependence on macOS `say`.
- All 44 backend `/v1` + voice pure tests pass; app boots.

Nothing here sends audio anywhere yet — that's V2, and it needs the hosted backend
plus Deepgram/ElevenLabs keys.
