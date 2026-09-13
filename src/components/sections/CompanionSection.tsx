"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, type ChatMessage } from "@/lib/store";
import { classifyCrisis, detectMinors } from "@/lib/crisis";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  Info,
  User,
  Bot,
  ShieldCheck,
  Clock,
  Volume2,
  Languages,
  Trash2,
  Anchor,
  Pause,
  Square,
  Phone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function CompanionSection() {
  const { chat, appendChat, resetChat, lang, triggerCrisis, triggerMinorsOffboard, memories, consent, setSection } =
    useAppStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [screenStalled, setScreenStalled] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  // Real TTS playback using z-ai-web-dev-sdk audio.tts via /api/tts
  const playTTS = async (text: string, msgId: string) => {
    try {
      setSpeakingId(msgId);
      setVoiceState("speaking");
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "tongtong", speed: 1.0 }),
      });

      if (!res.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingId(null);
        setVoiceState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeakingId(null);
        setVoiceState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error("[TTS] playback failed:", err);
      setSpeakingId(null);
      setVoiceState("idle");
      // Per §6.4.2: graceful degradation to text — voice mode remains usable
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);
    setVoiceState("idle");
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    // §5.1 — run crisis classifier on user message (real-time, pre-send)
    const crisis = classifyCrisis(content, lang);
    // §5.6 — run minors detection
    const minors = detectMinors(content);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      ts: Date.now(),
      flagged: crisis.flagged,
      flagReason: crisis.reason,
      viaVoice: voiceMode,
    };
    appendChat(userMsg);
    setInput("");
    setSending(true);

    // §5.6 — minors self-identification triggers off-boarding flow
    if (minors.flagged) {
      triggerMinorsOffboard();
      toast.warning("Minors policy triggered — redirecting to age-appropriate resources.");
      // Still append a gentle AI response before the overlay takes over
      appendChat({
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Thank you for being honest with me. Serenity is built for adults, but the support you deserve is real — I'm going to point you to people who specialize in helping young people. You're not in trouble.",
        ts: Date.now(),
        anchored: false,
        viaVoice: voiceMode,
      });
      setSending(false);
      return;
    }

    if (crisis.flagged) {
      // §5.2 — trigger crisis protocol; AI does NOT end conversation.
      triggerCrisis(crisis.reason!);
      toast.error("Crisis protocol activated — a supervisor has been notified.");
    }

    // Voice safety-gate stall behavior — §6.4.2
    if (voiceMode) {
      setVoiceState("thinking");
      setScreenStalled(true);
      // Per §6.4.2: if screen pending > 1.0s, play bridging acknowledgement.
      setTimeout(() => {
        if (screenStalled) {
          appendChat({
            id: crypto.randomUUID(),
            role: "assistant",
            content: "I'm here, go on…",
            ts: Date.now(),
            anchored: false,
            viaVoice: true,
          });
        }
      }, 1100);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chat
            .filter((m) => m.role !== "system")
            .concat(userMsg)
            .map((m) => ({ role: m.role, content: m.content })),
          memory: memories
            .filter((m) => !m.pendingDeletion)
            .map((m) => m.text),
          lang,
        }),
      });
      const data = await res.json();

      setScreenStalled(false);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        ts: Date.now(),
        anchored: data.anchored ?? true,
        viaVoice: voiceMode,
      };
      appendChat(aiMsg);

      if (data.degraded) {
        toast.warning("Safety classifier degraded — response is bridging only.");
      }

      // §6.4 — real TTS playback when in voice mode
      if (voiceMode && data.content) {
        await playTTS(data.content, aiMsg.id);
      }
    } catch (err) {
      setScreenStalled(false);
      setVoiceState("idle");
      appendChat({
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm here. I had trouble forming a response just now — would you like to rephrase, or switch to text?",
        ts: Date.now(),
        anchored: false,
        viaVoice: voiceMode,
      });
    } finally {
      setSending(false);
    }
  };

  const toggleVoice = () => {
    if (!consent.voiceAgent) {
      toast.error("Voice mode requires consent. Enable in Settings → Consent.");
      setSection("settings");
      return;
    }
    if (lang === "ar") {
      toast.warning(
        "Arabic voice mode is in crisis-resource mode (§5.1 gate not yet met). Text chat remains available."
      );
      return;
    }
    if (voiceMode) {
      stopTTS();
    }
    setVoiceMode((v) => !v);
    setVoiceState("idle");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-12rem)] lg:h-[calc(100vh-7rem)]">
      {/* Chat column */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <Bot className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  AI Companion
                  <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                    <ShieldCheck className="size-3" />
                    Tier 3
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {tr("aiIdentity", lang)}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant={voiceMode ? "secondary" : "outline"}
                size="sm"
                onClick={toggleVoice}
                className="h-8 gap-1.5"
                aria-label="Toggle voice mode"
              >
                {voiceMode ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                <span className="hidden sm:inline">{tr("voiceMode", lang)}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  if (confirm("Clear this conversation? Memory entries are not affected.")) {
                    resetChat();
                  }
                }}
                aria-label="Clear conversation"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {/* Voice mode state banner */}
          {voiceMode && (
            <div className="rounded-md bg-secondary/60 p-2.5 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {voiceState === "listening" && (
                    <>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Listening — barge-in enabled</span>
                    </>
                  )}
                  {voiceState === "thinking" && (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      <span>Safety screen clearing…</span>
                    </>
                  )}
                  {voiceState === "speaking" && (
                    <>
                      <Volume2 className="size-3" />
                      <span>Speaking — tap anywhere to barge in</span>
                    </>
                  )}
                  {voiceState === "idle" && (
                    <>
                      <Mic className="size-3" />
                      <span>Tap mic to speak</span>
                    </>
                  )}
                </div>
                <span className="text-muted-foreground">p95 ≤ 2.0s target</span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setVoiceMode(false)}
                >
                  {tr("switchToText", lang)}
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Phone className="size-3" />
                  Get help now
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3 py-8">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Hi — I'm Serenity.</div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {tr("aiIdentity", lang)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground max-w-sm">
                <div className="flex items-start gap-1.5">
                  <Info className="size-3.5 mt-0.5 shrink-0" />
                  <span>{tr("aiScopeNote", lang)}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 w-full max-w-sm pt-2">
                {[
                  "I've been anxious about work lately",
                  "Help me with a 4-7-8 breathing exercise",
                  "I can't sleep — my mind won't shut off",
                ].map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-2 text-xs font-normal text-start"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {chat.map((m) => (
            <MessageBubble
              key={m.id}
              msg={m}
              speakingId={speakingId}
              onPlay={playTTS}
              onStop={stopTTS}
            />
          ))}

          {sending && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="size-3 text-primary" />
              </div>
              <div className="flex gap-0.5">
                <span className="size-1.5 rounded-full bg-foreground/50 typing-dot" />
                <span className="size-1.5 rounded-full bg-foreground/50 typing-dot" />
                <span className="size-1.5 rounded-full bg-foreground/50 typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-3 space-y-2">
          <div className="flex items-end gap-2">
            {voiceMode ? (
              <>
                <Button
                  variant={voiceState === "listening" ? "destructive" : "default"}
                  size="lg"
                  className="rounded-full size-12 p-0 shrink-0"
                  onClick={() => {
                    if (voiceState === "listening") {
                      setVoiceState("idle");
                    } else {
                      setVoiceState("listening");
                      setTimeout(() => {
                        send("I'm feeling overwhelmed by everything happening at work this week.");
                      }, 1500);
                    }
                  }}
                  aria-label={voiceState === "listening" ? "Stop" : "Start speaking"}
                >
                  {voiceState === "listening" ? (
                    <Square className="size-4" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </Button>
                <div className="flex-1 text-xs text-muted-foreground px-2 py-2 border rounded-md bg-muted/30">
                  {voiceState === "listening"
                    ? "Listening… speak naturally, barge in anytime"
                    : "Tap mic to start speaking — turn-based with barge-in (v1 architecture)"}
                </div>
              </>
            ) : (
              <>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type your message…"
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  onClick={() => send()}
                  disabled={!input.trim() || sending}
                  size="lg"
                  className="h-11 px-4"
                >
                  <Send className="size-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              <Badge variant="outline" className="text-[10px] mr-1">
                §5.5
              </Badge>
              Not a therapist. Cannot diagnose or prescribe.
            </span>
            <span>
              Memory active: {memories.filter((m) => !m.pendingDeletion).length} entries ·{" "}
              {lang.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Side panel: scope + safety info */}
      <Card className="hidden lg:flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Scope & Safety</CardTitle>
          <CardDescription className="text-xs">
            What this companion can and cannot do — per §5.5 / §17.
          </CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4 text-xs">
            <ScopeBlock
              title="Can do"
              items={[
                "CBT, DBT, ACT, MBSR skill delivery",
                "Reflection prompts and psychoeducation",
                "Mood tracking and self-assessments",
                "Surface patterns from your memory entries",
                "Connect you to a human (Tier 4)",
              ]}
              tone="positive"
            />
            <ScopeBlock
              title="Cannot do (hard boundaries)"
              items={[
                "Medical diagnosis",
                "Recommend specific medications or doses",
                "Claim to be a therapist or person",
                "Operate in Tier 2 as a peer impersonator",
                "Use voiceprints or prosody-based emotion inference (NG7)",
              ]}
              tone="negative"
            />

            <Separator />

            <div className="space-y-1.5">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Latency budget (voice)
              </div>
              <LatencyBar label="ASR streaming" pct={28} />
              <LatencyBar label="Safety screen" pct={12} />
              <LatencyBar label="LLM response" pct={42} />
              <LatencyBar label="TTS streaming" pct={18} />
              <div className="text-[10px] text-muted-foreground pt-1">
                Total p95 ≤ 2.0s v1 target (1.5s optimization goal). If screen &gt; 1.0s,
                neutral bridging acknowledgement plays — never substantive reply to uncleared
                content (§6.4.2).
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Anchor className="size-3.5" />
                Grounding discipline
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every response is constrained to clinically reviewed content. Unanchored
                statements render as bracketed prompts — never as assertions (same rule as
                Smart Notes, §7.1).
              </p>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Languages className="size-3.5" />
                Language parity
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Each language (and for Arabic, each dialect) has independent launch gates
                for classifier recall, in-language crisis protocol, and culturally reviewed
                response sets. Below gate → crisis-resource mode only.
              </p>
              {lang === "ar" && (
                <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] text-amber-700 dark:text-amber-400">
                  Arabic voice classifier is in <strong>crisis-resource mode</strong> until
                  the Gulf-dialect parity gate passes (§6.5).
                </div>
              )}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}

function MessageBubble({
  msg,
  speakingId,
  onPlay,
  onStop,
}: {
  msg: ChatMessage;
  speakingId?: string | null;
  onPlay?: (text: string, id: string) => void;
  onStop?: () => void;
}) {
  const isUser = msg.role === "user";
  const isSpeaking = speakingId === msg.id;
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "size-7 rounded-full flex items-center justify-center shrink-0 text-xs",
          isUser ? "bg-secondary" : "bg-primary/15 text-primary"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div className={cn("max-w-[85%] space-y-1", isUser && "items-end flex flex-col")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          {msg.content}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
          {msg.viaVoice && (
            <Badge variant="outline" className="text-[9px] gap-0.5 py-0 h-3.5">
              <Mic className="size-2.5" />
              voice
            </Badge>
          )}
          {msg.flagged && (
            <Badge variant="destructive" className="text-[9px] gap-0.5 py-0 h-3.5">
              <AlertTriangle className="size-2.5" />
              {msg.flagReason}
            </Badge>
          )}
          {!isUser && !msg.anchored && (
            <Badge variant="outline" className="text-[9px] gap-0.5 py-0 h-3.5">
              <Info className="size-2.5" />
              bridging only
            </Badge>
          )}
          {!isUser && onPlay && msg.anchored && (
            <button
              onClick={() => {
                if (isSpeaking) {
                  onStop?.();
                } else {
                  onPlay(msg.content, msg.id);
                }
              }}
              className={cn(
                "inline-flex items-center gap-0.5 px-1 py-0 h-3.5 rounded text-[9px] transition-colors",
                isSpeaking
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={isSpeaking ? "Stop audio" : "Play audio"}
            >
              {isSpeaking ? <Square className="size-2.5" /> : <Volume2 className="size-2.5" />}
              {isSpeaking ? "stop" : "play"}
            </button>
          )}
          {new Date(msg.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

function ScopeBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "negative";
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-1.5 text-[11px] leading-relaxed",
              tone === "positive" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
            )}
          >
            <span className="mt-1.5 size-1 rounded-full shrink-0 bg-current" />
            <span className="text-foreground/80">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LatencyBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
