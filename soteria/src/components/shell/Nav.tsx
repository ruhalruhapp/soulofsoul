"use client";

import { useAppStore, type Section } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV: Array<{ id: Section; label: string; icon: string }> = [
  { id: "arrival", label: "Arrival", icon: "○" },
  { id: "window", label: "Open Window", icon: "◡" },
  { id: "affect", label: "Affect-Logic", icon: "≈" },
  { id: "trialogue", label: "Trialogue", icon: "△" },
  { id: "triage", label: "Triage", icon: "◈" },
  { id: "workbook", label: "Workbook", icon: "▣" },
  { id: "continuity", label: "Continuity", icon: "→" },
  { id: "directive", label: "Directive", icon: "◆" },
];

export function Nav() {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);

  return (
    <nav className="flex items-center gap-1 px-4 py-3 border-b border-border/30">
      <div className="flex items-center gap-2 mr-4">
        <span className="text-sm font-light text-foreground/90">Soteria</span>
        <span className="text-[10px] text-muted-foreground/50">Dialogue</span>
      </div>
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap flex items-center gap-1.5",
              section === item.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <span className="text-[10px] opacity-60">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
