/**
 * Minimal Convex API reference — allows useQuery/useMutation without generated types.
 * In production with `npx convex dev` authenticated, this file is auto-generated.
 * Here we provide a manual version that works with the deployed functions.
 */

export const api = {
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
} as const;
