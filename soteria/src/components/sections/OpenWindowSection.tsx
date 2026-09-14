"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Primitive 1: The Open Window.
 *
 * Not a chat. Not a video call. A persistent ambient connection — like leaving
 * a window open between two rooms. You can sense the other person is there,
 * but there's no obligation to speak.
 *
 * Technical: WebSocket presence indicator (no audio, no video, no transcript).
 * In production: WebRTC data channel + low-bitrate presence audio.
 * Here: a simulated presence with a breathing glow.
 *
 * Per the philosophy:
 * - NO recording
 * - NO transcript
 * - NO classifier running on content (there is no content)
 * - Silence is the default state, not an awkward gap
 * - The companion "breathes" — presence, not performance
 */
export function OpenWindowSection() {
  const { windowOpen, setWindowOpen, companionPresent, setCompanionPresent, currentTension, setCurrentTension } = useAppStore();
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (windowOpen) {
      timerRef.current = setInterval(() => {
        setSessionDuration((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [windowOpen]);

  useEffect(() => {
    if (windowOpen && !companionPresent) {
      const t = setTimeout(() => setCompanionPresent(true), 3000);
      return () => clearTimeout(t);
    }
  }, [windowOpen, companionPresent, setCompanionPresent]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const openWindow = () => setWindowOpen(true);
  const closeWindow = () => {
    setWindowOpen(false);
    setCompanionPresent(false);
  };

  if (!windowOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-light text-foreground/90">The Open Window</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A persistent connection to a peer companion. Not a chat — you don&apos;t
            have to talk. They&apos;re just there, on the other side of the window.
            Present, not demanding.
          </p>
          <p className="text-xs text-muted-foreground/70">
            No recording. No transcript. No one analyzing your words.
          </p>
        </div>
        <button
          onClick={openWindow}
          className="group relative flex flex-col items-center gap-4 transition-all"
          aria-label="Open the window — request a companion"
        >
          <div className="size-32 rounded-full border border-border/50 bg-muted/30 flex items-center justify-center transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
            <div className="size-20 rounded-full bg-muted/50" />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Open the window
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="flex flex-col items-center gap-6">
        <div className={`size-48 rounded-full flex items-center justify-center transition-all duration-1000 ${companionPresent ? "window-glow" : ""}`}>
          <div className={`size-32 rounded-full transition-all duration-2000 ${companionPresent ? "breathe-anim bg-primary/20" : "bg-muted/40 animate-pulse"}`}>
            {companionPresent && (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div className="size-16 rounded-full bg-primary/30 breathe-anim" />
              </div>
            )}
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {companionPresent ? "Someone is here" : "Waiting for a companion…"}
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">
            {formatDuration(sessionDuration)}
          </p>
          {companionPresent && (
            <p className="text-xs text-muted-foreground/50 mt-4 max-w-xs">
              You don&apos;t have to talk. They&apos;re just here. Breathe.
            </p>
          )}
        </div>
      </div>

      {companionPresent && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground/70">How are you right now?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setCurrentTension(n)}
                className={`size-7 rounded-full text-[10px] transition-all ${
                  currentTension === n
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between w-full text-[10px] text-muted-foreground/50">
            <span>calm</span>
            <span>overwhelmed</span>
          </div>
        </div>
      )}

      <button
        onClick={closeWindow}
        className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors underline underline-offset-4"
      >
        Close the window
      </button>
    </div>
  );
}
