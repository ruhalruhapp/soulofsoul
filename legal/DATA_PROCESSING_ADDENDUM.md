# Data Processing Addendum (DPA)

**Version:** 1.0
**Date:** September 13, 2026

This Data Processing Addendum ("DPA") is incorporated into the soulofsoul Terms of Service and Business Associate Agreement by reference. It supplements the HIPAA Business Associate Agreement for customers subject to the EU General Data Protection Regulation (GDPR) and the UK Data Protection Act.

---

## 1. Definitions

- **"Data Controller"** means the entity that determines the purposes and means of processing Personal Data.
- **"Data Processor"** means soulofsoul, which processes Personal Data on behalf of the Data Controller.
- **"Personal Data"** means any information relating to an identified or identifiable natural person, as defined in Article 4(1) of the GDPR.
- **"Special Category Data"** includes health data (Article 9 GDPR), which soulofsoul processes under HIPAA BAA terms.
- **"Subprocessor"** means any third party engaged by soulofsoul to process Personal Data.

---

## 2. Scope and Roles

### 2.1 Roles
- The **Customer** is the Data Controller.
- soulofsoul is the Data Processor.

### 2.2 Personal Data Processed
- Identifiers (name, email, IP address)
- Health data (mental health assessments, chat content, crisis classifications)
- Biometric data (HCI timing signals, opt-in only — no voiceprints or speaker ID)
- Usage data (features used, session duration)

### 2.3 Processing Purposes
- Providing the mental health platform
- AI companion generation
- Telehealth session hosting
- Crisis screening and supervisor routing
- FHIR R4 EHR sync
- Aggregate analytics (de-identified)

### 2.4 Duration
- For the duration of the customer's subscription
- Personal data retained per HIPAA / state law after termination (≥ 6 years for clinical records)

---

## 3. Subprocessors

### 3.1 Authorized Subprocessors
As of the date of this DPA:

| Subprocessor | Purpose | Location |
|---|---|---|
| [Cloud provider — AWS/GCP/Azure] | Infrastructure hosting | [Region] |
| [LLM provider — under BAA] | AI companion generation | [Region] |
| [ASR/TTS provider] | Voice agent mode | [Region] |
| [EHR vendor] | FHIR R4 sync | [Region] |
| [Monitoring/logging provider] | Application monitoring | [Region] |
| [Error tracking provider] | Error reporting | [Region] |

### 3.2 Notification of Changes
We will notify the Customer at least 30 days before engaging a new subprocessor. The Customer may object to the new subprocessor by notifying us in writing within 30 days.

### 3.3 Subprocessor Obligations
All subprocessors are bound by written agreements that impose the same data protection obligations as this DPA.

---

## 4. Data Subject Rights

### 4.1 Assistance
We will assist the Customer in responding to data subject requests (access, rectification, erasure, portability, objection) to the extent we have access to the relevant Personal Data.

### 4.2 Standard Timeline
- Acknowledgment: within 5 business days
- Response: within 30 days (may be extended by 60 days for complex requests)

---

## 5. Security Measures

### 5.1 Technical Measures
- TLS 1.3 in transit
- AES-256-GCM at rest with envelope encryption
- Field-level encryption for message content
- Separate encryption contexts for the three data domains (§8.1)
- Client-side AES-GCM 256-bit for private journal
- Key rotation ≤ 12 months via KMS/HSM

### 5.2 Organizational Measures
- Role-based access control (RBAC)
- All PHI access logged and auditable
- Annual workforce training on HIPAA and GDPR
- Designated Security Officer and Privacy Officer
- Incident response plan

### 5.3 No End-to-End Encryption Claim
We do not claim E2EE for AI-processed content because crisis screening and Smart Notes require server-side processing.

---

## 6. International Data Transfers

### 6.1 Transfer Mechanisms
For transfers outside the EU/EEA:
- Standard Contractual Clauses (SCCs) approved by the European Commission
- UK International Data Transfer Agreement (IDTA) for UK transfers
- Binding Corporate Rules (if applicable)

### 6.2 Schrems II Compliance
We have conducted transfer impact assessments per the Schrems II ruling. Supplementary measures include:
- Encryption of data in transit and at rest
- Pseudonymization where feasible
- Access controls limiting cross-border access

---

## 7. Data Breach Notification

### 7.1 HIPAA Breach
Per our BAA: notify within 60 calendar days of discovery.

### 7.2 GDPR Breach
Per Article 33 GDPR:
- Notify the Customer without undue delay and within **72 hours** of becoming aware of a personal data breach
- Provide: nature of breach, categories and approximate number of data subjects, likely consequences, measures taken

---

## 8. Data Return and Deletion

### 8.1 On Termination
Upon termination, we will:
- Return all Personal Data to the Customer in a standard machine-readable format
- Delete all copies of Personal Data within 90 days
- Provide written certification of deletion upon request

### 8.2 Legal Retention
Clinical records subject to HIPAA retention (≥ 6 years) will be retained in encrypted form and not used for any other purpose.

---

## 9. Audit Rights

### 9.1 Customer Audit
The Customer may audit our compliance with this DPA, subject to:
- 30 days' written notice
- Conducting the audit during business hours
- Not disrupting our operations
- Confidentiality obligations

### 9.2 Third-Party Audits
We commission annual third-party audits (SOC 2 Type II, ISO 27001) and will share reports with the Customer under NDA.

---

## 10. Contact

**Data Protection Officer:**
- Email: dpo@soulofsoul.com
- Mail: soulofsoul DPO, [Address]

---

*© 2026 soulofsoul. All rights reserved. This DPA is incorporated into the soulofsoul Terms of Service and Business Associate Agreement by reference.*
