/**
 * z-ai-web-dev-sdk initialization for soulofsoul.
 *
 * The SDK looks for .z-ai-config in:
 *   1. process.cwd() — the app directory
 *   2. os.homedir() — the user's home directory
 *   3. /etc/.z-ai-config — system-wide
 *
 * On Render, the filesystem is mostly read-only, but /tmp and the home
 * directory are typically writable. We write to all three to maximize the
 * chance the SDK finds it.
 *
 * Required env vars on Render:
 *   ZAI_API_KEY, ZAI_BASE_URL, ZAI_CHAT_ID, ZAI_TOKEN, ZAI_USER_ID
 */

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";
import os from "os";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (zaiInstance) return zaiInstance;

  const envApiKey = process.env.ZAI_API_KEY;
  const envBaseUrl = process.env.ZAI_BASE_URL;

  if (envApiKey && envBaseUrl) {
    const config = JSON.stringify({
      apiKey: envApiKey,
      baseUrl: envBaseUrl,
      chatId: process.env.ZAI_CHAT_ID || "",
      token: process.env.ZAI_TOKEN || "",
      userId: process.env.ZAI_USER_ID || "",
    });

    // Write to all locations the SDK checks
    const configPaths = [
      path.join(process.cwd(), ".z-ai-config"),
      path.join(os.homedir(), ".z-ai-config"),
      "/etc/.z-ai-config",
      "/tmp/.z-ai-config",
    ];

    for (const configPath of configPaths) {
      try {
        fs.writeFileSync(configPath, config);
      } catch {
        // Skip if not writable
      }
    }
  }

  zaiInstance = await ZAI.create();
  return zaiInstance;
}
