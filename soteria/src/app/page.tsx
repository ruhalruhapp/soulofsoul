"use client";

import { useAppStore } from "@/lib/store";
import { Nav } from "@/components/shell/Nav";
import { ArrivalSection } from "@/components/sections/ArrivalSection";
import { OpenWindowSection } from "@/components/sections/OpenWindowSection";
import { AffectLogicSection } from "@/components/sections/AffectLogicSection";
import { TrialogueSection } from "@/components/sections/TrialogueSection";
import { TriageSection } from "@/components/sections/TriageSection";
import { ContinuitySection } from "@/components/sections/ContinuitySection";
import { DirectiveSection } from "@/components/sections/DirectiveSection";
import { WorkbookSection } from "@/components/sections/WorkbookSection";

export default function Home() {
  const section = useAppStore((s) => s.section);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container max-w-3xl mx-auto p-6 sm:p-8 lg:p-12 soft-fade" key={section}>
        {section === "arrival" && <ArrivalSection />}
        {section === "window" && <OpenWindowSection />}
        {section === "affect" && <AffectLogicSection />}
        {section === "trialogue" && <TrialogueSection />}
        {section === "triage" && <TriageSection />}
        {section === "continuity" && <ContinuitySection />}
        {section === "directive" && <DirectiveSection />}
        {section === "workbook" && <WorkbookSection />}
      </main>
      <footer className="border-t border-border/20 py-3 px-4">
        <div className="container max-w-3xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/40">
          <span>Soteria Dialogue — Being With</span>
          <span>If you need 988, it&apos;s always one tap away. The platform cannot call for you unless you authorize it.</span>
        </div>
      </footer>
    </div>
  );
}
