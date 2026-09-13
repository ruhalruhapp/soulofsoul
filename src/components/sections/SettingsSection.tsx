"use client";

import { useState } from "react";
import { useAppStore, type MemoryEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Trash2,
  Edit3,
  Plus,
  Clock,
  Lock,
  Eye,
  Languages,
  Moon,
  Sun,
  AlertTriangle,
  ShieldCheck,
  Database,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CONSENT_STREAMS: Array<{
  key: keyof ReturnType<typeof useAppStore.getState>["consent"];
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "aiCompanion",
    label: "AI Companion",
    desc: "Tier 3 conversational AI. Revocable; stops the companion from responding.",
    icon: Brain,
  },
  {
    key: "telehealthRecording",
    label: "Telehealth session recording",
    desc: "Per-session, clinician+member dual consent. Powers Smart Notes. Revoking does not delete past records (legal medical record, §9).",
    icon: Database,
  },
  {
    key: "researchTelemetry",
    label: "Research telemetry (Pillar 2)",
    desc: "Opt-in only. Interaction-timing patterns, NO message content. Revocable; collection stops within 24h.",
    icon: Eye,
  },
  {
    key: "voiceAgent",
    label: "Voice Agent Mode",
    desc: "Microphone access + transient processing. Raw audio NOT retained (except explicit save or safety event). No voiceprints. No emotion inference (NG7).",
    icon: Lock,
  },
];

const MEMORY_CATEGORIES: Array<{ value: MemoryEntry["category"]; label: string; color: string }> = [
  { value: "preference", label: "Preference", color: "text-emerald-600" },
  { value: "goal", label: "Goal", color: "text-amber-600" },
  { value: "pattern", label: "Pattern", color: "text-primary" },
  { value: "fact", label: "Fact", color: "text-muted-foreground" },
];

export function SettingsSection() {
  const {
    lang, setLang,
    theme, toggleTheme,
    memories, addMemory, deleteMemory, editMemory,
    consent, setConsent,
  } = useAppStore();

  const [newMemory, setNewMemory] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryEntry["category"]>("preference");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const activeMemories = memories.filter((m) => !m.pendingDeletion);
  const pendingMemories = memories.filter((m) => m.pendingDeletion);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Memory, consent streams, language. Users can view, edit, and delete what's collected (§6, §8.3, §17.2).
        </p>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Languages className="size-4" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Language</Label>
              <p className="text-xs text-muted-foreground">
                Affects UI + AI companion. Arabic triggers RTL layout (§6.5).
              </p>
            </div>
            <div className="flex gap-1">
              {(["en", "ar"] as const).map((l) => (
                <Button
                  key={l}
                  variant={lang === l ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLang(l);
                    if (l === "ar") {
                      toast.info("Arabic voice classifier is in crisis-resource mode until §5.1 gate passes.");
                    }
                  }}
                >
                  {l === "en" ? "English" : "العربية"}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-xs text-muted-foreground">Light or dark — your preference persists.</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
              {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memory editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="size-4" />
            Conversation memory
          </CardTitle>
          <CardDescription className="text-xs">
            What the AI companion remembers about you. Editable, deletable; effect ≤ 24h.
            Deleted entries are tombstoned and excluded from all retrieval paths (§17.2).
            Safety-hold records live in a separate domain and are never used as memory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add new */}
          <div className="rounded-lg border border-dashed p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {MEMORY_CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  variant={newCategory === c.value ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setNewCategory(c.value)}
                >
                  {c.label}
                </Button>
              ))}
            </div>
            <Textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Add a memory the companion should remember — e.g., 'I prefer short, direct responses'"
              rows={2}
              className="resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!newMemory.trim()}
                onClick={() => {
                  addMemory(newMemory, newCategory);
                  setNewMemory("");
                  toast.success("Memory added. Takes effect on next companion response (≤ 24h).");
                }}
              >
                <Plus className="size-3.5" />
                Add memory
              </Button>
            </div>
          </div>

          {/* Active memories */}
          <div className="space-y-1.5">
            {activeMemories.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">
                No memory entries yet.
              </div>
            )}
            {activeMemories.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg border p-2.5 space-y-1.5",
                  editingId === m.id && "ring-1 ring-primary"
                )}
              >
                {editingId === m.id ? (
                  <>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          editMemory(m.id, editText);
                          setEditingId(null);
                          toast.success("Memory updated.");
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={cn("text-[10px] py-0 capitalize", MEMORY_CATEGORIES.find((c) => c.value === m.category)?.color)}>
                        {m.category}
                      </Badge>
                      <span className="flex-1 text-sm">{m.text}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-2.5" />
                        {new Date(m.ts).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] gap-1"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditText(m.text);
                          }}
                        >
                          <Edit3 className="size-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] gap-1 text-destructive"
                          onClick={() => {
                            deleteMemory(m.id);
                            toast.info("Memory tombstoned — excluded from retrieval within 24h.");
                          }}
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pending deletions */}
          {pendingMemories.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3" />
                  Pending deletion (effect ≤ 24h)
                </div>
                {pendingMemories.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-dashed p-2 text-xs text-muted-foreground line-through"
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Consent streams */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Layered consent
          </CardTitle>
          <CardDescription className="text-xs">
            Consent is requested separately for each data stream (§8.3). Each states purpose,
            retention, and revocation path in plain language.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONSENT_STREAMS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="rounded-lg border p-3 flex items-start gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <Label className="text-sm font-medium leading-tight">{s.label}</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                <Switch
                  checked={consent[s.key]}
                  onCheckedChange={(v) => {
                    setConsent(s.key, v);
                    if (s.key === "researchTelemetry" && !v) {
                      toast.info("Collection stops within 24h. Data domain segregated — never merged with clinical record.");
                    }
                  }}
                  aria-label={s.label}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Data governance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="size-4" />
            Data governance
          </CardTitle>
          <CardDescription className="text-xs">
            Retention schedule (§9). Clinical-record portions persist per law even after account deletion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-2 py-2 font-medium text-muted-foreground">Data class</th>
                  <th className="px-2 py-2 font-medium text-muted-foreground">Retention</th>
                </tr>
              </thead>
              <tbody>
                <RetRow cls="Tier 3 chat content (active)" ret="Life of account + 30 days" />
                <RetRow cls="Tier 3 chat archive" ret="12 months, encrypted, access-logged" />
                <RetRow cls="Tier 4 clinical records" ret="≥ 6 years (HIPAA / state law)" />
                <RetRow cls="Crisis-event logs" ret="7 years · de-identified after closure" />
                <RetRow cls="Research telemetry" ret="Until revocation + 30 days" />
                <RetRow cls="Classifier evaluation sets" ret="Rolling, de-identified" />
                <RetRow cls="Account deletion" ret="≤ 30 days (clinical portions persist per law)" />
              </tbody>
            </table>
          </div>

          <Separator className="my-3" />

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-medium text-amber-700 dark:text-amber-400">Honesty note (§8.1)</div>
              <p className="text-muted-foreground">
                Crisis screening and Smart Notes require server-side processing. This platform
                does <strong>not</strong> claim end-to-end encryption for AI-processed content.
                Marketing and consent language match this architecture.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account deletion */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash className="size-4" />
            Delete account
          </CardTitle>
          <CardDescription className="text-xs">
            Executed ≤ 30 days. Clinical-record portions persist per law; you receive a deletion
            receipt distinguishing the two.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-destructive border-destructive/40" onClick={() => toast.info("Deletion request queued. Receipt will be issued within 30 days.")}>
            Request deletion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RetRow({ cls, ret }: { cls: string; ret: string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-2 py-2 font-medium">{cls}</td>
      <td className="px-2 py-2 text-muted-foreground">{ret}</td>
    </tr>
  );
}
