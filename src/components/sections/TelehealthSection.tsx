"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CLINICIANS, SMART_INSIGHTS, type Clinician } from "@/lib/data";
import {
  Video,
  Stethoscope,
  Calendar,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  TrendingDown,
  AlertCircle,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TelehealthSection() {
  const [selected, setSelected] = useState<Clinician | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Telehealth & Care Navigation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tier 4 — licensed telehealth and telepsychiatry. Target time-to-first-appointment ≤
          7 days (therapy) / ≤ 14 days (psychiatry). Smart Insights prepared before each visit.
        </p>
      </div>

      {/* Care status card */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatusItem label="Your tier" value="Tier 4" sub="Active" />
            <StatusItem label="Next session" value="Tue, 2:00 PM" sub="with Dr. Rostova" />
            <StatusItem label="Time to first appt" value="3 days" sub="≤ 7d target met" />
            <StatusItem label="Last PHQ-9" value="11" sub="↓ 3 from 14 days ago" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Clinician list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">In-network clinicians</h2>
            <Badge variant="outline" className="gap-1">
              <MapPin className="size-3" />
              PSYPACT coverage
            </Badge>
          </div>

          {CLINICIANS.map((c) => (
            <Card
              key={c.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/40",
                selected?.id === c.id && "border-primary ring-1 ring-primary/30"
              )}
              onClick={() => setSelected(c)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary/15 text-primary font-medium">
                      {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1.5">
                          {c.name}
                          {c.inNetwork && (
                            <Badge variant="secondary" className="text-[9px] gap-0.5 py-0 h-3.5">
                              <CheckCircle2 className="size-2.5" />
                              In-network
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.credentials}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{c.rating}</span>
                        <span className="text-muted-foreground">· {c.sessionsCompleted}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {c.modality === "video+psychiatry" ? (
                          <>
                            <Stethoscope className="size-3.5 text-primary" />
                            Psychiatry · medication
                          </>
                        ) : (
                          <>
                            <Video className="size-3.5 text-primary" />
                            Therapy
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {c.nextAvailable}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertCircle className="size-4 text-amber-600" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">Waitlist protocol</div>
                <p className="text-xs text-muted-foreground">
                  If no clinician is available within target time-to-appointment, you receive
                  an estimated wait, an interim care plan (Tier 2/3 intensification, structured
                  workbook), and automated weekly check-ins until matched.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Insights preview */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="size-4" />
                Smart Insights
              </CardTitle>
              <CardDescription className="text-xs">
                Prepared for Dr. Rostova before Tuesday's session. Every claim is anchored to
                source data (§7.2).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SMART_INSIGHTS.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {s.kind === "theme" && <Target className="size-3.5 text-primary" />}
                    {s.kind === "score-trend" && <TrendingDown className="size-3.5 text-emerald-600" />}
                    {s.kind === "goal" && <Target className="size-3.5 text-amber-600" />}
                    {s.kind === "risk" && <AlertCircle className="size-3.5 text-muted-foreground" />}
                    <Badge variant="outline" className="text-[10px] py-0 capitalize">
                      {s.kind.replace("-", " ")}
                    </Badge>
                    {s.editable && (
                      <Badge variant="secondary" className="text-[10px] py-0 ml-auto">
                        Clinician-editable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed pl-5">{s.text}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-5">
                    <ChevronRight className="size-2.5" />
                    Source: {s.source}
                  </div>
                  <Separator className="last:hidden" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Book this session
              </div>
              {selected ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    With <span className="font-medium text-foreground">{selected.name}</span> on{" "}
                    <span className="font-medium text-foreground">{selected.nextAvailable}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast.success(`Session booked with ${selected.name}. Pre-session consent required at start.`);
                    }}
                  >
                    Confirm booking
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a clinician to book.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-start gap-2 text-[11px] text-muted-foreground">
              <Clock className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Per §8.3: clinician + member dual consent is captured per session, revocable.
                Recording powers Smart Notes only; transcript is stored under HIPAA.
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-base sm:text-lg font-semibold leading-tight mt-0.5">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
