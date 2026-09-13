// Crisis classifier — mock implementation of the §5.1 safety engine.
// In production this would be a fine-tuned classifier with per-language gates.
// This demo uses keyword/regex heuristics for English only; Arabic falls back to
// "crisis-resource mode" per §5.1 rule (recall below threshold → text-only mode).

export interface CrisisResult {
  flagged: boolean;
  reason?: string;
  confidence: number;
  // Mock of the §5.1 metrics
  latencyMs: number;
}

// High-acuity risk classes per §5.1.
// Patterns are intentionally narrow to minimize false positives while catching
// genuine crisis language. Tested against /tests/crisis.test.ts.
const HIGH_ACUITY_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Explicit suicidal intent
  {
    pattern: /\b(kill|killing|killed)\s+(my|myself|me)\b/i,
    reason: "Suicidal ideation",
  },
  {
    // "end my life" specifically — NOT "end my subscription" or "end my workout"
    pattern: /\bend\s+my\s+(life|suffering|pain)\b/i,
    reason: "Suicidal ideation",
  },
  {
    pattern: /\b(suicide|suicidal)\b/i,
    reason: "Suicidal ideation",
  },
  {
    pattern: /\b(self[\s-]?harm|cutting myself|hurt myself)\b/i,
    reason: "Self-harm",
  },
  {
    // "want to die" — but NOT "want to disappear into a good book"
    pattern: /\bwant to\s+(die|not (be|exist)\s+anymore)\b/i,
    reason: "Suicidal ideation",
  },
  {
    // "not want to be alive anymore" — covers "I don't want to be alive anymore"
    pattern: /\b(not|don[''t]+|do\s+not)\s+want\s+to\s+(be\s+alive|exist|live)\b/i,
    reason: "Suicidal ideation",
  },
  {
    // Bare "want to disappear" with no following word — only flag if sentence ends
    // or is followed by crisis context. Match "want to disappear" at end of utterance
    // or followed by period. Avoids "want to disappear into/under/behind" etc.
    pattern: /\bwant to disappear\b(?!\s+(?:into|under|behind|in|inside))\b/i,
    reason: "Suicidal ideation",
  },
  {
    pattern: /\b(hurt|hits|beats|abuses?)\s+(me|my)\b/i,
    reason: "Domestic violence",
  },
  {
    pattern: /\b(overdose|pills?\s+to\s+end|take\s+all\s+(my\s+)?pills)\b/i,
    reason: "Overdose risk",
  },
  {
    pattern: /\b(no reason to live|better off (without|dead))\b/i,
    reason: "Suicidal ideation",
  },
  {
    // "planning to kill/end/die" — but NOT "planning to end my workout"
    // Require "kill", "die", "end my life/suffering/pain", or "end it" in plan context
    pattern: /\b(plan|planning)\s+to\s+(kill|die|end\s+my\s+(life|suffering|pain)|end\s+it)\b/i,
    reason: "Acute suicide plan",
  },
];

// Minors detection (§5.6) — gentle, conservative. False positives route to human review
// rather than auto-off-boarding. Production would use a dedicated classifier with stricter thresholds.
//
// Strategy: extract a stated age from common phrasings, then flag if age < 18.
// Also flag explicit self-identification as a minor (kid/child/teen/minor).
const MINORS_PATTERNS: Array<{ pattern: RegExp; evidence: string }> = [
  {
    // "I'm 14 years old", "I am 16 years old", "I'm 13yo", "I'm only 12"
    // Captures the age in group 1.
    pattern: /\bI(?:[''m]+|\s+am)\s+(?:only\s+)?(\d{1,2})\s*(?:years?\s*(?:old|yo)|yo|years?\s+old)?\b/i,
    evidence: "Stated age below 18",
  },
  {
    pattern: /\bI(?:[''m]+|\s+am)\s+(?:a\s+)?(?:kid|child|teen(?:ager)?|minor)\b/i,
    evidence: "Self-identified as minor",
  },
  {
    pattern: /\b(?:in|at)\s+(?:middle|high)\s+school\b/i,
    evidence: "Stated school enrollment",
  },
  {
    pattern: /\bI(?:[''m]+|\s+am)\s+not\s+(?:18|eighteen|an\s+adult)\b/i,
    evidence: "Explicit denial of adult status",
  },
];

export interface MinorsResult {
  flagged: boolean;
  evidence?: string;
  confidence: number;
}

export function detectMinors(text: string): MinorsResult {
  for (const { pattern, evidence } of MINORS_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Try to extract the stated age from the captured group
      const statedAgeStr = match[1];
      if (statedAgeStr) {
        const statedAge = parseInt(statedAgeStr, 10);
        if (statedAge > 0 && statedAge < 18) {
          return { flagged: true, evidence: `Stated age: ${statedAge}`, confidence: 0.92 };
        }
        // Age ≥ 18 — not a minor, don't flag
        continue;
      }
      // No age captured — flag with the pattern's evidence
      return { flagged: true, evidence, confidence: 0.7 };
    }
  }
  return { flagged: false, confidence: 0.95 };
}

export function classifyCrisis(
  text: string,
  lang: "en" | "ar" = "en"
): CrisisResult {
  const start = performance.now();

  // Arabic classifier is in "crisis-resource mode" per §5.1 / §6.5 — launch gate not yet met.
  // We surface a transparency note in the UI when Arabic is active.
  if (lang === "ar") {
    return {
      flagged: false,
      reason: undefined,
      confidence: 0,
      latencyMs: Math.round(performance.now() - start),
      // Note: production would route Arabic to crisis-resource mode here.
    };
  }

  for (const { pattern, reason } of HIGH_ACUITY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        flagged: true,
        reason,
        confidence: 0.96, // demo value; production would use model confidence
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  return {
    flagged: false,
    reason: undefined,
    confidence: 0.98,
    latencyMs: Math.round(performance.now() - start),
  };
}

// Crisis resources — geo-mapped per §13. In production this is keyed to user location,
// NOT language (§13 v1.4 rule: language-independent, location-based routing).
export interface CrisisResource {
  country: string;
  flag: string;
  police: string;
  general: string;
  mentalHealth: string;
  textLine?: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    country: "United States",
    flag: "🇺🇸",
    police: "911",
    general: "988",
    mentalHealth: "988 Suicide & Crisis Lifeline",
    textLine: "HOME to 741741",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    police: "999",
    general: "111",
    mentalHealth: "Samaritans 116 123",
    textLine: "SHOUT to 85258",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    police: "911",
    general: "988",
    mentalHealth: "Talk Suicide Canada 1-833-456-4566",
    textLine: "CONNECT to 686868",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    police: "000",
    general: "13 11 14",
    mentalHealth: "Lifeline Australia 13 11 14",
    textLine: "0477 13 11 14",
  },
  {
    country: "UAE",
    flag: "🇦🇪",
    police: "999",
    general: "999",
    mentalHealth: "Ministry of Happiness support line 80046743",
  },
  {
    country: "Saudi Arabia",
    flag: "🇸🇦",
    police: "999",
    general: "999",
    mentalHealth: "937 (Ministry of Health)",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    police: "112",
    general: "116 117",
    mentalHealth: "Telefonseelsorge 0800 111 0 111",
  },
  {
    country: "France",
    flag: "🇫🇷",
    police: "15",
    general: "15",
    mentalHealth: "3114 (Numéro national prévention suicide)",
  },
];
