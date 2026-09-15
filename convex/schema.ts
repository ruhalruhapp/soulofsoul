/**
 * soulofsoul — Convex schema
 *
 * Replaces the Prisma/PostgreSQL schema with Convex's document-based model.
 * Convex provides real-time subscriptions natively — perfect for the
 * crisis queue, peer space, and supervisor console.
 *
 * Per §8.1: three separate data domains are modeled as separate tables
 * with distinct access patterns.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Authentication & Users ───

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    role: v.union(
      v.literal("MEMBER"),
      v.literal("CLINICIAN"),
      v.literal("SUPERVISOR"),
      v.literal("ADMIN"),
      v.literal("RESEARCHER")
    ),
    ageVerified: v.boolean(),
    birthYear: v.optional(v.number()),
    tier: v.number(),
    displayName: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // NextAuth.js session storage
  authSessions: defineTable({
    sessionToken: v.string(),
    userId: v.string(),
    expires: v.number(),
  }).index("by_sessionToken", ["sessionToken"]),

  // ─── Member profile ───

  members: defineTable({
    userId: v.string(),
    language: v.string(),
    networkContacts: v.optional(v.string()), // JSON
    facilitatorPairId: v.optional(v.string()),
    consentAiCompanion: v.boolean(),
    consentTelehealthRecord: v.boolean(),
    consentResearchTelemetry: v.boolean(),
    consentVoiceAgent: v.boolean(),
  }).index("by_userId", ["userId"]),

  // ─── Staff profiles ───

  peerCompanions: defineTable({
    userId: v.string(),
    name: v.string(),
    trainingCompleted: v.optional(v.string()), // JSON
    yearsExperience: v.optional(v.number()),
    availableForWindow: v.boolean(),
    availableForTrialogue: v.boolean(),
  }).index("by_userId", ["userId"]),

  clinicians: defineTable({
    userId: v.string(),
    name: v.string(),
    credentials: v.string(),
    npi: v.optional(v.string()),
    specialties: v.string(), // JSON
    modality: v.string(),
    licensureStates: v.optional(v.string()), // JSON
    rating: v.number(),
    sessionsCompleted: v.number(),
    inNetwork: v.boolean(),
    nextAvailable: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // ─── Domain A: Tier 3 chat store (§8.1) ───

  chatMessages: defineTable({
    userId: v.string(),
    role: v.string(),
    content: v.string(),
    flagged: v.boolean(),
    flagReason: v.optional(v.string()),
    viaVoice: v.boolean(),
    anchored: v.boolean(),
  }).index("by_userId_createdAt", ["userId", "_creationTime"]),

  memoryEntries: defineTable({
    userId: v.string(),
    text: v.string(),
    category: v.string(),
    pendingDeletion: v.boolean(),
    deletedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  moodEntries: defineTable({
    userId: v.string(),
    score: v.number(),
    note: v.optional(v.string()),
    tags: v.string(), // JSON
  }).index("by_userId_createdAt", ["userId", "_creationTime"]),

  assessmentResults: defineTable({
    userId: v.string(),
    type: v.string(),
    score: v.number(),
    severity: v.string(),
  }).index("by_userId_type", ["userId", "type"]),

  // ─── Tier 2: Peer space ───

  peerPosts: defineTable({
    authorId: v.string(),
    content: v.string(),
    tags: v.string(), // JSON
    aiFlag: v.string(),
    moderatorAction: v.optional(v.string()),
    hearts: v.number(),
    replies: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_createdAt", ["_creationTime"]).index("by_aiFlag", ["aiFlag"]),

  // ─── Domain B: Tier 4 clinical ───

  appointments: defineTable({
    memberId: v.string(),
    clinicianId: v.string(),
    scheduledAt: v.number(),
    durationMin: v.number(),
    status: v.string(),
    memberConsented: v.boolean(),
    clinicianConsented: v.boolean(),
    copayAmount: v.optional(v.number()),
    payerClaimId: v.optional(v.string()),
  }).index("by_clinicianId_scheduledAt", ["clinicianId", "scheduledAt"]),

  smartNotes: defineTable({
    appointmentId: v.string(),
    clinicianId: v.string(),
    subjective: v.string(),
    objective: v.string(),
    assessment: v.string(),
    plan: v.string(),
    transcriptAnchors: v.string(), // JSON
    unanchoredCount: v.number(),
    signed: v.boolean(),
    signedAt: v.optional(v.number()),
    fhirDocRefId: v.optional(v.string()),
  }).index("by_clinicianId", ["clinicianId"]),

  // ─── Crisis pipeline (§5) ───

  crisisEvents: defineTable({
    userId: v.optional(v.string()),
    deidentifiedId: v.string(),
    reason: v.string(),
    language: v.string(),
    channel: v.string(),
    status: v.string(),
    slaDeadline: v.number(),
    reviewedAt: v.optional(v.number()),
    disposition: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
  }).index("by_status_createdAt", ["status", "_creationTime"]),

  // ─── Consent records (§8.3) ───

  consentRecords: defineTable({
    userId: v.string(),
    stream: v.string(),
    granted: v.boolean(),
    consentVersion: v.string(),
    ipAddress: v.optional(v.string()),
  }).index("by_userId_stream", ["userId", "stream"]),

  // ─── Domain C: Pillar 2 research telemetry (§4) ───

  telemetryEvents: defineTable({
    userId: v.string(),
    type: v.string(),
    value: v.number(),
    unit: v.string(),
    consentVersion: v.string(),
  }).index("by_userId_type", ["userId", "type"]),

  // ─── Enterprise contracts (§10.2) ───

  enterpriseContracts: defineTable({
    name: v.string(),
    type: v.string(),
    members: v.number(),
    slaUptime: v.number(),
    crisisPipelineAvailability: v.number(),
    status: v.string(),
    renewalDate: v.optional(v.number()),
  }),

  // ─── Audit log (§8.1) ───

  auditLogs: defineTable({
    userId: v.optional(v.string()),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_action", ["action"]),
});
