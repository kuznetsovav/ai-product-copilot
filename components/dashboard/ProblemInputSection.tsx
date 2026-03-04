"use client";

import { useState } from "react";
import type { ProductStage, RiskTolerance } from "@/lib/types/prioritization";

interface ProblemInputSectionProps {
  onSubmit: (payload: {
    description: string;
    context?: string;
    northStarMetric?: string;
    productStage?: ProductStage;
    teamSize?: number;
    riskTolerance?: RiskTolerance;
  }) => void;
  loading?: boolean;
  error?: string | null;
}

export function ProblemInputSection({
  onSubmit,
  loading = false,
  error,
}: ProblemInputSectionProps) {
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [northStarMetric, setNorthStarMetric] = useState("");
  const [productStage, setProductStage] = useState<ProductStage | "">("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | "">("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || loading) return;

    onSubmit({
      description: description.trim(),
      context: context.trim() || undefined,
      northStarMetric: northStarMetric.trim() || undefined,
      productStage: productStage || undefined,
      teamSize: teamSize ? Number(teamSize) || undefined : undefined,
      riskTolerance: riskTolerance || undefined,
    });
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <header className="mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-300">
          Describe your product problem
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          The more context you provide, the better prioritization accuracy.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="problem-description"
            className="mb-1 block text-sm text-zinc-400"
          >
            Problem description
          </label>
          <textarea
            id="problem-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            placeholder="e.g. Users drop off at step 2 of signup. 70% never complete."
          />
        </div>

        <div>
          <label
            htmlFor="problem-context"
            className="mb-1 block text-sm text-zinc-400"
          >
            Additional context (optional)
          </label>
          <textarea
            id="problem-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            placeholder="Any relevant product, user, or business context."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="north-star-metric"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              North Star Metric (optional)
            </label>
            <input
              id="north-star-metric"
              type="text"
              value={northStarMetric}
              onChange={(e) => setNorthStarMetric(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              placeholder="e.g. Activation rate, expansion revenue"
            />
          </div>

          <div>
            <label
              htmlFor="product-stage"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Product stage (optional)
            </label>
            <select
              id="product-stage"
              value={productStage}
              onChange={(e) =>
                setProductStage(
                  e.target.value === "" ? "" : (e.target.value as ProductStage)
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="">Select stage</option>
              <option value="early">Early</option>
              <option value="growth">Growth</option>
              <option value="scale">Scale</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="team-size"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Team size (optional)
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              placeholder="e.g. 6"
            />
          </div>

          <div>
            <label
              htmlFor="risk-tolerance"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Risk tolerance (optional)
            </label>
            <select
              id="risk-tolerance"
              value={riskTolerance}
              onChange={(e) =>
                setRiskTolerance(
                  e.target.value === ""
                    ? ""
                    : (e.target.value as RiskTolerance)
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="">Select level</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Analyze & Prioritize"}
          </button>
        </div>
      </form>
    </section>
  );
}

