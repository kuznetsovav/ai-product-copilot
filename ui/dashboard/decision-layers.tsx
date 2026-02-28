"use client";

import { useState } from "react";
import type { DashboardData } from "./analyze-form";

const LAYERS = [
  {
    id: "problem",
    label: "Problem",
    description: "Raw product issue",
    getSummary: (d: DashboardData) =>
      d.problem.description.slice(0, 80) + (d.problem.description.length > 80 ? "…" : ""),
    getCount: () => null,
  },
  {
    id: "structuring",
    label: "Structuring",
    description: "Funnel, friction, intent",
    getSummary: (d: DashboardData) =>
      `${d.structuredProblem.funnelStage} · ${d.structuredProblem.likelyFrictionPoints.length} friction points`,
    getCount: () => null,
  },
  {
    id: "segmentation",
    label: "Segmentation",
    description: "User segments",
    getSummary: (d: DashboardData) => {
      const b = d.segments.behavioralSegments.length;
      const l = d.segments.lifecycleSegments.length;
      const i = d.segments.intentBasedSegments.length;
      return `${b + l + i} segments`;
    },
    getCount: (d: DashboardData) =>
      d.segments.behavioralSegments.length +
      d.segments.lifecycleSegments.length +
      d.segments.intentBasedSegments.length,
  },
  {
    id: "hypothesis",
    label: "Hypothesis",
    description: "Causes & solutions",
    getSummary: (d: DashboardData) =>
      `${d.hypotheses.likelyCauses.length} causes · ${d.hypotheses.potentialSolutions.length} solutions`,
    getCount: (d: DashboardData) =>
      d.hypotheses.likelyCauses.length + d.hypotheses.potentialSolutions.length,
  },
  {
    id: "experiment",
    label: "Experiment",
    description: "Tests & metrics",
    getSummary: (d: DashboardData) =>
      `${d.experiments.experiments.length} experiments · ${d.experiments.successMetrics.length} metrics`,
    getCount: (d: DashboardData) =>
      d.experiments.experiments.length + d.experiments.successMetrics.length,
  },
  {
    id: "decision",
    label: "Decision",
    description: "Structured output",
    getSummary: () => "Complete",
    getCount: () => 1,
  },
] as const;

export function DecisionLayers({ data }: { data: DashboardData }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-0">
      {LAYERS.map((layer, i) => {
        const summary = layer.getSummary(data);
        const count = layer.getCount?.(data);
        const isLast = i === LAYERS.length - 1;
        const isExpanded = expandedId === layer.id;

        return (
          <div
            key={layer.id}
            className="flex reasoning-layer-reveal"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : layer.id)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-500/60 bg-zinc-900 text-sm font-semibold text-amber-400 shadow-lg shadow-zinc-950 transition hover:scale-105 hover:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {i + 1}
              </button>
              {!isLast && (
                <div className="h-6 w-px shrink-0 bg-gradient-to-b from-amber-500/40 to-transparent" />
              )}
            </div>

            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : layer.id)}
              className="ml-4 flex-1 pb-6 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-inset focus:ring-offset-0 rounded-xl"
            >
              <div
                className={`rounded-xl border p-4 shadow-sm transition ${
                  isExpanded
                    ? "border-amber-500/50 bg-zinc-800/80 ring-1 ring-amber-500/20"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-amber-500/90">
                      {layer.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">{layer.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {count != null && count > 0 && (
                      <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                        {count}
                      </span>
                    )}
                    <span className="text-zinc-500" aria-hidden>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{summary}</p>
                {isExpanded && (
                  <div className="mt-3 border-t border-zinc-700 pt-3 text-xs text-zinc-400">
                    Click again to collapse · Use layers to step through the reasoning
                  </div>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
