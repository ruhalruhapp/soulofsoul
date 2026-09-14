"use client";

/**
 * Primitive 5: The Continuity Coordinator.
 *
 * The same facilitator pair assigned at first contact stays assigned through:
 * Digital safe room → Open Circle → physical micro-house → aftercare → back to digital
 *
 * No hand-offs without explicit transfer ceremony. If a facilitator must change,
 * the transition is logged, the user is notified, and the outgoing facilitator
 * introduces the incoming one.
 */

interface ContinuityRecord {
  touchpoint: string;
  facilitatorPair: string;
  date: string;
  status: "active" | "transferred" | "ended";
  transferCeremony?: boolean;
}

const CONTINUITY_HISTORY: ContinuityRecord[] = [
  {
    touchpoint: "Digital Safe Room entry",
    facilitatorPair: "Marcus (Peer) + Dr. Rostova (Clinician)",
    date: "2026-09-10 14:30",
    status: "active",
  },
  {
    touchpoint: "First Trialogue",
    facilitatorPair: "Marcus (Peer) + Dr. Rostova (Clinician)",
    date: "2026-09-10 16:00",
    status: "active",
  },
  {
    touchpoint: "Workbook co-authoring",
    facilitatorPair: "Marcus (Peer) + Dr. Rostova (Clinician)",
    date: "2026-09-11 10:00",
    status: "active",
  },
];

export function ContinuitySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground/90">Continuity</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
          The same facilitator pair stays with you across every touchpoint. No
          hand-offs without a transfer ceremony. The relationship IS the treatment.
        </p>
      </div>

      {/* Current facilitator pair */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="text-xs text-primary uppercase tracking-wider">
          Your facilitator pair
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="size-10 rounded-full bg-primary/30 border-2 border-background flex items-center justify-center text-xs font-medium">
              M
            </div>
            <div className="size-10 rounded-full bg-tension-high/30 border-2 border-background flex items-center justify-center text-xs font-medium">
              DR
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Marcus + Dr. Rostova</div>
            <div className="text-xs text-muted-foreground">Peer Companion + Clinician</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          Assigned since your first contact. They will stay with you across all
          touchpoints — digital safe room, Trialogues, physical micro-house (if
          needed), and aftercare.
        </p>
      </div>

      {/* Touchpoint history — the continuity thread */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Your continuity thread
        </div>
        <div className="space-y-2">
          {CONTINUITY_HISTORY.map((r, i) => (
            <div key={i} className="flex gap-3">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div className={`size-3 rounded-full ${r.status === "active" ? "bg-primary" : "bg-muted-foreground"}`} />
                {i < CONTINUITY_HISTORY.length - 1 && (
                  <div className="w-px h-12 bg-border" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="text-sm font-medium">{r.touchpoint}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.facilitatorPair}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{r.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer ceremony — what happens if a facilitator must change */}
      <div className="rounded-lg border border-dashed p-4 space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          If a facilitator must change
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          A transfer only happens with a ceremony — the outgoing facilitator
          introduces the incoming one, the transition is logged, and you are
          notified. No silent hand-offs. No surprise new faces.
        </p>
      </div>

      <div className="text-xs text-muted-foreground/60 border-t pt-4 leading-relaxed">
        Per Open Dialogue&apos;s principle of psychological continuity: the same
        support team remains across digital and physical touchpoints. This is
        architectural, not policy.
      </div>
    </div>
  );
}
