"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PEER_POSTS, type PeerPost } from "@/lib/data";
import {
  Heart,
  MessageCircle,
  Flag,
  ShieldCheck,
  Bot,
  Users,
  Info,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PeerSection() {
  const [posts, setPosts] = useState<PeerPost[]>(PEER_POSTS);
  const [compose, setCompose] = useState("");

  const post = () => {
    if (!compose.trim()) return;
    const newPost: PeerPost = {
      id: crypto.randomUUID(),
      author: "You",
      avatar: "Y",
      ts: "just now",
      content: compose,
      tags: ["new"],
      aiFlag: "review", // §3.2: AI pre-filters reports
      replies: 0,
      hearts: 0,
    };
    setPosts((p) => [newPost, ...p]);
    setCompose("");
    toast.success("Posted. A moderator will review within 15 min (p95).");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Peer Space</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tier 2 — moderated peer support. 24/7 human moderators; AI pre-filters but never
          takes moderation actions autonomously in v1 (§3.2).
        </p>
      </div>

      {/* Moderation status banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={Users} label="Active now" value="247" />
        <StatCard icon={Clock} label="Mod response p95" value="11m 40s" sub="target ≤ 15m" status="ok" />
        <StatCard icon={ShieldCheck} label="Mods on shift" value="6" sub="covers 24/7" />
        <StatCard icon={AlertTriangle} label="Incidents / 1k DAU" value="0.3" sub="declining QoQ" status="ok" />
      </div>

      {/* Compose */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Share something</CardTitle>
          <CardDescription className="text-xs">
            Safe-messaging guidelines enforced — no method discussion. The AI pre-screens for
            risk language before your post is visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={compose}
            onChange={(e) => setCompose(e.target.value)}
            placeholder="What's on your mind? Share a win, a question, or just check in…"
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Bot className="size-3" />
              AI pre-screen active. Posts are reviewed by a human moderator.
            </div>
            <Button onClick={post} disabled={!compose.trim()} size="sm">
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onHeart={() => {
            setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, hearts: x.hearts + 1 } : x));
          }} />
        ))}
      </div>

      {/* Moderator wellbeing notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <Info className="size-4 text-amber-600" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-medium">Moderator wellbeing</div>
            <p className="text-xs text-muted-foreground">
              Shift limits, debrief access, no solo overnight coverage. Suicidal-contagion
              safe-messaging guidelines enforced; postvention templates maintained by the
              clinical team. If you need support after reading hard posts, reach out — the
              same crisis resources are available to you.
            </p>
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
  sub?: string;
  status?: "ok" | "watch";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("size-3.5", status === "ok" ? "text-emerald-500" : status === "watch" ? "text-amber-500" : "text-muted-foreground")} />
          <span className="text-[10px] text-muted-foreground truncate">{label}</span>
        </div>
        <div className="text-lg font-semibold leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function PostCard({ post, onHeart }: { post: PeerPost; onHeart: () => void }) {
  const flagLabel = {
    clean: { label: "Clear", variant: "secondary" as const, color: "text-emerald-600" },
    review: { label: "In review", variant: "outline" as const, color: "text-amber-600" },
    escalate: { label: "Escalated", variant: "destructive" as const, color: "text-rose-600" },
  }[post.aiFlag];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/15 text-primary text-xs">
              {post.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{post.author}</span>
              <span className="text-[10px] text-muted-foreground">{post.ts}</span>
              <Badge variant={flagLabel.variant} className={cn("text-[10px] ml-auto gap-1")}>
                {post.aiFlag === "review" && <Bot className="size-2.5" />}
                {post.aiFlag === "escalate" && <AlertTriangle className="size-2.5" />}
                {flagLabel.label}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-3 pt-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={onHeart}>
                <Heart className="size-3" />
                {post.hearts}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <MessageCircle className="size-3" />
                {post.replies}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 ml-auto text-muted-foreground"
                onClick={() => toast.info("Report sent to moderator queue — p95 ≤ 15 min.")}
              >
                <Flag className="size-3" />
                Report
              </Button>
            </div>
            {post.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap pt-1">
                {post.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] py-0">
                    #{t}
                  </Badge>
                ))}
              </div>
            )}
            {post.moderatorAction && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded p-1.5 mt-1">
                <ShieldCheck className="size-3" />
                {post.moderatorAction}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
