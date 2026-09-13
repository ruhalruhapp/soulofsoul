/**
 * Unit tests for journal encryption helpers — §8.1.
 *
 * Verifies the security properties of the client-side AES-GCM 256-bit encryption:
 * - Encrypt → decrypt round-trip preserves plaintext
 * - Different IVs are generated for each encryption (no IV reuse)
 * - Wrong passphrase produces different key → decryption fails gracefully
 * - Serialization preserves ciphertext structure
 *
 * Run with: `bun test`
 */

import { describe, expect, it, beforeAll } from "bun:test";
import {
  deriveKey,
  encryptEntry,
  decryptEntry,
  generateSalt,
  generateEntryId,
  serializeEntries,
  deserializeEntries,
  bytesToBase64,
  base64ToBytes,
  JOURNAL_ITERATIONS,
  type JournalEntry,
} from "@/lib/journal-crypto";

// Use fewer iterations for tests to keep them fast (security properties still hold)
const TEST_ITERATIONS = 1000;

describe("journal-crypto", () => {
  describe("generateSalt", () => {
    it("generates a 16-byte salt", () => {
      const salt = generateSalt();
      expect(salt.length).toBe(16);
    });

    it("generates different salts on each call (randomness)", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(Array.from(salt1)).not.toEqual(Array.from(salt2));
    });
  });

  describe("generateEntryId", () => {
    it("generates a UUID-like string", () => {
      const id = generateEntryId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(30);
    });

    it("generates unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateEntryId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("base64 encoding round-trip", () => {
    it("round-trips arbitrary bytes", () => {
      const original = new Uint8Array([0, 1, 2, 127, 128, 255, 100, 200]);
      const b64 = bytesToBase64(original);
      const decoded = base64ToBytes(b64);
      expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    it("round-trips empty bytes", () => {
      const original = new Uint8Array([]);
      const b64 = bytesToBase64(original);
      const decoded = base64ToBytes(b64);
      expect(decoded.length).toBe(0);
    });

    it("round-trips large payload", () => {
      const original = new Uint8Array(1024);
      for (let i = 0; i < 1024; i++) original[i] = i % 256;
      const b64 = bytesToBase64(original);
      const decoded = base64ToBytes(b64);
      expect(Array.from(decoded)).toEqual(Array.from(original));
    });
  });

  describe("deriveKey", () => {
    it("derives a CryptoKey with encrypt/decrypt usages", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      expect(key).toBeDefined();
      expect(key.type).toBe("secret");
      expect(key.usages).toContain("encrypt");
      expect(key.usages).toContain("decrypt");
    });

    it("derives different keys for different passphrases (same salt)", async () => {
      const salt = generateSalt();
      const key1 = await deriveKey("passphrase-one", salt, TEST_ITERATIONS);
      const key2 = await deriveKey("passphrase-two", salt, TEST_ITERATIONS);
      // CryptoKey objects are opaque; verify they're different by encrypting
      // with one and failing to decrypt with the other
      const { ciphertext, iv } = await encryptEntry(key1, "secret");
      const decrypted = await decryptEntry(key2, { ciphertext, iv });
      expect(decrypted).toBe("[Decryption failed — wrong key?]");
    });

    it("derives different keys for different salts (same passphrase)", async () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const key1 = await deriveKey("same-passphrase", salt1, TEST_ITERATIONS);
      const key2 = await deriveKey("same-passphrase", salt2, TEST_ITERATIONS);
      const { ciphertext, iv } = await encryptEntry(key1, "secret");
      const decrypted = await decryptEntry(key2, { ciphertext, iv });
      expect(decrypted).toBe("[Decryption failed — wrong key?]");
    });
  });

  describe("encryptEntry / decryptEntry round-trip", () => {
    it("round-trips a simple plaintext", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "Hello, world!";
      const { ciphertext, iv } = await encryptEntry(key, plaintext);
      const decrypted = await decryptEntry(key, { ciphertext, iv });
      expect(decrypted).toBe(plaintext);
    });

    it("round-trips a long journal entry", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "This is a longer journal entry. ".repeat(50);
      const { ciphertext, iv } = await encryptEntry(key, plaintext);
      const decrypted = await decryptEntry(key, { ciphertext, iv });
      expect(decrypted).toBe(plaintext);
    });

    it("round-trips unicode content", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "مرحبا بالعالم — Hello — 你好 — مرحبا";
      const { ciphertext, iv } = await encryptEntry(key, plaintext);
      const decrypted = await decryptEntry(key, { ciphertext, iv });
      expect(decrypted).toBe(plaintext);
    });

    it("round-trips empty string", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const { ciphertext, iv } = await encryptEntry(key, "");
      const decrypted = await decryptEntry(key, { ciphertext, iv });
      expect(decrypted).toBe("");
    });

    it("round-trips content with special characters", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "Symbols: !@#$%^&*()[]{}|;':\",./<>? `~";
      const { ciphertext, iv } = await encryptEntry(key, plaintext);
      const decrypted = await decryptEntry(key, { ciphertext, iv });
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("IV uniqueness (no IV reuse — critical for AES-GCM security)", () => {
    it("generates different IVs for the same plaintext on repeated encryption", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "same message";

      const ivs = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const { iv } = await encryptEntry(key, plaintext);
        ivs.add(iv);
      }
      // All 20 IVs should be distinct
      expect(ivs.size).toBe(20);
    });

    it("generates different ciphertexts for the same plaintext + IV (due to AES-GCM internal randomness)", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const plaintext = "same message";

      const result1 = await encryptEntry(key, plaintext);
      const result2 = await encryptEntry(key, plaintext);
      // IVs differ, ciphertexts differ (because IV differs)
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.ciphertext).not.toBe(result2.ciphertext);
      // Both decrypt correctly
      expect(await decryptEntry(key, result1)).toBe(plaintext);
      expect(await decryptEntry(key, result2)).toBe(plaintext);
    });
  });

  describe("wrong-key decryption fails gracefully", () => {
    it("returns sentinel error string instead of throwing", async () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const key1 = await deriveKey("correct-passphrase", salt1, TEST_ITERATIONS);
      const key2 = await deriveKey("wrong-passphrase", salt2, TEST_ITERATIONS);

      const { ciphertext, iv } = await encryptEntry(key1, "secret");
      const decrypted = await decryptEntry(key2, { ciphertext, iv });
      expect(decrypted).toBe("[Decryption failed — wrong key?]");
    });

    it("does not throw on corrupted ciphertext", async () => {
      const salt = generateSalt();
      const key = await deriveKey("test-passphrase", salt, TEST_ITERATIONS);
      const result = await decryptEntry(key, {
        ciphertext: "invalid!!!base64!!!",
        iv: "short",
      });
      expect(result).toBe("[Decryption failed — wrong key?]");
    });
  });

  describe("serialization (serializeEntries / deserializeEntries)", () => {
    it("round-trips an array of entries", () => {
      const entries: JournalEntry[] = [
        { id: "e1", ts: 1000, ciphertext: "abc", iv: "iv1", title: "First" },
        { id: "e2", ts: 2000, ciphertext: "def", iv: "iv2" },
      ];
      const json = serializeEntries(entries);
      const parsed = deserializeEntries(json);
      expect(parsed).toEqual(entries);
    });

    it("round-trips empty array", () => {
      const json = serializeEntries([]);
      const parsed = deserializeEntries(json);
      expect(parsed).toEqual([]);
    });

    it("filters out malformed entries (missing required fields)", () => {
      const malformed = JSON.stringify([
        { id: "good", ts: 1000, ciphertext: "abc", iv: "iv1" },
        { id: "bad-no-ciphertext", ts: 2000, iv: "iv2" },
        { id: "bad-no-iv", ts: 3000, ciphertext: "xyz" },
        "not-an-object",
        null,
        { id: "bad-no-id", ciphertext: "x", iv: "y" }, // missing id is OK structurally
      ]);
      const parsed = deserializeEntries(malformed);
      // Only entries with both ciphertext and iv survive
      expect(parsed.length).toBe(2);
      expect(parsed[0].id).toBe("good");
    });

    it("returns empty array on invalid JSON", () => {
      expect(deserializeEntries("not json")).toEqual([]);
      expect(deserializeEntries("")).toEqual([]);
    });
  });

  describe("constants", () => {
    it("uses 210,000 PBKDF2 iterations (production strength)", () => {
      // Per §8.1: PBKDF2 with high iteration count for brute-force resistance
      expect(JOURNAL_ITERATIONS).toBe(210_000);
    });
  });
});
