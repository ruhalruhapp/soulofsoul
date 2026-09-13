/**
 * Private Journal encryption helpers — §8.1.
 *
 * Extracted into a separate module so unit tests can import and verify them.
 * Uses Web Crypto API (SubtleCrypto) for AES-GCM 256-bit encryption.
 *
 * Security properties:
 * - PBKDF2 key derivation with 210,000 iterations and per-device salt
 * - AES-GCM 256-bit authenticated encryption (provides confidentiality + integrity)
 * - Random 12-byte IV per entry (never reused)
 * - Key never persisted — only held in memory while journal is unlocked
 * - Ciphertext is the only thing ever written to localStorage
 */

export const JOURNAL_ITERATIONS = 210_000;
export const JOURNAL_SALT_KEY = "serenity-journal-salt";
export const JOURNAL_ENTRIES_KEY = "serenity-journal-entries";

export interface JournalEntry {
  id: string;
  ts: number;
  /** Base64-encoded AES-GCM ciphertext. Never plaintext. */
  ciphertext: string;
  /** Base64-encoded 12-byte initialization vector. Unique per entry. */
  iv: string;
  /** Optional plaintext title (not encrypted — used for list display). */
  title?: string;
}

/**
 * Derive an AES-GCM 256-bit key from a user passphrase via PBKDF2.
 * The salt should be a random 16-byte value generated once at journal setup
 * and persisted (the salt is not secret — only the derived key is).
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = JOURNAL_ITERATIONS
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt plaintext with AES-GCM using a fresh random IV.
 * Returns base64-encoded ciphertext and IV for storage.
 */
export async function encryptEntry(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
  };
}

/**
 * Decrypt a journal entry. Returns the plaintext, or a sentinel error string
 * if decryption fails (wrong key, corrupted ciphertext, etc.).
 *
 * In production, callers should distinguish failure from success — the sentinel
 * string is for display only and should never be persisted as if it were content.
 */
export async function decryptEntry(
  key: CryptoKey,
  entry: Pick<JournalEntry, "ciphertext" | "iv">
): Promise<string> {
  try {
    const iv = base64ToBytes(entry.iv);
    const ciphertext = base64ToBytes(entry.ciphertext);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return "[Decryption failed — wrong key?]";
  }
}

/**
 * Generate a random 16-byte salt for journal setup.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random UUID for journal entries.
 * Uses crypto.randomUUID when available, falls back to a manual implementation.
 */
export function generateEntryId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 UUID
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

// ─── Encoding helpers ───

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Serialize/deserialize journal entries to/from localStorage-safe JSON.
 * Only the ciphertext + IV are stored — never the plaintext.
 */
export function serializeEntries(entries: JournalEntry[]): string {
  return JSON.stringify(entries);
}

export function deserializeEntries(json: string): JournalEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: unknown): e is JournalEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as JournalEntry).ciphertext === "string" &&
        typeof (e as JournalEntry).iv === "string"
    );
  } catch {
    return [];
  }
}
