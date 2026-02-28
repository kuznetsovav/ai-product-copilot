"use client";

import { useState } from "react";
import { saveDecision } from "@/lib/store/decisions";

export interface AnalyzeFormProps {
  onResult: (data: DashboardData) => void;
}

export interface DashboardData {
  problem: { description: string; context?: string };
  structuredProblem: {
    funnelStage: string;
    likelyFrictionPoints: string[];
    intentMismatch: { userExpectation: string; productReality: string; gap: string };
  };
  segments: {
    behavioralSegments: Array<{ id: string; name: string; description: string; criteria: string[] }>;
    lifecycleSegments: Array<{ id: string; name: string; description: string; criteria: string[] }>;
    intentBasedSegments: Array<{ id: string; name: string; description: string; criteria: string[] }>;
  };
  hypotheses: {
    likelyCauses: Array<{
      id: string;
      description: string;
      likelihood: string;
      segmentIds?: string[];
    }>;
    potentialSolutions: Array<{
      id: string;
      description: string;
      addressesCauseIds?: string[];
      effort?: string;
    }>;
  };
  experiments: {
    experiments: Array<{
      id: string;
      name: string;
      design: string;
      solutionId?: string;
      causeIds?: string[];
      duration?: string;
    }>;
    successMetrics: Array<{
      id: string;
      experimentId: string;
      name: string;
      type: string;
      definition: string;
      target?: string;
    }>;
    expectedImpact: Array<{
      experimentId: string;
      description: string;
      magnitude?: string;
      confidence?: string;
    }>;
  };
}

export function AnalyzeForm({ onResult }: AnalyzeFormProps) {
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, context: context || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Analysis failed");
        return;
      }
      saveDecision(data);
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 text-lg font-medium text-zinc-200">Analyze problem</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="mb-1 block text-sm text-zinc-400">
            Problem description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Users drop off at step 2 of signup. 70% never complete."
            required
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label htmlFor="context" className="mb-1 block text-sm text-zinc-400">
            Context (optional)
          </label>
          <input
            id="context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="B2B SaaS, 14-day trial..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Run analysis"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
