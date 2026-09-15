import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/lib/db";

export const runtime = "nodejs";

interface CrisisCreate {
  reason: string;
  language: string;
  channel: "text" | "voice";
  confidence?: number;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CrisisCreate;

    if (!body.reason) {
      return NextResponse.json({ error: "Reason required" }, { status: 400 });
    }

    const result = await convex.mutation(api.mutations.createCrisisEvent, {
      reason: body.reason,
      language: body.language ?? "English",
      channel: body.channel,
      userId: body.userId,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/crisis] error:", msg);
    return NextResponse.json({ error: "Failed to create crisis event" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await convex.query(api.queries.getCrisisQueue, {});
    return NextResponse.json({
      events,
      notice: "De-identified — supervisor view per §5.4.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/crisis GET] error:", msg);
    return NextResponse.json({ error: "Failed to fetch crisis queue" }, { status: 500 });
  }
}
