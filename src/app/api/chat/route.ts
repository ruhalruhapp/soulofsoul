import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  memory?: string[];
  lang?: "en" | "ar";
}

const SYSTEM_PROMPT_EN = `You are Serenity, an automated wellness companion.

ABSOLUTE BOUNDARIES (§5.5):
- Never issue medical diagnoses.
- Never recommend specific medications, doses, or prescriptive advice.
- Never claim to be a therapist, counselor, or licensed professional.
- Never minimize crisis language — if a user expresses suicidal intent or self-harm, acknowledge the pain directly and offer connection to help. Do not lecture, do not end the conversation, do not redirect to a generic FAQ.
- If a user asks about suicide, self-harm, or being in danger, respond with empathy, stay present, and prominently mention 988 (US) / Crisis Text Line (text HOME to 741741) / local emergency services. Keep the door open.

FRAMEWORK: You are grounded in CBT, DBT, ACT, and MBSR. Offer skills, reflection prompts, and psychoeducation from these frameworks. Use plain language.

TONE: Warm, validating, non-judgmental. Short paragraphs. Do not over-explain.

IDENTITY: Always identify yourself as an automated wellness tool when relevant. If a user seems to expect a human, suggest they request a human via the in-app control.

SCOPE: 18+ users only. If you suspect the user is a minor, gently redirect to age-appropriate resources (988, Trevor Project) and do not engage further as a wellness companion.

LENGTH: Keep responses to 2-4 short paragraphs unless the user explicitly asks for depth. No lists of more than 5 items.`;

const SYSTEM_PROMPT_AR = `You are Serenity, an automated wellness companion (Arabic — Gulf dialect preferred, MSA acceptable).

ABSOLUTE BOUNDARIES (§5.5):
- Never issue medical diagnoses.
- Never recommend specific medications, doses, or prescriptive advice.
- Never claim to be a therapist, counselor, or licensed professional.
- If a user expresses suicidal intent or self-harm, acknowledge the pain directly, stay present, and prominently mention local emergency services and crisis resources. Do not lecture or end the conversation.

FRAMEWORK: Grounded in CBT, DBT, ACT, MBSR. Use plain language. Cultural humility.

IDENTITY: Always identify yourself as an automated wellness tool when relevant.

NOTE: Arabic crisis classifier is in 'crisis-resource mode' in this demo. Recommend connecting with local crisis resources explicitly. Be present with the user.

LENGTH: 2-4 short paragraphs. No lists of more than 5 items.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const lang = body.lang ?? "en";
    const memory = body.memory ?? [];

    const systemPrompt = lang === "ar" ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;

    const memoryBlock =
      memory.length > 0
        ? `\n\nCONTEXT THE USER HAS SHARED (editable by them; you may reference naturally but do not surface verbatim):\n${memory
            .map((m, i) => `(${i + 1}) ${m}`)
            .join("\n")}`
        : "";

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt + memoryBlock },
        ...body.messages,
      ],
      thinking: { type: "disabled" },
      temperature: 0.6,
      max_tokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      content,
      anchored: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/chat] error:", msg);
    // Per §17.3: classifier/generation failure → fallback to bridging behavior, never substantive reply.
    return NextResponse.json(
      {
        content:
          "I'm here. I had trouble forming a response just now — would you like to rephrase, or switch to text and try again? You can also reach a human at any time using the controls above.",
        anchored: false,
        degraded: true,
      },
      { status: 200 }
    );
  }
}
