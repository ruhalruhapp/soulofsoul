# Serenity — Enterprise AI & Telehealth Mental Health Platform

A Next.js 16 reference implementation of PRD v1.4 for an enterprise-grade mental health platform. Bridges four care modalities — self-guided wellness, moderated peer support, conversational AI, and licensed telehealth — connected by layered safety guardrails and honest data governance.

**Status:** PRD v1.4 reference implementation. Not for clinical production use — safety classifier is a regex mock, not a validated model.

---

## Quick start

```bash
# Install dependencies
bun install

# Run the dev server (auto-started by the sandbox; do NOT run manually in sandbox)
bun run dev

# Run unit tests (110 tests across crisis classifier, journal crypto, FHIR resources)
bun test

# Lint
bun run lint

# Start the crisis-relay mini-service (WebSocket supervisor feed)
./scripts/start-crisis-relay.sh
```

Open [http://localhost:3000](http://localhost:3000) (or the preview URL in the sandbox).

### Onboarding

1. **Age verification** — enter birth year (18+ hard gate per §5.6)
2. **Layered consent** — 4 separate consent streams (AI companion, telehealth recording, research telemetry, voice agent) per §8.3
3. **Enter Serenity** — lands on the Home dashboard

---

## What's built

### 12 product surfaces (sidebar navigation)

| Section | PRD § | What it does |
|---|---|---|
| **Home** | §1-2, §14 | Tiered architecture, design principles, KPI preview, release phasing, cost-to-serve |
| **AI Companion** | §5, §6 | Real LLM chat (z-ai-web-dev-sdk), crisis classifier UI, voice mode with TTS, scope/safety side panel |
| **Wellness** | §3 Tier 1 | Box-breathing tool, mood tracker, PHQ-9 + GAD-7 self-assessments, private journal (§8.1 AES-GCM) |
| **Peer Space** | §3 Tier 2 | Moderated forum with AI pre-filter flags, moderator actions, safe-messaging cues |
| **Telehealth** | §3 Tier 4 | In-network clinician directory, Smart Insights dashboard, booking flow |
| **Clinician Co-Pilot** | §7 | Smart Notes SOAP draft with transcript anchors, edit-burden metric, `/api/notes` endpoint |
| **Supervisor Console** | §5.4, §12 | Live WebSocket crisis queue, SLA countdown, disposition workflow, full KPI table |
| **Safety Engineering** | §5.1, §17.3 | Parity gates per language/dialect, drift monitoring, Phase 0 deliverables, red-team results, rollback drills, regulatory matrix |
| **Enterprise Admin** | §10.2 | Aggregate-only metrics with k=25 + Laplace DP noise, "what you can never see" card, SLA tracking |
| **FHIR / EHR** | §17.4 | 8 FHIR R4 resources with US Core profiles, sync log, SMART on FHIR launch |
| **Research Pilot** | §4 | Pillar 2 digital phenotyping, IRB consent flow, hard boundaries, go/no-go gate |
| **Technical Design** | §17 | System architecture diagram, data flow, technology stack, 8 Architecture Decision Records |
| **Settings** | §6, §8.3, §9, §17.2 | Memory editor (tombstoned ≤24h), 4 consent streams, language picker (EN + AR RTL), data governance, account deletion |

### Cross-cutting safety features

- **Always-visible crisis bar** — 1-tap 988/911/Crisis Text Line, geo-keyed (8 jurisdictions), reachable without an account (NG6)
- **Crisis overlay** — renders §5.2 protocol: acknowledge, stay present, offer connection, notify supervision, schedule follow-up, false-positive dismissal per §5.3
- **Minors off-boarding** — `detectMinors()` runs alongside crisis classifier; triggers §5.6 off-boarding flow with Trevor Project / 988 resources
- **Age gate** — 18+ hard product gate (§5.6), not a terms-of-service afterthought
- **Theme + RTL director** — light/dark mode + Arabic RTL layout toggle, persists across reloads

### Real integrations (not mocks)

- **LLM chat** — `z-ai-web-dev-sdk` chat completions with §5.5 hard guardrails in system prompt
- **TTS** — `/api/tts` endpoint using `z-ai-web-dev-sdk` audio.tts returns WAV buffer; per-message play/stop buttons
- **Smart Notes generation** — `/api/notes` endpoint generates real SOAP notes from transcript with anchor discipline
- **WebSocket supervisor feed** — `mini-services/crisis-relay/` (port 3030) emits simulated crisis events every 25-45s; supervisor console connects via `/?XTransformPort=3030`
- **Client-side encryption** — Web Crypto API (SubtleCrypto) AES-GCM 256-bit for private journal; PBKDF2 210k iterations; verified by tests
- **FHIR R4 resources** — 8 sample resources with US Core profile conformance
- **Crisis classifier** — regex-based mock with per-language gates (Arabic in "crisis-resource mode" per §5.1)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1 — Client                                        │
│ Next.js 16 App Router · TypeScript · Tailwind · shadcn │
│ Web Crypto API (§8.1) · socket.io-client               │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ Layer 2 — Caddy Gateway (port 81)                       │
│ Routes by ?XTransformPort=N query · TLS · CORS          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ Layer 3 — App services (port 3000 + mini-services)      │
│ /api/chat · /api/tts · /api/notes · crisis-relay:3030   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ Layer 4 — Three separate data domains (§8.1)            │
│                                                          │
│  Domain A          Domain B           Domain C           │
│  Tier 3 chat       Tier 4 clinical    Pillar 2 research │
│  Encrypted store   FHIR R4 EHR        HCI timing tel.   │
│  Conversation mem   Smart Notes        Aggregate only    │
│  Separate key       Safety holds       IRB-supervised    │
│  Ret: acct + 30d   Ret: ≥6 years      Ret: revoc + 30d  │
└─────────────────────────────────────────────────────────┘
```

**Domains never co-mingle.** Three separate encryption contexts, access roles, and consent records.

---

## Testing

```bash
bun test
```

**110 tests across 3 files:**

### `tests/crisis.test.ts` — safety-critical classifier (§5.1, §5.6)
- 12 suicidal-ideation phrases → flagged
- 3 self-harm phrases → flagged
- 3 domestic-violence phrases → flagged
- 3 overdose-risk phrases → flagged
- 14 benign phrases → NOT flagged (false-positive regression)
- 2 Arabic tests (crisis-resource mode behavior)
- Latency budget test (<50ms per classification)
- 14 minor self-identification phrases → flagged
- 9 adult statements → NOT flagged

### `tests/journal-crypto.test.ts` — §8.1 client-side encryption
- Salt generation (16 bytes, randomness)
- Entry ID generation (UUID, uniqueness)
- Base64 encoding round-trips
- PBKDF2 key derivation (different passphrases → different keys; different salts → different keys)
- AES-GCM encrypt/decrypt round-trips (simple, long, unicode, empty, special chars)
- **IV uniqueness** — critical for AES-GCM security; 20 encryptions of same plaintext produce 20 distinct IVs
- Wrong-key decryption fails gracefully (no throw)
- Serialization round-trips + filters malformed entries
- Constants: 210,000 PBKDF2 iterations

### `tests/fhir.test.ts` — §17.4 FHIR R4 resources
- All 8 resources have required FHIR fields
- US Core profile conformance (Patient, Practitioner, Observation)
- PHQ-9 Observation has LOINC 89204-2 + integer value + status "final"
- DocumentReference has LOINC 11506-3 (Progress note) + status "current"
- Consent has patient-privacy scope + status "active"
- Flag has safety category
- Resource origins (Serenity-authored vs EHR-pulled)
- Sync log structure + direction semantics + bytes accounting

---

## PRD v1.4 coverage map

| PRD § | Section | Status |
|---|---|---|
| §1-2 | Executive summary, goals, non-goals | Home |
| §3 | Tiered care architecture | Home + 4 tier-specific sections |
| §4 | Pillar 2 digital phenotyping | Research Pilot |
| §5 | Layered safety | Companion + Supervisor + Safety Engineering |
| §6 | Conversational AI | Companion (text + voice) |
| §7 | Clinician co-pilot | Co-Pilot (Smart Notes + Smart Insights) |
| §8 | Privacy & security | Settings (consent) + Journal (§8.1) |
| §9 | Data governance | Settings (retention table) |
| §10 | Monetization | Home (tiers) + Admin (§10.2) |
| §11 | Personas | Reflected in section content |
| §12 | KPIs | Supervisor Console + Safety Engineering |
| §13 | Regulatory | Safety Engineering (Regulatory tab) |
| §14 | Release phasing | Home + Safety Engineering (Phase 0) |
| §15 | Acceptance criteria | Reflected in test patterns |
| §16 | Open questions | TDD Key decisions (Open status) |
| §17 | Technical appendix | TDD section |

---

## File structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # LLM chat (z-ai-web-dev-sdk)
│   │   ├── notes/route.ts         # Smart Notes SOAP generation
│   │   └── tts/route.ts           # TTS audio buffer
│   ├── globals.css                # Clinical theme (teal/emerald, no indigo/blue)
│   ├── layout.tsx
│   └── page.tsx                   # Section router
├── components/
│   ├── sections/                  # 12 product surfaces
│   │   ├── HomeSection.tsx
│   │   ├── CompanionSection.tsx
│   │   ├── WellnessSection.tsx
│   │   ├── JournalTool.tsx        # §8.1 client-side encryption
│   │   ├── PeerSection.tsx
│   │   ├── TelehealthSection.tsx
│   │   ├── CopilotSection.tsx
│   │   ├── SupervisorSection.tsx  # WebSocket live feed
│   │   ├── SafetySection.tsx
│   │   ├── AdminSection.tsx       # §10.2 k=25 + Laplace DP
│   │   ├── FhirSection.tsx        # §17.4
│   │   ├── ResearchSection.tsx    # §4 Pillar 2
│   │   ├── TddSection.tsx         # §17 technical design
│   │   └── SettingsSection.tsx
│   └── shell/
│       ├── Sidebar.tsx
│       ├── CrisisBar.tsx          # Always-visible, NG6
│       ├── CrisisOverlay.tsx       # §5.2 protocol
│       ├── MinorsOffboardOverlay.tsx # §5.6
│       ├── OnboardingGate.tsx     # Age gate + layered consent
│       └── ThemeDirector.tsx      # Dark mode + RTL
├── lib/
│   ├── crisis.ts                  # classifyCrisis + detectMinors (tested)
│   ├── journal-crypto.ts          # AES-GCM helpers (tested)
│   ├── store.ts                   # Zustand persisted state
│   ├── i18n.ts                    # EN + AR strings
│   └── data.ts                    # Mock data (clinicians, KPIs, FHIR, etc.)
└── tests/
    ├── crisis.test.ts             # 50 tests
    ├── journal-crypto.test.ts     # 23 tests
    └── fhir.test.ts               # 37 tests

mini-services/
└── crisis-relay/                  # Socket.io mini-service (port 3030)
    ├── index.ts
    └── package.json

scripts/
└── start-crisis-relay.sh          # Detached launcher (setsid)
```

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (New York) | latest |
| State | Zustand | 5.x |
| Server state | TanStack Query | 5.x |
| Icons | Lucide React | 0.525 |
| i18n | next-intl | 4.x |
| Theme | next-themes | 0.4.x |
| LLM + TTS | z-ai-web-dev-sdk | 0.0.18 |
| Database | Prisma ORM (SQLite client) | 6.11 |
| WebSocket | Socket.io (server + client) | 4.8 |
| Runtime | Bun | 1.3 |
| Testing | Bun test | built-in |
| Linting | ESLint | 9.x |

---

## Critical safety notes

**This is a reference implementation, not a clinical product.**

1. **Crisis classifier is a regex mock.** Production requires a fine-tuned classifier with per-language gates (≥0.95 recall on validated test sets). The regex patterns here are intentionally narrow to minimize false positives but will miss many genuine crisis formulations.

2. **No real clinical backend.** Clinician directory, peer posts, KPI values, FHIR resources, and supervisor queue events are mock data.

3. **WebSocket mini-service simulates crisis events.** In production, the crisis-relay service would consume events from the safety classifier pipeline (Kafka/SQS) and fan them out to supervisor consoles.

4. **Arabic voice classifier is in "crisis-resource mode"** per §5.1 — the recall gate (≥0.95) has not been met, so Arabic launches in crisis-resource mode only (no open-ended chat).

5. **Private journal uses real AES-GCM 256-bit encryption** via Web Crypto API, but the salt and ciphertext are stored in localStorage (browser-only). Production should sync ciphertext to an encrypted backend with the key never leaving the device.

---

## License

Reference implementation. Not for clinical production use.
