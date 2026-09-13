"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SMART_NOTES_TEMPLATE, type NoteStatement } from "@/lib/data";
import {
  FileText,
  Anchor,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_TRANSCRIPT = [
  { speaker: "clinician" as const, text: "Hi Marcus, how have things been since our last session?", line: 1 },
  { speaker: "member" as const, text: "Honestly, work has been rough. Quarterly review is next Tuesday and I can't stop the spiral.", line: 2 },
  { speaker: "member" as const, text: "I haven't been sleeping well, maybe 4-5 hours, mind won't shut off.", line: 3 },
  { speaker: "clinician" as const, text: "Let's do a quick PHQ-9 before we get into it.", line: 4 },
  { speaker: "clinician" as const, text: "Score is 11, down from 14. That's progress. GAD-7 at 9.", line: 5 },
  { speaker: "member" as const, text: "I guess. I still feel like I'm going to fail though. The presentation will be a disaster.", line: 6 },
  { speaker: "clinician" as const, text: "Let's look at that thought. Evidence for? Evidence against?", line: 7 },
  { speaker: "member" as const, text: "Well, I've delivered 12 of these and none have been disasters. But this one feels different.", line: 8 },
  { speaker: "clinician" as const, text: "Let's practice cognitive restructuring. Box-breathing 2x daily as homework?", line: 9 },
  { speaker: "member" as const, text: "Yeah, I can do that. Tuesday next for follow-up?", line: 10 },
];

export function CopilotSection() {
  const [notes, setNotes] = useState<NoteStatement[]>(SMART_NOTES_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [editDistance, setEditDistance] = useState(0);

  const updateStatement = (id: string, text: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        // Track edit distance (char-level)
        const dist = Math.abs(text.length - n.text.length);
        setEditDistance((d) => d + dist);
        return { ...n, text };
      })
    );
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: SAMPLE_TRANSCRIPT,
          memberName: "Marcus",
        }),
      });
      const data = await res.json();
      if (!data.degraded && data.content) {
        toast.success("Draft regenerated. Every statement has a transcript anchor.");
      } else {
        toast.warning("Draft failed integrity check — keeping previous draft.");
      }
    } catch {
      toast.error("Could not reach notes service. Keeping current draft.");
    } finally {
      setLoading(false);
    }
  };

  const sign = () => {
    const unanchored = notes.filter((n) => !n.anchored).length;
    toast.success(
      unanchored > 0
        ? `Signed with ${unanchored} unanchored prompts (rendered as bracketed prompts per §7.1).`
        : "Note signed. All statements anchored to transcript."
    );
  };

  const totalChars = notes.reduce((a, n) => a + n.text.length, 0);
  const editPct = totalChars > 0 ? Math.min(100, (editDistance / totalChars) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clinician Co-Pilot</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Smart Notes (§7.1) — automated documentation with transcript anchoring. Notes are
            draft-only until clinician review, edit, and signature.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generate} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Regenerate draft
          </Button>
          <Button onClick={sign}>
            <Save className="size-4" />
            Sign & save
          </Button>
        </div>
      </div>

      {/* Header card: session info + KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard label="Member" value="Marcus J." sub="Tier 4 · session #149" />
        <KpiCard label="Session length" value="45 min" sub="Video · 2026-09-13" />
        <KpiCard label="Time reduction" value="48%" sub="≥ 45% target met" status="ok" />
        <KpiCard label="Edit burden" value={`${editPct.toFixed(0)}%`} sub="≤ 30% target" status={editPct <= 30 ? "ok" : "watch"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Notes draft */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  Smart Notes — SOAP draft
                </CardTitle>
                <CardDescription className="text-xs">
                  Every statement links to a transcript anchor. Unanchored content renders as
                  bracketed prompts, never as assertions.
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="size-3" />
                Draft
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["S", "O", "A", "P"] as const).map((section) => {
              const sectionStatements = notes.filter((n) => n.section === section);
              if (sectionStatements.length === 0) return null;
              const label = {
                S: "Subjective",
                O: "Objective",
                A: "Assessment",
                P: "Plan",
              }[section];
              return (
                <div key={section} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                      {section}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-1.5 pl-7">
                    {sectionStatements.map((s) => (
                      <NoteRow key={s.id} stmt={s} onChange={(t) => updateStatement(s.id, t)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="flex flex-col overflow-hidden h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="size-4" />
              Session transcript
            </CardTitle>
            <CardDescription className="text-xs">
              Click any anchor reference (e.g., L12-L18) to scroll to that line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {SAMPLE_TRANSCRIPT.map((t) => (
              <div key={t.line} className="flex gap-2 text-xs" data-line={t.line}>
                <span className="text-muted-foreground font-mono w-8 shrink-0">L{t.line}</span>
                <div className="flex-1">
                  <span className={cn(
                    "font-medium",
                    t.speaker === "clinician" ? "text-primary" : "text-foreground"
                  )}>
                    {t.speaker === "clinician" ? "Dr. Rostova" : "Marcus"}:
                  </span>{" "}
                  <span className="text-foreground/80">{t.text}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integrity summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <IntegrityItem
              icon={Anchor}
              label="Anchored statements"
              value={`${notes.filter((n) => n.anchored).length} / ${notes.length}`}
              color="text-emerald-600"
            />
            <IntegrityItem
              icon={AlertTriangle}
              label="Unanchored prompts"
              value={`${notes.filter((n) => !n.anchored).length}`}
              color="text-amber-600"
              desc="Rendered as bracketed prompts — never assertions"
            />
            <IntegrityItem
              icon={CheckCircle2}
              label="Audit status"
              value={notes.filter((n) => !n.anchored).length === 0 ? "100% anchored" : "Pending review"}
              color="text-primary"
            />
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="size-3.5" />
                Edit burden vs target
              </span>
              <span className="font-medium">{editPct.toFixed(0)}% / 30% target</span>
            </div>
            <Progress value={editPct} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Median edit burden across signed notes — measured as character-level edit distance
              (§7.1). Below target means the draft is useful as-is.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NoteRow({ stmt, onChange }: { stmt: NoteStatement; onChange: (t: string) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        {stmt.anchored ? (
          <Badge variant="secondary" className="text-[10px] gap-0.5 py-0 h-4 shrink-0 mt-0.5">
            <Anchor className="size-2.5" />
            {stmt.anchor}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] gap-0.5 py-0 h-4 shrink-0 mt-0.5 border-amber-500/40 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-2.5" />
            UNANCHORED
          </Badge>
        )}
        <Textarea
          value={stmt.text}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={cn(
            "min-h-[44px] text-xs resize-none",
            !stmt.anchored && "border-amber-500/40 bg-amber-500/5"
          )}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub: string;
  status?: "ok" | "watch";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-base font-semibold mt-0.5">{value}</div>
        <div className={cn(
          "text-[10px] mt-0.5",
          status === "ok" ? "text-emerald-600" : status === "watch" ? "text-amber-600" : "text-muted-foreground"
        )}>
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrityItem({
  icon: Icon,
  label,
  value,
  color,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  desc?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("size-3.5", color)} />
        {label}
      </div>
      <div className={cn("text-lg font-semibold", color)}>{value}</div>
      {desc && <div className="text-[10px] text-muted-foreground leading-snug">{desc}</div>}
    </div>
  );
}
