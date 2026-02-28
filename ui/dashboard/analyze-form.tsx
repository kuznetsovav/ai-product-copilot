"use client";

import { useState } from "react";
import { saveDecision } from "@/lib/store/decisions";

export interface AnalyzeFormProps {
  onResult: (data: DashboardData) => void;
  onLoadingChange?: (loading: boolean) => void;
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

const PROMPT_TIPS = `• Be specific: Include metrics (e.g. "70% drop off"), funnel stage, and user segment
• Add context: Product type (B2B/B2C), trial length, key features
• Describe the friction: Where in the journey does the problem occur?
• Quantify when possible: Conversion rates, time to complete`;

export function AnalyzeForm({ onResult, onLoadingChange }: AnalyzeFormProps) {
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    onLoadingChange?.(true);
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
      onLoadingChange?.(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-medium text-zinc-200 sm:text-lg">Analyze problem</h2>
        <div className="relative flex shrink-0">
          <button
            type="button"
            onClick={() => setShowTooltip((s) => !s)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 bg-zinc-800/50 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-manipulation"
            aria-label="Tips for better prompts"
            aria-expanded={showTooltip}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showTooltip && (
            <div
              role="tooltip"
              className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs text-zinc-300 shadow-xl"
            >
              <p className="mb-1.5 font-medium text-zinc-200">How to write better prompts</p>
              <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{PROMPT_TIPS}</pre>
            </div>
          )}
        </div>
      </div>
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
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-h-[88px]"
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
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-h-[44px] touch-manipulation"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-amber-500 disabled:opacity-50 min-h-[44px] active:scale-[0.98] touch-manipulation"
        >
          {loading ? "Analyzing…" : "Run analysis"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
