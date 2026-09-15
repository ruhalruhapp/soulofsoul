/**
 * Convex queries for soulofsoul.
 * These provide real-time data via subscriptions.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── Crisis queue (real-time for supervisor console) ───

export const getCrisisQueue = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("crisisEvents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(20);

    const reviewing = await ctx.db
      .query("crisisEvents")
      .withIndex("by_status", (q) => q.eq("status", "reviewing"))
      .order("desc")
      .take(20);

    return [...pending, ...reviewing];
  },
});

// ─── Telemetry aggregates (research dashboard) ───

export const getTelemetryAggregates = query({
  args: {},
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("telemetryEvents").collect();

    // Group by type
    const byType: Record<string, number[]> = {};
    for (const event of allEvents) {
      if (!byType[event.type]) byType[event.type] = [];
      byType[event.type].push(event.value);
    }

    const aggregates = Object.entries(byType).map(([type, values]) => ({
      type,
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }));

    const uniqueUsers = new Set(allEvents.map((e) => e.userId));

    return {
      aggregate: aggregates,
      totalParticipants: uniqueUsers.size,
      notice: "Aggregate only — individual data never exposed (§4.2).",
    };
  },
});

// ─── Chat messages (for a user) ───

export const getChatMessages = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(100);
  },
});

// ─── Memory entries (for a user) ───

export const getMemoryEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    // Filter out pending-deletion entries
    return all.filter((e) => !e.pendingDeletion);
  },
});

// ─── Peer posts ───

export const getPeerPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("peerPosts")
      .withIndex("by_createdAt")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(50);
  },
});

// ─── User by email (for auth) ───

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

// ─── Enterprise contracts ───

export const getEnterpriseContracts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("enterpriseContracts").collect();
  },
});

// ─── Health check ───

export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    // Test DB connectivity by counting users
    const userCount = await ctx.db.query("users").count();
    return {
      status: "ok",
      service: "soulofsoul",
      database: "connected",
      userCount,
    };
  },
});
