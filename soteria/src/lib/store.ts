import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Section =
  | "arrival"
  | "window"
  | "affect"
  | "trialogue"
  | "triage"
  | "workbook"
  | "directive"
  | "continuity";

export interface AppState {
  section: Section;
  setSection: (s: Section) => void;

  // Onboarding state
  onboarded: boolean;
  ageVerified: boolean;
  setAgeVerified: (v: boolean) => void;
  completeOnboarding: () => void;

  // Current affective tension (1-10, self-reported)
  currentTension: number;
  setCurrentTension: (t: number) => void;

  // Open Window state
  windowOpen: boolean;
  companionPresent: boolean;
  setWindowOpen: (v: boolean) => void;
  setCompanionPresent: (v: boolean) => void;

  // Advance directive (cached locally for UX; persisted in DB)
  directiveCompleted: boolean;
  setDirectiveCompleted: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      section: "arrival",
      setSection: (section) => set({ section }),

      onboarded: false,
      ageVerified: false,
      setAgeVerified: (ageVerified) => set({ ageVerified }),
      completeOnboarding: () => set({ onboarded: true }),

      currentTension: 5, // neutral start
      setCurrentTension: (currentTension) => set({ currentTension }),

      windowOpen: false,
      companionPresent: false,
      setWindowOpen: (windowOpen) => set({ windowOpen }),
      setCompanionPresent: (companionPresent) => set({ companionPresent }),

      directiveCompleted: false,
      setDirectiveCompleted: (directiveCompleted) => set({ directiveCompleted }),
    }),
    {
      name: "soteria-app-state",
    }
  )
);
