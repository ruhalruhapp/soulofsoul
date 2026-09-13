# soulofsoul

**Enterprise AI & Telehealth Mental Health Platform**

soulofsoul is a stepped-care mental health SaaS that bridges four care modalities — self-guided wellness, moderated peer support, conversational AI, and licensed telehealth — connected by layered safety guardrails and honest data governance.

> **⚠️ Proprietary & Confidential**
> This is a private, proprietary codebase owned by `ruhalruhapp`. All rights reserved. No part of this software may be reproduced, distributed, or used in any form without explicit written permission. See the footer of this README for full terms.

---

## Platform overview

soulofsoul implements a 4-tier hybrid care architecture:

| Tier | Name | Audience | Pricing |
|---|---|---|---|
| Tier 1 | Self-Guided Wellness | Sub-clinical users, self-help seekers | Free |
| Tier 2 | AI Pro Companion | Daily wellness seekers | $9.99–$19.99/mo |
| Tier 3 | In-Network Telehealth | Members needing diagnosis or medication | $0–$35/session copay |
| Tier 4 | Enterprise & Public Health | Employers, universities, municipal systems | Contract / B2B |

### Product surfaces

The platform ships with 12 product sections (sidebar navigation):

- **Home** — tiered architecture, KPIs, release phasing, cost-to-serve
- **AI Companion** — LLM chat (z-ai-web-dev-sdk), TTS, voice mode, crisis classifier
- **Wellness** — box-breathing, mood tracker, PHQ-9/GAD-7, private journal (AES-GCM §8.1)
- **Peer Space** — moderated forum with AI pre-filter flags
- **Telehealth** — clinician directory, Smart Insights, booking
- **Clinician Co-Pilot** — Smart Notes with transcript anchors (§7.1)
- **Supervisor Console** — live WebSocket crisis queue, SLA countdown
- **Safety Engineering** — parity gates, drift monitoring, Phase 0, red-team, regulatory
- **Enterprise Admin** — k=25 + Laplace DP noise (§10.2)
- **FHIR / EHR** — 8 FHIR R4 resources with US Core profiles (§17.4)
- **Research Pilot** — Pillar 2 digital phenotyping, IRB consent (§4)
- **Technical Design** — architecture, dataflow, stack, 8 ADRs (§17)
- **Settings** — memory editor, 4 consent streams, EN/AR RTL

### Cross-cutting safety features

- Always-visible crisis bar — 1-tap 988/911/Crisis Text Line, geo-keyed, reachable without an account
- Crisis overlay rendering §5.2 protocol (acknowledge, stay present, offer connection, notify supervision)
- Minors detection + off-boarding flow (§5.6)
- Age gate (18+ hard product gate)
- Layered consent — 4 separate streams per §8.3
- Client-side AES-GCM 256-bit encryption for private journal

### Production infrastructure

- **Prisma schema** — 16 models across 3 data domains (Tier 3 chat, Tier 4 clinical, Pillar 2 research)
- **NextAuth.js** — credentials provider, RBAC (member / clinician / supervisor / admin / researcher)
- **Real ASR endpoint** (`/api/asr`) using z-ai-web-dev-sdk
- **Pillar 2 telemetry collection** (`/api/telemetry`) — HCI timing signals, aggregate-only
- **Crisis event persistence** (`/api/crisis`) — de-identified, SLA-tracked
- **WebSocket mini-service** (`mini-services/crisis-relay`) on port 3030 — real-time supervisor console feed
- **Docker + docker-compose** deployment config
- **Health check endpoint** (`/api/health`)

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (New York) | latest |
| State | Zustand | 5.x |
| Database | Prisma ORM (SQLite client; Postgres in production) | 6.11 |
| Auth | NextAuth.js | 4.24 |
| LLM + TTS + ASR | z-ai-web-dev-sdk | 0.0.18 |
| WebSocket | Socket.io (server + client) | 4.8 |
| Runtime | Bun | 1.3 |
| Testing | Bun test | built-in |
| Containerization | Docker + docker-compose | — |

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
│ /api/chat · /api/tts · /api/notes · /api/asr            │
│ /api/telemetry · /api/crisis · /api/auth · crisis-relay │
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

## Quick start (development)

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- Node.js 18+ (for some tooling)
- Git

### Setup

```bash
# Clone (requires access — this is a private repo)
git clone https://github.com/ruhalruhapp/soulofsoul.git
cd soulofsoul

# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, etc.

# Push Prisma schema to SQLite
bun run db:push

# Generate Prisma client
bun run db:generate

# Seed demo accounts
bun run db:seed

# Start the crisis-relay mini-service (in a separate terminal)
./scripts/start-crisis-relay.sh

# Start the dev server (auto-started in sandbox; run manually locally)
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (seeded)

| Email | Password | Role |
|---|---|---|
| member@soulofsoul.dev | demo1234 | MEMBER |
| clinician@soulofsoul.dev | demo1234 | CLINICIAN |
| supervisor@soulofsoul.dev | demo1234 | SUPERVISOR |
| admin@soulofsoul.dev | demo1234 | ADMIN |

⚠️ **Change these passwords immediately in any non-dev environment.**

---

## Testing

```bash
bun test          # Run all 110 unit tests
bun run lint      # ESLint
```

**Test coverage:**

| File | Tests | Coverage |
|---|---|---|
| `tests/crisis.test.ts` | 50 | Crisis classifier (§5.1) + minors detection (§5.6) — true positives, false-positive regression, Arabic crisis-resource mode, latency budget |
| `tests/journal-crypto.test.ts` | 23 | AES-GCM encryption — IV uniqueness (critical for security), key derivation, round-trips, wrong-key handling |
| `tests/fhir.test.ts` | 37 | FHIR R4 resources — US Core profile conformance, LOINC codes, resource origins, sync log semantics |

---

## Deployment

### Docker (recommended for production)

```bash
# Build and run all services
docker-compose up -d

# Or build the image manually
docker build -t soulofsoul .
docker run -p 3000:3000 -v soulofsoul-db:/app/db soulofsoul
```

The Dockerfile is a multi-stage build:
1. **deps** — installs dependencies
2. **builder** — generates Prisma client + builds Next.js standalone
3. **runner** — minimal runtime image, non-root user, health check, runs migrations at startup

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma database URL (SQLite file path or Postgres connection string) |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Public URL of the deployment |
| `ZAI_API_KEY` | No | z-ai-web-dev-sdk API key (or use `.z-ai-config` file) |

---

## Project structure

```
soulofsoul/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Lint + test on push/PR
│   │   └── build.yml          # Verify Next.js build
│   └── PULL_REQUEST_TEMPLATE.md
├── .github/                    # CI/CD workflows
├── prisma/
│   └── schema.prisma           # 16 models across 3 data domains
├── src/
│   ├── app/
│   │   ├── api/                # 8 API endpoints
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Section router
│   │   └── globals.css         # Clinical theme (teal/emerald)
│   ├── components/
│   │   ├── sections/           # 12 product sections
│   │   └── shell/               # Sidebar, crisis bar, error boundary
│   └── lib/
│       ├── auth/                # NextAuth.js config
│       ├── crisis.ts            # Crisis classifier (tested)
│       ├── journal-crypto.ts   # AES-GCM helpers (tested)
│       ├── db.ts                # Prisma client
│       ├── store.ts             # Zustand state
│       ├── i18n.ts              # EN + AR strings
│       └── data.ts              # Seed/mock data
├── tests/                       # 110 unit tests
├── mini-services/
│   └── crisis-relay/            # WebSocket supervisor feed (port 3030)
├── scripts/
│   ├── seed.ts                  # Demo account seeding
│   └── start-crisis-relay.sh    # Detached mini-service launcher
├── prd.md                       # Original PRD v1.4
├── Dockerfile                   # Multi-stage production build
├── docker-compose.yml           # web + crisis-relay services
└── package.json
```

---

## Critical safety notes

⚠️ **This software is not yet FDA-cleared or HIPAA-certified for clinical production use.**

1. **Crisis classifier is a regex mock.** Production requires a fine-tuned classifier with per-language gates (≥0.95 recall on validated test sets).
2. **No real clinical backend.** Clinician directory, peer posts, KPI values, FHIR resources are mock data.
3. **WebSocket mini-service simulates crisis events.** Production would consume from a real classifier pipeline (Kafka/SQS).
4. **Arabic voice classifier is in "crisis-resource mode"** per §5.1 — the recall gate (≥0.95) has not been met.
5. **Private journal uses real AES-GCM 256-bit encryption** via Web Crypto API, but the salt and ciphertext are stored in localStorage (browser-only). Production should sync ciphertext to an encrypted backend with the key never leaving the device.

Before any clinical deployment, complete the Phase 0 deliverables specified in the PRD §14: STRIDE threat model, validated classifier test sets, supervision staffing model, regulatory classification memo, payer contracting, etc.

---

## License & legal

**© 2026 ruhalruhapp. All rights reserved.**

This software and its source code are proprietary and confidential. No part of this software may be reproduced, distributed, transmitted, displayed, published, or broadcast without the prior written permission of the copyright holder.

Unauthorized use, reproduction, or distribution of this software, via any medium, is strictly prohibited and may result in civil and criminal penalties.

For licensing inquiries, partnerships, or enterprise deployment, contact: `ruhalruhapp`.

---

*Built on Next.js 16 + TypeScript + Prisma + NextAuth.js*
