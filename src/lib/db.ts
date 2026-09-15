/**
 * Convex client provider for soulofsoul.
 * Replaces the Prisma client — provides real-time data subscriptions.
 *
 * Set CONVEX_URL in your environment to your Convex deployment URL.
 */

import { ConvexHttpClient } from "convex/browser";

// Server-side Convex client (for API routes)
// Uses the CONVEX_URL environment variable
const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";

if (!convexUrl && process.env.NODE_ENV === "production") {
  console.warn("[convex] No CONVEX_URL set — database operations will fail");
}

export const convex = new ConvexHttpClient(convexUrl || "https://placeholder.convex.cloud");

// Convex function references for type-safe calls
export const api = {
  mutations: {
    createUser: "mutations:createUser",
    createSession: "mutations:createSession",
    createCrisisEvent: "mutations:createCrisisEvent",
    updateCrisisDisposition: "mutations:updateCrisisDisposition",
    addTelemetryEvents: "mutations:addTelemetryEvents",
    createPeerPost: "mutations:createPeerPost",
    addChatMessage: "mutations:addChatMessage",
    addMemoryEntry: "mutations:addMemoryEntry",
    deleteMemoryEntry: "mutations:deleteMemoryEntry",
    recordConsent: "mutations:recordConsent",
    createEnterpriseContract: "mutations:createEnterpriseContract",
    seedDemoData: "mutations:seedDemoData",
  },
  queries: {
    getCrisisQueue: "queries:getCrisisQueue",
    getTelemetryAggregates: "queries:getTelemetryAggregates",
    getChatMessages: "queries:getChatMessages",
    getMemoryEntries: "queries:getMemoryEntries",
    getPeerPosts: "queries:getPeerPosts",
    getUserByEmail: "queries:getUserByEmail",
    getEnterpriseContracts: "queries:getEnterpriseContracts",
    healthCheck: "queries:healthCheck",
  },
} as const;
