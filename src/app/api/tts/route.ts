import { NextRequest, NextResponse } from "next/server";
import { getZAI } from "@/lib/zai";

export const runtime = "nodejs";
export const maxDuration = 30;

// Voice Agent Mode TTS endpoint — §6.4.
// Returns audio buffer for client-side playback.
// In production: streaming TTS would be used for sub-2s latency.
// Per §6.4.4: no voiceprints, no speaker identification, no production emotion inference.
interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TTSRequest;
    const text = (body.text ?? "").trim();

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    // Truncate to reasonable length for voice response
    const truncated = text.slice(0, 500);

    const zai = await getZAI();
    const response = await zai.audio.tts.create({
      input: truncated,
      voice: body.voice ?? "tongtong",
      speed: body.speed ?? 1.0,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "no-store", // voice output is per-session, never cached
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/tts] error:", msg);
    return NextResponse.json(
      { error: "TTS failed — voice mode degrades gracefully to text per §6.4.2" },
      { status: 200 }
    );
  }
}
