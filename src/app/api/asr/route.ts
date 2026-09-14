import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * ASR endpoint — §6.4 Voice Agent Mode.
 * Receives audio (base64 or blob), returns transcribed text.
 *
 * Per §6.4.4: raw audio is NOT retained (stream-to-respond).
 * Per §6.4.2: streaming ASR would feed partial transcripts to the safety screen.
 * This endpoint does full-utterance ASR; production would stream partials.
 *
 * Per NG7: no voiceprints, no speaker identification, no production emotion inference.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let base64Audio: string;

    if (contentType.includes("application/json")) {
      const body = await req.json() as { audio?: string };
      if (!body.audio) {
        return NextResponse.json({ error: "Audio data required" }, { status: 400 });
      }
      base64Audio = body.audio;
    } else if (contentType.includes("audio/") || contentType.includes("multipart/form-data")) {
      // Blob upload
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile) {
        return NextResponse.json({ error: "Audio file required" }, { status: 400 });
      }
      const arrayBuffer = await audioFile.arrayBuffer();
      base64Audio = Buffer.from(arrayBuffer).toString("base64");
    } else {
      return NextResponse.json(
        { error: "Unsupported content type. Use application/json with base64 audio, or multipart/form-data." },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();
    const response = await zai.audio.asr.create({
      file_base64: base64Audio,
    });

    const text = (response as { text?: string }).text ?? "";

    // Per §6.4.4: raw audio is NOT retained — we return text only.
    // The crisis classifier runs on the text client-side before sending to /api/chat.
    return NextResponse.json({
      text,
      // Latency reporting for §6.4.2 budget tracking
      asrLatencyMs: 0, // would be measured in production
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/asr] error:", msg);
    // Per §6.4.2: graceful degradation — never hard-fail a voice session
    return NextResponse.json(
      {
        text: "",
        error: "ASR failed — please switch to text mode",
        degraded: true,
      },
      { status: 200 }
    );
  }
}
