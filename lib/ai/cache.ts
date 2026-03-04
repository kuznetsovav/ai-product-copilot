/**
 * In-memory cache for LLM responses to reduce token cost on repeated prompts.
 * Key: hash of (model, temperature, maxTokens, schemaName, serialized messages).
 */

import { createHash } from "crypto";

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500;

const store = new Map<string, CacheEntry<unknown>>();

function hashKey(payload: string): string {
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Build a stable cache key from the structured generation params.
 * Only messages and options are included; schema is identified by schemaName.
 */
export function buildCacheKey(params: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  schemaName: string;
  messages: Array<{ role: string; content: unknown }>;
}): string {
  const payload = JSON.stringify({
    model: params.model ?? "gpt-4o-mini",
    temperature: params.temperature ?? 0.3,
    maxTokens: params.maxTokens ?? 4096,
    schemaName: params.schemaName,
    messages: params.messages.map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })),
  });
  return hashKey(payload);
}

export function getCached<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.createdAt > ttlMs) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCached<T>(key: string, value: T): void {
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, { value, createdAt: Date.now() });
}
