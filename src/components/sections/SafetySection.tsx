"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  PARITY_GATES,
  DRIFT_SIGNALS,
  PHASE_0_DELIVERABLES,
  RED_TEAM_RESULTS,
  ROLLBACK_DRILLS,
  REGULATORY_ITEMS,
  type ParityGate,
  type Phase0Deliverable,
  type RedTeamResult,
} from "@/lib/data";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Gauge,
  Beaker,
  Bug,
  RotateCcw,
  FileCheck,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "parity" | "drift" | "phase0" | "redteam" | "rollback" | "regulatory";

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
  { id: "parity", label: "Parity gates", icon: Target },
  { id: "drift", label: "Drift monitoring", icon: Activity, badge: "1" },
  { id: "phase0", label: "Phase 0 deliverables", icon: FileCheck },
  { id: "redteam", label: "Red-team results", icon: Bug },
  { id: "rollback", label: "Rollback drills", icon: RotateCcw },
  { id: "regulatory", label: "Regulatory items", icon: ShieldCheck },
];

export function SafetySection() {
  const [tab, setTab] = useState<Tab>("parity");

  const phase0Complete = PHASE_0_DELIVERABLES.filter((d) => d.status === "complete").length;
  const phase0Total = PHASE_0_DELIVERABLES.length;
  const phase0Pct = Math.round((phase0Complete / phase0Total) * 100);

  const parityPassed = PARITY_GATES.filter((g) => g.status === "passed").length;
  const parityBreaches = PARITY_GATES.filter((g) => g.status === "breach").length;
  const driftTriggered = DRIFT_SIGNALS.filter((d) => d.triggered).length;
  const redteamMissed = RED_TEAM_RESULTS.filter((r) => r.outcome === "missed").length;
  const regBlocked = REGULATORY_ITEMS.filter((r) => r.status === "blocked").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          Safety Engineering
          <Badge variant="outline" className="text-xs">§5.1 / §5.3 / §17.3</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Classifier parity gates, drift monitoring, Phase 0 deliverables, red-team results,
          rollback drills, and the regulatory matrix. Every safety-critical metric has a
          defined measurement method.
        </p>
      </div>

      {/* Top status row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <StatusTile
          icon={FileCheck}
          label="Phase 0 done"
          value={`${phase0Pct}%`}
          sub={`${phase0Complete}/${phase0Total} deliverables`}
          status={phase0Pct === 100 ? "ok" : phase0Pct >= 50 ? "watch" : "breach"}
        />
        <StatusTile
          icon={Target}
          label="Parity gates passed"
          value={`${parityPassed}/${PARITY_GATES.length}`}
          sub={`${parityBreaches} breaches`}
          status={parityBreaches > 0 ? "breach" : parityPassed === PARITY_GATES.length ? "ok" : "watch"}
        />
        <StatusTile
          icon={Activity}
          label="Drift triggers"
          value={`${driftTriggered}`}
          sub="auto flag-review"
          status={driftTriggered > 0 ? "watch" : "ok"}
        />
        <StatusTile
          icon={Bug}
          label="Red-team misses"
          value={`${redteamMissed}`}
          sub={`${RED_TEAM_RESULTS.length} scenarios`}
          status={redteamMissed > 0 ? "breach" : "ok"}
        />
        <StatusTile
          icon={RotateCcw}
          label="Rollback drills"
          value={`${ROLLBACK_DRILLS.filter((d) => d.passed).length}/${ROLLBACK_DRILLS.length}`}
          sub="last 30 days"
          status="ok"
        />
        <StatusTile
          icon={ShieldCheck}
          label="Reg items blocked"
          value={`${regBlocked}`}
          sub={`${REGULATORY_ITEMS.length} total`}
          status={regBlocked > 0 ? "watch" : "ok"}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-px">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <Button
              key={t.id}
              variant="ghost"
              size="sm"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-9 gap-1.5 text-xs rounded-b-none border-b-2 border-transparent",
                active && "border-primary text-foreground bg-muted/50",
                !active && "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
              {t.badge && (
                <span className="size-1.5 rounded-full bg-amber-500" />
              )}
            </Button>
          );
        })}
      </div>

      {tab === "parity" && <ParityGatesView />}
      {tab === "drift" && <DriftView />}
      {tab === "phase0" && <Phase0View pct={phase0Pct} complete={phase0Complete} total={phase0Total} />}
      {tab === "redteam" && <RedTeamView />}
      {tab === "rollback" && <RollbackView />}
      {tab === "regulatory" && <RegulatoryView />}
    </div>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  sub,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  status: "ok" | "watch" | "breach";
}) {
  const color =
    status === "ok" ? "text-emerald-600" : status === "watch" ? "text-amber-600" : "text-destructive";
  const bg = status === "ok" ? "bg-emerald-500/10" : status === "watch" ? "bg-amber-500/10" : "bg-destructive/10";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("size-6 rounded-md flex items-center justify-center", bg)}>
            <Icon className={cn("size-3.5", color)} />
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{label}</span>
        </div>
        <div className="text-lg font-semibold leading-tight">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function ParityGatesView() {
  const [filter, setFilter] = useState<"all" | "text" | "voice">("all");
  const gates = PARITY_GATES.filter((g) => filter === "all" || g.modality === filter);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="size-4" />
                Classifier parity gates — per language / dialect / modality
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                §5.1: recall ≥ 0.95 on high-acuity class, false-alarm ≤ 2 per 1,000 messages,
                per served language — and per served dialect where dialects diverge enough to
                affect crisis-language recognition (e.g. Gulf Arabic; §6.5). Below gate → that
                variant launches in <strong>crisis-resource mode only</strong>.
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {(["all", "text", "voice"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "text" ? "Text only" : "Voice only"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-2 py-2 font-medium text-muted-foreground">Language</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Dialect</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Mode</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Recall</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden sm:table-cell">False alarm</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden md:table-cell">Test set</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden md:table-cell">Last validated</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {gates.map((g) => (
                  <ParityRow key={g.id} gate={g} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ParityRow({ gate }: { gate: ParityGate }) {
  const recallPct = gate.testSetSize === 0 ? 0 : Math.round(gate.recall * 100);
  const faPct = gate.testSetSize === 0 ? 0 : Math.min(100, (gate.falseAlarmRate / (gate.falseAlarmTarget * 3)) * 100);
  const recallColor =
    gate.testSetSize === 0
      ? "text-muted-foreground"
      : gate.recall >= gate.target
      ? "text-emerald-600"
      : gate.recall >= gate.target - 0.02
      ? "text-amber-600"
      : "text-destructive";

  const statusCfg: Record<ParityGate["status"], { label: string; cls: string }> = {
    passed: { label: "Passed", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    watch: { label: "Watch", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    breach: { label: "Breach", cls: "bg-destructive/15 text-destructive" },
    "mode-restricted": { label: "Mode restricted", cls: "bg-muted text-muted-foreground" },
  };
  const s = statusCfg[gate.status];

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 align-top">
      <td className="px-2 py-2 font-medium">{gate.language}</td>
      <td className="px-2 py-2 text-muted-foreground">{gate.dialect ?? "—"}</td>
      <td className="px-2 py-2">
        <Badge variant="outline" className="text-[10px] py-0 capitalize">
          {gate.modality}
        </Badge>
      </td>
      <td className="px-2 py-2">
        <div className={cn("font-mono font-medium", recallColor)}>
          {gate.testSetSize === 0 ? "—" : recallPct.toFixed(0) + "%"}
        </div>
        <div className="text-[10px] text-muted-foreground">target {(gate.target * 100).toFixed(0)}%</div>
        {gate.testSetSize > 0 && (
          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className={cn(
                "h-full rounded-full",
                gate.recall >= gate.target ? "bg-emerald-500" : gate.recall >= gate.target - 0.02 ? "bg-amber-500" : "bg-destructive"
              )}
              style={{ width: `${recallPct}%` }}
            />
          </div>
        )}
      </td>
      <td className="px-2 py-2 hidden sm:table-cell">
        <div className="font-mono">{gate.testSetSize === 0 ? "—" : gate.falseAlarmRate.toFixed(1)}</div>
        <div className="text-[10px] text-muted-foreground">/1k · target ≤{gate.falseAlarmTarget}</div>
        {gate.testSetSize > 0 && (
          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className={cn("h-full rounded-full", gate.falseAlarmRate > gate.falseAlarmTarget ? "bg-destructive" : "bg-emerald-500")}
              style={{ width: `${faPct}%` }}
            />
          </div>
        )}
      </td>
      <td className="px-2 py-2 hidden md:table-cell text-muted-foreground">
        {gate.testSetSize.toLocaleString()}
      </td>
      <td className="px-2 py-2 hidden md:table-cell text-muted-foreground">{gate.lastValidated}</td>
      <td className="px-2 py-2">
        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium", s.cls)}>
          {s.label}
        </span>
        {gate.notes && (
          <div className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">{gate.notes}</div>
        )}
      </td>
    </tr>
  );
}

function DriftView() {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4" />
            Drift & degradation monitoring
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            §5.1: production metrics monitored continuously with monthly dashboards and
            quarterly full re-validation. Predefined triggers — audited-sample recall &lt; 0.93,
            or false-alarm rate &gt; 2× baseline for 7 days — automatically open a
            language-level feature-flag review. For voice, the automatic degradation is
            text-only mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DRIFT_SIGNALS.map((d) => (
            <div
              key={d.id}
              className={cn(
                "rounded-lg border p-3 space-y-2",
                d.triggered && "border-amber-500/40 bg-amber-500/5"
              )}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {d.language} · {d.modality} ·{" "}
                    <span className="text-muted-foreground capitalize">
                      {d.metric.replace("-", " ")}
                    </span>
                    {d.triggered && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400 gap-0.5">
                        <AlertTriangle className="size-2.5" />
                        Triggered
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-lg font-semibold font-mono",
                      d.triggered ? "text-amber-600" : "text-emerald-600"
                    )}
                  >
                    {d.metric === "audited-recall"
                      ? d.current.toFixed(2)
                      : d.current.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    threshold {d.metric === "audited-recall" ? d.threshold.toFixed(2) : d.threshold.toFixed(1)}
                  </div>
                </div>
              </div>
              <DriftChart trend={d.trend} threshold={d.threshold} metric={d.metric} triggered={d.triggered} />
              {d.triggered && d.triggerDescription && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded p-2 flex items-start gap-1.5">
                  <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                  <span>{d.triggerDescription}</span>
                </div>
              )}
            </div>
          ))}

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Promotion & rollback discipline</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Model promotion requires shadow-mode parity</li>
              <li>Rollback is one-click and drill-tested (see Rollback drills tab)</li>
              <li>For voice: automatic degradation is text-only mode when below gate</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DriftChart({
  trend,
  threshold,
  metric,
  triggered,
}: {
  trend: number[];
  threshold: number;
  metric: "audited-recall" | "false-alarm-rate";
  triggered: boolean;
}) {
  const w = 280;
  const h = 40;
  const max = Math.max(...trend, threshold) * 1.1;
  const min = Math.min(...trend, threshold) * 0.9;
  const range = max - min || 1;
  const pts = trend
    .map((v, i) => `${(i / (trend.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  const thresholdY = h - ((threshold - min) / range) * h;

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h + 8} className="block">
        {/* threshold line */}
        <line
          x1={0}
          y1={thresholdY}
          x2={w}
          y2={thresholdY}
          stroke="currentColor"
          className="text-amber-500"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <text x={2} y={thresholdY - 2} className="fill-amber-600 text-[8px]">
          threshold {metric === "audited-recall" ? threshold.toFixed(2) : threshold.toFixed(1)}
        </text>
        {/* trend */}
        <polyline
          points={pts}
          fill="none"
          stroke="currentColor"
          className={triggered ? "text-amber-500" : "text-emerald-500"}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        {/* last point */}
        <circle
          cx={w}
          cy={h - ((trend[trend.length - 1] - min) / range) * h}
          r={3}
          className={triggered ? "fill-amber-500" : "fill-emerald-500"}
        />
      </svg>
    </div>
  );
}

function Phase0View({ pct, complete, total }: { pct: number; complete: number; total: number }) {
  const byOwner = PHASE_0_DELIVERABLES.reduce<Record<string, Phase0Deliverable[]>>((acc, d) => {
    (acc[d.owner] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="size-4" />
                Phase 0 deliverables — gate to Phase 1
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                §14: Phase 0 (6–8 wks) gates everything else. Each deliverable has a named
                owner, a measurable criterion, and a rollback plan (§15).
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold">{pct}%</div>
              <div className="text-xs text-muted-foreground">
                {complete} / {total} complete
              </div>
            </div>
          </div>
          <Progress value={pct} className="h-2 mt-3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(byOwner).map(([owner, items]) => (
            <div key={owner} className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {owner}
              </div>
              <div className="space-y-1.5">
                {items.map((d) => (
                  <Phase0Row key={d.id} d={d} />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Phase0Row({ d }: { d: Phase0Deliverable }) {
  const cfg: Record<
    Phase0Deliverable["status"],
    { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    complete: { label: "Complete", cls: "text-emerald-600", icon: CheckCircle2 },
    "in-progress": { label: "In progress", cls: "text-amber-600", icon: Clock },
    blocked: { label: "Blocked", cls: "text-destructive", icon: XCircle },
    "not-started": { label: "Not started", cls: "text-muted-foreground", icon: Clock },
  };
  const c = cfg[d.status];
  const Icon = c.icon;

  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b last:border-0">
      <Icon className={cn("size-4 mt-0.5 shrink-0", c.cls)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{d.name}</div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
          <span>Due {d.dueDate}</span>
          <span>·</span>
          <span>Gate: {d.gate}</span>
        </div>
        {d.notes && (
          <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{d.notes}</div>
        )}
      </div>
      <span className={cn("text-[10px] font-medium shrink-0", c.cls)}>{c.label}</span>
    </div>
  );
}

function RedTeamView() {
  const [filter, setFilter] = useState<"all" | "missed" | "voice">("all");
  const results = RED_TEAM_RESULTS.filter((r) => {
    if (filter === "missed") return r.outcome === "missed" || r.outcome === "partial";
    if (filter === "voice") return r.modality === "voice";
    return true;
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bug className="size-4" />
                Red-team results
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                §14 Phase 0: scripted adversarial crisis content. Text red-team complete;
                voice red-team (spoken, accents, devices, noise conditions) in flight. Per
                §6.4.6 launch gates, voice mode requires both scripted + live drill.
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {(["all", "missed", "voice"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "missed" ? "Misses" : "Voice only"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.map((r) => (
            <RedTeamRow key={r.id} r={r} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RedTeamRow({ r }: { r: RedTeamResult }) {
  const outcomeCfg: Record<RedTeamResult["outcome"], { label: string; cls: string }> = {
    blocked: { label: "Blocked", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    flagged: { label: "Flagged", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    missed: { label: "Missed", cls: "bg-destructive/15 text-destructive" },
    partial: { label: "Partial", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  };
  const sevCfg: Record<RedTeamResult["severity"], string> = {
    low: "text-muted-foreground",
    medium: "text-amber-600",
    high: "text-orange-600",
    critical: "text-destructive",
  };
  const oc = outcomeCfg[r.outcome];

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-1",
        r.outcome === "missed" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="text-sm font-medium leading-snug flex-1 min-w-0">{r.scenario}</div>
        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0", oc.cls)}>
          {oc.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <Badge variant="outline" className="text-[9px] py-0 capitalize">{r.category}</Badge>
        <Badge variant="outline" className="text-[9px] py-0 capitalize">{r.modality}</Badge>
        <span className="text-muted-foreground">Lang: {r.language}</span>
        <span className={cn("font-medium", sevCfg[r.severity])}>Severity: {r.severity}</span>
      </div>
      {r.notes && (
        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{r.notes}</div>
      )}
    </div>
  );
}

function RollbackView() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <RotateCcw className="size-4" />
          Rollback drills — §17.3
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          One-click rollback, drill-tested. The classifier is failure-closed — on outage the
          system permits only bridging behavior, never substantive replies (§17.3, §6.4.2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {ROLLBACK_DRILLS.map((d) => (
          <div key={d.id} className="rounded-lg border p-3 flex items-start gap-3">
            <CheckCircle2 className={cn("size-4 mt-0.5 shrink-0", d.passed ? "text-emerald-600" : "text-destructive")} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{d.scenario}</div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span>{d.date}</span>
                <span>·</span>
                <span>Time: <span className="font-mono text-foreground">{d.timeToRollback}</span></span>
                <span>·</span>
                <span>Target: {d.target}</span>
              </div>
            </div>
            <Badge variant={d.passed ? "secondary" : "destructive"} className="text-[10px]">
              {d.passed ? "Passed" : "Failed"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RegulatoryView() {
  const grouped = REGULATORY_ITEMS.reduce<Record<string, typeof REGULATORY_ITEMS>>((acc, r) => {
    (acc[r.jurisdiction] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([jur, items]) => (
        <Card key={jur}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4" />
              {jur}
              <Badge variant="outline" className="text-[10px] ml-auto">
                {items.filter((i) => i.status === "complete").length}/{items.length} complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {items.map((r) => {
              const cfg: Record<typeof r.status, string> = {
                complete: "text-emerald-600",
                "in-progress": "text-amber-600",
                blocked: "text-destructive",
                monitoring: "text-muted-foreground",
              };
              return (
                <div key={r.id} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{r.topic}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Owner: {r.owner}
                      {r.notes && <span> · {r.notes}</span>}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-medium shrink-0 capitalize", cfg[r.status])}>
                    {r.status.replace("-", " ")}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
