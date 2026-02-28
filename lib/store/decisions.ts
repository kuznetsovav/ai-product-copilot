/**
 * Client-side persistence for past decisions.
 * Uses localStorage. Run in browser only.
 */

import type { DashboardData } from "@/ui/dashboard/analyze-form";

const STORAGE_KEY = "pm-past-decisions";
const MAX_DECISIONS = 50;

export interface StoredDecision {
  id: string;
  createdAt: string; // ISO 8601
  summary: string;
  data: DashboardData;
}

function generateId(): string {
  return `dec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getStored(): StoredDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStored(decisions: StoredDecision[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = decisions.slice(0, MAX_DECISIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable
  }
}

export function saveDecision(data: DashboardData): StoredDecision {
  const decisions = getStored();
  const summary =
    data.problem.description.slice(0, 100) +
    (data.problem.description.length > 100 ? "…" : "");
  const stored: StoredDecision = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    summary,
    data,
  };
  decisions.unshift(stored);
  setStored(decisions);
  return stored;
}

export function getDecisions(): StoredDecision[] {
  return getStored();
}

export function getDecision(id: string): StoredDecision | null {
  return getStored().find((d) => d.id === id) ?? null;
}

export function deleteDecision(id: string): void {
  const decisions = getStored().filter((d) => d.id !== id);
  setStored(decisions);
}
