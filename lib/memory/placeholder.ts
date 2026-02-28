/**
 * Memory Layer (Placeholder for Future)
 * Intended for: session context, decision history, user preferences.
 *
 * Future implementations might include:
 * - Vector store for semantic search over past decisions
 * - Redis/DB for session state
 * - User preference profiles
 */

export interface MemoryStore {
  getSession?(sessionId: string): Promise<unknown>;
  setSession?(sessionId: string, data: unknown): Promise<void>;
  searchSimilar?(query: string, limit?: number): Promise<unknown[]>;
}

// Placeholder - no-op implementations
export const memoryPlaceholder: MemoryStore = {
  async getSession() {
    return null;
  },
  async setSession() {
    return;
  },
  async searchSimilar() {
    return [];
  },
};
