"use client";

import { useState, useEffect } from "react";
import {
  getDecisions,
  deleteDecision,
  type StoredDecision,
} from "@/lib/store/decisions";
import type { DashboardData } from "./analyze-form";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function PastDecisions({
  onSelect,
  currentData,
}: {
  onSelect: (data: DashboardData) => void;
  currentData: DashboardData | null;
}) {
  const [decisions, setDecisions] = useState<StoredDecision[]>([]);

  useEffect(() => {
    setDecisions(getDecisions());
  }, [currentData]); // Refresh when current data changes (new analysis = new save)

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteDecision(id);
    setDecisions(getDecisions());
  }

  if (decisions.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Past decisions
      </h3>
      <ul className="space-y-1.5 max-h-64 overflow-y-auto">
        {decisions.map((d) => (
          <li
            key={d.id}
            onClick={() => onSelect(d.data)}
            className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-zinc-700/50 px-3 py-2 text-left transition hover:border-amber-500/30 hover:bg-zinc-800/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-300">{d.summary}</p>
              <p className="text-xs text-zinc-500">{formatDate(d.createdAt)}</p>
            </div>
            <button
              onClick={(e) => handleDelete(e, d.id)}
              className="shrink-0 rounded p-1 text-zinc-500 opacity-0 transition hover:bg-red-900/30 hover:text-red-400 group-hover:opacity-100"
              title="Delete"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
