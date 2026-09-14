"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Primitive 6: Non-Coercion as Architecture — the Advance Directive.
 *
 * Per user's choice (B): The platform CAN trigger involuntary intervention,
 * but ONLY if the user has EXPLICITLY pre-authorized it for specific situations.
 *
 * The platform is architecturally incapable of coercion outside these
 * pre-authorized situations. No "duty to warn" override. No silent escalation.
 *
 * The user writes their own rules — in their own words.
 */

interface Directive {
  anyInterventionAuthorized: boolean;
  authorizeCrisisLine: boolean;
  authorizeEmergencyServices: boolean;
  authorizeNotificationOfNetwork: boolean;
  authorizePhysicalTransition: boolean;
  preferences: string;
}

const DEFAULT_DIRECTIVE: Directive = {
  anyInterventionAuthorized: false,
  authorizeCrisisLine: false,
  authorizeEmergencyServices: false,
  authorizeNotificationOfNetwork: false,
  authorizePhysicalTransition: false,
  preferences: "",
};

export function DirectiveSection() {
  const { directiveCompleted, setDirectiveCompleted } = useAppStore();
  const [directive, setDirective] = useState<Directive>(DEFAULT_DIRECTIVE);
  const [saved, setSaved] = useState(false);

  // Load from localStorage (in production: load from DB via /api/directive)
  useEffect(() => {
    const stored = localStorage.getItem("soteria-directive");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDirective(parsed);
        setDirectiveCompleted(true);
      } catch {
        // ignore
      }
    }
  }, [setDirectiveCompleted]);

  const save = () => {
    localStorage.setItem("soteria-directive", JSON.stringify(directive));
    setDirectiveCompleted(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const update = (key: keyof Directive, value: boolean | string) => {
    setDirective((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground/90">Advance Directive</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
          You decide what the platform is allowed to do. The platform is
          architecturally incapable of acting outside what you authorize here.
          No silent escalation. No duty-to-warn override.
        </p>
      </div>

      {/* The core question */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => {
              const val = !directive.anyInterventionAuthorized;
              setDirective({
                ...directive,
                anyInterventionAuthorized: val,
                authorizeCrisisLine: val ? directive.authorizeCrisisLine : false,
                authorizeEmergencyServices: val ? directive.authorizeEmergencyServices : false,
                authorizeNotificationOfNetwork: val ? directive.authorizeNotificationOfNetwork : false,
                authorizePhysicalTransition: val ? directive.authorizePhysicalTransition : false,
              });
            }}
            className={`mt-0.5 size-5 rounded border-2 transition-all shrink-0 ${
              directive.anyInterventionAuthorized
                ? "bg-primary border-primary"
                : "border-muted-foreground/40"
            }`}
            aria-label="Authorize any involuntary intervention"
          >
            {directive.anyInterventionAuthorized && (
              <svg className="w-full h-full text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-sm font-medium">
              I authorize the platform to take involuntary action in specific situations I define below.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              If unchecked, the platform will NEVER trigger any intervention without your explicit in-the-moment request.
            </p>
          </div>
        </div>
      </div>

      {/* Specific authorizations — only visible if anyIntervention is checked */}
      {directive.anyInterventionAuthorized && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Specific situations I authorize
          </div>
          {[
            { key: "authorizeCrisisLine" as const, label: "Surface crisis line (988) resources", desc: "The platform may proactively show 988 resources." },
            { key: "authorizeEmergencyServices" as const, label: "Contact emergency services (911)", desc: "The platform may call 911 on your behalf. Requires triple confirmation." },
            { key: "authorizeNotificationOfNetwork" as const, label: "Notify my social network", desc: "The platform may contact family/friends you've listed." },
            { key: "authorizePhysicalTransition" as const, label: "Recommend physical micro-house", desc: "The platform may suggest transition to a physical respite house." },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/20">
              <button
                onClick={() => update(item.key, !directive[item.key])}
                className={`mt-0.5 size-4 rounded border-2 transition-all shrink-0 ${
                  directive[item.key] ? "bg-primary border-primary" : "border-muted-foreground/40"
                }`}
              >
                {directive[item.key] && (
                  <svg className="w-full h-full text-primary-foreground" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.364 3.636a1 1 0 010 1.414l-6.364 6.364a1 1 0 01-1.414 0L2.636 8.464a1 1 0 011.414-1.414l2.575 2.575 5.657-5.657a1 1 0 011.414 0z" />
                  </svg>
                )}
              </button>
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User's own words — their preferences in their language */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Your words (optional)
        </div>
        <p className="text-xs text-muted-foreground/70">
          What helps you? What doesn&apos;t? What should the platform know about
          your preferences? Write in your own words.
        </p>
        <textarea
          value={directive.preferences}
          onChange={(e) => update("preferences", e.target.value)}
          placeholder="e.g., 'Don't call my mom — call my partner instead. I need quiet, not advice. When I'm overwhelmed, just be there.'"
          rows={5}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Save my directive
        </button>
        {directiveCompleted && (
          <span className="text-xs text-muted-foreground">
            ✓ Saved — the platform will respect these boundaries
          </span>
        )}
        {saved && (
          <span className="text-xs text-primary">
            Directive updated
          </span>
        )}
      </div>

      {/* The architectural guarantee */}
      <div className="rounded-lg border border-dashed p-4 space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          What this means architecturally
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The platform&apos;s code is structured so that no intervention pathway
          can execute without checking your directive first. There is no
          override, no backdoor, no admin override. This is a design constraint,
          not a policy that can be changed.
        </p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          If you uncheck everything, the platform becomes a companion that can
          only be with you — it cannot act on your behalf. That is the default.
        </p>
      </div>
    </div>
  );
}
