"use client";

import { Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { ThemeDirector } from "@/components/shell/ThemeDirector";
import { Sidebar } from "@/components/shell/Sidebar";
import { CrisisBar } from "@/components/shell/CrisisBar";
import { CrisisOverlay } from "@/components/shell/CrisisOverlay";
import { MinorsOffboardOverlay } from "@/components/shell/MinorsOffboardOverlay";
import { OnboardingGate } from "@/components/shell/OnboardingGate";
import { SectionErrorBoundary } from "@/components/shell/SectionErrorBoundary";
import { HomeSection } from "@/components/sections/HomeSection";
import { CompanionSection } from "@/components/sections/CompanionSection";
import { WellnessSection } from "@/components/sections/WellnessSection";
import { SettingsSection } from "@/components/sections/SettingsSection";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load heavier sections to reduce initial bundle.
// Home, Companion, Wellness, Settings are eagerly loaded (most-visited / smallest).
// Peer, Telehealth, Copilot, Supervisor, Safety, Admin, FHIR, Research, TDD are lazy.
const PeerSection = lazy(() => import("@/components/sections/PeerSection").then((m) => ({ default: m.PeerSection })));
const TelehealthSection = lazy(() => import("@/components/sections/TelehealthSection").then((m) => ({ default: m.TelehealthSection })));
const CopilotSection = lazy(() => import("@/components/sections/CopilotSection").then((m) => ({ default: m.CopilotSection })));
const SupervisorSection = lazy(() => import("@/components/sections/SupervisorSection").then((m) => ({ default: m.SupervisorSection })));
const SafetySection = lazy(() => import("@/components/sections/SafetySection").then((m) => ({ default: m.SafetySection })));
const AdminSection = lazy(() => import("@/components/sections/AdminSection").then((m) => ({ default: m.AdminSection })));
const FhirSection = lazy(() => import("@/components/sections/FhirSection").then((m) => ({ default: m.FhirSection })));
const ResearchSection = lazy(() => import("@/components/sections/ResearchSection").then((m) => ({ default: m.ResearchSection })));
const TddSection = lazy(() => import("@/components/sections/TddSection").then((m) => ({ default: m.TddSection })));

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full mt-4" />
    </div>
  );
}

export default function Home() {
  const section = useAppStore((s) => s.section);

  return (
    <>
      <ThemeDirector />
      <OnboardingGate />
      <CrisisOverlay />
      <MinorsOffboardOverlay />

      <div className="min-h-screen flex flex-col">
        {/* Crisis bar always on top — §5.2 step 3 / NG6.
            Lives OUTSIDE the error boundary so it never disappears. */}
        <CrisisBar />

        <div className="flex flex-1 min-h-0">
          <Sidebar />

          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* Each section wrapped in its own error boundary — one section
                  crashing never hides the crisis bar or kills the app. */}
              <SectionErrorBoundary sectionName={sectionName(section)}>
                <Suspense fallback={<SectionSkeleton />}>
                  {section === "home" && <HomeSection />}
                  {section === "companion" && <CompanionSection />}
                  {section === "wellness" && <WellnessSection />}
                  {section === "peer" && <PeerSection />}
                  {section === "telehealth" && <TelehealthSection />}
                  {section === "copilot" && <CopilotSection />}
                  {section === "supervisor" && <SupervisorSection />}
                  {section === "safety" && <SafetySection />}
                  {section === "admin" && <AdminSection />}
                  {section === "fhir" && <FhirSection />}
                  {section === "research" && <ResearchSection />}
                  {section === "tdd" && <TddSection />}
                  {section === "settings" && <SettingsSection />}
                </Suspense>
              </SectionErrorBoundary>
            </div>
          </main>
        </div>

        <footer className="border-t bg-muted/30 mt-auto">
          <div className="container max-w-7xl mx-auto px-4 sm:p-6 lg:px-8 py-3 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                Serenity — v1.4 reference implementation. Stepped-care mental health platform.
                Not a substitute for emergency services.
              </div>
              <div className="flex items-center gap-2">
                <span>§5.5 boundary: AI is supportive — never autonomous.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function sectionName(section: string): string {
  const names: Record<string, string> = {
    home: "Home",
    companion: "AI Companion",
    wellness: "Wellness",
    peer: "Peer Space",
    telehealth: "Telehealth",
    copilot: "Clinician Co-Pilot",
    supervisor: "Supervisor Console",
    safety: "Safety Engineering",
    admin: "Enterprise Admin",
    fhir: "FHIR / EHR",
    research: "Research Pilot",
    tdd: "Technical Design",
    settings: "Settings",
  };
  return names[section] ?? "This section";
}
