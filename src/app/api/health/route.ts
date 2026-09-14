import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Health check endpoint — used by Docker HEALTHCHECK and load balancers.
 * Verifies the app is running and the database is reachable.
 */
export async function GET() {
  try {
    // Test database connectivity
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "soulofsoul",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err) {
    console.error("[/api/health] check failed:", err);
    return NextResponse.json(
      {
        status: "degraded",
        service: "soulofsoul",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
