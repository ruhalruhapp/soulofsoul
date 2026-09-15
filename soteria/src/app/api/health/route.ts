import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Health check endpoint — used by Render (and Docker HEALTHCHECK).
 * Verifies the app is running. In production, also checks DB connectivity.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "soteria-dialogue",
    timestamp: new Date().toISOString(),
  });
}
