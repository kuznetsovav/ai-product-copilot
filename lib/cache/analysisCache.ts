/**
 * Simple in-memory cache for LLM analysis responses.
 * Key: hash(problem + context). Check cache before LLM; store response after.
 */

import { createHash } from "crypto";

const store = new Map<string, unknown>();
const MAX_ENTRIES = 500;

function hash(payload: string): string {
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Build cache key from main input and optional context.
 * Use problem string for analysis; use JSON.stringify(experiments) for scoring.
 */
export function buildCacheKey(problem: string, context?: unknown): string {
  const contextStr =
    context === undefined || context === null
      ? ""
      : JSON.stringify(context);
  return hash(problem + contextStr);
}

/**
 * Get cached value if present.
 */
export function get<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

/**
 * Store value in cache. Evicts oldest entry if at capacity.
 */
export function set<T>(key: string, value: T): void {
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, value);
}

/**
 * Check cache; if hit return cached data, else call fn(), store result, and return it.
 */
export async function getOrSet<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const cached = get<T>(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  set(key, value);
  return value;
}
