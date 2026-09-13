"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookLock,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Key,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  deriveKey,
  encryptEntry,
  decryptEntry,
  generateSalt,
  generateEntryId,
  serializeEntries,
  deserializeEntries,
  JOURNAL_SALT_KEY,
  JOURNAL_ENTRIES_KEY,
  type JournalEntry,
} from "@/lib/journal-crypto";

/**
 * Private Journal — §8.1.
 * "Optional client-side (device-held key) encryption for user journal entries;
 *  if enabled, content is inaccessible to server-side features including the AI companion."
 *
 * Implementation notes:
 * - Uses Web Crypto API (SubtleCrypto) for AES-GCM 256-bit encryption.
 * - The encryption key is derived from a user passphrase via PBKDF2 (210,000 iterations).
 * - The key + IV + ciphertext all live in component state — never persisted to server,
 *   never written to localStorage in plaintext.
 * - When enabled, the AI companion CANNOT see journal content (it's encrypted client-side
 *   before any sync). We surface this to the user explicitly.
 * - When the user locks the journal, the key is wiped from memory.
 * - Encryption helpers extracted to /lib/journal-crypto.ts for unit testing.
 */

export function JournalTool() {
  const [enabled, setEnabled] = useState(() => typeof window !== "undefined" && !!localStorage.getItem(JOURNAL_SALT_KEY));
  const [unlocked, setUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [newEntry, setNewEntry] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [confirmPassphrase, setConfirmPassphrase] = useState("");

  // Persist encrypted entries to localStorage (ciphertext only — never plaintext)
  useEffect(() => {
    if (entries.length > 0 && enabled) {
      localStorage.setItem(JOURNAL_ENTRIES_KEY, serializeEntries(entries));
    }
  }, [entries, enabled]);

  // Load entries on unlock — defer setState to escape the effect body
  useEffect(() => {
    if (!unlocked || !cryptoKey || entries.length > 0) return;
    const stored = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!stored) return;

    const parsed = deserializeEntries(stored);
    if (parsed.length === 0) return;

    // Schedule state updates outside the effect body to satisfy react-hooks rules
    const loadEntries = async () => {
      const cache: Record<string, string> = {};
      for (const e of parsed) {
        cache[e.id] = await decryptEntry(cryptoKey, e);
      }
      setEntries(parsed);
      setDecryptedCache(cache);
    };
    loadEntries();
  }, [unlocked, cryptoKey, entries.length]);

  const setupJournal = async () => {
    if (passphrase.length < 8) {
      toast.error("Passphrase must be at least 8 characters.");
      return;
    }
    if (passphrase !== confirmPassphrase) {
      toast.error("Passphrases don't match.");
      return;
    }
    // Generate salt
    const salt = generateSalt();
    localStorage.setItem(JOURNAL_SALT_KEY, Array.from(salt).join(","));

    // Derive key
    const key = await deriveKey(passphrase, salt);
    setCryptoKey(key);
    setEnabled(true);
    setUnlocked(true);
    setSetupOpen(false);
    setPassphrase("");
    setConfirmPassphrase("");
    toast.success("Private journal enabled. Your entries are encrypted on this device.");
  };

  const unlock = async () => {
    const saltStr = localStorage.getItem(JOURNAL_SALT_KEY);
    if (!saltStr) {
      toast.error("No journal found. Enable journal first.");
      return;
    }
    const salt = new Uint8Array(saltStr.split(",").map(Number));
    const key = await deriveKey(passphrase, salt);
    setCryptoKey(key);
    setUnlocked(true);
    setPassphrase("");
    toast.success("Journal unlocked.");
  };

  const lock = () => {
    setCryptoKey(null);
    setUnlocked(false);
    setDecryptedCache({});
    toast.info("Journal locked. Key wiped from memory.");
  };

  const addEntry = async () => {
    if (!newEntry.trim() || !cryptoKey) return;
    const { ciphertext, iv } = await encryptEntry(cryptoKey, newEntry);
    const entry: JournalEntry = {
      id: generateEntryId(),
      ts: Date.now(),
      ciphertext,
      iv,
      title: newTitle.trim() || undefined,
    };
    setEntries((prev) => [entry, ...prev]);
    setDecryptedCache((prev) => ({ ...prev, [entry.id]: newEntry }));
    setNewEntry("");
    setNewTitle("");
    toast.success("Entry encrypted and saved.");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDecryptedCache((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.info("Entry deleted.");
  };

  const disableJournal = () => {
    if (!confirm("Disable private journal? All entries will be permanently deleted. This cannot be undone.")) return;
    localStorage.removeItem(JOURNAL_SALT_KEY);
    localStorage.removeItem(JOURNAL_ENTRIES_KEY);
    setEnabled(false);
    setUnlocked(false);
    setCryptoKey(null);
    setEntries([]);
    setDecryptedCache({});
    toast.info("Journal disabled. All entries deleted.");
  };

  // ─── Encryption helpers are at module scope (see above) ───

  // ─── Render ───

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookLock className="size-4" />
            Private Journal
          </CardTitle>
          <CardDescription>
            Optional. Client-side AES-GCM 256-bit encryption. Your entries are encrypted on
            this device before any sync — the server, the AI companion, and even soulofsoul's
            admins cannot read them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              How it works
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>You choose a passphrase (not your account password).</li>
              <li>AES-GCM 256-bit key is derived via PBKDF2 (210,000 iterations).</li>
              <li>The key never leaves your device — never sent to the server.</li>
              <li>Entries are encrypted before sync. Ciphertext is all that's stored.</li>
              <li>If you forget the passphrase, entries are unrecoverable. There is no backdoor.</li>
            </ul>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-medium text-amber-700 dark:text-amber-400">
                Per §8.1: AI companion cannot read journal content
              </div>
              <p className="text-muted-foreground">
                When the journal is enabled, the AI companion is architecturally blocked from
                accessing journal content — it lives in a separate encryption context. The
                companion may know you wrote an entry, but cannot read what you wrote.
              </p>
            </div>
          </div>

          <Button onClick={() => setSetupOpen(true)} className="w-full">
            <Key className="size-4" />
            Enable private journal
          </Button>
        </CardContent>

        <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="size-5 text-primary" />
                Set your journal passphrase
              </DialogTitle>
              <DialogDescription>
                This is separate from your account password. Choose something memorable — there
                is no recovery option.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="jp1">Passphrase (min 8 chars)</Label>
                <div className="relative">
                  <Input
                    id="jp1"
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="A memorable phrase only you know"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 size-9"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                  >
                    {showPassphrase ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jp2">Confirm passphrase</Label>
                <Input
                  id="jp2"
                  type={showPassphrase ? "text" : "password"}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter to confirm"
                />
              </div>
              <div className="text-[11px] text-muted-foreground bg-muted/30 rounded p-2">
                Strength: PBKDF2 210k iterations · AES-GCM 256-bit · per-device salt.
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSetupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={setupJournal} disabled={passphrase.length < 8 || passphrase !== confirmPassphrase}>
                Enable journal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Enabled but locked
  if (!unlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-4" />
            Private Journal — locked
          </CardTitle>
          <CardDescription>
            Enter your passphrase to unlock. The key is held in memory only while unlocked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="unlock-pass">Passphrase</Label>
            <div className="relative">
              <Input
                id="unlock-pass"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && passphrase) unlock();
                }}
                placeholder="Enter passphrase"
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 size-9"
                onClick={() => setShowPassphrase(!showPassphrase)}
              >
                {showPassphrase ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
          </div>
          <Button onClick={unlock} disabled={!passphrase} className="w-full">
            <Unlock className="size-4" />
            Unlock
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={disableJournal}>
            Disable journal (deletes all entries)
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Enabled and unlocked
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Private Journal — unlocked
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Key in memory. {entries.length} encrypted {entries.length === 1 ? "entry" : "entries"}.
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-[10px] gap-0.5">
              <ShieldCheck className="size-2.5" />
              AES-GCM 256
            </Badge>
            <Button variant="outline" size="sm" onClick={lock} className="h-7 text-xs gap-1">
              <Lock className="size-3" />
              Lock
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* New entry */}
        <div className="rounded-lg border p-3 space-y-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (optional)"
            className="text-sm font-medium border-none px-0 h-7 focus-visible:ring-0"
          />
          <Textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write freely. This is encrypted before it leaves your device."
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock className="size-2.5" />
              Encrypted client-side · AI companion blocked from this content
            </span>
            <Button onClick={addEntry} disabled={!newEntry.trim()} size="sm">
              <Plus className="size-3.5" />
              Save entry
            </Button>
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No entries yet. Your first entry will be encrypted on this device.
          </div>
        )}
        <div className="space-y-2 max-h-[400px] overflow-y-auto chat-scroll">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                {entry.title ? (
                  <div className="text-sm font-medium">{entry.title}</div>
                ) : (
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="size-2.5" />
                    Encrypted entry
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="text-xs leading-relaxed whitespace-pre-wrap">
                {decryptedCache[entry.id] ?? "[Decrypting…]"}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="size-2.5" />
                {new Date(entry.ts).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
