"use client";

import { useState } from "react";

/**
 * Primitive 8: The Shared Workbook.
 *
 * Not a medical record. A crisis narrative owned by the person in crisis.
 *
 * - Co-authored by user, network, and facilitators
 * - User has FINAL EDIT AUTHORITY
 * - Contains: feelings log, coping plans, crisis preferences, network contacts,
 *   goals, Trialogue notes (multiple perspectives preserved)
 * - Not a "chart" that follows you forever — a living document you control
 *
 * The clinical chart is the instrument of the "clinical gaze."
 * The Shared Workbook inverts ownership.
 */

interface WorkbookEntry {
  id: string;
  type: "feeling" | "coping_plan" | "crisis_preference" | "goal" | "reflection";
  content: string;
  authoredBy: string;
  authorRole: "user" | "peer" | "clinician" | "family";
  userEditable: boolean;
  ts: number;
}

const SEED_ENTRIES: WorkbookEntry[] = [
  {
    id: "w1",
    type: "crisis_preference",
    content: "When I'm overwhelmed, I need quiet and presence — not advice. Don't try to fix it. Just be there.",
    authoredBy: "You",
    authorRole: "user",
    userEditable: true,
    ts: Date.now() - 86400000,
  },
  {
    id: "w2",
    type: "goal",
    content: "I want to get through the next two weeks without going to the ER. I want to try being heard first.",
    authoredBy: "You",
    authorRole: "user",
    userEditable: true,
    ts: Date.now() - 43200000,
  },
  {
    id: "w3",
    type: "feeling",
    content: "The voices are less loud today. I slept 6 hours. That's better than last week.",
    authoredBy: "You",
    authorRole: "user",
    userEditable: true,
    ts: Date.now() - 3600000,
  },
  {
    id: "w4",
    type: "reflection",
    content: "I noticed that when Marcus sat with me in silence, the tension dropped. No one has ever just been with me before.",
    authoredBy: "You",
    authorRole: "user",
    userEditable: true,
    ts: Date.now() - 1800000,
  },
];

const TYPE_LABELS: Record<WorkbookEntry["type"], string> = {
  feeling: "Feeling",
  coping_plan: "Coping plan",
  crisis_preference: "Crisis preference",
  goal: "Goal",
  reflection: "Reflection",
};

const ROLE_COLORS: Record<WorkbookEntry["authorRole"], string> = {
  user: "var(--primary)",
  peer: "var(--tension-mid)",
  clinician: "var(--tension-high)",
  family: "var(--tension-low)",
};

export function WorkbookSection() {
  const [entries, setEntries] = useState<WorkbookEntry[]>(SEED_ENTRIES);
  const [newType, setNewType] = useState<WorkbookEntry["type"]>("feeling");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const addEntry = () => {
    if (!newContent.trim()) return;
    setEntries([
      {
        id: crypto.randomUUID(),
        type: newType,
        content: newContent,
        authoredBy: "You",
        authorRole: "user",
        userEditable: true,
        ts: Date.now(),
      },
      ...entries,
    ]);
    setNewContent("");
  };

  const startEdit = (entry: WorkbookEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setEntries(entries.map((e) =>
      e.id === editingId ? { ...e, content: editContent } : e
    ));
    setEditingId(null);
    setEditContent("");
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground/90">Shared Workbook</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
          Your crisis narrative. You own it. You can edit any entry. Others can
          annotate — but you have final authority. Not a chart that follows you
          forever. A living document you control.
        </p>
      </div>

      {/* Add entry */}
      <div className="rounded-lg border border-dashed p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(TYPE_LABELS) as WorkbookEntry["type"][]).map((t) => (
            <button
              key={t}
              onClick={() => setNewType(t)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                newType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={`Write a ${TYPE_LABELS[newType].toLowerCase()}...`}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={addEntry}
          disabled={!newContent.trim()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-40"
        >
          Add to workbook
        </button>
      </div>

      {/* Entries — user can edit any entry (final authority) */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border p-4 space-y-2"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: ROLE_COLORS[entry.authorRole],
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">
                  {TYPE_LABELS[entry.type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {entry.authoredBy}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/50">
                {new Date(entry.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            </div>
            {editingId === entry.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-md text-xs text-muted-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">{entry.content}</p>
            )}
            {entry.userEditable && editingId !== entry.id && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => startEdit(entry)}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-[10px] text-muted-foreground hover:text-destructive underline underline-offset-2"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground/60 border-t pt-4 leading-relaxed">
        You have final edit authority. If a facilitator writes something you
        disagree with, you can correct it or delete it. This is your narrative —
        not a clinical chart.
      </div>
    </div>
  );
}
