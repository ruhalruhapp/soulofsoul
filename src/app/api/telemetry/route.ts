import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/lib/db";

export const runtime = "nodejs";

interface TelemetryBatch {
  events: Array<{
    type: "tap-latency" | "swipe-velocity" | "typing-rhythm" | "scroll-fluidity";
    value: number;
    unit: string;
    ts: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TelemetryBatch;

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json({ error: "Events array required" }, { status: 400 });
    }

    // Find the demo member for telemetry
    const demoUser = await convex.query(api.queries.getUserByEmail, {
      email: "member@soulofsoul.dev",
    });

    if (!demoUser) {
      return NextResponse.json(
        { error: "No consented user available for telemetry" },
        { status: 403 }
      );
    }

    const result = await convex.mutation(api.mutations.addTelemetryEvents, {
      userId: demoUser._id,
      events: body.events,
      consentVersion: "v1.3-2026-08-22",
    });

    return NextResponse.json({
      collected: result.collected,
      notice: "Research telemetry — aggregate, de-identified. No user-facing output, no clinical claims.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/telemetry] error:", msg);
    return NextResponse.json({ error: "Telemetry collection failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await convex.query(api.queries.getTelemetryAggregates, {});
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/telemetry GET] error:", msg);
    return NextResponse.json({ error: "Failed to fetch aggregate stats" }, { status: 500 });
  }
}
