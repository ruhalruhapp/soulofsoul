"use client";

import { useAppStore } from "@/lib/store";

/**
 * The Arrival page — the "front door" of the platform.
 *
 * Per Open Dialogue's "Immediate Help" principle: rapid response initiated
 * within 24 hours of first contact. The front door is instant — no waiting room,
 * no forms, no intake process. Just arrival.
 *
 * Low-stimulation, dark, calm. The first impression should feel like entering
 * a dim room with warm light, not a clinical intake.
 */
export function ArrivalSection() {
  const setSection = useAppStore((s) => s.setSection);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 soft-fade">
      {/* The breathing circle — the visual identity of the platform */}
      <div className="flex flex-col items-center gap-6">
        <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center window-glow">
          <div className="size-20 rounded-full bg-primary/20 breathe-anim" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-light text-foreground/90">
            You&apos;ve arrived.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a space for being with — not fixing, not diagnosing, not
            rushing. A peer companion can be here with you. Your social network
            can join the dialogue. You stay in control.
          </p>
        </div>
      </div>

      {/* Entry points — the primary paths through the platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        <button
          onClick={() => setSection("window")}
          className="rounded-xl border border-border/50 p-5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">◡</span>
            <span className="text-sm font-medium">Open the Window</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A peer companion is available to be with you. Not a chat — just
            presence. You don&apos;t have to talk.
          </p>
        </button>

        <button
          onClick={() => setSection("trialogue")}
          className="rounded-xl border border-border/50 p-5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">△</span>
            <span className="text-sm font-medium">Start a Trialogue</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bring your social network into the dialogue. Family, friends, a
            facilitator pair. Multiple perspectives, no single authority.
          </p>
        </button>

        <button
          onClick={() => setSection("triage")}
          className="rounded-xl border border-border/50 p-5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">◈</span>
            <span className="text-sm font-medium">Triage</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not a risk assessment. A prediction of who benefits from the least
            coercive pathway. Based on 50 years of Soteria evidence.
          </p>
        </button>

        <button
          onClick={() => setSection("directive")}
          className="rounded-xl border border-border/50 p-5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">◆</span>
            <span className="text-sm font-medium">Advance Directive</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Decide what the platform is allowed to do. Non-coercion is
            architectural — not policy. You write the rules.
          </p>
        </button>
      </div>

      {/* The lineage — the theoretical grounding */}
      <div className="max-w-lg text-center space-y-2 pt-8 border-t border-border/20">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Built on 50 years of evidence: Soteria (Mosher, 1971), Affect-Logic
          (Ciompi, Berne), Open Dialogue (Finland). The digital realization of
          &ldquo;being with&rdquo; and dialogism.
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          43% drug-free responder rate · 0.38–0.61 SD effect size · 79% triage accuracy
        </p>
      </div>
    </div>
  );
}
