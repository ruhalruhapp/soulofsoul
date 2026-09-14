# Privacy Policy

**Last updated:** September 13, 2026

This Privacy Policy describes how soulofsoul ("we," "us," "our") collects, uses, and protects your personal information when you use our mental health platform (the "Service").

> **If you are in crisis, call 988 (US) or your local emergency number. This Privacy Policy does not delay emergency care.**

---

## 1. Information We Collect

### 1.1 Information You Provide
- **Account data:** email, name (optional), birth year (for age verification)
- **Profile data:** language preference, consent state (4 separate streams)
- **Chat data:** messages you send to the AI companion (Tier 3)
- **Assessment data:** PHQ-9, GAD-7, PSS self-assessment scores
- **Mood data:** daily mood logs and notes
- **Memory data:** patterns and goals you choose to share with the AI companion
- **Telehealth data:** session transcripts (only with per-session dual consent)
- **Journal data:** private journal entries (encrypted client-side; we never see plaintext)

### 1.2 Information Collected Automatically
- **HCI telemetry:** tap latency, swipe velocity, typing rhythm (timing only — never content), scroll fluidity. **Opt-in only** for Pillar 2 research participants. Stored separately from message content.
- **Usage data:** features used, session duration, app interactions (aggregate)
- **Device data:** device type, OS version, browser (for compatibility)
- **Crash data:** error logs (no message content)

### 1.3 Information We NEVER Collect
Per §4.2 of our PRD, the following are NEVER collected:
- ❌ Typed text content from HCI telemetry (only inter-keystroke timing)
- ❌ Message bodies in Pillar 2 telemetry
- ❌ Passwords (beyond hashed verification)
- ❌ GPS / precise location (only country-level for crisis resource routing)
- ❌ Microphone or ambient audio (only transient voice processing, not retained)
- ❌ Browsing history
- ❌ Contact lists
- ❌ Voiceprints or speaker identification
- ❌ Production emotion inference from voice prosody

---

## 2. How We Use Your Information

### 2.1 Provide the Service
- Process chat messages and AI companion responses
- Run the crisis classifier (real-time, on every message)
- Generate Smart Notes and Smart Insights (clinician co-pilot)
- Sync with your EHR via FHIR R4 (Tier 4 only, with consent)

### 2.2 Safety
- Detect crisis language and route to the on-call supervisor (de-identified)
- Schedule 24-72h follow-up for imminent-risk dispositions
- Maintain crisis-event logs for QA and legal hold (7 years, de-identified after closure)

### 2.3 Improve the Service
- Aggregate, de-identified analytics for safety engineering (recall, false-alarm rate)
- Red-team exercises (scripted adversarial content, with consent)
- Quarterly classifier re-validation

### 2.4 Research (Opt-In Only)
- Pillar 2 digital phenotyping research (HCI timing signals, IRB-supervised)
- Aggregate findings only — never individual-level inference shown to users, clinicians, or care-navigators

### 2.5 Legal Compliance
- Respond to lawful requests (subpoenas, court orders)
- Maintain audit logs (all access to PHI logged per §8.1)
- Comply with HIPAA, GDPR, and applicable state laws

---

## 3. Data Domains & Retention

We maintain three separate data domains with distinct encryption contexts, access roles, and consent records (§8.1):

### 3.1 Domain A — Tier 3 Chat Store
- **Contents:** conversation memory, mood logs, assessments
- **Encryption:** AES-256-GCM at rest, field-level encryption for message content
- **Retention:** Life of account + 30 days
- **Access:** User (editable, deletable); AI companion (for generation)

### 3.2 Domain B — Tier 4 Clinical Record (EHR)
- **Contents:** Smart Notes, FHIR resources, safety-hold Flags, session transcripts
- **Encryption:** AES-256-GCM at rest, field-level encryption
- **Retention:** ≥ 6 years from last contact (per HIPAA / state law)
- **Access:** Licensed clinicians (with session consent); user (viewable, deletion per law)

### 3.3 Domain C — Pillar 2 Research Telemetry
- **Contents:** HCI timing signals (no message content)
- **Encryption:** Separate encryption context
- **Retention:** Until consent revocation + 30 days
- **Access:** IRB-supervised researchers; aggregate only

### 3.4 Crisis-Event Logs
- **Contents:** de-identified crisis classifications, dispositions, follow-up records
- **Retention:** 7 years; de-identified after case closure
- **Access:** On-call supervisors (de-identified); Legal (for minors-specific handling)

### 3.5 Safety-Classifier Evaluation Sets
- **Contents:** de-identified classifier test cases
- **Retention:** Rolling, de-identified
- **Access:** ML Platform team; quarterly review

### 3.6 Audit Logs
- **Contents:** all access to PHI (user ID, timestamp, action, resource)
- **Retention:** ≥ 6 years
- **Access:** Security Officer, Privacy Officer

---

## 4. Data Sharing

### 4.1 Subprocessors
We use the following subprocessors, each under a signed BAA:

| Subprocessor | Purpose | Data accessed |
|---|---|---|
| [Cloud provider] | Infrastructure hosting | All domains |
| [LLM provider] | AI companion generation | Tier 3 chat (transient) |
| [ASR/TTS provider] | Voice agent mode | Audio (transient, not retained) |
| [EHR vendor] | FHIR R4 sync | Tier 4 clinical record |
| [Monitoring provider] | Application monitoring | Audit logs (no PHI) |

We will notify you 30 days before adding a new subprocessor.

### 4.2 Enterprise Customers
If your employer or university provides access to the Service:
- Your employer sees **aggregate-only** metrics (k=25 minimum cohort, differential-privacy noise)
- Your employer **never** sees individual utilization data, session content, or crisis-event records
- Clinical content of sessions is **never** reportable (ERISA/ADA guardrails)

### 4.3 Legal Disclosures
We may disclose your information:
- To comply with legal obligations (subpoenas, court orders)
- To protect our rights or safety
- In connection with a merger, acquisition, or asset sale (with BAA transfer)

### 4.4 De-Identified Data
We may use or disclose de-identified data (as defined under HIPAA § 164.502(d)) for:
- Safety engineering and quality improvement
- Aggregate enterprise reporting
- Research (per §4 of the PRD, with separate IRB-supervised consent)

---

## 5. Your Rights

### 5.1 Access & Portability
You can:
- View your conversation memory, mood logs, and assessments
- Export your data (contact privacy@soulofsoul.com)
- Request an accounting of disclosures (per HIPAA § 164.528, 6-year lookback)

### 5.2 Correction & Deletion
You can:
- Edit or delete conversation memory entries (effect ≤ 24 hours)
- Delete your account (executed within 30 days)
- Note: clinical-record portions persist per HIPAA / state law (≥ 6 years)

### 5.3 Consent Management
You can change your consent state at any time:
- AI companion (revocable — stops the companion)
- Telehealth recording (revocable — does not delete past records per HIPAA)
- Research telemetry (revocable — collection stops within 24 hours)
- Voice agent mode (revocable — microphone access removed)

### 5.4 GDPR Rights (EU/UK Users)
If you are in the EU/UK, you have additional rights:
- Right to access (Article 15)
- Right to rectification (Article 16)
- Right to erasure / "right to be forgotten" (Article 17) — subject to HIPAA retention
- Right to data portability (Article 20)
- Right to object (Article 21)

Contact: dpo@soulofsoul.com

### 5.5 California Rights (CCPA/CPRA)
California residents have the right to:
- Know what personal information is collected
- Request deletion (subject to HIPAA retention)
- Opt out of "sale" (we do not sell personal information)
- Non-discrimination for exercising rights

---

## 6. Security

### 6.1 Encryption
- **In transit:** TLS 1.3 (HSTS enforced)
- **At rest:** AES-256-GCM with envelope encryption; keys in managed KMS/HSM with rotation ≤ 12 months
- **Field-level:** message content encrypted separately
- **Client-side:** private journal uses AES-GCM 256-bit via Web Crypto API (key never leaves device)

### 6.2 Access Control
- Short-lived scoped credentials
- All access to PHI logged and auditable
- Role-based access: Member, Clinician, Supervisor, Admin, Researcher

### 6.3 Honest About Encryption
We do NOT claim end-to-end encryption for AI-processed content. Crisis screening and Smart Notes require server-side processing. Marketing and consent language match this architecture.

### 6.4 Breach Notification
In the event of a breach of unsecured PHI:
- We notify affected individuals within 60 days
- We notify the Secretary of HHS
- We notify prominent media outlets if the breach affects 500+ residents of a state or jurisdiction
- We maintain a breach log for 6 years

---

## 7. Children's Privacy

The Service is not directed to children under 18. We do not knowingly collect personal information from children under 18. If we become aware that a user is under 18:
- We redirect them to age-appropriate resources (988, Trevor Project)
- We off-board their account per our §5.6 policy
- We delete conversation memory and chat archives
- Crisis-event logs are routed to Legal for minors-specific handling before deletion

---

## 8. International Users

The Service is currently available in the United States. If accessed from outside the US:
- Telehealth services are provided only where the clinician holds licensure
- Crisis resources are geo-keyed (per §13 v1.4: location-based, not language-based)
- GDPR applies to EU/UK users (see Section 5.4)

---

## 9. Changes to This Policy

We may update this Privacy Policy. We will notify you of material changes via email or in-app notice. Continued use after the effective date constitutes acceptance.

---

## 10. Contact

**Privacy Officer:**
- Email: privacy@soulofsoul.com
- Mail: soulofsoul Privacy Officer, [Address]

**Data Protection Officer (EU/UK):**
- Email: dpo@soulofsoul.com

**Crisis Support (always available):**
- 988 Suicide & Crisis Lifeline (call or text 988)
- 911 for emergencies
- Crisis Text Line (text HOME to 741741)

---

*© 2026 soulofsoul. All rights reserved. This Privacy Policy is for reference only and does not constitute legal advice. Consult qualified counsel before deployment.*
