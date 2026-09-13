"use client";

import { useAppStore } from "@/lib/store";
import { ThemeDirector } from "@/components/shell/ThemeDirector";
import { Sidebar } from "@/components/shell/Sidebar";
import { CrisisBar } from "@/components/shell/CrisisBar";
import { CrisisOverlay } from "@/components/shell/CrisisOverlay";
import { OnboardingGate } from "@/components/shell/OnboardingGate";
import { HomeSection } from "@/components/sections/HomeSection";
import { CompanionSection } from "@/components/sections/CompanionSection";
import { WellnessSection } from "@/components/sections/WellnessSection";
import { PeerSection } from "@/components/sections/PeerSection";
import { TelehealthSection } from "@/components/sections/TelehealthSection";
import { CopilotSection } from "@/components/sections/CopilotSection";
import { SupervisorSection } from "@/components/sections/SupervisorSection";
import { SettingsSection } from "@/components/sections/SettingsSection";

export default function Home() {
  const section = useAppStore((s) => s.section);

  return (
    <>
      <ThemeDirector />
      <OnboardingGate />
      <CrisisOverlay />

      <div className="min-h-screen flex flex-col">
        {/* Crisis bar always on top — §5.2 step 3 / NG6 */}
        <CrisisBar />

        <div className="flex flex-1 min-h-0">
          <Sidebar />

          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {section === "home" && <HomeSection />}
              {section === "companion" && <CompanionSection />}
              {section === "wellness" && <WellnessSection />}
              {section === "peer" && <PeerSection />}
              {section === "telehealth" && <TelehealthSection />}
              {section === "copilot" && <CopilotSection />}
              {section === "supervisor" && <SupervisorSection />}
              {section === "settings" && <SettingsSection />}
            </div>
          </main>
        </div>

        <footer className="border-t bg-muted/30 mt-auto">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-muted-foreground">
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
