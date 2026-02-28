"use client";

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
  return (
    <div className="space-y-0">
      {LAYERS.map((layer, i) => {
        const summary = layer.getSummary(data);
        const count = layer.getCount?.(data);
        const isLast = i === LAYERS.length - 1;

        return (
          <div key={layer.id} className="flex">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-500/60 bg-zinc-900 text-sm font-semibold text-amber-400 shadow-lg shadow-zinc-950">
                {i + 1}
              </div>
              {!isLast && (
                <div className="h-6 w-px shrink-0 bg-gradient-to-b from-amber-500/40 to-transparent" />
              )}
            </div>

            <div className="ml-4 flex-1 pb-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-amber-500/90">
                      {layer.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">{layer.description}</p>
                  </div>
                  {count != null && count > 0 && (
                    <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                      {count}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-zinc-300">{summary}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
