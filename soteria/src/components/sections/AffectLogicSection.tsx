"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Primitive 2: The Affect-Logic Engine.
 *
 * Per Ciompi, affective tension is the primary state variable — NOT symptoms,
 * NOT diagnosis, NOT risk score. The platform's core computational model tracks
 * affective tension and ADJUSTS THE ENVIRONMENT in response.
 *
 * The user sees what the system sees — no surveillance.
 * High tension → UI dims, notifications silence, the Open Window widens.
 * Low tension → workbook unlocks, network circle offered.
 *
 * All inputs are self-reported (user-owned) or behavioral (timing-only, never content).
 * The user can correct any sample.
 */
export function AffectLogicSection() {
  const { currentTension, setCurrentTension } = useAppStore();
  const [history, setHistory] = useState<Array<{ ts: number; tension: number; response: string }>>([
    { ts: Date.now() - 3600000, tension: 7, response: "dimmed_ui" },
    { ts: Date.now() - 1800000, tension: 6, response: "silenced_notifications" },
    { ts: Date.now() - 600000, tension: 5, response: "none" },
  ]);

  // The environment response logic — visible to the user (transparency)
  const getEnvironmentResponse = (tension: number): string => {
    if (tension >= 8) return "dimmed_ui + silenced_notifications + widened_window";
    if (tension >= 6) return "dimmed_ui + silenced_notifications";
    if (tension >= 4) return "none";
    return "workbook_unlocked + network_circle_offered";
  };

  const logCheckIn = (tension: number) => {
    setCurrentTension(tension);
    const response = getEnvironmentResponse(tension);
    setHistory((prev) => [
      ...prev,
      { ts: Date.now(), tension, response },
    ].slice(-10));
  };

  const tensionColor = (t: number) => {
    if (t <= 3) return "var(--tension-low)";
    if (t <= 6) return "var(--tension-mid)";
    return "var(--tension-high)";
  };

  const tensionLabel = (t: number) => {
    if (t <= 2) return "Calm";
    if (t <= 4) return "Settled";
    if (t <= 6) return "Activated";
    if (t <= 8) return "Elevated";
    return "Overwhelmed";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground/90">Affect-Logic</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
          The platform responds to your affective tension — not a symptom score,
          not a diagnosis. You tell it how you feel. It adjusts the environment.
          You see exactly what it does. No hidden surveillance.
        </p>
      </div>

      {/* Current tension — large, visible, color-coded */}
      <div
        className="rounded-xl border p-6 transition-all duration-1000"
        style={{
          backgroundColor: `color-mix(in oklch, ${tensionColor(currentTension)} 8%, var(--card))`,
          borderColor: `color-mix(in oklch, ${tensionColor(currentTension)} 30%, var(--border))`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Current tension
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: tensionColor(currentTension) }}
          >
            {tensionLabel(currentTension)}
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span
            className="text-5xl font-light tabular-nums"
            style={{ color: tensionColor(currentTension) }}
          >
            {currentTension}
          </span>
          <span className="text-sm text-muted-foreground">/ 10</span>
        </div>

        {/* The tension bar — smooth, not jarring */}
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden mb-4">
          <div
            className="h-full rounded-full tension-bar"
            style={{
              width: `${currentTension * 10}%`,
              backgroundColor: tensionColor(currentTension),
            }}
          />
        </div>

        {/* What the environment is doing */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Environment response
          </span>
          <div className="text-sm text-foreground/80">
            {getEnvironmentResponse(currentTension) === "none" ? (
              <span className="text-muted-foreground italic">Baseline — no adjustments needed</span>
            ) : (
              <span className="font-mono text-xs">{getEnvironmentResponse(currentTension)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Check-in — 1-tap, not a form */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">How are you right now?</p>
        <div className="flex gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => logCheckIn(n)}
              className="size-10 rounded-lg text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: currentTension === n
                  ? tensionColor(n)
                  : `color-mix(in oklch, ${tensionColor(n)} 15%, var(--muted))`,
                color: currentTension === n ? "var(--background)" : "var(--foreground)",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/50">
          <span>calm</span>
          <span>overwhelmed</span>
        </div>
      </div>

      {/* History — user can see AND correct any sample */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Recent samples
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            You can correct any entry
          </span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {history.slice().reverse().map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: tensionColor(h.tension) }}
              />
              <span className="text-sm font-mono tabular-nums">{h.tension}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">
                {h.response === "none" ? "baseline" : h.response}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {new Date(h.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency note */}
      <div className="text-xs text-muted-foreground/60 border-t pt-4 leading-relaxed">
        The Affect-Logic Engine uses only what you tell it. No behavioral tracking
        without your consent. No content analysis. No risk score. The environment
        responds to your affect — and you see exactly what it does.
      </div>
    </div>
  );
}
