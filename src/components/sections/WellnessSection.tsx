"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Heart,
  Wind,
  Activity,
  Play,
  Square,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tool = "breathing" | "mood" | "phq9" | "gad7";

export function WellnessSection() {
  const [tool, setTool] = useState<Tool>("breathing");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Self-Guided Wellness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tier 1 — free for everyone, no account required for crisis resources. Evidence-based
          skills from CBT, DBT, ACT, and MBSR frameworks.
        </p>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ToolCard active={tool === "breathing"} onClick={() => setTool("breathing")} icon={Wind} label="Box Breathing" desc="4-4-4-4 · 2 min" />
        <ToolCard active={tool === "mood"} onClick={() => setTool("mood")} icon={Heart} label="Mood Tracker" desc="Daily log" />
        <ToolCard active={tool === "phq9"} onClick={() => setTool("phq9")} icon={Activity} label="PHQ-9" desc="Depression screen" />
        <ToolCard active={tool === "gad7"} onClick={() => setTool("gad7")} icon={Activity} label="GAD-7" desc="Anxiety screen" />
      </div>

      {tool === "breathing" && <BreathingTool />}
      {tool === "mood" && <MoodTool />}
      {tool === "phq9" && <AssessmentTool type="PHQ-9" />}
      {tool === "gad7" && <AssessmentTool type="GAD-7" />}
    </div>
  );
}

function ToolCard({
  active,
  onClick,
  icon: Icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Button
      variant={active ? "secondary" : "outline"}
      onClick={onClick}
      className={cn(
        "h-auto py-3 flex flex-col items-start gap-1 text-start",
        active && "bg-secondary"
      )}
    >
      <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
    </Button>
  );
}

function BreathingTool() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold-in" | "exhale" | "hold-out">("inhale");
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => {
            const next = p === "inhale" ? "hold-in" : p === "hold-in" ? "exhale" : p === "exhale" ? "hold-out" : "inhale";
            if (next === "inhale") setCycle((x) => x + 1);
            return next;
          });
          return 4;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setPhase("inhale");
    setCount(4);
    setCycle(0);
  };

  const phaseLabel = {
    inhale: "Breathe in",
    "hold-in": "Hold",
    exhale: "Breathe out",
    "hold-out": "Hold",
  }[phase];

  const phaseColor = {
    inhale: "from-emerald-500/30 to-emerald-500/10",
    "hold-in": "from-amber-500/30 to-amber-500/10",
    exhale: "from-teal-500/30 to-teal-500/10",
    "hold-out": "from-blue-500/30 to-blue-500/10",
  }[phase];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Box Breathing (4-4-4-4)</CardTitle>
        <CardDescription>
          Used by Navy SEALs and CBT protocols. Slow the breath, slow the nervous system.
          Two minutes can shift your heart-rate variability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("rounded-2xl bg-gradient-to-br p-8 sm:p-12 transition-all duration-1000", phaseColor)}>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div
              className={cn(
                "size-32 sm:size-40 rounded-full bg-background/80 backdrop-blur flex flex-col items-center justify-center transition-all duration-1000 shadow-lg",
                phase === "inhale" && "scale-110",
                phase === "exhale" && "scale-90"
              )}
            >
              <div className="text-2xl font-semibold">{count}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {phaseLabel}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {running ? `Cycle ${cycle + 1}` : "Press play to begin"}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <Button onClick={() => setRunning((r) => !r)} size="lg" className="min-w-32">
            {running ? (
              <>
                <Square className="size-4" /> Pause
              </>
            ) : (
              <>
                <Play className="size-4" /> Start
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={reset}>
            Reset
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        <div className="space-y-1">
          <div className="font-medium text-foreground">Why it works</div>
          <p>
            Box breathing activates the parasympathetic nervous system by extending your
            exhale and holding at the bottom. It's a foundational DBT distress-tolerance
            skill (TIPP) and a MBSR staple.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

function MoodTool() {
  const { moods, addMood } = useAppStore();
  const [score, setScore] = useState(3);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const MOOD_LABELS = ["Very low", "Low", "Neutral", "Good", "Great"];
  const MOOD_COLORS = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-muted-foreground",
    "bg-emerald-500",
    "bg-teal-500",
  ];
  const SUGGESTED_TAGS = ["work", "sleep", "family", "exercise", "social", "health"];

  const submit = () => {
    addMood({ score, note, tags });
    setNote("");
    setTags([]);
    setScore(3);
    toast.success("Mood logged. Streak: keep it up.");
  };

  const recentMoods = moods.slice(-7);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log how you feel</CardTitle>
          <CardDescription>A daily check-in takes 30 seconds and builds a pattern over time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Today I'm feeling…</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  className={cn(
                    "flex-1 h-12 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-0.5",
                    score === n
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn("size-2 rounded-full", MOOD_COLORS[n - 1])} />
                  <span className="text-[10px] text-muted-foreground">{MOOD_LABELS[n - 1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>What's contributing? (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((t) => {
                const sel = tags.includes(t);
                return (
                  <Button
                    key={t}
                    variant={sel ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      setTags((prev) => (sel ? prev.filter((x) => x !== t) : [...prev, t]))
                    }
                  >
                    {t}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood-note">Notes (optional, private)</Label>
            <Textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything you want to remember about today…"
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={submit} className="w-full">
            Log mood
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last 7 entries</CardTitle>
          <CardDescription>Patterns surface over time, not single days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentMoods.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No mood entries yet. Log your first today.
            </div>
          )}
          {recentMoods.slice().reverse().map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 py-2 border-b last:border-0"
            >
              <div className={cn("size-2.5 rounded-full shrink-0", MOOD_COLORS[m.score - 1])} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">
                  {new Date(m.ts).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </div>
                {m.note && <div className="text-sm truncate">{m.note}</div>}
                {m.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {m.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] py-0">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs font-medium text-muted-foreground">{MOOD_LABELS[m.score - 1]}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const PHQ9_QS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling/staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things (read, watch TV)",
  "Moving/speaking slowly — or being fidgety/restless",
  "Thoughts that you'd be better off not being here",
];

const GAD7_QS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

function AssessmentTool({ type }: { type: "PHQ-9" | "GAD-7" }) {
  const { addAssessment, assessments, triggerCrisis } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = type === "PHQ-9" ? PHQ9_QS : GAD7_QS;
  const OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

  const score = answers.reduce((a, b) => a + b, 0);

  const submit = () => {
    const severity =
      type === "PHQ-9"
        ? score >= 20 ? "Severe" : score >= 15 ? "Moderately severe" : score >= 10 ? "Moderate" : score >= 5 ? "Mild" : "Minimal"
        : score >= 15 ? "Severe" : score >= 10 ? "Moderate" : score >= 5 ? "Mild" : "Minimal";

    addAssessment({ type, score, severity });

    // §3.1 trigger: PHQ-9 ≥ 15 or GAD-7 ≥ 15 → care-navigator triage
    if ((type === "PHQ-9" && score >= 15) || (type === "GAD-7" && score >= 15)) {
      triggerCrisis(
        `${type} score ${score} (${severity}) — care navigator triage recommended within 1 business day`
      );
    }

    // PHQ-9 Q9 is the suicide-risk item — if "Several days" or higher, surface crisis resources.
    if (type === "PHQ-9" && answers[8] >= 1) {
      triggerCrisis(`PHQ-9 item 9 (suicidal ideation) endorsed — review by clinician`);
    }

    toast.success(`${type} complete. Score: ${score} (${severity}). Logged to your record.`);
    setStep(0);
    setAnswers([]);
  };

  const lastScore = assessments.filter((a) => a.type === type).slice(-1)[0];
  const history = assessments.filter((a) => a.type === type).slice(-5);

  if (step >= questions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{type} — Results</CardTitle>
          <CardDescription>Your responses have been recorded to your private health record.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <div className="text-5xl font-semibold">{score}</div>
            <div className="text-sm text-muted-foreground mt-1">out of {questions.length * 3}</div>
            <div className="text-base font-medium mt-3">
              {score >= 15 ? "Moderate to severe range" : score >= 10 ? "Moderate range" : score >= 5 ? "Mild range" : "Minimal range"}
            </div>
          </div>

          {(type === "PHQ-9" && score >= 10) || (type === "GAD-7" && score >= 8) ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 space-y-1.5 text-sm">
              <div className="font-medium flex items-center gap-2">
                <Activity className="size-4 text-amber-600" />
                Consider connecting with a clinician
              </div>
              <p className="text-xs text-muted-foreground">
                Your score is in the range where a care navigator can help you find next steps.
                Triage is offered within 1 business day; target time-to-first-appointment is
                ≤ 7 days for therapy.
              </p>
            </div>
          ) : null}

          <Button onClick={submit} className="w-full">
            Save to record
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{type}</CardTitle>
              <CardDescription>
                {type === "PHQ-9"
                  ? "Standard 9-item depression screen — over the last 2 weeks"
                  : "Standard 7-item generalized anxiety screen — over the last 2 weeks"}
              </CardDescription>
            </div>
            <Badge variant="outline">Q {step + 1} / {questions.length}</Badge>
          </div>
          <Progress value={((step + 1) / questions.length) * 100} className="h-1 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium leading-snug">{questions[step]}</div>
          <RadioGroup
            value={String(answers[step] ?? "")}
            onValueChange={(v) => {
              const next = [...answers];
              next[step] = parseInt(v, 10);
              setAnswers(next);
            }}
          >
            {OPTIONS.map((opt, i) => (
              <div key={opt} className="flex items-center gap-3 py-2 cursor-pointer">
                <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                <Label htmlFor={`opt-${i}`} className="text-sm font-normal cursor-pointer flex-1">
                  {opt}
                </Label>
                <span className="text-xs text-muted-foreground">{i}</span>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <div className="flex justify-between p-4 border-t">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={answers[step] === undefined}
          >
            {step === questions.length - 1 ? "See results" : "Next"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">History</CardTitle>
          {lastScore && (
            <CardDescription className="text-xs">
              Last: {lastScore.score} ({lastScore.severity}) on{" "}
              {new Date(lastScore.ts).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 && (
            <div className="text-xs text-muted-foreground py-4 text-center">
              No history yet.
            </div>
          )}
          {history.slice().reverse().map((a) => {
            const prev = history.find((x) => x.ts < a.ts);
            const diff = prev ? a.score - prev.score : 0;
            return (
              <div key={a.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">
                  {new Date(a.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{a.score}</span>
                  {diff !== 0 && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-[10px]",
                        diff < 0 ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {diff < 0 ? <TrendingDown className="size-2.5" /> : <TrendingUp className="size-2.5" />}
                      {Math.abs(diff)}
                    </span>
                  )}
                  {diff === 0 && <Minus className="size-2.5 text-muted-foreground" />}
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t text-[10px] text-muted-foreground leading-relaxed">
            {type === "PHQ-9" ? "PHQ-9" : "GAD-7"} is a screen, not a diagnosis. Scores feed
            your Smart Insights dashboard and Tier 4 care planning.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
