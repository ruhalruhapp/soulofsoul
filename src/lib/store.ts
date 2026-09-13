import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "ar";
export type Theme = "light" | "dark";
export type Section =
  | "home"
  | "companion"
  | "wellness"
  | "peer"
  | "telehealth"
  | "copilot"
  | "supervisor"
  | "safety"
  | "settings";

export interface MoodEntry {
  id: string;
  ts: number;
  score: number; // 1-5
  note?: string;
  tags: string[];
}

export interface MemoryEntry {
  id: string;
  ts: number;
  text: string;
  category: "pattern" | "goal" | "fact" | "preference";
  // Per §6/§17.2: user can edit/delete, effect ≤ 24h
  pendingDeletion?: boolean;
  deletedAt?: number;
}

export interface ConsentState {
  // 4 separate consent streams per §8.3
  aiCompanion: boolean;
  telehealthRecording: boolean;
  researchTelemetry: boolean;
  voiceAgent: boolean;
}

export interface AssessmentResult {
  id: string;
  ts: number;
  type: "PHQ-9" | "GAD-7" | "PSS";
  score: number;
  severity: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
  // Safety classifier info
  flagged?: boolean;
  flagReason?: string;
  // Voice mode
  viaVoice?: boolean;
  // Anchor for grounded responses
  anchored?: boolean;
  anchorRef?: string;
}

export interface AppState {
  // Navigation
  section: Section;
  setSection: (s: Section) => void;

  // Theme + lang
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;

  // Auth (mock)
  onboarded: boolean;
  ageVerified: boolean;
  setAgeVerified: (v: boolean) => void;
  completeOnboarding: () => void;

  // Subscription tier
  tier: 1 | 2 | 3 | 4;
  setTier: (t: 1 | 2 | 3 | 4) => void;

  // Crisis state (transient — not persisted for safety reasons)
  crisisActive: boolean;
  crisisReason: string | null;
  triggerCrisis: (reason: string) => void;
  dismissCrisis: () => void;

  // Minors off-boarding (§5.6) — transient
  minorsOffboardActive: boolean;
  triggerMinorsOffboard: (evidence: string) => void;
  dismissMinorsOffboard: () => void;

  // Private journal (§8.1) — client-side encrypted, NOT in this store's persistence
  // (held in component state only — simulated as device-held)

  // Mood log (Tier 1)
  moods: MoodEntry[];
  addMood: (m: Omit<MoodEntry, "id" | "ts">) => void;

  // Memory (Tier 3) — §17.2
  memories: MemoryEntry[];
  addMemory: (text: string, category: MemoryEntry["category"]) => void;
  deleteMemory: (id: string) => void;
  editMemory: (id: string, text: string) => void;

  // Consent — §8.3
  consent: ConsentState;
  setConsent: (k: keyof ConsentState, v: boolean) => void;

  // Assessments
  assessments: AssessmentResult[];
  addAssessment: (a: Omit<AssessmentResult, "id" | "ts">) => void;

  // Chat (current session, transient)
  chat: ChatMessage[];
  appendChat: (m: ChatMessage) => void;
  resetChat: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      section: "home",
      setSection: (section) => set({ section }),

      theme: "light",
      toggleTheme: () =>
        set({ theme: get().theme === "light" ? "dark" : "light" }),
      lang: "en",
      setLang: (lang) => set({ lang }),

      onboarded: false,
      ageVerified: false,
      setAgeVerified: (ageVerified) => set({ ageVerified }),
      completeOnboarding: () => set({ onboarded: true }),

      tier: 2,
      setTier: (tier) => set({ tier }),

      crisisActive: false,
      crisisReason: null,
      triggerCrisis: (reason) => set({ crisisActive: true, crisisReason: reason }),
      dismissCrisis: () => set({ crisisActive: false, crisisReason: null }),

      minorsOffboardActive: false,
      triggerMinorsOffboard: () => set({ minorsOffboardActive: true }),
      dismissMinorsOffboard: () => set({ minorsOffboardActive: false }),

      moods: [],
      addMood: (m) =>
        set({
          moods: [
            ...get().moods,
            { ...m, id: crypto.randomUUID(), ts: Date.now() },
          ].slice(-30), // keep last 30
        }),

      memories: [
        {
          id: "seed-1",
          ts: Date.now() - 86400000 * 3,
          text: "Prefers CBT-style structured exercises over open-ended reflection",
          category: "preference",
        },
        {
          id: "seed-2",
          ts: Date.now() - 86400000 * 7,
          text: "Goal: reduce work-related anxiety before quarterly reviews",
          category: "goal",
        },
        {
          id: "seed-3",
          ts: Date.now() - 86400000 * 14,
          text: "Pattern: sleep worsens Sunday nights before Monday meetings",
          category: "pattern",
        },
      ],
      addMemory: (text, category) =>
        set({
          memories: [
            ...get().memories,
            { id: crypto.randomUUID(), ts: Date.now(), text, category },
          ],
        }),
      deleteMemory: (id) =>
        set({
          // Per §17.2: tombstoned, excluded from retrieval; effect ≤ 24h
          memories: get().memories.map((m) =>
            m.id === id
              ? { ...m, pendingDeletion: true, deletedAt: Date.now() }
              : m
          ),
        }),
      editMemory: (id, text) =>
        set({
          memories: get().memories.map((m) =>
            m.id === id ? { ...m, text } : m
          ),
        }),

      consent: {
        aiCompanion: true,
        telehealthRecording: false,
        researchTelemetry: false,
        voiceAgent: false,
      },
      setConsent: (k, v) =>
        set({ consent: { ...get().consent, [k]: v } }),

      assessments: [
        {
          id: "seed-a1",
          ts: Date.now() - 86400000 * 30,
          type: "PHQ-9",
          score: 14,
          severity: "Moderate",
        },
        {
          id: "seed-a2",
          ts: Date.now() - 86400000 * 14,
          type: "PHQ-9",
          score: 11,
          severity: "Moderate",
        },
        {
          id: "seed-a3",
          ts: Date.now() - 86400000 * 7,
          type: "GAD-7",
          score: 9,
          severity: "Mild",
        },
      ],
      addAssessment: (a) =>
        set({
          assessments: [
            ...get().assessments,
            { ...a, id: crypto.randomUUID(), ts: Date.now() },
          ],
        }),

      chat: [],
      appendChat: (m) => set({ chat: [...get().chat, m] }),
      resetChat: () => set({ chat: [] }),
    }),
    {
      name: "serenity-app-state",
      // Don't persist crisis state — it's transient safety data
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
        onboarded: state.onboarded,
        ageVerified: state.ageVerified,
        tier: state.tier,
        moods: state.moods,
        memories: state.memories,
        consent: state.consent,
        assessments: state.assessments,
      }),
    }
  )
);
