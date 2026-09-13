# Product Requirements Document (PRD)
## Enterprise AI & Telehealth Mental Health Platform

**Version 1.4 | Status: Revised — Pending Final Approval | Date: September 13, 2026**

**Changelog v1.0 → v1.1:**
- Replaced unachievable "100%" safety claims with measurable performance targets (sensitivity, false-alarm rate, human backstop)
- Corrected encryption architecture (removed inaccurate "Fernet end-to-end" claim; specified real key management)
- Demoted digital phenotyping from clinical feature to opt-in research scope (regulatory risk containment)
- Crisis protocol rewritten to warm-handoff model; false-positive user experience specified
- Added minors policy, peer-moderation SOPs, data retention schedule, EHR standard (HL7 FHIR R4)
- Fixed truncated sentences throughout; resolved Tier 3 revenue model; added non-goals, release phasing, acceptance criteria

**Changelog v1.1 → v1.2:**
- Added §6.4 Voice Agent Mode (real-time speech) with latency budget, streaming safety gates, interruption protocol, and voice-data consent
- Voice crisis detection subject to per-language parity gate (≥0.95 recall on voice-specific test sets)
- Added voice KPIs (response latency, voice recall, safety-gap incidents); resolved open question on voice safety posture
- Added NG7: no voice cloning, voiceprints, or production prosody-based emotion inference

**Changelog v1.2 → v1.3:**
- Phase 0 expanded: supervision staffing model, classifier evaluation plan + red-team, regulatory classification memo (US + EU AI Act), voice latency prototype, payer kickoff, cost-to-serve model, geo-mapped crisis resources
- G4 rewritten: Tier 3 measurement-based care protocol, exploratory/descriptive only
- New §3.2: peer-space moderation SOP outline with metrics
- New §17: technical appendix (LLM/RAG strategy, memory architecture, classifier architecture, FHIR R4 integration, voice architecture decision)
- §5.1: model drift & degradation handling; §5.2: 24–72h human follow-up; §5.6: minors off-boarding data path
- Voice latency relaxed to p95 ≤ 2.0 s (v1 target, 1.5 s optimization goal); full-duplex question decided (turn-based + barge-in)
- New KPIs: Tier 3 exploratory symptom trend, Tier 2 moderation metrics, crisis marginal cost
- §7.2: Smart Insights anchoring discipline; §13: jurisdiction handling; §10.3: cost-to-serve model

**Changelog v1.3 → v1.4:**
- §6 threshold languages expanded to include Arabic (Gulf/GCC dialect scope); RTL layout requirement added (§6.5, new)
- Full-duplex voice reopened for review and **reaffirmed as out of scope for v1** (§6.4.7, new) — turn-based + barge-in remains the v1 architecture; rationale documented for future re-evaluation
- §13 jurisdiction handling: GCC crisis-resource mapping added as a named Phase 0 deliverable, with explicit note that resource numbers must be independently verified at launch (multiple public sources disagree; see §13 footnote)
- §13: location-based (not language-based) crisis routing specified as a hard requirement, given Arabic-speaking users may be present in any jurisdiction
- Open Question #7 scope expanded: ASR/TTS vendor benchmarks now explicitly required per-dialect, not just per-language, starting with Gulf Arabic
- §5.1 classifier gate clarified: "per served language" is interpreted as "per served language-variant," since dialect divergence can be as safety-relevant as language divergence

---

# 1. Executive Summary & Core Purpose

This PRD defines the architectural, functional, and clinical specifications for an enterprise-grade mental health web application. The platform bridges the gap between four care modalities: digital self-care tools, automated conversational agents, passive cognitive monitoring (research scope, see Pillar 2), and licensed clinical human care.

By integrating round-the-clock conversational AI with clinician co-pilot tools (automated session summaries, pre-session insight synthesis) and layered safety guardrails, the platform delivers scalable, accessible, evidence-informed mental healthcare. The architecture is designed to reduce provider administrative burden while maintaining clearly bounded automation — the AI is a supportive wellness tool and clinical assistant, never a diagnostician or autonomous therapist.

**Design principles:** (1) human clinical authority is never overridden by automation; (2) every safety-critical metric has a defined measurement method; (3) every automated claim has a regulatory pathway assessment; (4) users can understand and control what is collected.

---

# 2. Goals & Non-Goals

## 2.1 Goals (v1.x)
- G1. Provide a stepped-care pathway from self-guided wellness to licensed telehealth with defined transition workflows.
- G2. Reduce clinician documentation time by ≥45% versus manual baseline (measured, see §12).
- G3. Maintain a crisis-response pipeline with ≥95% recall on high-acuity risk and <60 seconds median time-to-human-review.
- G4. Establish a measurement-based care protocol for the AI companion tier (optional PHQ-9/GAD-7 at baseline, 6 and 12 weeks) and report symptom trends descriptively — exploratory only, with no efficacy claims in marketing until powered analyses are available (§12).
- G5. Build the compliance and data-governance foundation for enterprise (EAP) contracts.

## 2.2 Non-Goals (Explicitly Out of Scope)
- **NG1.** Medical diagnosis, medication prescribing, or autonomous therapy delivery. The AI never provides these.
- **NG2.** Users under 18. The platform is gated 18+ in all tiers (see §5.6). COPPA compliance is out of scope by exclusion.
- **NG3.** Clinical claims from passive sensor data in v1.x (Pillar 2 is research-only).
- **NG4.** Marketing the AI chat as "end-to-end encrypted" or as a substitute for emergency services, 988, or a licensed therapist.
- **NG5.** Inpatient care, emergency dispatch, or involuntary intervention workflows (the platform routes *to* emergency resources, it does not replace them).
- **NG6.** Offline/low-connectivity crisis chat; crisis resources must remain reachable without an account (see §5.2).
- **NG7.** Voice cloning, voiceprint or speaker identification, and production emotion inference from prosody (research-only under Pillar 2 consent).

---

# 3. Pillar 1: Tiered Hybrid Care Architecture

The platform operates on a stepped-care model. Users may enter at any tier and move in both directions.

| Tier | Name | Contents |
|---|---|---|
| Tier 1 | Self-Guided Wellness | On-demand CBT and DBT skill modules, box-breathing and grounding tools, mood tracking, self-assessments (PHQ-9, GAD-7, PSS) |
| Tier 2 | Peer Support & Community | Moderated peer forums, active-listener chat rooms, structured groups (see §5.5 moderation standards) |
| Tier 3 | AI Conversational Companion | 24/7 empathetic conversational AI grounded in CBT/DBT/ACT/MBSR frameworks; daily reflection and emotional support within scope boundaries (§5.5) |
| Tier 4 | Licensed Telehealth & Psychiatry | In-network live video therapy, tele-psychiatry, medication management with licensed human clinicians; Smart Notes & Smart Insights included |

## 3.1 Care Transitions (Specified Workflow)
Escalation and de-escalation are **recommendations made by algorithms, approved by humans:**

1. **Trigger:** screening scores (PHQ-9 ≥ 15 or GAD-7 ≥ 15), crisis-classifier events, clinician referral, or explicit user request.
2. **Triage:** a care navigator (licensed or licensed-supervised staff member) reviews the recommendation within **1 business day** (crisis events bypass this queue — see §5).
3. **Consent & booking:** user confirms; session scheduled. Target time-to-first-appointment: **≤ 7 days** for therapy, **≤ 14 days** for psychiatry.
4. **Waitlist protocol:** if no capacity, user receives (a) an estimated wait time, (b) an interim care plan (Tier 2/3 intensification, structured workbook), and (c) automated weekly check-ins until matched.
5. **Step-down:** graduation from Tier 4 is a *success metric*, not churn. Members stepping down receive a maintenance plan and a scheduled 30-day follow-up.

## 3.2 Peer Space Moderation (Tier 2) — SOP Outline

- **Staffing:** trained human moderators cover all peer spaces 24/7. The AI assistant pre-filters reports and flags high-risk posts but never takes moderation actions autonomously in v1.x.
- **Escalation ladder:** (1) AI flag → moderator queue (target p95 ≤ 15 min); (2) moderator action (remove, restrict, supportive response); (3) imminent-risk content → §5.2 crisis protocol verbatim, including supervision notification.
- **Suicide-contagion protocol:** safe-messaging guidelines enforced (no method discussion); postvention template responses maintained by the clinical team.
- **Moderator wellbeing:** shift limits, debrief access, no solo overnight coverage.
- **Metrics:** §12 (moderator response time, safety incident rate, AI pre-filter false-flag rate).

---

# 4. Pillar 2: Exploratory Digital Phenotyping (Research Scope)

> **STATUS: This pillar is an opt-in research program in v1.x. It produces no user-facing output, drives no automated care escalation, and makes no clinical claims. A go/no-go decision on a regulated (SaMD) pathway is scheduled at the Phase 3 gate (§14).**

## 4.1 What is collected (opt-in participants only)
Millisecond-scale human-computer interaction dynamics — swipe velocity, tap latency, typing rhythm and pause patterns, scroll fluidity — used to explore correlations with cognition, executive function, and mood state.

## 4.2 Hard boundaries
- **NEVER collected:** typed text content, message bodies, passwords, GPS/location, microphone or ambient audio, browsing history, contact lists.
- Interaction-timing telemetry is stored separately from message content, under a **separate consent record** from telehealth audio processing (Smart Notes), and under a separate encryption context (§8).
- No individual-level inference is shown to users, clinicians, or care-navigators. Only aggregate, de-identified findings are reviewed (quarterly research review, IRB-supervised protocol).

## 4.3 Honest framing
Within-individual relapse prediction from HCI biomarkers is an **emerging, not established, evidence base**. v1.x treats it as research. Any future clinical deployment requires: (a) a validated within-person longitudinal model, (b) an FDA regulatory determination (likely SaMD), and (c) a dedicated consent flow. Until all three exist, this feature cannot trigger notifications, escalations, or clinician dashboards.

---

# 5. Pillar 3: Layered Clinical Safety & Crisis Guardrails

## 5.1 Safety Risk Classification Engine
All Tier 3 chat interactions are screened in real time for high-acuity risk classes: suicidal ideation, self-harm, domestic violence, severe psychosis, acute mania.

**Performance gates (acceptance criteria, per served language — and per served dialect where a language's dialects diverge enough to affect crisis-language recognition, e.g. Gulf Arabic; see §6.5):**
| Metric | Launch target | Measurement |
|---|---|---|
| Recall (sensitivity) on high-acuity class | ≥ 0.95 | Validated retrospective test set, stratified by language; re-validated quarterly |
| False-alarm rate | ≤ 2 per 1,000 messages screened | Production telemetry; alarm = full crisis workflow triggered |
| Screening latency | p95 ≤ 300 ms added to response time | Synthetic monitoring |

Recall below threshold on any served language → that language's companion launches in **crisis-resource mode only** (no open-ended chat) until the gate is met. The engine is never described internally or externally as "100% detection"; the human backstop below is part of the safety case, not an admission of failure.

**Drift & degradation handling:** production metrics (audited-sample recall, false-alarm rate) are monitored continuously, with monthly dashboards and quarterly full re-validation. Predefined triggers — audited-sample recall < 0.93, or false-alarm rate > 2× baseline for 7 days — automatically open a language-level feature-flag review; for voice, the automatic degradation is text-only mode. Model promotion requires shadow-mode parity; rollback is one-click and drill-tested.

## 5.2 Crisis Protocol (Warm-Handoff Model)
On high-acuity detection the AI must, in order:
1. **Acknowledge** the danger directly and convey non-judgmental, validating empathy (no minimization, no clinical advice).
2. **Stay present.** The AI does not end the conversation, redirect to a generic FAQ, or lecture. It remains with the user while offering connection to help.
3. **Offer in-product connection** to 988 (call/chat/text), 911 guidance, and the Crisis Text Line, with one-tap deep links. Crisis resources are reachable from every screen of the app **without an account**, satisfying NG6.
4. **Notify the human supervision team in real time** (p95 ≤ 60 seconds, 24/7 staffed) with de-identified transcript + classifier rationale.
5. **Human disposition:** the on-call clinician reviews and decides: continue monitoring, outreach call, or (with the user's involvement wherever possible) emergency-service guidance. All dispositions are logged for QA.
6. **Follow-up:** if the user remains in-session, the AI checks in on their state; a next-day wellness check-in message is scheduled (user-controllable).
7. **24–72h human follow-up:** for imminent-risk dispositions, a care navigator or clinician attempts human outreach within 24 hours and again at 72 hours per protocol. Capacity for this caseload is part of the Phase 0 supervision staffing model. Automated check-ins supplement, never substitute, for this human follow-up.

## 5.3 False-Positive Experience
False alarms are expected at the sensitivities above and are a trust-critical UX surface:
- A crisis interjection renders **at most once per conversation** unless risk language escalates; the user may dismiss it clearly ("I'm safe / this was misunderstood").
- Dismissal removes the flag from the user's visible experience and feeds the classifier evaluation set — it never penalizes, throttles, or silently profiles the user.
- Repeated false alarms for a user within 30 days trigger a classifier-quality review, not user-level restrictions.

## 5.4 Human-in-the-Loop Supervision
De-identified high-risk transcripts route to the on-call clinical supervision team (see Persona D). Escalation SLA: review initiated ≤ 5 minutes for imminent-risk classifications. Supervisors have authority to suspend the AI companion for a user pending clinician contact.

## 5.5 Functional Scope Boundaries (Hard Guardrails)
- The AI never issues medical diagnoses, never recommends specific medications or doses, and never claims to be a therapist.
- In Tier 2 peer spaces, the AI does not impersonate a peer; it operates as a clearly labeled assistant with defined moderation duties.
- Crisis classification runs independently of the generation model — safety is not prompt-dependent.

## 5.6 Age Gate (18+)
Onboarding requires date-of-birth attestation with a stated-eligibility notice. Under-18 self-identification at any later point (e.g., in chat) triggers a gentle redirection to age-appropriate resources (e.g., 988 and Trevor Project links) and account off-boarding per the minors policy. This is a hard product gate, not a terms-of-service afterthought. **Off-boarding data path:** conversation memory and chat archives are deleted per §9; any crisis-event logs are routed to Legal for minors-specific handling before deletion; the off-boarding flow always leaves the user with age-appropriate crisis resources.

---

# 6. Pillar 4: Evidence-Based Conversational AI & Personalization

- **Grounded modalities:** CBT, DBT, ACT, and MBSR skill delivery; responses are constrained to protocol-aligned content with retrieval grounding from a clinically reviewed content library.
- **Stateful memory:** encrypted long-term conversation memory enables recall of past disclosures, pattern recognition, goal tracking, and narrative continuity. Users can view, edit, and delete memory entries (see §9), with effect ≤ 24 h and guaranteed non-resurfacing of deleted content (§17.2). The AI companion has no access to client-side-encrypted journal entries (§8.1); safety-hold records (§9) are never used as conversation memory.
- **Inclusivity & language:** threshold languages — English, Spanish, Arabic (Gulf/GCC dialect, MSA fallback), French, Vietnamese, Mandarin. Each language (and, for Arabic, each supported dialect — see §6.5) has independent launch gates: (a) §5.1 classifier gates, (b) crisis protocol in-language, (c) culturally reviewed response sets developed with community consultants. A language launches only when all three pass.
- **Transparency:** the AI identifies itself as an automated wellness tool at conversation start and whenever clinically relevant. Users can always request a human (Tier 4 referral flow).

## 6.5 Arabic (Gulf/GCC) Language Scope
- **Dialect scope:** launch dialect is Gulf/Khaleeji Arabic, with Modern Standard Arabic (MSA) as the fallback register for content the community consultants judge dialect-neutral (e.g., psychoeducational text). Colloquial distress language, crisis scripts (§5.2), and the safety classifier's training/test data are built and validated in Gulf dialect specifically — MSA alone is not sufficient for crisis-language coverage, since users in acute distress default to dialect, not MSA.
- **RTL requirement:** full right-to-left layout across web and mobile clients (chat bubbles, forms, navigation, iconography) — not a mirrored stylesheet applied late. Treated as a first-class design requirement, reviewed under the same accessibility gate as §13 (WCAG 2.2 AA).
- **Voice (§6.4):** Gulf-dialect ASR/TTS is scoped under Open Question #7; the §6.4.3 parity gate (≥0.95 crisis recall on a *voice-specific, dialect-specific* test set — accents, code-switching with English, distress/crying speech) applies before Gulf Arabic voice mode can launch, per the existing rule that recall below gate restricts a language (here, dialect) to text-only.
- **Expansion path:** additional Arabic dialects (Levantine, Egyptian, Maghrebi) are treated as separate launch-gated variants, not automatic extensions of the Gulf build — each requires its own community-consultant review and classifier validation before launch (§14, Phase 3 "additional languages").

## 6.4.7 Voice Interaction Model — Full-Duplex Re-Evaluation (Closed)
Full-duplex (simultaneous bidirectional speech) was re-evaluated in v1.4 at product's request and **reaffirmed out of scope for v1**, for reasons distinct from — and additional to — the original v1.2 decision:
- Turn-based + barge-in preserves a clean pre-speech safety checkpoint (§6.4.2, §6.4.3): the classifier clears content *before* the agent is permitted to speak. Full-duplex removes that checkpoint, since the agent may already be mid-utterance when high-acuity content arrives, requiring real-time self-interruption as a new, unvalidated failure mode.
- Barge-in already provides the primary user-facing benefit sought ("the AI doesn't talk over me, I can jump in anytime") without taking on full-duplex's safety-architecture risk.
- Full-duplex remains available as a Pillar 2 research track (§17.5) and may be reconsidered post-launch once production data exists on turn-based safety-gate performance and a dedicated safety-engineering budget is allocated for it.

## 6.4 Voice Agent Mode (Real-Time Speech Conversations)

> **Naming rule:** This feature is internally and externally named **"Voice Agent Mode."** The word "therapy" must not appear in product UI, marketing, or consent copy for this feature (NG1, §5.5). Users may describe it however they like; the platform may not.

### 6.4.1 Experience Definition
- Real-time spoken conversation with the AI companion, with natural turn-taking and barge-in (the user may interrupt at any time; the safety screen keeps running on partial transcripts throughout).
- Seamless mid-session switching between voice and text without losing conversation context.
- Available to Tier 2 subscribers; gated per language by §6.4.3. Tier 1 includes a 60-minute/month voice trial.

### 6.4.2 Architecture & Latency Budget
| Component | Requirement |
|---|---|
| Pipeline | Streaming ASR → safety screen (same engine as §5.1, running on partial transcripts) → response generation → streaming TTS |
| End-to-end latency (user stops speaking → agent starts), p95 | ≤ 2.0 s v1 target (1.5 s optimization goal) |
| Safety-screen stall behavior | If the screen is pending > 1.0 s, the agent plays a neutral bridging acknowledgement ("I'm here, go on…") — never a substantive reply to uncleared content |
| Fallback | Network/model failure degrades gracefully to text chat; a session with an active crisis flag never hard-fails |
| Prosody/emotion analysis | Research-only under Pillar 2 consent (§4); never used in production inference |

### 6.4.3 Safety Gates (Hard Requirements)
1. **No unsafe utterance:** the agent must never speak a substantive response to crisis content before the safety screen clears it. Safety gates the audio path, not just the text path.
2. **Interruption on detection:** on high-acuity detection the agent stops speaking immediately, executes the §5.2 protocol by voice, and surfaces one-tap **"Call 988 now"** (device voice call — the natural modality for a voice session). The supervision notification (§5.2 step 4) fires in parallel.
3. **Parity gate:** voice-mode crisis recall ≥ 0.95 measured on a **voice-specific test set** per language (ASR noise, accents, code-switching, crying/distress speech, background audio). Below gate → voice mode disabled for that language; text chat remains.
4. **Same scope boundaries:** §5.5 applies verbatim to spoken output; §5.3 false-positive UX applies with a single gentle voiced interjection + clear dismissal.

### 6.4.4 Voice Data & Consent
- Raw audio is **not retained**: processed transiently, stream-to-respond. Exceptions: (a) user explicitly saves a session to memory (per-session opt-in), or (b) a safety event occurs (§9 crisis-event logs).
- **No voiceprints, no speaker identification, no production emotion inference from prosody.**
- Synthetic voice is clearly disclosed as AI at session start; voice is user-selectable; no cloning of real persons' voices (FTC §5 compliant).
- Separate consent stream (4) in §8.3: microphone access + transient processing + the two retention exceptions above.

### 6.4.5 UX Requirements
- Session start: identity disclosure ("I'm an automated wellness tool, not a therapist or a person"), how to reach a human, and how to switch to text.
- Persistent on-screen controls during voice sessions: **switch to text**, **end session**, **get help now**.
- Duration guardrails: gentle check-in at 30 and 60 minutes; late-night sessions (11pm–5am local) surface crisis resources in one tap without ending the conversation.
- Error honesty: on low ASR confidence, the agent says it didn't catch that and offers rephrase-or-switch-to-text. It never fabricates understanding.

### 6.4.6 Launch Gates
- §6.4.3 parity gate passed per language.
- Red-team: scripted adversarial crisis content **spoken, not typed**, across accents, devices, and noise conditions.
- Live drill: crisis tabletop exercising the voice interruption path end-to-end.

---

# 7. Pillar 5: Clinician Co-Pilot Tools

## 7.1 Smart Notes (Automated Documentation)
Post-session, a HIPAA-compliant pipeline processes the **session audio transcript** (recorded with explicit dual consent of clinician and member at session start; consent is per-session and revocable) to draft structured notes in SOAP/DAP format.

**Accuracy and safety requirements:**
| Requirement | Target |
|---|---|
| Clinician edit burden | Median ≤ 30% of draft text changed before sign-off (measured as character-level edit distance) |
| Fabrication control | Every generated clinical statement links to transcript anchor(s); unanchored statements render as bracketed prompts, never as assertions |
| Sign-off | Notes are draft-only until clinician review, edit, and signature; unsigned notes auto-expire and are never billable |
| Time reduction | ≥ 45% vs. manual documentation baseline (pilot-measured) |

## 7.2 Smart Insights (Pre-Session Intelligence)
Prior to a scheduled session, the co-pilot synthesizes member chat activity (Tier 3), assessment-score trends, and session history into a one-page prep dashboard: key themes, goal progress, risk-flag history, and evidence-based intervention suggestions. Insights are advisory; clinicians can dismiss or correct entries, and corrections feed evaluation sets. The same anchoring discipline as Smart Notes applies: every synthesized claim links to source data (chat-derived themes reference specific sessions; scores reference specific assessments), and unanchored content is labeled as inference, not fact.

## 7.3 Anti-burnout design constraints
Co-pilot suggestions are defaults, not obligations. No productivity quota may be derived from co-pilot usage metrics. Burnout KPI measured via time-motion sampling, not self-report alone.

---

# 8. Pillar 6: Privacy, Security & Transparent Ethics

## 8.1 Security architecture (corrected specification)
| Layer | Specification |
|---|---|
| Transport | TLS 1.3 (HSTS enforced) |
| At rest | AES-256-GCM, envelope encryption, keys in a managed KMS/HSM with rotation ≤ 12 months |
| Message content | Field-level encryption; access via short-lived scoped credentials, all access logged and auditable |
| Separation | Tier 3 chat store, Tier 4 clinical record (EHR), and Pillar 2 research telemetry are **three separate data domains** with distinct keys, access roles, and consent records |
| Private journals | Optional client-side (device-held key) encryption for user journal entries; if enabled, content is inaccessible to server-side features including the AI companion |
| Honesty note | Because crisis screening and Smart Notes require server-side processing, the platform does **not** claim end-to-end encryption for AI-processed content. Marketing and consent language must match this architecture. A full threat model (STRIDE) is a Phase 0 deliverable. |

## 8.2 Regulatory compliance matrix
HIPAA (BAAs with all subprocessors), GDPR (DPO appointed, DPIA per feature, Article 9 handling), SOC 2 Type II (audit window defined), ISO 27001 (certification roadmap). Substance-use-disorder records, if ever collected, are segregated under 42 CFR Part 2 — default decision: do not collect in v1.x.

## 8.3 Informed consent (layered, per data stream)
Consent is requested separately for: (1) AI companion use, (2) Tier 4 treatment & session recording, (3) research telemetry (Pillar 2), (4) voice agent mode — microphone access, transient processing, and the two retention exceptions in §6.4.4. Each states purpose, retention, and revocation path in plain language. Revoking consent (3) stops collection within 24 hours; revoking (2) does not delete records already part of the legal clinical record (see §9).

---

# 9. Data Governance & Retention

| Data class | Retention | Notes |
|---|---|---|
| Tier 3 chat content (active) | Life of account + 30 days | Powers conversation memory (user-editable/deletable) |
| Tier 3 chat archive | 12 months, encrypted, access-logged | Safety QA and classifier evaluation; user deletion honored sooner where no safety hold exists |
| Tier 4 clinical records | ≥ 6 years from last contact (per HIPAA/state law) | Governed as legal medical record; deletion requests handled per jurisdiction |
| Crisis-event logs | 7 years | Legal hold readiness; de-identified after case closure |
| Pillar 2 research telemetry | Until consent revocation + 30 days | Separate domain; never merged with clinical record |
| Safety-classifier evaluation sets | Rolling, de-identified | Reviewed quarterly |
| Account deletion | Executed ≤ 30 days | Clinical-record portions persist per law; user receives a deletion receipt distinguishing the two |

---

# 10. Pillar 7: Monetization & Pricing (Hybrid, 4-Tier)

| Tier | Price | Deliverables | Audience |
|---|---|---|---|
| Tier 1: Community & Basic AI | $0/mo | Basic 24/7 AI chat, crisis grounding, self-guided CBT/DBT, peer forums | Sub-clinical users, self-help seekers, low-income individuals |
| Tier 2: AI Pro Companion | $9.99–$19.99/mo | Unlimited AI chat, long-term memory, voice agent mode (§6.4), mood analytics, psychological assessments | Daily wellness seekers wanting continuous personalized reflection |
| Tier 3: In-Network Telehealth | $0–$35/session member copay | Live video therapy & psychiatry, Smart Notes, Smart Insights, full EHR integration | Members needing formal diagnosis or medication management |
| Tier 4: Enterprise & Public Health | Contract / B2B | EAP replacement, employer coverage, university plans, county public-health grants | Employers, universities, municipal systems |

## 10.1 Tier 3 economics (v1.0 gap — resolved)
Revenue = per-completed-session platform fee billed through in-network payer contracts (claims processed via integrated medical billing; eligibility checks at booking). Roadmap: credentialing workstream begins Phase 1; payer contracting targets 3 networks in launch state. Uninsured members routed to transparent self-pay schedule ($80–$120/session, sliding scale via public-health grants where available).

## 10.2 Tier 4 enterprise requirements (beyond a feature row)
- Employer/admin dashboards report **aggregate-only** metrics with a minimum cohort size of k=25 and differential-privacy noise; no individual utilization data is ever employer-visible.
- Contractual SLAs: uptime 99.9%, crisis-pipeline availability 100% (measured monthly), support response ≤ 4 business hours.
- Utilization reporting follows ERISA/ADA guardrails; clinical content of sessions is never reportable.

### 10.3 Cost-to-Serve Model (Phase 0 deliverable)
Finance builds a marginal cost model before Phase 2 covering: crisis-pipeline activations per tier, voice minutes (ASR/TTS + safety compute), supervision cost per covered hour, and Smart Notes/Insights inference per session. Output: per-tier cost caps and adjustment triggers (e.g., voice trial limits tighten if marginal cost exceeds threshold). Purpose: prevent adverse selection against the free Tier 1.

---

# 11. Target User Personas

- **Persona A — Sarah, 28 (sub-clinical):** uses Tier 1/2 AI chat — often hands-free voice agent mode at night, when typing feels like effort — plus breathing tools to manage work stress and anxiety without needing formal care.
- **Persona B — Marcus, 42 (telehealth patient):** employer-insured; bi-weekly Tier 4 video therapy; uses the AI companion between sessions for continuity; his therapist sees Smart Insights before each visit.
- **Persona C — Dr. Elena Rostova (licensed therapist):** uses Smart Notes and Smart Insights to cut documentation time roughly in half and review pre-session trends; retains full sign-off authority.
- **Persona D — Dev, on-call clinical supervisor (NEW):** 24/7 safety-team member triaging crisis flags, dispositions, and Tier 2 moderation escalations. Drives the §5.2 SLA requirements and the supervision tooling backlog.

---

# 12. KPIs & Evaluation Metrics

Every KPI has a baseline, target, and measurement method. No "100%" targets.

| KPI | Definition | Baseline | Target | Method |
|---|---|---|---|---|
| Crisis recall | Classifier recall on high-acuity, per language | — (pre-launch validation) | ≥ 0.95 | Quarterly validated test set |
| False-alarm rate | Crisis workflows triggered per 1,000 messages | — | ≤ 2 | Production telemetry, monthly |
| Time-to-human-review | Classifier alarm → supervisor review start, p50/p95 | — | p50 ≤ 2 min / p95 ≤ 5 min (imminent risk) | Pipeline logs |
| Crisis-resource reachability | Unauthenticated user → crisis link tap, any screen | — | ≤ 2 taps, always available | UX audit + synthetic monitoring |
| Clinical efficacy (Tier 4) | PHQ-9/GAD-7 response rate (≥50% score reduction) among engaged members at 6 weeks | — | ≥ 50% response | Measurement-based care protocol, validated instruments |
| Tier 3 symptom trend (exploratory) | PHQ-9/GAD-7 change at 6 weeks among engaged users; descriptive with 95% CI, no clinical claims | Baseline at pilot | Reported with CI at pilot end | In-app assessments |
| Tier 2 moderator response | Report/flag → moderator action, p95 | — | ≤ 15 min (24/7 coverage) | Moderation logs |
| Tier 2 safety incident rate | Confirmed safety/policy incidents per 1,000 DAU | — | Declining QoQ | Trust & Safety reporting |
| Crisis pipeline marginal cost | Fully-loaded cost per crisis activation (infra + supervision) | — | Model approved Phase 0; cap set | Finance cost-to-serve model |
| Clinician efficiency | Documentation minutes per session vs. manual baseline | Manual baseline from 20-clinician pilot | ≥ 45% reduction | Time-motion sampling |
| Smart Notes edit burden | Median character edit distance, signed notes | — | ≤ 30% | Production analytics |
| Tier 2 retention | 90-day retention, paying members | Industry baseline TBD in pilot | ≥ 65% | Cohort analysis |
| Tier 4 graduation health | Step-downs with completed maintenance plan | — | ≥ 70% of step-downs | Care-navigation records |
| Voice response latency | User stops speaking → agent starts, p95 | — | ≤ 2.0 s (v1) | Production telemetry |
| Voice crisis recall | High-acuity recall on voice-specific test set, per language | — | ≥ 0.95 | Quarterly validated voice test set |
| Voice safety-gap incidents | Substantive agent replies to uncleared crisis content | — | 0 | 100% session-log audit sampling |
| Platform reliability | Uptime (excl. planned maintenance) | — | ≥ 99.9% | Status-page telemetry |

*Note: 90-day retention is measured only for Tier 2. For Tier 4, retention is deliberately NOT a success metric — clinically appropriate step-down (graduation) is counted as success via the last row.*

---

# 13. Regulatory & Compliance Scope

- **US:** HIPAA; state telehealth licensure compacts (PSYPACT/IMLC) for clinician coverage; 42 CFR Part 2 (excluded data, §8.2); FTC Act §5 (marketing claims — enforces the honest-encryption and non-diagnostic language); state AI-disclosure laws as enacted.
- **FDA decision gate (Phase 3):** if Pillar 2 graduates from research to clinical claims, a SaMD pathway determination (likely De Novo) is required *before* any deterioration-detection feature ships. Until then, no clinical language anywhere in product or marketing.
- **EU (if launched):** GDPR Art. 9; EU AI Act classification assessment — the crisis-triage component is expected to require high-risk conformity work; timeline gated accordingly.
- **Accessibility:** WCAG 2.2 AA across web and mobile clients; crisis flows additionally usability-tested under stress conditions; voice mode must remain usable with speech differences — a text path to every voice capability is mandatory, and no task is voice-only.
- **Jurisdiction handling:** crisis resources are geo-mapped per jurisdiction (988 is US-only; equivalents mapped before any regional launch); telehealth is delivered only where the treating clinician holds licensure (compacts where applicable); members who travel out-of-state get a licensure-coverage check with continuity or rescheduling options.
- **GCC crisis-resource mapping (Phase 0 deliverable, added v1.4):** each GCC country served (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman) requires its own verified general-emergency number and mental-health-specific helpline, confirmed directly with the issuing health authority at Phase 0 and re-verified before every regional launch and annually thereafter — public sources on these numbers are inconsistent and change without notice, so none may be hardcoded from secondary sources without Trust & Safety sign-off.
- **Language-independent, location-based crisis routing (added v1.4):** because an Arabic-speaking user may be physically located in any jurisdiction (diaspora, travel, expatriate populations), crisis-resource surfacing (§5.2 step 3) is keyed to the user's **detected or declared location**, never to their language setting. A Gulf-dialect Arabic session for a user located outside the GCC must surface that user's actual local resources (or global fallback where local mapping doesn't yet exist), not GCC numbers by default.

---

# 14. Release Phasing

| Phase | Scope | Gate to proceed |
|---|---|---|
| **Phase 0 (6–8 wks)** | STRIDE threat model; consent flows; age gate; data-domain separation; classifier test-set build + evaluation plan (text & voice) + red-team; supervision staffing costed model + tabletop drill; regulatory classification memo (US + EU AI Act); voice latency prototype; payer prioritization & credentialing kickoff; cost-to-serve model; geo-mapped crisis resources | Security review sign-off; validated classifier test sets; staffing model funded; memo accepted by Legal; voice p95 ≤ 2.0 s in prototype |
| **Phase 1 (Q1)** | Tier 1 self-guided tools, Tier 4 telehealth + Smart Notes pilot (20 clinicians), billing/credentialing workstream, crisis resources page | Smart Notes ≥45% time reduction in pilot; zero unanchored clinical assertions in audit |
| **Phase 2 (Q2)** | AI companion text (English first, then languages passing §5.1/§6 gates), crisis pipeline with 24/7 supervision staffing, Smart Insights; voice agent mode pilot (§6.4.6) | Crisis recall ≥0.95 EN; supervision SLA staffed and rehearsed (tabletop + live drills); voice parity gate passed EN |
| **Phase 3 (Q3–Q4)** | Tier 2 launch, enterprise dashboards (k=25), Pillar 2 research pilot (IRB-approved), additional languages | Enterprise anonymization audit; IRB approval; FDA determination memo for Pillar 2 future |

---

# 15. Acceptance Criteria (Standard + Examples)

Every shipped feature requires: (a) named owner, (b) measurable criterion, (c) QA method, (d) rollback plan.

*Examples:*
- **Crisis flow:** Given a scripted imminent-risk message in each served language, when sent to the companion, then the protocol in §5.2 executes through step 4 within p95 ≤ 60s and the supervisor console receives the packet. Verified by scripted E2E tests run before every release.
- **False-positive UX:** Given a benign message that trips the classifier, when the user dismisses the interjection, then no visible flag persists and the event is logged to the evaluation set only. Verified by UX test suite.
- **Smart Notes:** Given a 45-minute session transcript, when Smart Notes runs, then every signed statement links to a transcript anchor; unanchored content renders as bracketed prompts. Verified by 100% statement-level audit on a held-out session set.

---

# 16. Open Questions (Owners Assigned in Working Doc)

1. Payer contracting priority order for Tier 3 (launch state) — Owner: Business.
2. *(Closed in v1.3 — converted to a Phase 0 deliverable: supervision staffing model & costed coverage plan, with tabletop drill.)*
3. *(Closed in v1.3 — decided: turn-based with barge-in for v1; full-duplex moved to a research track under §17.5.)*
4. Research partner/IRB of record for Pillar 2 — Owner: Research.
5. EU AI Act conformity scope if EU launch accelerates — Owner: Legal.
6. Jurisdiction-specific record-retention overrides beyond HIPAA floor — Owner: Compliance.
7. ASR/TTS vendor selection with per-language *and per-dialect* distress-speech performance benchmarks, starting with Gulf/Khaleeji Arabic — Owner: ML Platform.

---

# 17. Technical Appendix (High-Level — Detailed Design in TDD)

## 17.1 LLM & RAG Strategy
- Base model: commercial frontier model under a BAA; no training on user data by default (contractual).
- Therapeutic content is retrieval-grounded from a clinically reviewed, versioned content library signed off by the clinical governance board; generation is constrained to grounded content.
- Any fine-tuning uses de-identified, consented data only and must re-pass the §5.1 gates before deployment.
- Hallucination controls: response-level groundedness checks; scope filters enforce §5.5 boundaries.

## 17.2 Conversation Memory Architecture
- Memory store is separate from chat logs; user-facing memory is editable/deletable with effect ≤ 24 h.
- Deleted entries are tombstoned and excluded from all retrieval paths; regression tests verify deleted content cannot resurface in generation.
- Safety-hold records (crisis logs, §9) live in a separate domain and are never used as conversation memory.

## 17.3 Safety Classifier Architecture
- Independent service on the request path for both text and ASR partials; failure-closed — on classifier outage the system permits only bridging behavior, never substantive replies (§6.4.2).
- Versioned models with per-language gates (§5.1, §6.4.3); shadow-mode evaluation before promotion; one-click rollback, drill-tested.

## 17.4 EHR Integration (HL7 FHIR R4)
- Resources: Patient, Practitioner, Appointment, Encounter, DocumentReference (signed Smart Notes), Observation (PHQ-9/GAD-7), Consent, Flag (safety holds), Communication.
- SMART on FHIR app launch for EHR-embedded co-pilot; US Core profiles for US payer exchange.

## 17.5 Voice Architecture (v1 Decision)
- Turn-based with barge-in (Open Question #3 resolved); full-duplex deferred to a research track under Pillar 2 governance.
- Pipeline per §6.4.2; launch target p95 ≤ 2.0 s with bridging behavior; 1.5 s remains the optimization goal.

---

*End of PRD v1.3. This document supersedes v1.0, v1.1, and v1.2 in full.*
