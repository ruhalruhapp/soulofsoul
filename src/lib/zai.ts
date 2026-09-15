/**
 * z-ai-web-dev-sdk initialization for soulofsoul.
 *
 * On Render/production: reads config from env vars and instantiates ZAI directly
 * (bypassing ZAI.create() which requires a config file).
 * Locally: falls back to ZAI.create() which auto-loads .z-ai-config.
 *
 * Required env vars on Render:
 *   ZAI_API_KEY, ZAI_BASE_URL, ZAI_CHAT_ID, ZAI_TOKEN, ZAI_USER_ID
 */

import ZAI from "z-ai-web-dev-sdk";
import type ZAIType from "z-ai-web-dev-sdk";

let zaiInstance: ZAIType | null = null;

export async function getZAI(): Promise<ZAIType> {
  if (zaiInstance) return zaiInstance;

  const envApiKey = process.env.ZAI_API_KEY;
  const envBaseUrl = process.env.ZAI_BASE_URL;

  if (envApiKey && envBaseUrl) {
    // Bypass ZAI.create() (which requires a config file) and instantiate directly
    const config = {
      apiKey: envApiKey,
      baseUrl: envBaseUrl,
      chatId: process.env.ZAI_CHAT_ID || "",
      token: process.env.ZAI_TOKEN || "",
      userId: process.env.ZAI_USER_ID || "",
    };

    // Use the constructor directly (ZAI.create() is just a wrapper around this)
    // @ts-expect-error — ZAI constructor is not exported in the type defs but exists
    zaiInstance = new ZAI(config);
    return zaiInstance;
  }

  // Fallback: use ZAI.create() which auto-loads from .z-ai-config file
  zaiInstance = await ZAI.create();
  return zaiInstance;
}
