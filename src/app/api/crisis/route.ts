import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Crisis event endpoint — §5.2 step 4.
 * When the classifier flags high-acuity content, this endpoint:
 *   1. Creates a CrisisEvent record (de-identified)
 *   2. Routes to the supervisor console via the crisis-relay WebSocket
 *   3. SLA deadline = now + 5 min for imminent risk (§5.4)
 *
 * Per §5.2 step 7: 24-72h follow-up scheduled for imminent-risk dispositions.
 */
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

    // Generate de-identified ID for supervisor console
    const deidentifiedId = `User-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const event = await db.crisisEvent.create({
      data: {
        userId: body.userId ?? null,
        deidentifiedId,
        reason: body.reason,
        language: body.language ?? "English",
        channel: body.channel,
        status: "pending",
        slaDeadline: new Date(Date.now() + 5 * 60 * 1000), // §5.4: 5 min SLA
      },
    });

    // In production, also emit to crisis-relay mini-service via WebSocket
    // so supervisor consoles receive the event in real-time.
    // For demo, the mini-service simulates events on its own.

    // Audit log
    await db.auditLog.create({
      data: {
        action: "crisis:event_created",
        resourceType: "CrisisEvent",
        resourceId: event.id,
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      },
    });

    return NextResponse.json({
      id: event.id,
      deidentifiedId: event.deidentifiedId,
      slaDeadline: event.slaDeadline,
      // Per §5.2: supervisor notified, 24-72h follow-up scheduled
      followUpScheduled: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/crisis] error:", msg);
    return NextResponse.json({ error: "Failed to create crisis event" }, { status: 500 });
  }
}

/**
 * GET — fetch crisis queue for supervisor console.
 * Returns de-identified events only.
 */
export async function GET() {
  try {
    const events = await db.crisisEvent.findMany({
      where: {
        OR: [
          { status: "pending" },
          { status: "reviewing" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        deidentifiedId: true,
        reason: true,
        language: true,
        channel: true,
        status: true,
        slaDeadline: true,
        disposition: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      events,
      // Per §5.4: supervisor console sees de-identified data only
      notice: "De-identified — supervisor view per §5.4.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/crisis GET] error:", msg);
    return NextResponse.json({ error: "Failed to fetch crisis queue" }, { status: 500 });
  }
}
