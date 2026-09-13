"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENTERPRISE_CONTRACTS,
  COHORT_METRICS,
  SLA_TARGETS,
  ERISA_GUARDRAILS,
  type EnterpriseContract,
  type CohortMetric,
} from "@/lib/data";
import {
  Building2,
  Users,
  TrendingUp,
  ShieldCheck,
  Lock,
  Info,
  AlertTriangle,
  Activity,
  Gauge,
  CheckCircle2,
  Eye,
  EyeOff,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminSection() {
  const [selectedContract, setSelectedContract] = useState<EnterpriseContract>(ENTERPRISE_CONTRACTS[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Enterprise Admin
            <Badge variant="outline" className="text-xs">§10.2</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregate-only reporting for employers, universities, and municipal systems. No
            individual utilization data is ever employer-visible. Minimum cohort size k=25;
            differential-privacy noise added to all aggregates.
          </p>
        </div>
        <Select
          value={selectedContract.id}
          onValueChange={(v) => {
            const c = ENTERPRISE_CONTRACTS.find((x) => x.id === v);
            if (c) {
              setSelectedContract(c);
              toast.info(`Switched to ${c.name}`);
            }
          }}
        >
          <SelectTrigger className="w-[260px]">
            <Building2 className="size-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTERPRISE_CONTRACTS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Privacy guardrail banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Lock className="size-4 text-primary" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="text-sm font-medium flex items-center gap-2">
                Privacy guardrails enforced
                <Badge variant="secondary" className="text-[10px]">k=25 · ε=1.0</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {ERISA_GUARDRAILS.map((g, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3 text-primary mt-0.5 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          icon={Users}
          label="Total members"
          value={selectedContract.members.toLocaleString()}
          sub={`Cohort size: ${selectedContract.cohortSize.toLocaleString()}`}
        />
        <StatCard
          icon={Activity}
          label="Monthly active rate"
          value={`${selectedContract.monthlyActiveRate}%`}
          sub="Aggregate, DP-noised"
          status={selectedContract.monthlyActiveRate >= 30 ? "ok" : "watch"}
        />
        <StatCard
          icon={TrendingUp}
          label="Tier 4 utilization"
          value={`${selectedContract.tier4UtilizationRate}%`}
          sub="Clinical sessions"
        />
        <StatCard
          icon={ShieldCheck}
          label="SLA uptime"
          value={`${selectedContract.slaUptime}%`}
          sub={`Target: ${SLA_TARGETS.uptime.target}%`}
          status={selectedContract.slaUptime >= SLA_TARGETS.uptime.target ? "ok" : "breach"}
        />
      </div>

      {/* Cohort metrics with DP visualization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="size-4" />
                Aggregate cohort metrics
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                All values are aggregate-only. Laplace-mechanism noise (ε=1.0) is added before
                display. Cohorts below k=25 are suppressed entirely — not zeroed, not aggregated
                with neighbors.
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-xs">
              <Scale className="size-3" />
              ERISA / ADA compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {COHORT_METRICS.map((m) => (
            <CohortMetricRow key={m.id} metric={m} />
          ))}
        </CardContent>
      </Card>

      {/* What the employer CANNOT see */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <EyeOff className="size-4 text-amber-600" />
            What you can never see
          </CardTitle>
          <CardDescription className="text-xs">
            By design. These are protected by data-domain separation (§8.1), not just policy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              "Individual member names or identifiers in utilization data",
              "Clinical content of any session (ever, under any circumstance)",
              "Individual crisis-event records (only aggregate counts shown)",
              "Specific PHQ-9/GAD-7 scores tied to a person",
              "Which member spoke to which clinician",
              "Voice session audio or transcripts",
              "Memory entries (those belong to the member, §17.2)",
              "Whether a specific employee is in active crisis right now",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 p-2 rounded-md bg-amber-500/10">
                <EyeOff className="size-3 text-amber-600 mt-0.5 shrink-0" />
                <span className="text-amber-900 dark:text-amber-200">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLA tracking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4" />
            Contractual SLAs
          </CardTitle>
          <CardDescription className="text-xs">
            Contractual SLAs per §10.2. Crisis-pipeline availability is measured monthly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SlaRow
            label="Platform uptime"
            target={`${SLA_TARGETS.uptime.target}%`}
            current={`${SLA_TARGETS.uptime.current}%`}
            pct={(SLA_TARGETS.uptime.current / SLA_TARGETS.uptime.target) * 100}
            status={SLA_TARGETS.uptime.current >= SLA_TARGETS.uptime.target ? "ok" : "breach"}
          />
          <SlaRow
            label="Crisis-pipeline availability"
            target={`${SLA_TARGETS.crisisPipeline.target}%`}
            current={`${SLA_TARGETS.crisisPipeline.current}%`}
            pct={100}
            status="ok"
          />
          <SlaRow
            label="Support response time"
            target={`≤ ${SLA_TARGETS.supportResponse.target} business hours`}
            current={`${SLA_TARGETS.supportResponse.current} business hours`}
            pct={(SLA_TARGETS.supportResponse.target - SLA_TARGETS.supportResponse.current) / SLA_TARGETS.supportResponse.target * 100}
            status="ok"
          />
        </CardContent>
      </Card>

      {/* All contracts table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />
            All contracts
          </CardTitle>
          <CardDescription className="text-xs">
            {ENTERPRISE_CONTRACTS.length} active contracts across employers, universities, and
            municipal systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-2 py-2 font-medium text-muted-foreground">Account</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Type</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Members</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden sm:table-cell">MA rate</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden md:table-cell">Renewal</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISE_CONTRACTS.map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30 cursor-pointer",
                      selectedContract.id === c.id && "bg-muted/50"
                    )}
                    onClick={() => setSelectedContract(c)}
                  >
                    <td className="px-2 py-2 font-medium">{c.name}</td>
                    <td className="px-2 py-2 text-muted-foreground">{c.type}</td>
                    <td className="px-2 py-2 font-mono">{c.members.toLocaleString()}</td>
                    <td className="px-2 py-2 hidden sm:table-cell">{c.monthlyActiveRate}%</td>
                    <td className="px-2 py-2 hidden md:table-cell text-muted-foreground">{c.renewalDate}</td>
                    <td className="px-2 py-2">
                      <ContractStatus status={c.status} />
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

function StatCard({
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
  status?: "ok" | "watch" | "breach";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon
            className={cn(
              "size-3.5",
              status === "ok" ? "text-emerald-500" : status === "watch" ? "text-amber-500" : status === "breach" ? "text-destructive" : "text-muted-foreground"
            )}
          />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{label}</span>
        </div>
        <div className="text-lg font-semibold leading-tight">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function CohortMetricRow({ metric }: { metric: CohortMetric }) {
  const [showRaw, setShowRaw] = useState(false);
  const displayValue = metric.displayable ? metric.noisyValue : null;
  const rawValue = metric.rawValue;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        !metric.displayable && "bg-muted/30 border-dashed"
      )}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="space-y-0.5">
          <div className="text-sm font-medium flex items-center gap-2">
            {metric.label}
            {!metric.displayable && (
              <Badge variant="outline" className="text-[10px] gap-0.5 border-amber-500/40 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-2.5" />
                Suppressed (k&lt;25)
              </Badge>
            )}
            {metric.displayable && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Lock className="size-2.5" />
                k={metric.cohortSize.toLocaleString()} · ε=1.0
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Cohort size: {metric.cohortSize.toLocaleString()} · Laplace noise: ±{metric.noiseAdded} {metric.unit}
          </div>
        </div>
        <div className="text-right">
          {metric.displayable ? (
            <>
              <div className="text-2xl font-semibold font-mono">
                {displayValue?.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">{metric.unit}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Cohort too small
            </div>
          )}
        </div>
      </div>

      {metric.displayable && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MiniTrend data={metric.trend} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] gap-1 shrink-0"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {showRaw ? "Hide raw" : "Show raw"}
          </Button>
        </div>
      )}

      {showRaw && metric.displayable && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
            <Info className="size-3" />
            Internal view — never shown to employer
          </div>
          <div className="font-mono">
            Raw value: <span className="font-bold">{rawValue.toLocaleString()}</span> {metric.unit}
          </div>
          <div className="font-mono text-muted-foreground">
            DP-noised: {metric.noisyValue.toLocaleString()} (Δ = +{metric.noisyValue - rawValue})
          </div>
          <div className="text-[10px] text-muted-foreground leading-relaxed mt-1">
            The raw value exists in our internal analytics but is never exposed via the
            employer dashboard API. The noisy value is what the admin UI displays.
          </div>
        </div>
      )}

      {!metric.displayable && (
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          This cohort has only {metric.cohortSize} members — below the k=25 floor. The metric
          is <strong>suppressed entirely</strong> (not zeroed, not bundled with a neighbor
          cohort). Re-identification risk via small-cell inference is eliminated by design.
        </div>
      )}
    </div>
  );
}

function MiniTrend({ data }: { data: number[] }) {
  if (data.length === 0 || data.every((d) => d === 0)) return null;
  const w = 200;
  const h = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="block">
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r={2.5}
        className="fill-primary"
      />
    </svg>
  );
}

function SlaRow({
  label,
  target,
  current,
  pct,
  status,
}: {
  label: string;
  target: string;
  current: string;
  pct: number;
  status: "ok" | "breach";
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Target: {target}</span>
          <span className={cn("font-medium", status === "ok" ? "text-emerald-600" : "text-destructive")}>
            {current}
          </span>
        </div>
      </div>
      <Progress
        value={Math.min(100, pct)}
        className={cn("h-1.5", status === "ok" ? "[&_div]:bg-emerald-500" : "[&_div]:bg-destructive")}
      />
    </div>
  );
}

function ContractStatus({ status }: { status: EnterpriseContract["status"] }) {
  const cfg: Record<EnterpriseContract["status"], { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    pilot: { label: "Pilot", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
    trial: { label: "Trial", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    "renewal-due": { label: "Renewal due", cls: "bg-destructive/15 text-destructive" },
  };
  const c = cfg[status];
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium", c.cls)}>
      {c.label}
    </span>
  );
}
