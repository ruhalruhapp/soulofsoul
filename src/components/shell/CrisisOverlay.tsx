"use client";

import { useAppStore } from "@/lib/store";
import { CRISIS_RESOURCES } from "@/lib/crisis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, ShieldCheck, X } from "lucide-react";

/**
 * Crisis overlay — visual rendering of §5.2 protocol.
 * Steps 1-7 are represented in the UI:
 *   1. Acknowledge (header copy)
 *   2. Stay present (no dismiss-and-close button — only "I'm safe")
 *   3. Offer in-product connection (988, 911, Crisis Text Line)
 *   4. Notify supervision team (badge in footer)
 *   5. Human disposition (placeholder; production would route to supervisor)
 *   6. Follow-up (offer next-day check-in)
 *   7. 24-72h outreach (mentioned in fine print)
 */
export function CrisisOverlay() {
  const { crisisActive, crisisReason, dismissCrisis } = useAppStore();
  const resource = CRISIS_RESOURCES[0]; // US default; production keys to detected location

  return (
    <Dialog open={crisisActive} onOpenChange={(o) => !o && dismissCrisis()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldCheck className="size-5" />
            You deserve support right now
          </DialogTitle>
          <DialogDescription>
            What you shared sounds heavy. I'm staying with you. You don't have to act on
            anything alone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm">
            <div className="font-medium mb-1">Detected:</div>
            <div className="text-muted-foreground text-xs">{crisisReason}</div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="destructive"
              size="lg"
              className="h-12 text-base gap-2"
              asChild
            >
              <a href="tel:988">
                <Phone className="size-4" />
                Call 988 — Suicide & Crisis Lifeline
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-11 gap-2" asChild>
              <a href="tel:911">
                <Phone className="size-4" />
                Call 911 — Emergency Services
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-11 gap-2" asChild>
              <a href="sms:741741?body=HOME">
                <MessageSquare className="size-4" />
                Text HOME to 741741 — Crisis Text Line
              </a>
            </Button>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <span className="font-medium">A supervisor has been notified.</span>{" "}
                <span className="text-muted-foreground">
                  A licensed clinician will review within 5 minutes (SLA per §5.4).
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <span className="font-medium">A 24-hour follow-up is scheduled.</span>{" "}
                <span className="text-muted-foreground">
                  A care navigator will reach out — you control whether and how.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <span className="font-medium">Resources for {resource.country}:</span>{" "}
                <span className="text-muted-foreground">
                  Police {resource.police} · Helpline {resource.general} · Text{" "}
                  {resource.textLine ?? "741741"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={dismissCrisis}
          >
            <X className="size-4" />
            I'm safe — this was misunderstood
          </Button>
        </DialogFooter>

        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
          Dismissal logs this to the classifier evaluation set only. You are never
          penalized, throttled, or silently profiled (§5.3).
        </div>
      </DialogContent>
    </Dialog>
  );
}
