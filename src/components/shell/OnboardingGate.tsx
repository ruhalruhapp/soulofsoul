"use client";

import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShieldCheck, Cake, HeartHandshake } from "lucide-react";

const CONSENT_ITEMS = [
  {
    key: "aiCompanion" as const,
    label: "AI Companion — Tier 3 conversational support",
    desc: "I consent to use the AI companion. The companion is a wellness tool, not a therapist.",
  },
  {
    key: "telehealthRecording" as const,
    label: "Telehealth session recording — Tier 4",
    desc: "Clinician and I both consent per-session. Recording powers Smart Notes; transcripts stored under HIPAA.",
  },
  {
    key: "researchTelemetry" as const,
    label: "Research telemetry — Pillar 2 (optional)",
    desc: "Opt-in only. Interaction-timing patterns, no message content. Revocable; collection stops within 24h.",
  },
  {
    key: "voiceAgent" as const,
    label: "Voice Agent Mode — microphone + transient processing",
    desc: "Raw audio not retained (except explicit save or safety event). No voiceprints or emotion inference.",
  },
];

/**
 * Onboarding gate — §5.6 age gate (18+), §8.3 layered consent.
 * Hard product gate, not a terms afterthought.
 */
export function OnboardingGate() {
  const { onboarded, ageVerified, setAgeVerified, completeOnboarding, consent, setConsent } =
    useAppStore();
  const [step, setStep] = useState<"age" | "consent">("age");
  const [dobYear, setDobYear] = useState("");

  const ageOk = (() => {
    const y = parseInt(dobYear, 10);
    if (!y || y < 1900 || y > new Date().getFullYear()) return false;
    return new Date().getFullYear() - y >= 18;
  })();

  const handleAgeContinue = () => {
    if (ageOk) {
      setAgeVerified(true);
      setStep("consent");
    }
  };

  const handleFinish = () => {
    completeOnboarding();
  };

  return (
    <Dialog open={!onboarded}>
      <DialogContent className="max-w-md">
        {step === "age" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cake className="size-5 text-primary" />
                Age verification
              </DialogTitle>
              <DialogDescription>
                This platform is for adults 18 years or older. This is a hard product gate
                (§5.6), not a terms-of-service afterthought.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="dob-year">Year of birth</Label>
                <input
                  id="dob-year"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 1995"
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {dobYear && !ageOk && (
                  <p className="text-xs text-destructive">
                    We're sorry — this platform is for adults 18+. If you're under 18, please
                    reach out to 988 or the Trevor Project.
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <HeartHandshake className="size-3.5" />
                  Under 18?
                </div>
                <div>
                  We'll redirect you to age-appropriate resources and off-board your
                  account. Crisis resources remain reachable — they always are.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleAgeContinue}
                disabled={!ageOk}
                className="w-full"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "consent" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Layered consent
              </DialogTitle>
              <DialogDescription>
                Consent is requested separately for each data stream (§8.3). You can change
                these anytime in Settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-72 overflow-y-auto">
              {CONSENT_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border p-3 space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`c-${item.key}`}
                      checked={consent[item.key]}
                      onCheckedChange={(v) => setConsent(item.key, v === true)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`c-${item.key}`}
                      className="text-sm font-medium leading-tight cursor-pointer flex-1"
                    >
                      {item.label}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{item.desc}</p>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                onClick={handleFinish}
                disabled={!consent.aiCompanion}
                className="w-full"
              >
                {consent.aiCompanion ? "Enter Serenity" : "AI companion consent required"}
              </Button>
            </DialogFooter>
            {!consent.aiCompanion && (
              <p className="text-[10px] text-muted-foreground text-center">
                You can browse crisis resources without consent — they're always reachable.
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
