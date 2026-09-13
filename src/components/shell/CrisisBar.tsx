"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CRISIS_RESOURCES } from "@/lib/crisis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phone, MessageSquare, AlertCircle, ChevronDown, MapPin } from "lucide-react";

/**
 * Always-visible crisis resources bar — §5.2 step 3, NG6.
 * Reachable without an account, from every screen.
 * Geo-keyed (§13 v1.4 rule: location-based, not language-based).
 */
export function CrisisBar() {
  const triggerCrisis = useAppStore((s) => s.triggerCrisis);
  const lang = useAppStore((s) => s.lang);
  const [geo, setGeo] = useState(CRISIS_RESOURCES[0]);

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <AlertCircle className="size-4 text-destructive shrink-0" />
        <span className="text-destructive font-medium hidden sm:inline">
          {lang === "ar"
            ? "إذا كنت في أزمة، المساعدة على بُعد نقرة واحدة. متاحة دون حساب."
            : "If you're in crisis, help is one tap away. Reachable without an account."}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Geo selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                aria-label="Select your location for crisis resources"
              >
                <MapPin className="size-3" />
                <span>{geo.flag}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs">
                Crisis resources by jurisdiction
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CRISIS_RESOURCES.map((r) => (
                <DropdownMenuItem
                  key={r.country}
                  onClick={() => setGeo(r)}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-base">{r.flag}</span>
                  <span className="flex-1">{r.country}</span>
                  <span className="text-muted-foreground">{r.general}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5 crisis-pulse"
            onClick={() => triggerCrisis(`Showing resources for ${geo.country}`)}
          >
            <Phone className="size-3" />
            <span className="hidden sm:inline">{geo.general}</span>
            <span className="sm:hidden">Call</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5 border-destructive/40"
            asChild
          >
            <a
              href={
                geo.textLine
                  ? `sms:${geo.textLine.split(" to ")[1] ?? "741741"}`
                  : `sms:741741`
              }
            >
              <MessageSquare className="size-3" />
              <span className="hidden md:inline">Text Line</span>
            </a>
          </Button>

          <Badge
            variant="outline"
            className="text-[10px] hidden lg:inline-flex border-destructive/30 text-destructive"
          >
            {geo.country}
          </Badge>
        </div>
      </div>
    </div>
  );
}
