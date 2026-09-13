"use client";

import { useState } from "react";
import { useAppStore, type Section } from "@/lib/store";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import {
  Home,
  MessageCircle,
  Heart,
  Users,
  Video,
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Menu,
  Activity,
} from "lucide-react";

interface NavItem {
  id: Section;
  labelKey: Parameters<typeof tr>[0];
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV: NavItem[] = [
  { id: "home", labelKey: "navHome", icon: Home },
  { id: "companion", labelKey: "navCompanion", icon: MessageCircle },
  { id: "wellness", labelKey: "navWellness", icon: Heart },
  { id: "peer", labelKey: "navPeer", icon: Users },
  { id: "telehealth", labelKey: "navTelehealth", icon: Video },
  { id: "copilot", labelKey: "navCopilot", icon: Stethoscope },
  { id: "supervisor", labelKey: "navSupervisor", icon: ShieldAlert, badge: "1" },
  { id: "safety", labelKey: "navSafety", icon: ShieldCheck },
  { id: "admin", labelKey: "navAdmin", icon: Building2 },
  { id: "settings", labelKey: "navSettings", icon: SettingsIcon },
];

export function Sidebar() {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const lang = useAppStore((s) => s.lang);
  const tier = useAppStore((s) => s.tier);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground h-screen sticky top-0">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="font-semibold text-base leading-tight">
                {tr("appName", lang)}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {tr("tagline", lang)}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <Button
                key={item.id}
                variant={active ? "secondary" : "ghost"}
                onClick={() => setSection(item.id)}
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3 text-sm font-normal",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-start">
                  {tr(item.labelKey, lang)}
                </span>
                {item.badge && (
                  <span className="size-2 rounded-full bg-destructive" />
                )}
              </Button>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-2">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-muted-foreground">Tier</span>
            <span className="font-medium">Tier {tier}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            {theme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          <div className="text-[10px] text-muted-foreground px-2 pt-1 leading-relaxed">
            Not a substitute for emergency services. Always contact 911 / 988 in an emergency.
          </div>
        </div>
      </aside>

      {/* Mobile top bar with hamburger */}
      <MobileHeader />

      <SonnerToaster />
    </>
  );
}

function MobileHeader() {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [open, setOpen] = useState(false);

  const current = NAV.find((n) => n.id === section);

  return (
    <header className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="size-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
          <Activity className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">
            {tr("appName", lang)}
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            {current ? tr(current.labelKey, lang) : ""}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="size-8"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="end" className="w-72 p-0">
            <SheetHeader className="px-5 py-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                {tr("appName", lang)}
              </SheetTitle>
            </SheetHeader>
            <nav className="px-3 py-3 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={active ? "secondary" : "ghost"}
                    onClick={() => {
                      setSection(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start gap-3 h-10 px-3 text-sm font-normal",
                      active && "bg-sidebar-accent"
                    )}
                  >
                    <Icon className="size-4" />
                    {tr(item.labelKey, lang)}
                    {item.badge && (
                      <span className="size-2 rounded-full bg-destructive ml-auto" />
                    )}
                  </Button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
