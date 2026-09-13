"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPIS, CRISIS_QUEUE, type CrisisEvent } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Clock,
  Activity,
  TrendingDown,
  TrendingUp,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export function SupervisorSection() {
  const [queue, setQueue] = useState<CrisisEvent[]>(CRISIS_QUEUE);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");

  // Live SLA countdown
  useEffect(() => {
    const t = setInterval(() => {
      setQueue((prev) =>
        prev.map((e) =>
          e.status === "pending" && e.slaRemainingSec > 0
            ? { ...e, slaRemainingSec: e.slaRemainingSec - 1 }
            : e
        )
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = queue.filter((e) => {
    if (filter === "pending") return e.status === "pending";
    if (filter === "active") return e.status === "pending" || e.status === "reviewing";
    return true;
  });

  const pending = queue.filter((e) => e.status === "pending").length;
  const reviewing = queue.filter((e) => e.status === "reviewing").length;
  const breached = queue.filter(
    (e) => (e.status === "pending" || e.status === "reviewing") && e.slaRemainingSec === 0
  ).length;

  const setDisposition = (id: string, status: CrisisEvent["status"], disposition: string) => {
    setQueue((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, disposition, slaRemainingSec: 0 } : e))
    );
    toast.success("Disposition logged. Per §5.2 step 5, all dispositions are recorded for QA.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Supervisor Console
            {pending > 0 && (
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <ShieldAlert className="size-3" />
                {pending} pending
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Persona D — Dev, on-call clinical supervisor. Triage crisis flags, manage
            dispositions, monitor Tier 2 moderation escalations.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" />
            Tabletop drill
          </Button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox icon={ShieldAlert} label="Pending review" value={pending} sub="SLA: ≤5 min for imminent risk" status={pending > 0 ? "watch" : "ok"} />
        <StatBox icon={Eye} label="In review" value={reviewing} sub="Being triaged" />
        <StatBox icon={Clock} label="SLA breaches (24h)" value={breached} sub="p95 ≤ 5 min" status={breached > 0 ? "breach" : "ok"} />
        <StatBox icon={Users} label="Supervisors on-call" value={3} sub="24/7 coverage" />
      </div>

      {/* Crisis queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="size-4" />
                Crisis queue — de-identified
              </CardTitle>
              <CardDescription className="text-xs">
                Transcripts route to this console with classifier rationale. Per §5.4: review
                initiated ≤ 5 min for imminent-risk classifications.
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {(["all", "pending", "active"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No events in this view.
            </div>
          )}
          {filtered.map((e) => (
            <QueueRow key={e.id} event={e} onDisposition={setDisposition} />
          ))}
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4" />
            KPI Dashboard
          </CardTitle>
          <CardDescription className="text-xs">
            Every KPI has a baseline, target, and measurement method. No "100%" targets (§12).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-2 py-2 font-medium text-muted-foreground">Metric</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden sm:table-cell">Definition</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Target</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Current</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden md:table-cell">Trend</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {KPIS.map((kpi) => (
                  <tr key={kpi.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-2 py-2 font-medium">{kpi.metric}</td>
                    <td className="px-2 py-2 text-muted-foreground hidden sm:table-cell max-w-xs">
                      {kpi.definition}
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{kpi.target}</td>
                    <td className="px-2 py-2 font-medium">{kpi.current}</td>
                    <td className="px-2 py-2 hidden md:table-cell">
                      <Sparkline data={kpi.sparkline} status={kpi.status} />
                    </td>
                    <td className="px-2 py-2">
                      <StatusPill status={kpi.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QueueRow({
  event,
  onDisposition,
}: {
  event: CrisisEvent;
  onDisposition: (id: string, status: CrisisEvent["status"], disposition: string) => void;
}) {
  const slaMin = Math.floor(event.slaRemainingSec / 60);
  const slaSec = event.slaRemainingSec % 60;
  const slaPct =
    event.status === "closed" || event.status === "outreached"
      ? 100
      : Math.max(0, ((300 - event.slaRemainingSec) / 300) * 100);
  const slaBreached = event.slaRemainingSec === 0 && (event.status === "pending" || event.status === "reviewing");

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        slaBreached && "border-destructive bg-destructive/5",
        event.status === "closed" && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{event.user}</span>
            <Badge variant="outline" className="text-[10px] py-0">
              {event.language}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] py-0 gap-0.5",
                event.channel === "voice" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {event.channel === "voice" ? <Phone className="size-2.5" /> : <MessageSquare className="size-2.5" />}
              {event.channel}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">{event.ts}</span>
          </div>
          <div className="text-xs text-muted-foreground">{event.reason}</div>

          {event.disposition && (
            <div className="text-[11px] bg-muted/50 rounded p-1.5 mt-1 flex items-start gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-600 mt-0.5 shrink-0" />
              <span>{event.disposition}</span>
            </div>
          )}

          {/* SLA timer */}
          {(event.status === "pending" || event.status === "reviewing") && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    slaBreached ? "bg-destructive" : slaPct < 80 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${slaPct}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono",
                  slaBreached ? "text-destructive font-bold" : "text-muted-foreground"
                )}
              >
                {slaBreached ? "SLA BREACH" : `${slaMin}:${String(slaSec).padStart(2, "0")}`}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {event.status === "pending" && (
            <div className="flex gap-1.5 mt-2">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => onDisposition(event.id, "reviewing", "Review in progress — opened transcript")}
              >
                <Eye className="size-3" />
                Begin review
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onDisposition(event.id, "outreached", "Care navigator outreach initiated")}
              >
                <Phone className="size-3" />
                Outreach
              </Button>
            </div>
          )}
          {event.status === "reviewing" && (
            <div className="flex gap-1.5 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onDisposition(event.id, "outreached", "Outreach call placed — user connected")}
              >
                <Phone className="size-3" />
                Outreach call
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onDisposition(event.id, "closed", "False positive — logged to evaluation set per §5.3")}
              >
                False positive
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  sub,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub: string;
  status?: "ok" | "watch" | "breach";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon
            className={cn(
              "size-3.5",
              status === "breach" ? "text-destructive" : status === "watch" ? "text-amber-500" : status === "ok" ? "text-emerald-500" : "text-muted-foreground"
            )}
          />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    "on-track": { label: "On track", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    watch: { label: "Watch", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    breach: { label: "Breach", cls: "bg-destructive/15 text-destructive" },
    "pre-launch": { label: "Pre-launch", cls: "bg-muted text-muted-foreground" },
  };
  const c = cfg[status] ?? cfg["pre-launch"];
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium", c.cls)}>
      {c.label}
    </span>
  );
}

function Sparkline({ data, status }: { data: number[]; status: string }) {
  if (!data.length || data.every((d) => d === 0)) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 18;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * h}`)
    .join(" ");

  const trend = data[data.length - 1] - data[0];
  const isGoodTrend =
    status === "on-track"
      ? trend >= 0
        ? true
        : false
      : trend < 0
      ? true
      : false;

  return (
    <div className="flex items-center gap-1">
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={pts}
          fill="none"
          stroke={isGoodTrend ? "currentColor" : "currentColor"}
          className={isGoodTrend ? "text-emerald-500" : "text-amber-500"}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {trend !== 0 && (
        <span
          className={cn(
            "flex items-center text-[10px]",
            isGoodTrend ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {trend > 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
        </span>
      )}
    </div>
  );
}
