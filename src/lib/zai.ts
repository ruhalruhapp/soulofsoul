/**
 * z-ai-web-dev-sdk initialization for soulofsoul.
 *
 * On Render/production: reads config from environment variables.
 * Locally: falls back to the .z-ai-config file (auto-loaded by the SDK).
 *
 * Required env vars on Render:
 *   ZAI_API_KEY    — the API key
 *   ZAI_BASE_URL   — the API base URL
 *   ZAI_CHAT_ID    — the chat ID (optional)
 *   ZAI_TOKEN      — the JWT token (optional)
 *   ZAI_USER_ID    — the user ID (optional)
 */

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (zaiInstance) return zaiInstance;

  // Check if env vars are set (Render/production)
  const envApiKey = process.env.ZAI_API_KEY;
  const envBaseUrl = process.env.ZAI_BASE_URL;

  if (envApiKey && envBaseUrl) {
    // Write a temporary config file that the SDK can read
    const config = {
      apiKey: envApiKey,
      baseUrl: envBaseUrl,
      chatId: process.env.ZAI_CHAT_ID || "",
      token: process.env.ZAI_TOKEN || "",
      userId: process.env.ZAI_USER_ID || "",
    };

    // Write to a temp file the SDK will find
    const configPath = path.join(process.cwd(), ".z-ai-config");
    try {
      fs.writeFileSync(configPath, JSON.stringify(config));
    } catch {
      // If we can't write (read-only filesystem), the SDK may still work
      // if we set the config via the ZAI.create options
    }
  }

  zaiInstance = await ZAI.create();
  return zaiInstance;
}
