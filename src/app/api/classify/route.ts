import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * LLM-based crisis classifier — §5.1.
 *
 * Replaces the regex mock with a real LLM classifier using z-ai-web-dev-sdk.
 * The LLM evaluates each message against high-acuity risk classes and returns
 * structured JSON: { flagged, risk_class, confidence, reasoning }.
 *
 * Per §5.1: this runs on EVERY user message BEFORE generation. Target p95 ≤ 300ms.
 * Per §17.3: failure-closed — on classifier outage, only bridging behavior permitted.
 *
 * Per §5.5: the classifier runs INDEPENDENTLY of the generation model — safety
 * is not prompt-dependent.
 *
 * Production notes:
 * - A fine-tuned classifier (e.g., a DistilBERT or domain-specific model) would
 *   be faster and cheaper than an LLM call. This LLM approach is the reference
 *   implementation; swap in a real model via the same interface.
 * - Per-language gates (§5.1, §6.5): each language (and for Arabic, each dialect)
 *   requires ≥0.95 recall on a validated test set before launch.
 */

interface ClassifyRequest {
  text: string;
  lang?: "en" | "ar";
  conversationContext?: string[]; // recent messages for context
}

interface ClassifyResponse {
  flagged: boolean;
  riskClass?: string;
  confidence: number;
  reasoning?: string;
  latencyMs: number;
  model: string;
  degraded?: boolean;
}

const SYSTEM_PROMPT = `You are a crisis-screening classifier for a mental health platform. Your ONLY job is to evaluate whether a user message contains high-acuity risk language.

HIGH-ACUITY RISK CLASSES (per §5.1):
1. "suicidal_ideation" — explicit or implicit mention of wanting to die, kill oneself, end one's life, or no reason to live
2. "self_harm" — mention of cutting, hurting oneself, or self-injury
3. "domestic_violence" — disclosure of physical, emotional, or sexual abuse by a partner/family
4. "overdose_risk" — mention of taking pills, overdose, or substance-related self-harm
5. "severe_psychosis" — disorganized thinking, command hallucinations, imminent danger
6. "acute_mania" — extreme agitation, dangerous impulsivity
7. "minors_disclosure" — user identifies as under 18 (route to §5.6 off-boarding)

EVALUATION RULES:
- Be SENSITIVE but not OVER-SENSITIVE. False positives erode trust; false negatives are dangerous.
- Indirect language ("permanent exit", "no reason to live", "better off without me") COUNTS as risk.
- Metaphorical crisis language ("disappear into a good book", "kill some time") does NOT count.
- Stated age below 18 → flag as "minors_disclosure".
- If you are UNSURE, lean toward flagging — the human backstop (§5.2) will verify.

OUTPUT FORMAT:
Return ONLY a JSON object (no markdown, no prose):
{
  "flagged": boolean,
  "riskClass": string | null,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Examples:
- "I want to kill myself" → {"flagged": true, "riskClass": "suicidal_ideation", "confidence": 0.98, "reasoning": "explicit suicidal intent"}
- "I'm having a tough day at work" → {"flagged": false, "riskClass": null, "confidence": 0.95, "reasoning": "no risk language"}
- "I'm 14 years old" → {"flagged": true, "riskClass": "minors_disclosure", "confidence": 0.95, "reasoning": "stated age below 18"}
- "I want to kill some time" → {"flagged": false, "riskClass": null, "confidence": 0.90, "reasoning": "idiom, not literal"}`;

export async function POST(req: NextRequest): Promise<NextResponse<ClassifyResponse>> {
  const start = performance.now();

  try {
    const body = (await req.json()) as ClassifyRequest;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          flagged: false,
          confidence: 0,
          latencyMs: Math.round(performance.now() - start),
          model: "none",
          degraded: true,
        },
        { status: 400 }
      );
    }

    // §5.1 / §6.5: Arabic in crisis-resource mode (gate not yet met)
    if (body.lang === "ar") {
      return NextResponse.json({
        flagged: false,
        confidence: 0,
        latencyMs: Math.round(performance.now() - start),
        model: "arabic-crisis-resource-mode",
        degraded: true,
        reasoning: "Arabic classifier below 0.95 gate — crisis-resource mode only",
      });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Classify this message:\n\n"${text}"${
            body.conversationContext && body.conversationContext.length > 0
              ? `\n\nRecent context:\n${body.conversationContext.slice(-3).join("\n")}`
              : ""
          }`,
        },
      ],
      thinking: { type: "disabled" },
      temperature: 0, // deterministic classification
      max_tokens: 200,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const latencyMs = Math.round(performance.now() - start);

    // Parse the JSON response
    let parsed: { flagged?: boolean; riskClass?: string | null; confidence?: number; reasoning?: string };
    try {
      // Strip any markdown code fences if present
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Per §17.3: failure-closed — if we can't parse, treat as potential risk
      // (safer to flag and have human review than to miss)
      return NextResponse.json({
        flagged: true,
        riskClass: "parse_failure",
        confidence: 0.5,
        reasoning: "Classifier output could not be parsed — routing to human review per §17.3",
        latencyMs,
        model: "llm-classifier-v1",
        degraded: true,
      });
    }

    return NextResponse.json({
      flagged: Boolean(parsed.flagged),
      riskClass: parsed.riskClass ?? undefined,
      confidence: Number(parsed.confidence ?? 0),
      reasoning: parsed.reasoning,
      latencyMs,
      model: "llm-classifier-v1",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/classify] error:", msg);
    const latencyMs = Math.round(performance.now() - start);

    // Per §17.3: failure-closed — on classifier outage, flag for human review
    return NextResponse.json({
      flagged: true,
      riskClass: "classifier_outage",
      confidence: 0.5,
      reasoning: "Classifier service unavailable — routing to human review per §17.3",
      latencyMs,
      model: "llm-classifier-v1",
      degraded: true,
    });
  }
}
