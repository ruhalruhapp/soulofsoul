/**
 * Client-side API helpers for Convex.
 * These wrap the Convex HTTP API so components can fetch data without
 * requiring the generated type files (which need `npx convex dev` auth).
 *
 * All functions call the Convex HTTP API directly.
 */

const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  "https://cautious-ostrich-558.eu-west-1.convex.cloud";

async function convexQuery(path: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage);
  return data.value;
}

async function convexMutation(path: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage);
  return data.value;
}

// Crisis queue (for supervisor console)
export async function fetchCrisisQueue() {
  return convexQuery("queries:getCrisisQueue", {});
}

export async function createCrisisEvent(params: {
  reason: string;
  language: string;
  channel: string;
  userId?: string;
}) {
  return convexMutation("mutations:createCrisisEvent", params);
}

export async function updateCrisisDisposition(params: {
  eventId: string;
  status: string;
  disposition: string;
  reviewedBy?: string;
}) {
  return convexMutation("mutations:updateCrisisDisposition", params);
}

// Telemetry
export async function fetchTelemetryAggregates() {
  return convexQuery("queries:getTelemetryAggregates", {});
}

export async function addTelemetryEvents(params: {
  userId: string;
  events: Array<{ type: string; value: number; unit: string }>;
  consentVersion: string;
}) {
  return convexMutation("mutations:addTelemetryEvents", params);
}

// Peer posts
export async function fetchPeerPosts() {
  return convexQuery("queries:getPeerPosts", {});
}

export async function createPeerPost(params: {
  authorId: string;
  content: string;
  tags: string;
  aiFlag: string;
}) {
  return convexMutation("mutations:createPeerPost", params);
}

// Enterprise contracts
export async function fetchEnterpriseContracts() {
  return convexQuery("queries:getEnterpriseContracts", {});
}

// User
export async function fetchUserByEmail(email: string) {
  return convexQuery("queries:getUserByEmail", { email });
}

// Seed
export async function seedDemoData() {
  return convexMutation("mutations:seedDemoData", {});
}

// Health
export async function healthCheck() {
  return convexQuery("queries:healthCheck", {});
}
