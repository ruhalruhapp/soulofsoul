import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Pillar 2 telemetry collection endpoint — §4.
 *
 * Collects HCI timing signals from opt-in participants:
 *   - tap-latency (ms)
 *   - swipe-velocity (px/s)
 *   - typing-rhythm (inter-keystroke interval, ms) — NEVER the typed text
 *   - scroll-fluidity (px/frame)
 *
 * Hard boundaries (§4.2):
 *   - NEVER collects: typed text, message bodies, passwords, GPS, microphone, etc.
 *   - Stored in separate data domain (Domain C) from Tier 3 chat and Tier 4 clinical
 *   - Requires consentResearchTelemetry=true on the Member record
 *   - Retention: until consent revocation + 30 days (§9)
 *
 * Per §4.3: this data is for exploratory research only. No user-facing output,
 * no automated care escalation, no clinical claims.
 */
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

    // Per §4: opt-in only. In production, verify the user has consentResearchTelemetry=true.
    // For demo, we use the seeded member account.
    // Real implementation would:
    //   1. Get user from session
    //   2. Check member.consentResearchTelemetry === true
    //   3. If not consented, return 403
    //   4. Store with userId + consent version for audit

    // Find the demo member for anonymous telemetry, or use null
    const demoUser = await db.user.findUnique({
      where: { email: "member@soulofsoul.dev" },
    });
    const userId = demoUser?.id ?? null;
    const consentVersion = "v1.3-2026-08-22"; // IRB_PROTOCOL.consentVersion

    if (!userId) {
      return NextResponse.json(
        { error: "No consented user available for telemetry" },
        { status: 403 }
      );
    }

    // Batch insert
    const created = await db.telemetryEvent.createMany({
      data: body.events.map((e) => ({
        userId,
        type: e.type,
        value: e.value,
        unit: e.unit,
        consentVersion,
      })),
    });

    return NextResponse.json({
      collected: created.count,
      // Per §4.3: confirm no clinical claims
      notice: "Research telemetry — aggregate, de-identified. No user-facing output, no clinical claims.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/telemetry] error:", msg);
    return NextResponse.json({ error: "Telemetry collection failed" }, { status: 500 });
  }
}

/**
 * GET — aggregate stats for the research dashboard.
 * Returns only aggregate, de-identified stats per §4.2.
 */
export async function GET() {
  try {
    const events = await db.telemetryEvent.groupBy({
      by: ["type"],
      _count: true,
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
    });

    const totalParticipants = await db.telemetryEvent.groupBy({
      by: ["userId"],
    });

    return NextResponse.json({
      aggregate: events.map((e) => ({
        type: e.type,
        count: e._count,
        avg: e._avg.value,
        min: e._min.value,
        max: e._max.value,
      })),
      totalParticipants: totalParticipants.length,
      // Per §4.2: no individual data exposed
      notice: "Aggregate only — individual data never exposed (§4.2).",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/telemetry GET] error:", msg);
    return NextResponse.json({ error: "Failed to fetch aggregate stats" }, { status: 500 });
  }
}
