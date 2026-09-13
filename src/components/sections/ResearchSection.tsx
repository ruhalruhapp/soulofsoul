"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HCI_SIGNALS, PILLAR_2_BOUNDARIES, IRB_PROTOCOL, type HciSignal } from "@/lib/data";
import {
  FlaskConical,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Ban,
  Beaker,
  FileCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ResearchSection() {
  const [enrolled, setEnrolled] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState({
    optional: false,
    aggregate: false,
    noClinical: false,
    revocable: false,
  });

  const allAck = Object.values(acknowledged).every(Boolean);

  const enroll = () => {
    setEnrolled(true);
    setConsentOpen(false);
    setAcknowledged({ optional: false, aggregate: false, noClinical: false, revocable: false });
    toast.success("Enrolled in Pillar 2 research. Telemetry collection starts within 24h.");
  };

  const withdraw = () => {
    setEnrolled(false);
    toast.info("Withdrawn. Collection stops within 24h. Existing data deleted within 30 days.");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          Research Pilot
          <Badge variant="outline" className="text-xs">§4 — Pillar 2</Badge>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <FlaskConical className="size-3" />
            Opt-in only
          </Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digital phenotyping research. Produces no user-facing output, drives no automated care
          escalation, makes no clinical claims. Go/no-go decision on a regulated (SaMD) pathway
          scheduled at the Phase 3 gate.
        </p>
      </div>

      {/* STATUS banner — this is the key honest framing per §4.3 */}
      <Card className={cn("border-2", enrolled ? "border-primary/40 bg-primary/5" : "border-amber-500/40 bg-amber-500/5")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0",
                enrolled ? "bg-primary/15" : "bg-amber-500/15"
              )}
            >
              {enrolled ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : (
                <AlertTriangle className="size-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium">
                {enrolled
                  ? "You are enrolled — your data is contributing to research"
                  : "You are not enrolled — no telemetry is being collected"}
              </div>
              <p className="text-xs text-muted-foreground">
                {enrolled
                  ? "You can withdraw at any time. Collection stops within 24h; existing data deleted within 30 days."
                  : "Pillar 2 is an opt-in research program. Your regular use of soulofsoul is unaffected. No HCI telemetry is collected unless you enroll."}
              </p>
            </div>
            {enrolled ? (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/40" onClick={withdraw}>
                Withdraw
              </Button>
            ) : (
              <Button size="sm" onClick={() => setConsentOpen(true)}>
                Review & enroll
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* IRB protocol */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="size-4" />
            IRB protocol summary
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Per §4: IRB-supervised protocol. Aggregate findings reviewed quarterly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Field label="Protocol ID" value={IRB_PROTOCOL.irbId} />
            <Field label="PI" value={IRB_PROTOCOL.pi} />
            <Field label="Status" value={IRB_PROTOCOL.status} highlight="ok" />
            <Field label="Consent version" value={IRB_PROTOCOL.consentVersion} />
            <Field label="Enrollment" value={`${IRB_PROTOCOL.enrolled} / ${IRB_PROTOCOL.enrollmentTarget}`} />
            <Field label="Retention" value={IRB_PROTOCOL.dataRetention} />
            <Field label="Review cadence" value={IRB_PROTOCOL.reviewCadence} />
            <Field label="Data domain" value="Separate from clinical record" highlight="ok" />
          </div>
          <Progress
            value={(IRB_PROTOCOL.enrolled / IRB_PROTOCOL.enrollmentTarget) * 100}
            className="h-1.5"
          />
          <div className="text-[11px] text-muted-foreground">
            {Math.round((IRB_PROTOCOL.enrolled / IRB_PROTOCOL.enrollmentTarget) * 100)}% of enrollment target
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-xs font-medium">Research outcomes (descriptive / exploratory only)</div>
            {IRB_PROTOCOL.outcomes.map((o, i) => (
              <div key={i} className="rounded-lg border p-2.5 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-medium leading-snug">{o.name}</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] py-0 capitalize shrink-0",
                      o.type === "descriptive" ? "text-muted-foreground" : "text-amber-600"
                    )}
                  >
                    {o.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5",
                      o.status === "complete" ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {o.status === "complete" ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                    {o.status}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{o.note}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HCI signals collected */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4" />
            HCI signals collected (aggregate, de-identified)
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Per §4.1: millisecond-scale human-computer interaction dynamics. Used to explore
            correlations with cognition, executive function, and mood state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {HCI_SIGNALS.map((s) => (
            <HciSignalRow key={s.id} signal={s} />
          ))}
        </CardContent>
      </Card>

      {/* Hard boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ban className="size-4 text-destructive" />
              NEVER collected
            </CardTitle>
            <CardDescription className="text-xs">
              Hard boundaries (§4.2). These are architectural — not policy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {PILLAR_2_BOUNDARIES.neverCollected.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <XCircle className="size-3.5 text-destructive mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Storage rules
            </CardTitle>
            <CardDescription className="text-xs">
              Per §4.2 — segregation enforced at the data-domain level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {PILLAR_2_BOUNDARIES.storageRules.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Phase 3 go/no-go gate */}
      <Card className={cn(
        "border-2",
        PILLAR_2_BOUNDARIES.goNoGoGate.status === "blocked" ? "border-amber-500/40" : "border-emerald-500/40"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Beaker className="size-4" />
            {PILLAR_2_BOUNDARIES.goNoGoGate.title}
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Per §4.3: until all three criteria exist, this feature cannot trigger notifications,
            escalations, or clinician dashboards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {PILLAR_2_BOUNDARIES.goNoGoGate.criteria.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm py-1.5 border-b last:border-0">
              <XCircle className="size-4 text-amber-500 shrink-0" />
              <span className="flex-1">{c}</span>
              <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400">
                Not met
              </Badge>
            </div>
          ))}
          <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3 inline mr-1" />
            {PILLAR_2_BOUNDARIES.goNoGoGate.note}
          </div>
        </CardContent>
      </Card>

      {/* Honest framing per §4.3 */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <FlaskConical className="size-4 text-primary" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-medium">Honest framing (§4.3)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Within-individual relapse prediction from HCI biomarkers is an{" "}
              <strong className="text-foreground">emerging, not established, evidence base</strong>.
              v1.x treats it as research. Any future clinical deployment requires: (a) a validated
              within-person longitudinal model, (b) an FDA regulatory determination (likely SaMD),
              and (c) a dedicated consent flow.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment dialog */}
      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              Pillar 2 research enrollment
            </DialogTitle>
            <DialogDescription>
              You're enrolling in PRO-{IRB_PROTOCOL.irbId}. Please acknowledge each item below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <ConsentAck
              checked={acknowledged.optional}
              onChange={(v) => setAcknowledged((p) => ({ ...p, optional: v }))}
              title="Participation is fully optional"
              desc="Your regular use of soulofsoul is unaffected. Tier 1, Tier 2, Tier 3, Tier 4 — all work the same whether you enroll or not."
            />
            <ConsentAck
              checked={acknowledged.aggregate}
              onChange={(v) => setAcknowledged((p) => ({ ...p, aggregate: v }))}
              title="Only aggregate, de-identified findings are reviewed"
              desc="Your individual data is never shown to users, clinicians, or care-navigators. Quarterly research reviews use aggregate, de-identified statistics only."
            />
            <ConsentAck
              checked={acknowledged.noClinical}
              onChange={(v) => setAcknowledged((p) => ({ ...p, noClinical: v }))}
              title="No clinical claims or care escalation"
              desc="This research produces no user-facing output. It never triggers notifications, escalations, or clinician dashboards. It will not change your care."
            />
            <ConsentAck
              checked={acknowledged.revocable}
              onChange={(v) => setAcknowledged((p) => ({ ...p, revocable: v }))}
              title="Revocable at any time"
              desc="Withdraw at any time. Collection stops within 24h. Existing data is deleted within 30 days. You do not need to give a reason."
            />

            <Separator />

            <div className="rounded-lg bg-muted/50 p-3 text-[11px] space-y-1">
              <div className="font-medium">What's collected:</div>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Tap latency (ms) — never the content of the tap</li>
                <li>Swipe velocity (px/s)</li>
                <li>Typing rhythm (inter-keystroke interval) — <strong>never the typed text</strong></li>
                <li>Scroll fluidity (px/frame)</li>
              </ul>
              <div className="font-medium mt-2">What's NEVER collected:</div>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Typed text content, message bodies, passwords</li>
                <li>GPS / location, microphone, browsing history, contacts</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConsentOpen(false)}>
              Not now
            </Button>
            <Button onClick={enroll} disabled={!allAck}>
              I acknowledge — enroll me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HciSignalRow({ signal }: { signal: HciSignal }) {
  const [showStats, setShowStats] = useState(false);
  return (
    <div className="rounded-lg border p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="text-sm font-medium capitalize flex items-center gap-2">
            {signal.type.replace("-", " ")}
            <Badge variant="outline" className="text-[9px] py-0 gap-0.5">
              <EyeOff className="size-2.5" />
              timing-only
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">{signal.description}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] gap-1 shrink-0"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          {showStats ? "Hide" : "Show"} stats
        </Button>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-2.5" />
          {signal.participants} participants
        </span>
        <span>·</span>
        <span>{signal.sampleSize.toLocaleString()} samples</span>
      </div>
      {showStats && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <Stat label="Mean" value={`${signal.aggregate.mean} ${signal.aggregate.unit}`} />
          <Stat label="Median" value={`${signal.aggregate.median} ${signal.aggregate.unit}`} />
          <Stat label="Std dev" value={`±${signal.aggregate.stddev} ${signal.aggregate.unit}`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-xs font-mono font-medium">{value}</div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: "ok" }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={cn("text-xs font-medium truncate", highlight === "ok" && "text-emerald-600")}>
        {value}
      </div>
    </div>
  );
}

function ConsentAck({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-1.5">
      <div className="flex items-start gap-2">
        <Switch checked={checked} onCheckedChange={onChange} />
        <div className="flex-1 space-y-0.5">
          <Label className="text-sm font-medium cursor-pointer">{title}</Label>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
