"use client";

import { useState } from "react";

/**
 * Primitive 3: The Trialogue.
 *
 * Multi-party sessions where the user, their social network (family/friends/peers),
 * and a facilitator pair (1 peer specialist + 1 clinician) all participate as equals.
 *
 * The shared record is CO-AUTHORED. No "clinical gaze" where the clinician writes
 * about the patient. Everyone writes in the same workbook. Multiple perspectives
 * are recorded as MULTIPLE PERSPECTIVES — not synthesized into a single diagnosis.
 *
 * Polyphony preserved: If the user says "I'm hearing voices" and the mother says
 * "she's always been dramatic" and the clinician says "this could be psychosis" —
 * all three are recorded. No premature closure. The system does not pick a winner.
 */

interface Perspective {
  id: string;
  participant: string;
  role: "user" | "family" | "peer" | "clinician";
  statement: string;
  ts: number;
}

const SEED_PERSPECTIVES: Perspective[] = [
  {
    id: "p1",
    participant: "You",
    role: "user",
    statement: "I've been hearing voices since Tuesday. They're not scary, just… loud.",
    ts: Date.now() - 600000,
  },
  {
    id: "p2",
    participant: "Mom (Sarah)",
    role: "family",
    statement: "She's always been sensitive. I think it's stress from work.",
    ts: Date.now() - 480000,
  },
  {
    id: "p3",
    participant: "Marcus (Peer Companion)",
    role: "peer",
    statement: "I hear that you're hearing something. That sounds intense. What do the voices say?",
    ts: Date.now() - 360000,
  },
  {
    id: "p4",
    participant: "Dr. Rostova (Clinician)",
    role: "clinician",
    statement: "This could be consistent with several experiences. I don't want to label it yet. Let's stay with what you're experiencing.",
    ts: Date.now() - 300000,
  },
];

const ROLE_COLORS: Record<Perspective["role"], string> = {
  user: "var(--primary)",
  family: "var(--tension-low)",
  peer: "var(--tension-mid)",
  clinician: "var(--tension-high)",
};

export function TrialogueSection() {
  const [perspectives, setPerspectives] = useState<Perspective[]>(SEED_PERSPECTIVES);
  const [newStatement, setNewStatement] = useState("");
  const [newParticipant, setNewParticipant] = useState("");
  const [newRole, setNewRole] = useState<Perspective["role"]>("user");

  const addPerspective = () => {
    if (!newStatement.trim()) return;
    setPerspectives([
      ...perspectives,
      {
        id: crypto.randomUUID(),
        participant: newParticipant || "Anonymous",
        role: newRole,
        statement: newStatement,
        ts: Date.now(),
      },
    ]);
    setNewStatement("");
    setNewParticipant("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground/90">Trialogue</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
          You, your social network, and a facilitator pair — all as equals.
          Multiple perspectives are recorded as multiple perspectives. Not
          synthesized into a single diagnosis. No one picks a winner.
        </p>
      </div>

      {/* Participants */}
      <div className="flex flex-wrap gap-2">
        {[
          { name: "You", role: "user" as const },
          { name: "Mom (Sarah)", role: "family" as const },
          { name: "Marcus", role: "peer" as const, subtitle: "Peer Companion" },
          { name: "Dr. Rostova", role: "clinician" as const, subtitle: "Facilitator" },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <div className="size-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[p.role] }} />
            <span className="text-xs font-medium">{p.name}</span>
            {p.subtitle && <span className="text-[10px] text-muted-foreground">{p.subtitle}</span>}
          </div>
        ))}
      </div>

      {/* The polyphonic record — each perspective preserved separately */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          The record — multiple perspectives, not synthesized
        </div>
        {perspectives.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border p-4 space-y-2"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: ROLE_COLORS[p.role],
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{p.participant}</span>
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  {p.role === "user" ? "your voice" : p.role}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/50">
                {new Date(p.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{p.statement}</p>
          </div>
        ))}
      </div>

      {/* Add a perspective — anyone can contribute */}
      <div className="space-y-3 rounded-lg border border-dashed p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Add a perspective
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["user", "family", "peer", "clinician"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setNewRole(r)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                newRole === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {r === "user" ? "You" : r}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Name (optional)"
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <textarea
          placeholder="What's your perspective?"
          value={newStatement}
          onChange={(e) => setNewStatement(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={addPerspective}
          disabled={!newStatement.trim()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-40"
        >
          Add to the record
        </button>
      </div>

      {/* Polyphony note */}
      <div className="text-xs text-muted-foreground/60 border-t pt-4 leading-relaxed">
        No perspective is marked as "correct." No diagnosis is forced. The record
        holds all voices equally. This is dialogism — polyphony, not authority.
      </div>
    </div>
  );
}
