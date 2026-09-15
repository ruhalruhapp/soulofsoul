import { NextResponse } from "next/server";
import { convex, api } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await convex.query(api.queries.healthCheck, {});
    return NextResponse.json({
      status: "ok",
      service: "soulofsoul",
      timestamp: new Date().toISOString(),
      database: "connected",
      databaseProvider: "convex",
      ...result,
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
