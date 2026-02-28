"use client";

import { useState } from "react";
import { processProblemDecision } from "@/app/actions/decision-actions";
import { useDecisionResult } from "@/ui/decision-context";

export function DecisionForm() {
  const [statement, setStatement] = useState("");
  const [context, setContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const { setResult } = useDecisionResult();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await processProblemDecision({
        statement,
        context: context || undefined,
        constraints: constraints || undefined,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 text-lg font-medium text-zinc-200">Problem input</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="statement" className="mb-1 block text-sm text-zinc-400">
            Problem statement
          </label>
          <textarea
            id="statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="e.g. Users are dropping off during onboarding but we're not sure why..."
            required
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label htmlFor="context" className="mb-1 block text-sm text-zinc-400">
            Context (optional)
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Background, metrics, recent changes..."
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label htmlFor="constraints" className="mb-1 block text-sm text-zinc-400">
            Constraints (optional)
          </label>
          <input
            id="constraints"
            type="text"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Timeline, budget, tech limits..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Get decision framework"}
        </button>
      </form>
    </div>
  );
}
