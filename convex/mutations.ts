/**
 * Convex mutations for soulofsoul.
 * These replace the Prisma API routes — they run on Convex's servers.
 *
 * Note: Convex mutations can't use setTimeout (which bcryptjs.hash uses internally).
 * For password hashing, we use bcryptjs.hashSync instead, or pre-hash on the client.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// ─── Auth ───

export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(), // pre-hashed by the API route
    name: v.optional(v.string()),
    role: v.string(),
    ageVerified: v.boolean(),
    birthYear: v.number(),
    tier: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash: args.passwordHash,
      role: args.role as "MEMBER" | "CLINICIAN" | "SUPERVISOR" | "ADMIN" | "RESEARCHER",
      ageVerified: args.ageVerified,
      birthYear: args.birthYear,
      tier: args.tier,
    });

    await ctx.db.insert("members", {
      userId,
      language: "en",
      consentAiCompanion: false,
      consentTelehealthRecord: false,
      consentResearchTelemetry: false,
      consentVoiceAgent: false,
    });

    await ctx.db.insert("auditLogs", {
      action: "auth:register",
    });

    return { id: userId, email: args.email, role: args.role };
  },
});

export const createSession = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("authSessions", args);
  },
});

// ─── Crisis events (§5.2) ───

export const createCrisisEvent = mutation({
  args: {
    reason: v.string(),
    language: v.string(),
    channel: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deidentifiedId = `User-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const slaDeadline = Date.now() + 5 * 60 * 1000; // 5 min SLA per §5.4

    const eventId = await ctx.db.insert("crisisEvents", {
      userId: args.userId,
      deidentifiedId,
      reason: args.reason,
      language: args.language,
      channel: args.channel,
      status: "pending",
      slaDeadline,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      action: "crisis:event_created",
      resourceType: "CrisisEvent",
      resourceId: eventId,
    });

    return { id: eventId, deidentifiedId, slaDeadline, followUpScheduled: true };
  },
});

export const updateCrisisDisposition = mutation({
  args: {
    eventId: v.string(),
    status: v.string(),
    disposition: v.string(),
    reviewedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
      disposition: args.disposition,
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
    });

    await ctx.db.insert("auditLogs", {
      action: "crisis:disposition",
      resourceType: "CrisisEvent",
      resourceId: args.eventId,
    });

    return { success: true };
  },
});

// ─── Telemetry (§4) ───

export const addTelemetryEvents = mutation({
  args: {
    userId: v.string(),
    events: v.array(
      v.object({
        type: v.string(),
        value: v.number(),
        unit: v.string(),
      })
    ),
    consentVersion: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the user has consentResearchTelemetry=true
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!member || !member.consentResearchTelemetry) {
      throw new Error("User has not consented to research telemetry");
    }

    // Batch insert
    for (const event of args.events) {
      await ctx.db.insert("telemetryEvents", {
        userId: args.userId,
        type: event.type,
        value: event.value,
        unit: event.unit,
        consentVersion: args.consentVersion,
      });
    }

    return { collected: args.events.length };
  },
});

// ─── Peer posts (Tier 2) ───

export const createPeerPost = mutation({
  args: {
    authorId: v.string(),
    content: v.string(),
    tags: v.string(),
    aiFlag: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("peerPosts", {
      authorId: args.authorId,
      content: args.content,
      tags: args.tags,
      aiFlag: args.aiFlag,
      hearts: 0,
      replies: 0,
    });
  },
});

// ─── Chat messages (Tier 3) ───

export const addChatMessage = mutation({
  args: {
    userId: v.string(),
    role: v.string(),
    content: v.string(),
    flagged: v.boolean(),
    flagReason: v.optional(v.string()),
    viaVoice: v.boolean(),
    anchored: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});

// ─── Memory entries (§17.2) ───

export const addMemoryEntry = mutation({
  args: {
    userId: v.string(),
    text: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryEntries", {
      userId: args.userId,
      text: args.text,
      category: args.category,
      pendingDeletion: false,
    });
  },
});

export const deleteMemoryEntry = mutation({
  args: { entryId: v.string() },
  handler: async (ctx, args) => {
    // Tombstone per §17.2 — excluded from retrieval within 24h
    await ctx.db.patch(args.entryId, {
      pendingDeletion: true,
      deletedAt: Date.now(),
    });
    return { success: true };
  },
});

// ─── Consent (§8.3) ───

export const recordConsent = mutation({
  args: {
    userId: v.string(),
    stream: v.string(),
    granted: v.boolean(),
    consentVersion: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consentRecords", args);
  },
});

// ─── Enterprise contracts (§10.2) ───

export const createEnterpriseContract = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    members: v.number(),
    slaUptime: v.number(),
    crisisPipelineAvailability: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enterpriseContracts", args);
  },
});

// ─── Seed demo data ───

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Use sync hash — bcryptjs.hash uses setTimeout which isn't allowed in Convex mutations
    const passwordHash = bcrypt.hashSync("demo1234", 12);

    // Check if already seeded
    const existingMember = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "member@soulofsoul.dev"))
      .first();

    if (existingMember) {
      return { seeded: false, message: "Already seeded" };
    }

    // Member
    const memberId = await ctx.db.insert("users", {
      email: "member@soulofsoul.dev",
      name: "Demo Member",
      passwordHash,
      role: "MEMBER",
      ageVerified: true,
      birthYear: 1990,
      tier: 2,
    });
    await ctx.db.insert("members", {
      userId: memberId,
      language: "en",
      consentAiCompanion: true,
      consentTelehealthRecord: false,
      consentResearchTelemetry: true,
      consentVoiceAgent: false,
    });

    // Clinician
    const clinicianId = await ctx.db.insert("users", {
      email: "clinician@soulofsoul.dev",
      name: "Dr. Elena Rostova",
      passwordHash,
      role: "CLINICIAN",
      ageVerified: true,
      birthYear: 1978,
      tier: 4,
    });
    await ctx.db.insert("clinicians", {
      userId: clinicianId,
      name: "Dr. Elena Rostova",
      credentials: "PsyD, Licensed Clinical Psychologist",
      npi: "1538294716",
      specialties: JSON.stringify(["CBT", "Anxiety", "Trauma"]),
      modality: "video",
      licensureStates: JSON.stringify(["OR", "WA", "CA"]),
      rating: 4.9,
      sessionsCompleted: 842,
      inNetwork: true,
      nextAvailable: "Tue 2:00 PM",
    });

    // Supervisor
    await ctx.db.insert("users", {
      email: "supervisor@soulofsoul.dev",
      name: "Dev (On-call Supervisor)",
      passwordHash,
      role: "SUPERVISOR",
      ageVerified: true,
      birthYear: 1982,
      tier: 4,
    });

    // Admin
    await ctx.db.insert("users", {
      email: "admin@soulofsoul.dev",
      name: "Enterprise Admin",
      passwordHash,
      role: "ADMIN",
      ageVerified: true,
      birthYear: 1975,
      tier: 4,
    });

    // Sample crisis events
    await ctx.db.insert("crisisEvents", {
      deidentifiedId: "User-7F3A",
      reason: "Suicidal ideation — high confidence (0.97)",
      language: "English",
      channel: "text",
      status: "pending",
      slaDeadline: Date.now() + 5 * 60 * 1000,
    });
    await ctx.db.insert("crisisEvents", {
      deidentifiedId: "User-9B21",
      reason: "Self-harm language",
      language: "English",
      channel: "voice",
      status: "reviewing",
      slaDeadline: Date.now() + 2 * 60 * 1000,
      disposition: "Outreach in progress",
    });

    // Enterprise contract
    await ctx.db.insert("enterpriseContracts", {
      name: "Northwind Tech (12k employees)",
      type: "Employer",
      members: 12480,
      slaUptime: 99.94,
      crisisPipelineAvailability: 100,
      status: "active",
      renewalDate: new Date("2027-03-15").getTime(),
    });

    return { seeded: true, message: "Demo data seeded successfully" };
  },
});
