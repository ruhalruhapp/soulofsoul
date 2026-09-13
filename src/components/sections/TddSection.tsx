"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  Database,
  Lock,
  GitBranch,
  Cpu,
  Network,
  Server,
  Cloud,
  Boxes,
  ArrowRight,
  Clock,
  Shield,
  Code2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = "architecture" | "dataflow" | "stack" | "decisions";

const VIEWS: Array<{ id: View; label: string; icon: React.ComponentType<{ className?: string }>; }> = [
  { id: "architecture", label: "System architecture", icon: Boxes },
  { id: "dataflow", label: "Data flow", icon: Network },
  { id: "stack", label: "Technology stack", icon: Layers },
  { id: "decisions", label: "Key decisions", icon: GitBranch },
];

export function TddSection() {
  const [view, setView] = useState<View>("architecture");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          Technical Design Document
          <Badge variant="outline" className="text-xs">§17 — high-level</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Architecture overview for soulofsoul. Detailed design lives in the TDD; this view
          summarizes the system: services, data domains, request paths, and the
          engineering decisions behind them.
        </p>
      </div>

      {/* View tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-px">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "h-9 px-3 gap-1.5 text-xs rounded-b-none border-b-2 border-transparent inline-flex items-center font-medium transition-colors",
                active && "border-primary text-foreground bg-muted/50",
                !active && "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {v.label}
            </button>
          );
        })}
      </div>

      {view === "architecture" && <ArchitectureView />}
      {view === "dataflow" && <DataFlowView />}
      {view === "stack" && <StackView />}
      {view === "decisions" && <DecisionsView />}
    </div>
  );
}

function ArchitectureView() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Boxes className="size-4" />
            System architecture
          </CardTitle>
          <CardDescription className="text-xs">
            Three separate data domains (§8.1): Tier 3 chat store, Tier 4 clinical record (EHR),
            Pillar 2 research telemetry. Distinct keys, access roles, and consent records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArchDiagram />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <ServiceCard
          icon={Cloud}
          name="Web client (Next.js 16)"
          desc="App Router, TypeScript, Tailwind, shadcn/ui. SSR for public pages, CSR for app shell. WCAG 2.2 AA."
          tier="Client"
        />
        <ServiceCard
          icon={Cpu}
          name="API server (Next.js routes)"
          desc="REST + WebSocket routes. BFF pattern — never exposes raw LLM credentials to client."
          tier="Edge"
        />
        <ServiceCard
          icon={Server}
          name="LLM service (z-ai-web-dev-sdk)"
          desc="Frontier model under BAA. No training on user data (contractual). Generation constrained to grounded content."
          tier="Tier 3"
        />
        <ServiceCard
          icon={Shield}
          name="Safety classifier"
          desc="Independent service on request path. Failure-closed. Per-language gates. Shadow-mode promotion, one-click rollback."
          tier="Cross-cutting"
        />
        <ServiceCard
          icon={Network}
          name="Crisis-relay mini-service"
          desc="Socket.io on port 3030. Real-time supervisor console fan-out. Connects via Caddy gateway."
          tier="Cross-cutting"
        />
        <ServiceCard
          icon={Database}
          name="FHIR R4 EHR endpoint"
          desc="SMART on FHIR launch. US Core profiles. Field-level encryption. Push signed notes; pull patient/practitioner."
          tier="Tier 4"
        />
      </div>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div className="space-y-2 text-xs">
      {/* Layer 1: Client */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">
          Layer 1 — Client
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Box label="Next.js 16 App Router" sub="TypeScript, SSR + CSR" />
          <Box label="shadcn/ui + Tailwind" sub="WCAG 2.2 AA" />
          <Box label="Web Crypto API" sub="Private journal (§8.1)" />
          <Box label="socket.io-client" sub="Supervisor live feed" />
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowRight className="size-4 rotate-90 text-muted-foreground" />
      </div>

      {/* Layer 2: Gateway */}
      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Layer 2 — Caddy Gateway (port 81)
        </div>
        <div className="text-xs text-muted-foreground">
          Routes by <code className="text-foreground">?XTransformPort=N</code> query. CORS,
          TLS termination, port multiplexing.
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowRight className="size-4 rotate-90 text-muted-foreground" />
      </div>

      {/* Layer 3: App services */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">
          Layer 3 — App services (port 3000 + mini-services)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Box label="Next.js API routes" sub="/api/chat, /api/tts, /api/notes" />
          <Box label="Crisis-relay" sub="socket.io, port 3030" />
          <Box label="Future: ASR/TTS" sub="Streaming, p95 ≤ 2.0s" />
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowRight className="size-4 rotate-90 text-muted-foreground" />
      </div>

      {/* Layer 4: Data domains */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-medium mb-2">
            Domain A — Tier 3 chat
          </div>
          <div className="text-[11px] space-y-0.5 text-muted-foreground">
            <div>Encrypted chat store</div>
            <div>Conversation memory (§17.2)</div>
            <div>Separate key + consent</div>
            <div>Retention: account + 30d</div>
          </div>
        </div>
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-medium mb-2">
            Domain B — Tier 4 clinical
          </div>
          <div className="text-[11px] space-y-0.5 text-muted-foreground">
            <div>FHIR R4 EHR (§17.4)</div>
            <div>Signed Smart Notes</div>
            <div>Safety-hold Flags</div>
            <div>Retention: ≥ 6 years</div>
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-medium mb-2">
            Domain C — Pillar 2 research
          </div>
          <div className="text-[11px] space-y-0.5 text-muted-foreground">
            <div>HCI timing telemetry</div>
            <div>Aggregate, de-identified</div>
            <div>IRB-supervised protocol</div>
            <div>Retention: revocation + 30d</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground text-center pt-2">
        Domains NEVER co-mingle. Three separate encryption contexts, access roles, and consent records (§8.1).
      </div>
    </div>
  );
}

function Box({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="rounded-md border bg-background p-2">
      <div className="text-xs font-medium leading-tight">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  name,
  desc,
  tier,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  tier: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-1">
          <div className="size-7 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
            <Icon className="size-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-tight">{name}</div>
            <Badge variant="outline" className="text-[9px] py-0 mt-0.5">
              {tier}
            </Badge>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}

function DataFlowView() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="size-4" />
            Request flows
          </CardTitle>
          <CardDescription className="text-xs">
            How a user message travels through the system, with safety gates on the critical path.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <FlowStep
            num="1"
            title="User sends message"
            desc="Client → POST /api/chat. Includes conversation history + memory entries (tombstoned entries filtered client-side, §17.2)."
            layer="Client → API"
          />
          <FlowStep
            num="2"
            title="Crisis classifier (§5.1)"
            desc="Runs on user message BEFORE generation. Target: p95 ≤ 300ms added latency. Failure-closed: on classifier outage, only bridging acknowledgement permitted."
            layer="API → Classifier"
            critical
          />
          <FlowStep
            num="3a"
            title="If flagged: §5.2 protocol"
            desc="Crisis overlay shown. Notify supervisor via WebSocket. 24/7 staffed, p95 ≤ 60s review start. Care navigator 24-72h follow-up."
            layer="API → Crisis-relay → Supervisor"
            critical
          />
          <FlowStep
            num="3b"
            title="If clear: LLM generation"
            desc="z-ai-web-dev-sdk chat completions. System prompt enforces §5.5 boundaries. Memory injected as context. Generation constrained to grounded content (§17.1)."
            layer="API → LLM"
          />
          <FlowStep
            num="4"
            title="Response groundedness check"
            desc="Generated response checked against retrieval grounding. Unanchored statements render as bracketed prompts — never assertions."
            layer="API"
          />
          <FlowStep
            num="5"
            title="Voice mode (if enabled)"
            desc="Response → /api/tts → WAV buffer → client audio element. Per §6.4: no voiceprints, no emotion inference."
            layer="API → TTS → Client"
          />
          <FlowStep
            num="6"
            title="Persistence"
            desc="User message + AI response stored in Tier 3 chat store (Domain A). Crisis events stored as Flag/Communication resources in Tier 4 (Domain B). Pillar 2 telemetry in Domain C — never co-mingled."
            layer="Domain A/B/C"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            Safety classifier architecture (§17.3)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <ClassArchItem
            requirement="Independent service on request path"
            detail="Runs on both text and ASR partials. Not embedded in the LLM — safety is not prompt-dependent."
          />
          <ClassArchItem
            requirement="Failure-closed behavior"
            detail="On classifier outage: only bridging acknowledgement ('I'm here, go on…') permitted. Never substantive replies to uncleared content."
          />
          <ClassArchItem
            requirement="Per-language gates"
            detail="Each served language (and for Arabic, each dialect — §6.5) has independent recall gate (≥0.95). Below gate → crisis-resource mode only."
          />
          <ClassArchItem
            requirement="Shadow-mode promotion"
            detail="New models run in shadow mode (no user impact) until parity verified. Promotion requires audited-sample parity."
          />
          <ClassArchItem
            requirement="One-click rollback"
            detail="Drill-tested. Per §17.3 logs: rollback drills quarterly, target ≤ 5 min, actual ~1m 42s."
          />
          <ClassArchItem
            requirement="Drift monitoring"
            detail="Audited-sample recall + false-alarm rate tracked weekly. Triggers: recall <0.93, or false-alarm >2× baseline for 7 days → automatic feature-flag review."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FlowStep({
  num,
  title,
  desc,
  layer,
  critical,
}: {
  num: string;
  title: string;
  desc: string;
  layer: string;
  critical?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "size-7 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
          critical ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
        )}
      >
        {num}
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{title}</span>
          {critical && (
            <Badge variant="destructive" className="text-[9px] py-0 gap-0.5">
              <Shield className="size-2.5" />
              Critical path
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] py-0">
            {layer}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ClassArchItem({ requirement, detail }: { requirement: string; detail: string }) {
  return (
    <div className="rounded-md border p-2 space-y-0.5">
      <div className="text-xs font-medium">{requirement}</div>
      <div className="text-[11px] text-muted-foreground leading-relaxed">{detail}</div>
    </div>
  );
}

function StackView() {
  const stacks = [
    {
      layer: "Frontend",
      icon: Code2,
      items: [
        { name: "Next.js 16 (App Router)", version: "16.1.1", purpose: "Framework" },
        { name: "TypeScript", version: "5.x", purpose: "Language" },
        { name: "Tailwind CSS", version: "4.x", purpose: "Styling" },
        { name: "shadcn/ui (New York)", version: "latest", purpose: "Component library" },
        { name: "Zustand", version: "5.x", purpose: "Client state" },
        { name: "TanStack Query", version: "5.x", purpose: "Server state" },
        { name: "Lucide React", version: "0.525", purpose: "Icons" },
        { name: "next-intl", version: "4.x", purpose: "i18n (EN + AR)" },
        { name: "next-themes", version: "0.4.x", purpose: "Dark mode" },
      ],
    },
    {
      layer: "Backend",
      icon: Server,
      items: [
        { name: "Next.js API routes", version: "16.x", purpose: "REST endpoints" },
        { name: "z-ai-web-dev-sdk", version: "0.0.18", purpose: "LLM + TTS + ASR + image" },
        { name: "Prisma ORM", version: "6.11", purpose: "Database client" },
        { name: "Socket.io server", version: "4.8", purpose: "Crisis-relay mini-service" },
        { name: "Socket.io-client", version: "4.8", purpose: "Supervisor live feed" },
      ],
    },
    {
      layer: "Data",
      icon: Database,
      items: [
        { name: "SQLite (Prisma client)", version: "—", purpose: "Local dev DB" },
        { name: "Web Crypto API", version: "browser", purpose: "Client-side AES-GCM (§8.1)" },
        { name: "HL7 FHIR R4", version: "4.0.1", purpose: "EHR interop (§17.4)" },
        { name: "US Core profiles", version: "6.1.0", purpose: "Payer exchange" },
      ],
    },
    {
      layer: "Infrastructure",
      icon: Cloud,
      items: [
        { name: "Caddy", version: "—", purpose: "Gateway (port 81 → 3000/3030)" },
        { name: "Bun", version: "1.3", purpose: "JS runtime (mini-services)" },
        { name: "ESLint", version: "9.x", purpose: "Linting" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {stacks.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.layer}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="size-4" />
                {s.layer}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-2 py-2 font-medium text-muted-foreground">Name</th>
                      <th className="px-2 py-2 font-medium text-muted-foreground hidden sm:table-cell">Version</th>
                      <th className="px-2 py-2 font-medium text-muted-foreground">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.items.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-2 py-2 font-medium">{item.name}</td>
                        <td className="px-2 py-2 hidden sm:table-cell font-mono text-[10px] text-muted-foreground">
                          {item.version}
                        </td>
                        <td className="px-2 py-2 text-muted-foreground">{item.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DecisionsView() {
  const decisions = [
    {
      title: "Turn-based + barge-in for voice (not full-duplex)",
      section: "§6.4.7",
      rationale:
        "Full-duplex removes the pre-speech safety checkpoint — the classifier can't clear content before the agent speaks. Barge-in already provides the primary user benefit ('AI doesn't talk over me') without that risk. Full-duplex deferred to a Pillar 2 research track.",
      status: "decided",
    },
    {
      title: "No end-to-end encryption claim (§8.1)",
      section: "§8.1",
      rationale:
        "Crisis screening and Smart Notes require server-side processing. We do NOT claim E2EE for AI-processed content. Marketing and consent language must match this architecture. Client-side encryption only for the optional private journal.",
      status: "decided",
    },
    {
      title: "Location-based (not language-based) crisis routing",
      section: "§13 v1.4",
      rationale:
        "An Arabic-speaking user may be physically located in any jurisdiction (diaspora, travel, expatriate). Crisis-resource surfacing is keyed to detected/declared location, never to language setting. A Gulf-dialect Arabic session for a user outside the GCC must surface local resources, not GCC numbers.",
      status: "decided",
    },
    {
      title: "Per-dialect parity gates (not just per-language)",
      section: "§5.1, §6.5",
      rationale:
        "Dialect divergence can be as safety-relevant as language divergence. Gulf Arabic and MSA get separate classifier test sets and separate gates. Below gate → crisis-resource mode only (no open-ended chat) for that dialect.",
      status: "decided",
    },
    {
      title: "Digital phenotyping is research-only in v1.x",
      section: "§4",
      rationale:
        "Within-individual relapse prediction from HCI biomarkers is emerging, not established. Pillar 2 produces no user-facing output, drives no automated escalation, makes no clinical claims. Phase 3 go/no-go gate before any SaMD pathway.",
      status: "decided",
    },
    {
      title: "Supervisor console is two-way WebSocket, not polling",
      section: "§5.4",
      rationale:
        "Crisis events must reach the on-call supervisor in real-time. WebSocket (socket.io) provides push, two-way disposition updates, and connection-state visibility. Local SLA countdown fallback when connection drops.",
      status: "decided",
    },
    {
      title: "Enterprise dashboards: k=25 + Laplace DP noise",
      section: "§10.2",
      rationale:
        "Aggregate-only reporting with minimum cohort k=25 and Laplace-mechanism noise (ε=1.0). Cohorts below k=25 are SUPPRESSED entirely (not zeroed, not bundled with neighbors) — eliminates small-cell re-identification risk. ERISA/ADA guardrails enforced.",
      status: "decided",
    },
    {
      title: "ASR/TTS vendor benchmarks per-dialect, starting with Gulf Arabic",
      section: "Open Q #7",
      rationale:
        "Per-language benchmarks insufficient. Gulf-dialect distress-speech performance must be benchmarked specifically — accents, code-switching with English, crying speech. Vendor selection gated on per-dialect parity.",
      status: "open",
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="bg-muted/30">
        <CardContent className="p-3 flex items-start gap-2 text-xs">
          <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-0.5">Architecture Decision Records</div>
            <p className="text-muted-foreground">
              Each decision is documented with rationale and a PRD section reference. Status
              reflects whether the decision is final or under review.
            </p>
          </div>
        </CardContent>
      </Card>

      {decisions.map((d, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="text-sm font-medium leading-snug flex-1 min-w-0">
                {i + 1}. {d.title}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-[9px] py-0">
                  {d.section}
                </Badge>
                <Badge
                  variant={d.status === "decided" ? "secondary" : "outline"}
                  className={cn(
                    "text-[9px] py-0",
                    d.status === "decided"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  )}
                >
                  {d.status === "decided" ? "Decided" : "Open"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{d.rationale}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
