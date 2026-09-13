"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPIS, COST_TO_SERVE } from "@/lib/data";
import {
  Heart,
  Users,
  MessageCircle,
  Video,
  Activity,
  Shield,
  Lock,
  Eye,
  Languages,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { tr } from "@/lib/i18n";

const TIER_CARDS = [
  {
    tier: 1,
    name: "Self-Guided Wellness",
    icon: Heart,
    price: "$0/mo",
    desc: "CBT/DBT skill modules, breathing tools, mood tracking, self-assessments (PHQ-9, GAD-7, PSS)",
    audience: "Sub-clinical users, self-help seekers, low-income individuals",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    tier: 2,
    name: "Peer Support & Community",
    icon: Users,
    price: "incl. Tier 1",
    desc: "Moderated peer forums, active-listener chat rooms, structured groups",
    audience: "Members seeking shared experience",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    tier: 3,
    name: "AI Conversational Companion",
    icon: MessageCircle,
    price: "$9.99–$19.99/mo",
    desc: "24/7 empathetic conversational AI grounded in CBT/DBT/ACT/MBSR; voice agent mode included",
    audience: "Daily wellness seekers wanting continuous reflection",
    color: "text-teal-600",
    bg: "bg-teal-500/10",
  },
  {
    tier: 4,
    name: "Licensed Telehealth & Psychiatry",
    icon: Video,
    price: "$0–$35/session copay",
    desc: "Live video therapy, tele-psychiatry, medication management; Smart Notes & Insights",
    audience: "Members needing formal diagnosis or medication management",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
];

const PRINCIPLES = [
  {
    icon: Shield,
    title: "Human authority is never overridden",
    desc: "Care transitions are recommendations made by algorithms, approved by humans. The AI is supportive — never autonomous.",
  },
  {
    icon: Activity,
    title: "Every safety metric is measurable",
    desc: "Crisis recall ≥ 0.95, false-alarm rate ≤ 2/1,000 messages, p95 review ≤ 5 min. No '100%' claims, ever.",
  },
  {
    icon: Lock,
    title: "Honest about encryption",
    desc: "Server-side processing is required for crisis screening. We do NOT claim end-to-end encryption for AI content.",
  },
  {
    icon: Eye,
    title: "Users see and control what's collected",
    desc: "Memory is editable and deletable (effect ≤ 24h). 4 separate consent streams — AI, telehealth, research, voice.",
  },
];

const LAUNCH_LANGUAGES = [
  { lang: "English", status: "GA", color: "text-emerald-600" },
  { lang: "Spanish", status: "Phase 2", color: "text-amber-600" },
  { lang: "Arabic (Gulf)", status: "Phase 3 — RTL parity gate", color: "text-blue-600" },
  { lang: "French", status: "Phase 3", color: "text-amber-600" },
  { lang: "Vietnamese", status: "Phase 3", color: "text-amber-600" },
  { lang: "Mandarin", status: "Phase 3", color: "text-amber-600" },
];

export function HomeSection() {
  const setSection = useAppStore((s) => s.setSection);
  const lang = useAppStore((s) => s.lang);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge variant="secondary" className="gap-1">
            <Activity className="size-3" />
            PRD v1.4 — Phase 0 active
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
            {tr("appName", lang)}: stepped-care mental health,
            <span className="text-primary"> 24/7</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Four care modalities in one platform: self-guided tools, moderated peer
            spaces, conversational AI, and licensed telehealth — connected by layered
            safety guardrails and honest data governance.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => setSection("companion")} size="lg">
              <MessageCircle className="size-4" />
              Talk to the AI Companion
            </Button>
            <Button variant="outline" size="lg" onClick={() => setSection("wellness")}>
              <Heart className="size-4" />
              Try a wellness tool
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setSection("supervisor")}>
              <Shield className="size-4" />
              See safety architecture
            </Button>
          </div>
        </div>
      </div>

      {/* Tier architecture */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Tiered hybrid care</h2>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="size-3" />
            Stepped-care model
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Users enter at any tier and move in both directions. Step-down from Tier 4 is a
          success metric, not churn.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIER_CARDS.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.tier} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className={`size-10 rounded-lg ${t.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`size-5 ${t.color}`} />
                  </div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Tier {t.tier}
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {t.price}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-foreground">
                    {t.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-[11px] text-muted-foreground">{t.audience}</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Design principles */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Design principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="bg-muted/30">
                <CardContent className="p-4 flex gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-medium">{p.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Safety KPIs preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Safety KPIs (live)</h2>
          <Button variant="ghost" size="sm" onClick={() => setSection("supervisor")}>
            Full dashboard <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPIS.slice(0, 4).map((kpi) => (
            <Card key={kpi.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground truncate">
                    {kpi.metric}
                  </span>
                  <StatusDot status={kpi.status} />
                </div>
                <div className="text-xl font-semibold">{kpi.current}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Target: {kpi.target}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Languages + release phasing */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Languages className="size-4" />
              Launch languages
            </CardTitle>
            <CardDescription>
              Each language has independent launch gates: classifier recall (§5.1), in-language
              crisis protocol, and culturally reviewed response sets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {LAUNCH_LANGUAGES.map((l) => (
              <div
                key={l.lang}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <span className="font-medium">{l.lang}</span>
                <Badge variant="outline" className={`text-xs ${l.color}`}>
                  {l.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4" />
              Release phasing
            </CardTitle>
            <CardDescription>
              Phase 0 (6–8 wks) gates everything else. Classifier test sets, supervision
              staffing, regulatory memo, voice prototype must all pass.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PhaseRow phase="Phase 0" status="active" label="Foundations — threat model, classifier eval, payer kickoff" pct={42} />
            <PhaseRow phase="Phase 1" status="planned" label="Tier 1 tools + Tier 4 Smart Notes pilot (20 clinicians)" pct={0} />
            <PhaseRow phase="Phase 2" status="planned" label="AI companion text + crisis pipeline + voice pilot" pct={0} />
            <PhaseRow phase="Phase 3" status="planned" label="Tier 2 launch, enterprise dashboards, additional languages" pct={0} />
          </CardContent>
        </Card>
      </section>

      {/* Cost-to-serve */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost-to-serve model (Phase 0 deliverable)</CardTitle>
            <CardDescription>
              Per-tier marginal cost; prevents adverse selection against free Tier 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((t) => {
                const key = `tier${t}` as keyof typeof COST_TO_SERVE;
                const cost = COST_TO_SERVE[key];
                return (
                  <div key={t} className="rounded-lg border p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Tier {t}</div>
                    <div className="text-lg font-semibold">
                      ${cost.monthly.toFixed(2)}
                      <span className="text-xs text-muted-foreground font-normal">/mo</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug">
                      {cost.drivers.join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "on-track": "bg-emerald-500",
    watch: "bg-amber-500",
    breach: "bg-destructive",
    "pre-launch": "bg-muted-foreground",
  };
  return <span className={`size-2 rounded-full ${colors[status] || "bg-muted-foreground"}`} />;
}

function PhaseRow({
  phase,
  status,
  label,
  pct,
}: {
  phase: string;
  status: "active" | "planned";
  label: string;
  pct: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium flex items-center gap-2">
          {phase}
          {status === "active" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              active
            </Badge>
          )}
        </span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
