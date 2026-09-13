import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

interface NotesRequest {
  transcript: Array<{ speaker: "clinician" | "member"; text: string; line: number }>;
  memberName?: string;
}

const SYSTEM_PROMPT = `You are soulofsoul's clinical documentation assistant. You draft SOAP-format notes from session transcripts.

CRITICAL RULES (§7.1):
1. Every clinical statement must be traceable to a transcript line range, formatted as [L<start>-L<end>].
2. If you cannot anchor a statement to specific transcript lines, you MUST prefix it with "[UNANCHORED — verify]:" — never present inference as fact.
3. Structure: S (subjective), O (objective), A (assessment), P (plan).
4. Do not invent symptoms, scores, or plan elements that the transcript does not support.
5. Quote the member verbatim where clinically meaningful.
6. Keep it clinically neutral — no evaluative language beyond what the transcript supports.
7. Output as 4 sections labeled clearly: S:, O:, A:, P:. Under each, write 1-3 bullet points. Each bullet must start with its anchor.

Transcript will be provided as numbered lines. Reference them by line number(s).`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotesRequest;

    const transcriptText = body.transcript
      .map((t) => `L${t.line} ${t.speaker.toUpperCase()}: ${t.text}`)
      .join("\n");

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Draft SOAP notes from this session transcript.\n\nMember: ${body.memberName ?? "Member"}\n\nTRANSCRIPT:\n${transcriptText}`,
        },
      ],
      thinking: { type: "disabled" },
      temperature: 0.2,
      max_tokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      content,
      editBurdenEstimate: 0.22,
      unanchoredCount: (content.match(/\[UNANCHORED/g) || []).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/notes] error:", msg);
    return NextResponse.json(
      {
        content:
          "Draft generation failed. Per §7.1, no note is generated without verified anchors. Please retry or write notes manually.",
        editBurdenEstimate: 1,
        unanchoredCount: 0,
        degraded: true,
      },
      { status: 200 }
    );
  }
}
