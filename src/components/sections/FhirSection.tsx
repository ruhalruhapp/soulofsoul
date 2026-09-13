"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FHIR_RESOURCES, FHIR_SYNC_OPS, type FhirResource } from "@/lib/data";
import {
  Network,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileJson,
  ShieldCheck,
  RefreshCw,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Activity,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Patient: User,
  Practitioner: Stethoscope,
  Encounter: Calendar,
  DocumentReference: FileText,
  Observation: Activity,
  Consent: ShieldCheck,
  Flag: AlertCircle,
  Communication: FileJson,
};

export function FhirSection() {
  const [selected, setSelected] = useState<FhirResource>(FHIR_RESOURCES[0]);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    toast.info("Initiating FHIR sync with EHR endpoint...");
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sync complete — 7 resources pushed, 2 pulled. 0 errors.");
    }, 1800);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            FHIR R4 / EHR Integration
            <Badge variant="outline" className="text-xs">§17.4</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            HL7 FHIR R4 resources for EHR sync. SMART on FHIR app launch for EHR-embedded
            co-pilot. US Core profiles for US payer exchange.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
            Sync now
          </Button>
          <Button variant="outline">
            <Network className="size-4" />
            SMART on FHIR launch
          </Button>
        </div>
      </div>

      {/* Connection status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          icon={Network}
          label="EHR endpoint"
          value="Epic FHIR R4"
          sub="sandbox.open.epic.com"
          status="ok"
        />
        <StatCard
          icon={ShieldCheck}
          label="SMART scopes"
          value="5 / 5 granted"
          sub="launch, patient/*.read, etc."
          status="ok"
        />
        <StatCard
          icon={CheckCircle2}
          label="Last sync"
          value="32s ago"
          sub="7 push · 2 pull · 0 errors"
          status="ok"
        />
        <StatCard
          icon={FileJson}
          label="Resources synced"
          value="8"
          sub="across 8 resource types"
          status="ok"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Resource list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="size-4" />
              FHIR R4 resources
            </CardTitle>
            <CardDescription className="text-xs">
              §17.4 supported resource types. Each row represents one FHIR resource, with
              US Core profile conformance where applicable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {FHIR_RESOURCES.map((r) => {
              const Icon = RESOURCE_ICONS[r.resourceType] ?? FileJson;
              const active = selected.id === r.id;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors",
                    active ? "bg-secondary ring-1 ring-primary/30" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelected(r)}
                >
                  <div
                    className={cn(
                      "size-8 rounded-md flex items-center justify-center shrink-0",
                      r.origin === "serenity" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.display}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] py-0">
                        {r.resourceType}
                      </Badge>
                      <span>·</span>
                      <span>{r.lastSynced}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] py-0 shrink-0",
                      r.origin === "serenity"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {r.origin === "serenity" ? "soulofsoul" : "EHR"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Resource detail */}
        <Card className="flex flex-col overflow-hidden h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileJson className="size-4" />
              Resource JSON
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {selected.resourceType}/{selected.raw.id as string}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Detail label="Resource type" value={selected.resourceType} />
              <Detail label="ID" value={String(selected.raw.id)} />
              <Detail label="Status" value={(selected.raw.status as string) ?? "—"} />
              <Detail label="Origin" value={selected.origin === "serenity" ? "soulofsoul" : "EHR"} />
              <Detail label="Last synced" value={selected.lastSynced} />
              <Detail
                label="US Core"
                value={
                  (selected.raw.meta as { profile?: string[] })?.profile?.[0]?.includes("us-core")
                    ? "Conformant"
                    : "n/a"
                }
              />
            </div>
            <Separator />
            <div>
              <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">
                Raw JSON
              </div>
              <pre className="text-[10px] leading-relaxed font-mono bg-muted/50 rounded-md p-3 overflow-x-auto max-h-72">
                {JSON.stringify(selected.raw, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4" />
            Sync log
          </CardTitle>
          <CardDescription className="text-xs">
            All sync operations audited. Push = soulofsoul → EHR; Pull = EHR → soulofsoul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-2 py-2 font-medium text-muted-foreground">Timestamp</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Resource</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Direction</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden sm:table-cell">Endpoint</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground hidden md:table-cell">Bytes</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {FHIR_SYNC_OPS.map((op) => (
                  <tr key={op.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-2 py-2 font-mono text-[10px] text-muted-foreground">{op.ts}</td>
                    <td className="px-2 py-2 font-mono text-[10px]">{op.resource}</td>
                    <td className="px-2 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px]",
                          op.direction === "push" ? "text-primary" : "text-emerald-600"
                        )}
                      >
                        {op.direction === "push" ? <ArrowUpRight className="size-3" /> : <ArrowDownLeft className="size-3" />}
                        {op.direction}
                      </span>
                    </td>
                    <td className="px-2 py-2 hidden sm:table-cell font-mono text-[10px] text-muted-foreground">{op.endpoint}</td>
                    <td className="px-2 py-2 hidden md:table-cell font-mono text-[10px]">{op.bytes || "—"}</td>
                    <td className="px-2 py-2">
                      {op.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          success
                        </span>
                      )}
                      {op.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
                          <Clock className="size-3" />
                          pending
                        </span>
                      )}
                      {op.status === "failed" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-destructive">
                          <AlertCircle className="size-3" />
                          failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Architecture notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="size-4" />
              Integration architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <ArchStep
              num="1"
              title="SMART on FHIR launch"
              desc="EHR-embedded co-pilot launches from the EHR's app launcher. OAuth2 scopes granted: launch, patient/*.read, user/*.read, openid, fhirUser."
            />
            <ArchStep
              num="2"
              title="US Core profiles"
              desc="Patient, Practitioner, Observation (PHQ-9/GAD-7), DocumentReference, Encounter conform to US Core profiles for US payer exchange."
            />
            <ArchStep
              num="3"
              title="DocumentReference for Smart Notes"
              desc="Signed Smart Notes pushed as DocumentReference with LOINC 11506-3 (Progress note). Unsigned notes never pushed — they auto-expire."
            />
            <ArchStep
              num="4"
              title="Flag for safety holds"
              desc="Active safety holds surface as Flag resources. Inactive (cleared) holds remain in history for QA audit."
            />
            <ArchStep
              num="5"
              title="Separate data domains"
              desc="FHIR resources live in the Tier 4 clinical record domain. Tier 3 chat store and Pillar 2 research telemetry are SEPARATE — never co-mingled (§8.1)."
            />
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="size-4" />
              Compliance & privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <ComplianceRow label="HIPAA" value="BAAs with all subprocessors" status="complete" />
            <ComplianceRow label="GDPR Art. 9" value="Special category handling" status="complete" />
            <ComplianceRow label="42 CFR Part 2" value="SUD records — not collected in v1.x" status="complete" />
            <ComplianceRow label="FTC §5" value="Honest-encryption + non-diagnostic language enforced" status="complete" />
            <ComplianceRow label="US Core v6.1.0" value="Conformance for payer exchange" status="complete" />
            <ComplianceRow label="WCAG 2.2 AA" value="Accessibility for crisis flows" status="in-progress" />
            <Separator className="my-2" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Per §8.1: FHIR resources for Tier 4 clinical records use field-level encryption
              and short-lived scoped credentials. All access logged and auditable.
            </p>
          </CardContent>
        </Card>
      </div>
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
  status: "ok" | "watch" | "breach";
}) {
  const color =
    status === "ok" ? "text-emerald-500" : status === "watch" ? "text-amber-500" : "text-destructive";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("size-3.5", color)} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{label}</span>
        </div>
        <div className="text-sm font-semibold leading-tight">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-xs font-medium truncate">{value}</div>
    </div>
  );
}

function ArchStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="size-6 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
        {num}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{title}</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ComplianceRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "complete" | "in-progress";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{value}</div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-medium shrink-0",
          status === "complete" ? "text-emerald-600" : "text-amber-600"
        )}
      >
        <CheckCircle2 className="size-3" />
        {status === "complete" ? "Done" : "In progress"}
      </span>
    </div>
  );
}
