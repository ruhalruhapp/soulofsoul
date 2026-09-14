# Legal Documents

This directory contains the legal documents for the soulofsoul platform. These are **templates** provided for reference only — they are not legal advice. Consult qualified counsel before deployment.

## Documents

| Document | Purpose | When Required |
|---|---|---|
| [BUSINESS_ASSOCIATE_AGREEMENT.md](./BUSINESS_ASSOCIATE_AGREEMENT.md) | HIPAA BAA between soulofsoul (Business Associate) and covered entities (employers, clinicians, hospitals) | Before processing any PHI on behalf of a covered entity |
| [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) | Terms of Service for all users | Live before any user registers |
| [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) | Privacy Policy describing data collection, use, and protection | Live before any user registers |
| [DATA_PROCESSING_ADDENDUM.md](./DATA_PROCESSING_ADDENDUM.md) | DPA for EU/UK customers subject to GDPR | Provided to EU/UK customers upon request |

## Deployment Checklist

Before processing real Protected Health Information (PHI):

- [ ] All four documents reviewed by qualified healthcare legal counsel
- [ ] BAA signed with all subprocessors (cloud provider, LLM provider, ASR/TTS provider, EHR vendor, monitoring provider)
- [ ] HIPAA training completed for all workforce members
- [ ] Security Officer and Privacy Officer designated
- [ ] Incident response plan documented and tested
- [ ] Privacy Policy and Terms of Service published on the live site
- [ ] Cookie consent mechanism implemented (if serving EU/UK users)
- [ ] Data subject request (DSR) process documented
- [ ] Breach notification process documented (60 days for HIPAA, 72 hours for GDPR)

## Customization Notes

These templates use placeholders like `[Cloud provider]` and `[Address]` that must be filled in before deployment. The documents reference PRD sections (§5.1, §8.1, etc.) — keep the PRD in sync with any architectural changes.

## Regulatory Scope

The templates cover:
- **US:** HIPAA, HITECH, 42 CFR Part 2, FTC Act §5, state telehealth licensure (PSYPACT/IMLC)
- **EU/UK:** GDPR (Article 9 special category data), UK Data Protection Act
- **State:** California (CCPA/CPRA, CMIA), New York (SHIELD Act)
- **Accessibility:** WCAG 2.2 AA

## Version Control

Each document has a "Last updated" date at the top. Update this date when making changes and notify existing users per the "Changes to Terms" / "Changes to This Policy" sections.

---

*© 2026 soulofsoul. All rights reserved. These documents are proprietary templates and may not be reproduced or used without permission.*
