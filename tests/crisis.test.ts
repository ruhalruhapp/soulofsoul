/**
 * Unit tests for the crisis classifier — §5.1.
 *
 * These tests cover the safety-critical path: detecting high-acuity risk language
 * (suicidal ideation, self-harm, domestic violence, overdose) and minors
 * self-identification (§5.6).
 *
 * Run with: `bun test`
 */

import { describe, expect, it } from "bun:test";
import { classifyCrisis, detectMinors } from "@/lib/crisis";

// ─── classifyCrisis — high-acuity risk detection (§5.1) ───

describe("classifyCrisis", () => {
  describe("English — suicidal ideation", () => {
    const suicidalPhrases = [
      "I want to kill myself",
      "I'm going to end my life",
      "I want to die",
      "I don't want to be alive anymore",
      "I want to disappear",
      "I'm suicidal",
      "I've been thinking about suicide",
      "There's no reason to live",
      "Everyone would be better off without me",
      "Everyone would be better off dead",
      "I have a plan to end it",
      "I'm planning to kill myself",
    ];

    for (const phrase of suicidalPhrases) {
      it(`flags: "${phrase}"`, () => {
        const result = classifyCrisis(phrase, "en");
        expect(result.flagged).toBe(true);
        expect(result.reason).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.9);
      });
    }
  });

  describe("English — self-harm", () => {
    const selfHarmPhrases = [
      "I want to hurt myself",
      "I've been cutting myself",
      "I self-harm when I'm stressed",
    ];

    for (const phrase of selfHarmPhrases) {
      it(`flags: "${phrase}"`, () => {
        const result = classifyCrisis(phrase, "en");
        expect(result.flagged).toBe(true);
        expect(result.reason).toBe("Self-harm");
      });
    }
  });

  describe("English — domestic violence", () => {
    const dvPhrases = [
      "My partner hits me",
      "He beats me",
      "She abuses me",
    ];

    for (const phrase of dvPhrases) {
      it(`flags: "${phrase}"`, () => {
        const result = classifyCrisis(phrase, "en");
        expect(result.flagged).toBe(true);
        expect(result.reason).toBe("Domestic violence");
      });
    }
  });

  describe("English — overdose risk", () => {
    const overdosePhrases = [
      "I'm going to overdose",
      "I want to take all my pills",
      "I have pills to end it",
    ];

    for (const phrase of overdosePhrases) {
      it(`flags: "${phrase}"`, () => {
        const result = classifyCrisis(phrase, "en");
        expect(result.flagged).toBe(true);
        expect(result.reason).toBeDefined();
      });
    }
  });

  describe("English — benign messages (false-positive regression)", () => {
    const benignPhrases = [
      "I'm having a tough day at work",
      "I've been feeling anxious about deadlines",
      "My anxiety is worse on Sundays",
      "I want to improve my sleep",
      "Can you help me with a breathing exercise?",
      "I'm feeling a bit down today",
      "I'd like to talk about my relationship",
      "I want to feel better",
      "I've been stressed lately",
      "Help me with my mood",
      // Edge cases that should NOT trip:
      "I want to kill some time",
      "I want to end my subscription",
      "I'm planning to end my workout early",
      "I want to disappear into a good book",
    ];

    for (const phrase of benignPhrases) {
      it(`does NOT flag: "${phrase}"`, () => {
        const result = classifyCrisis(phrase, "en");
        expect(result.flagged).toBe(false);
      });
    }
  });

  describe("Arabic — crisis-resource mode (§5.1 / §6.5)", () => {
    it("returns flagged=false because gate not yet met (crisis-resource mode)", () => {
      // Arabic classifier below 0.95 gate → text-only crisis-resource mode
      // Even explicit crisis language is not auto-detected; resources are surfaced
      const result = classifyCrisis("أريد أن أموت", "ar");
      expect(result.flagged).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it("does not crash on Arabic text", () => {
      const result = classifyCrisis("مرحبا، كيف حالك؟", "ar");
      expect(result.flagged).toBe(false);
    });
  });

  describe("latency budget (§5.1: p95 ≤ 300ms)", () => {
    it("completes within 50ms for typical message", () => {
      const start = performance.now();
      classifyCrisis("I've been having a really hard time lately and I don't know what to do", "en");
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });
});

// ─── detectMinors — §5.6 age gate enforcement ───

describe("detectMinors", () => {
  describe("explicit age statements", () => {
    const minorStatements = [
      "I'm 14 years old",
      "I'm 17",
      "I am 16 years old",
      "I'm only 12",
      "I'm 13yo",
      "I'm a kid",
      "I'm a child",
      "I'm a teenager",
      "I'm a teen",
      "I'm a minor",
      "I'm in high school",
      "I'm in middle school",
      "I'm not 18",
      "I'm not an adult",
    ];

    for (const statement of minorStatements) {
      it(`flags: "${statement}"`, () => {
        const result = detectMinors(statement);
        expect(result.flagged).toBe(true);
        expect(result.evidence).toBeDefined();
      });
    }
  });

  describe("benign adult statements (false-positive regression)", () => {
    const adultStatements = [
      "I'm 25 years old",
      "I'm 30",
      "I am 18 years old",
      "I'm an adult",
      "I'm 40 and stressed",
      "I've been feeling down lately",
      "I want to talk about my anxiety",
      "Help me with breathing exercises",
      "I'm 24 and work is hard",
    ];

    for (const statement of adultStatements) {
      it(`does NOT flag: "${statement}"`, () => {
        const result = detectMinors(statement);
        expect(result.flagged).toBe(false);
      });
    }
  });

  describe("stated age extraction", () => {
    it("extracts the stated age when present", () => {
      const result = detectMinors("I'm 15 years old and need help");
      expect(result.flagged).toBe(true);
      expect(result.evidence).toContain("15");
      expect(result.confidence).toBeGreaterThan(0.85);
    });
  });
});
