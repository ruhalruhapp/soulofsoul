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
    // Write a config file that the SDK can read.
    // Use /tmp on Render (read-only filesystem elsewhere)
    const config = {
      apiKey: envApiKey,
      baseUrl: envBaseUrl,
      chatId: process.env.ZAI_CHAT_ID || "",
      token: process.env.ZAI_TOKEN || "",
      userId: process.env.ZAI_USER_ID || "",
    };

    // Try multiple writable locations
    const possiblePaths = [
      "/tmp/.z-ai-config",
      path.join(process.cwd(), ".z-ai-config"),
      path.join(require("os").tmpdir(), ".z-ai-config"),
    ];

    for (const configPath of possiblePaths) {
      try {
        fs.writeFileSync(configPath, JSON.stringify(config));
        // Also set as env var that the SDK might check
        process.env.ZAI_CONFIG_PATH = configPath;
        break;
      } catch {
        // Try next path
      }
    }
  }

  zaiInstance = await ZAI.create();
  return zaiInstance;
}
